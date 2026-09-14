const { EventEmitter } = require('node:events');
const https = require('node:https');
const http = require('node:http');

// Invidious public instances (YouTube proxy - no bot detection!)
const INVIDIOUS_INSTANCES = [
    'https://vid.puffyan.us',
    'https://invidious.fdn.fr',
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://invidious.jing.rocks',
];

class MusicQueue extends EventEmitter {
    constructor() {
        super();
        this.guilds = new Map();
    }

    get(guildId) {
        return this.guilds.get(guildId);
    }

    create(guildId, data) {
        const queue = {
            guildId,
            songs: [],
            connection: data.connection,
            player: data.player,
            textChannel: data.textChannel,
            playing: false,
            loopMode: 0,
        };
        this.guilds.set(guildId, queue);
        return queue;
    }

    delete(guildId) {
        const queue = this.guilds.get(guildId);
        if (queue?.connection) {
            try { queue.connection.destroy(); } catch {}
        }
        this.guilds.delete(guildId);
    }
}

// HTTP fetch helper
function fetchJSON(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
        const mod = url.startsWith('https') ? https : http;
        
        mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                clearTimeout(timer);
                return fetchJSON(res.headers.location, timeout).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                clearTimeout(timer);
                try { resolve(JSON.parse(data)); }
                catch { reject(new Error('Invalid JSON')); }
            });
            res.on('error', (e) => { clearTimeout(timer); reject(e); });
        }).on('error', (e) => { clearTimeout(timer); reject(e); });
    });
}

// Try each Invidious instance until one works
async function tryInvidious(path) {
    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            const result = await fetchJSON(`${instance}${path}`, 8000);
            if (result && !result.error) return { data: result, instance };
        } catch {}
    }
    throw new Error('Tất cả Invidious instances đều không khả dụng');
}

// Search YouTube via Invidious
async function searchYouTube(query, limit = 1) {
    const isURL = query.startsWith('http://') || query.startsWith('https://');
    
    if (isURL) {
        // Extract video ID from URL
        const videoId = extractVideoId(query);
        if (!videoId) throw new Error('URL YouTube không hợp lệ');
        
        const { data, instance } = await tryInvidious(`/api/v1/videos/${videoId}?fields=title,videoId,lengthSeconds,videoThumbnails,author`);
        return [{
            title: data.title || 'Unknown',
            url: `https://www.youtube.com/watch?v=${data.videoId}`,
            videoId: data.videoId,
            duration: data.lengthSeconds || 0,
            thumbnail: data.videoThumbnails?.[0]?.url || '',
            uploader: data.author || 'Unknown',
            instance,
        }];
    }
    
    // Search
    const encoded = encodeURIComponent(query);
    const { data, instance } = await tryInvidious(`/api/v1/search?q=${encoded}&type=video`);
    
    if (!Array.isArray(data) || !data.length) throw new Error('Không tìm thấy kết quả');
    
    return data.slice(0, limit).map(v => ({
        title: v.title || 'Unknown',
        url: `https://www.youtube.com/watch?v=${v.videoId}`,
        videoId: v.videoId,
        duration: v.lengthSeconds || 0,
        thumbnail: v.videoThumbnails?.[0]?.url || '',
        uploader: v.author || 'Unknown',
        instance,
    }));
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const match = url.match(p);
        if (match) return match[1];
    }
    return null;
}

// Get audio stream URL from Invidious
async function getAudioStreamURL(videoId, instance) {
    // Get video details with adaptive formats
    const { data } = await tryInvidious(`/api/v1/videos/${videoId}`);
    
    // Find best audio format
    const audioFormats = (data.adaptiveFormats || [])
        .filter(f => f.type?.startsWith('audio/'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    
    if (!audioFormats.length) throw new Error('Không tìm thấy audio stream');
    
    // Return the best audio URL
    return audioFormats[0].url;
}

// Create audio stream via FFmpeg from URL
function createFFmpegStream(audioUrl) {
    const { spawn } = require('node:child_process');
    const ffmpeg = spawn('ffmpeg', [
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '5',
        '-i', audioUrl,
        '-vn',
        '-acodec', 'libopus',
        '-f', 'opus',
        '-ar', '48000',
        '-ac', '2',
        '-b:a', '128k',
        'pipe:1',
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    ffmpeg.stderr.on('data', () => {}); // suppress logs
    return ffmpeg.stdout;
}

module.exports = { MusicQueue, searchYouTube, getAudioStreamURL, createFFmpegStream };

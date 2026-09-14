const { spawn } = require('node:child_process');
const { EventEmitter } = require('node:events');

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

// Run yt-dlp with proper args
function runYtDlp(args, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const proc = spawn('yt-dlp', args, { timeout });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (d) => (stdout += d));
        proc.stderr.on('data', (d) => (stderr += d));

        proc.on('close', (code) => {
            // yt-dlp can return warnings in stderr but still succeed
            if (stdout.trim()) {
                resolve(stdout.trim());
            } else if (code !== 0) {
                // Get the actual ERROR line, skip WARNINGs
                const errorLines = stderr.split('\n').filter(l => l.includes('ERROR'));
                const errMsg = errorLines.length ? errorLines[0].slice(0, 300) : stderr.slice(0, 300);
                reject(new Error(errMsg));
            } else {
                reject(new Error('Không có kết quả'));
            }
        });

        proc.on('error', (e) => reject(new Error(`yt-dlp not found: ${e.message}`)));
    });
}

// Common yt-dlp args for YouTube
const YT_ARGS = [
    '--geo-bypass',
    '--force-ipv4',
    '--no-check-certificates',
    '--extractor-args', 'youtube:player_client=web_music,android',
    '--user-agent', 'com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip',
];

// Search YouTube using yt-dlp
async function searchYouTube(query, limit = 1) {
    const isURL = query.startsWith('http://') || query.startsWith('https://');
    const args = isURL
        ? ['--dump-json', '--no-playlist', ...YT_ARGS, query]
        : ['--dump-json', '--default-search', 'ytsearch' + limit, '--no-playlist', ...YT_ARGS, query];

    const stdout = await runYtDlp(args);
    
    return stdout.split('\n').filter(Boolean).map(line => {
        const info = JSON.parse(line);
        return {
            title: info.title || 'Unknown',
            url: info.webpage_url || info.url,
            duration: info.duration || 0,
            thumbnail: info.thumbnail || '',
            uploader: info.uploader || info.channel || 'Unknown',
        };
    });
}

// Get audio stream URL
async function getAudioStream(url) {
    const args = [
        '-f', 'bestaudio',
        '--get-url',
        '--no-playlist',
        ...YT_ARGS,
        url,
    ];

    return await runYtDlp(args);
}

// Create FFmpeg stream
function createFFmpegStream(audioUrl) {
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

    ffmpeg.stderr.on('data', () => {});
    return ffmpeg.stdout;
}

module.exports = { MusicQueue, searchYouTube, getAudioStream, createFFmpegStream };

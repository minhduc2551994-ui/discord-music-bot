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
            loopMode: 0, // 0=off, 1=song, 2=queue
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

// Search YouTube using yt-dlp
async function searchYouTube(query, limit = 1) {
    return new Promise((resolve, reject) => {
        const isURL = query.startsWith('http://') || query.startsWith('https://');
        const args = isURL
            ? ['--dump-json', '--no-playlist', '--geo-bypass', '--force-ipv4', '--js-runtimes', 'node', query]
            : ['--dump-json', '--default-search', 'ytsearch' + limit, '--geo-bypass', '--force-ipv4', '--js-runtimes', 'node', '--no-playlist', query];

        const proc = spawn('yt-dlp', args, { timeout: 20000 });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (d) => (stdout += d));
        proc.stderr.on('data', (d) => (stderr += d));

        proc.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`yt-dlp error: ${stderr.slice(0, 200)}`));
            }
            try {
                const results = stdout.trim().split('\n').map(line => {
                    const info = JSON.parse(line);
                    return {
                        title: info.title || 'Unknown',
                        url: info.webpage_url || info.url,
                        duration: info.duration || 0,
                        thumbnail: info.thumbnail || '',
                        uploader: info.uploader || info.channel || 'Unknown',
                    };
                });
                resolve(results);
            } catch (e) {
                reject(new Error('Không parse được kết quả'));
            }
        });

        proc.on('error', (e) => reject(new Error(`yt-dlp not found: ${e.message}`)));
    });
}

// Get audio stream URL from yt-dlp  
async function getAudioStream(url) {
    return new Promise((resolve, reject) => {
        const args = [
            '-f', 'bestaudio[ext=webm]/bestaudio',
            '--get-url',
            '--geo-bypass',
            '--force-ipv4',
            '--js-runtimes', 'node',
            '--no-playlist',
            url,
        ];

        const proc = spawn('yt-dlp', args, { timeout: 20000 });
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (d) => (stdout += d));
        proc.stderr.on('data', (d) => (stderr += d));

        proc.on('close', (code) => {
            if (code !== 0) return reject(new Error(stderr.slice(0, 200)));
            resolve(stdout.trim().split('\n')[0]);
        });

        proc.on('error', (e) => reject(e));
    });
}

// Create audio stream via FFmpeg from URL
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

    ffmpeg.stderr.on('data', () => {}); // suppress ffmpeg logs
    return ffmpeg.stdout;
}

module.exports = { MusicQueue, searchYouTube, getAudioStream, createFFmpegStream };

/**
 * Format milliseconds thành mm:ss hoặc hh:mm:ss
 * @param {number} ms - Thời gian tính bằng milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
    if (!ms || isNaN(ms)) return '0:00';

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Tạo progress bar text
 * @param {number} current - Thời gian hiện tại (ms)
 * @param {number} total - Tổng thời gian (ms)
 * @param {number} length - Độ dài progress bar
 * @returns {string} Progress bar string
 */
function createProgressBar(current, total, length = 15) {
    if (!total || total === 0) return '▬'.repeat(length);

    const progress = Math.round((current / total) * length);
    const before = '▬'.repeat(Math.max(0, progress));
    const after = '▬'.repeat(Math.max(0, length - progress - 1));

    return `${before}🔘${after}`;
}

/**
 * Truncate text nếu quá dài
 * @param {string} text - Text cần truncate
 * @param {number} maxLength - Độ dài tối đa
 * @returns {string} Truncated text
 */
function truncate(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

module.exports = {
    formatDuration,
    createProgressBar,
    truncate,
};

# 🎵 Discord Music Bot

Bot phát nhạc Discord đầy đủ tính năng, hỗ trợ YouTube, Spotify, SoundCloud.

Built with [Discord.js v14](https://discord.js.org) + [discord-player](https://github.com/Androz2091/discord-player).

## ✨ Tính năng

| Lệnh | Mô tả |
|-------|--------|
| `/play <query>` | Phát nhạc theo tên hoặc URL (YouTube/Spotify/SoundCloud) |
| `/skip` | Bỏ qua bài hiện tại |
| `/stop` | Dừng phát và rời voice channel |
| `/queue` | Xem danh sách bài chờ (có phân trang) |
| `/pause` | Tạm dừng phát nhạc |
| `/resume` | Tiếp tục phát nhạc |
| `/nowplaying` | Hiển thị bài đang phát với progress bar |
| `/shuffle` | Xáo trộn queue |
| `/loop <mode>` | Lặp: Tắt / Lặp bài / Lặp queue / Autoplay |

## 🚀 Cài đặt

### Yêu cầu
- [Node.js](https://nodejs.org) v18+
- Discord Bot Token ([tạo tại đây](https://discord.com/developers/applications))

### Bước 1: Clone & Cài dependencies

```bash
git clone <your-repo-url>
cd discord-music-bot
npm install
```

### Bước 2: Cấu hình

Copy `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_test_guild_id_here
```

**Lấy thông tin từ đâu?**
- `DISCORD_TOKEN`: Discord Developer Portal → Application → Bot → Token
- `CLIENT_ID`: Discord Developer Portal → Application → General Information → Application ID
- `GUILD_ID`: Bật Developer Mode trong Discord → Click phải server → Copy Server ID

### Bước 3: Đăng ký Slash Commands

```bash
npm run deploy-commands
```

### Bước 4: Chạy bot

```bash
npm start
```

Bot sẽ hiển thị `✅ Bot đã online` khi thành công!

## 🐳 Deploy lên Cloud (chạy 24/7)

### Railway (Khuyên dùng)

1. Push code lên GitHub
2. Truy cập [railway.app](https://railway.app)
3. New Project → Deploy from GitHub Repo
4. Thêm Environment Variables: `DISCORD_TOKEN`, `CLIENT_ID`
5. Deploy!

### Docker

```bash
docker build -t discord-music-bot .
docker run -d --env-file .env discord-music-bot
```

## 🔧 Tạo Bot trên Discord Developer Portal

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → Đặt tên → Create
3. Vào tab **Bot**:
   - Click **Reset Token** → Copy token
   - Bật **SERVER MEMBERS INTENT** và **MESSAGE CONTENT INTENT**
4. Vào tab **OAuth2** → **URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Connect`, `Speak`, `Use Slash Commands`
   - Copy URL → Mở trong trình duyệt → Invite bot vào server

## 📝 License

MIT

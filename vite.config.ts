import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 5173,
      open: false,
      host: true,
      watch: {
        ignored: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.bin', '**/*.mp4', '**/motionfolio-realestate/**']
      }
    },
    plugins: [
      {
        name: 'baha-telegram-proxy',
        configureServer(server) {
          server.middlewares.use('/api/telegram/send', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body || '{}');
                let token = (payload.token || env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '').trim();
                const chatId = (payload.chatId || env.TELEGRAM_CHAT_ID || '7775586213').trim();
                const text = (payload.text || '').trim();

                // Clean 'bot' prefix if user typed e.g. 'bot8684276925:...'
                if (token.toLowerCase().startsWith('bot')) {
                  token = token.slice(3).trim();
                }

                if (!token) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    ok: false,
                    description: 'Thiếu Token Bot Telegram. Vui lòng nhập Token vào ô Cài đặt hoặc khai báo trong .env'
                  }));
                  return;
                }

                // Check if user accidentally entered only Bot ID instead of full Bot Token
                if (!token.includes(':')) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    ok: false,
                    description: `Token không đúng định dạng. Bạn đang nhập Bot ID (${token}) thay vì Token đầy đủ. Token Telegram bắt buộc có dấu hai chấm ':' (Ví dụ: ${token}:AAH_xxx). Vui lòng lấy Token từ @BotFather.`
                  }));
                  return;
                }

                if (!chatId || !text) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    ok: false,
                    description: 'Thiếu chatId hoặc nội dung tin nhắn'
                  }));
                  return;
                }

                // Security: Reject group chat IDs (negative numbers)
                if (parseInt(chatId, 10) < 0) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    ok: false,
                    description: 'GROUP_RECIPIENT_REJECTED: Báo cáo chỉ được gửi vào chat riêng tư, không gửi vào nhóm chung.'
                  }));
                  return;
                }

                // Security: Reject prohibited attendance bot (8660244994)
                if (token.startsWith('8660244994')) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    ok: false,
                    description: 'PROHIBITED_BOT_REJECTED: Nghiêm cấm dùng Bot Chấm Công để gửi báo cáo điều hành.'
                  }));
                  return;
                }

                // Server-side direct dispatch to Telegram API (bypasses browser CORS)
                const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json; charset=utf-8' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                  })
                });

                const tgData = await tgRes.json().catch(() => ({}));
                if (!tgData.ok && tgRes.status === 404) {
                  tgData.description = `Mã Token không hợp lệ hoặc đã bị thu hồi (Lỗi 404: Not Found từ Telegram). Vui lòng kiểm tra lại Token chính xác từ @BotFather.`;
                }
                res.statusCode = tgRes.status;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify(tgData));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({
                  ok: false,
                  description: err.message || 'Lỗi xử lý gửi tin nhắn tại máy chủ Vite'
                }));
              }
            });
          });
        }
      }
    ],
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 1200
    }
  };
});

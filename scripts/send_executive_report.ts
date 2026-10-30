/**
 * BAHA GROUP - EXECUTIVE REPORTING CLI ENGINE
 * Bot: @BAHA_DieuHanh_bot (ID: 8684276925)
 * Destination: Founder Nguyen Canh Dieu (7775586213)
 * 
 * Usage:
 *   node --experimental-strip-types scripts/send_executive_report.ts [options]
 *   npm run report
 *   npm run report:send
 * 
 * Options:
 *   --send                Send directly to Telegram API (requires TELEGRAM_BOT_TOKEN)
 *   --preset <name>       Preset template: 'realweb' (PRJ_048) or '059' (PRJ_059)
 *   --project <code/name> Project code or name override
 *   --author <name>       Author / reporter name
 *   --chat <id>           Target chat ID (default: 7775586213)
 *   --token <token>       Bot token override
 *   --json                Output JSON format
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type { DailyReportInput } from '../src/services/TelegramReportService.ts';
import {
  generateDailyReportMarkdown,
  getDefaultRealWebReport,
  getPrj059Report,
  sendExecutiveReport,
  BAHA_TELEGRAM_CONSTANTS
} from '../src/services/TelegramReportService.ts';

// Simple .env loader
function loadEnvFile(envPath: string) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

// Load .env if present
const workspaceRoot = path.resolve(import.meta.dirname, '..');
loadEnvFile(path.join(workspaceRoot, '.env'));
loadEnvFile(path.join(workspaceRoot, '.env.local'));

// Parse CLI flags
function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    }
  }
  return options;
}

// Get recent git commits to help inform the report
function getRecentGitCommits(): string[] {
  try {
    const gitLog = execSync('git log -n 5 --pretty=format:"%s"', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    return gitLog.split('\n').map(s => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

async function main() {
  const opts = parseArgs();

  const isSend = Boolean(opts['send']);
  const isJson = Boolean(opts['json']);
  const preset = String(opts['preset'] || 'realweb').toLowerCase();

  // 1. Base Report Data
  let reportData: DailyReportInput = preset === '059'
    ? getPrj059Report()
    : getDefaultRealWebReport();

  // Overrides from CLI
  if (opts['project']) {
    reportData.projectCode = String(opts['project']);
  }
  if (opts['author']) {
    reportData.authorName = String(opts['author']);
  }
  if (opts['tests']) {
    reportData.testResults = String(opts['tests']);
  }

  // 2. Resolve Telegram Credentials
  const botToken = String(
    opts['token'] ||
    process.env['TELEGRAM_BOT_TOKEN'] ||
    process.env['BAHA_DIEUHANH_BOT_TOKEN'] ||
    process.env['PRJ011_TELEGRAM_BOT_TOKEN'] ||
    ''
  ).trim();

  const targetChatId = String(
    opts['chat'] ||
    process.env['TELEGRAM_CHAT_ID'] ||
    process.env['AUTHORIZED_CHAT_ID'] ||
    BAHA_TELEGRAM_CONSTANTS.DEFAULT_FOUNDER_CHAT_ID
  ).trim();

  // 3. Generate Report Text
  const markdownReport = generateDailyReportMarkdown(reportData);

  // 4. Execution
  if (isSend) {
    if (!botToken) {
      console.error('\x1b[31m[LỖI]\x1b[0m Không tìm thấy Token Bot Telegram.');
      console.error('Vui lòng thiết lập biến môi trường TELEGRAM_BOT_TOKEN trong .env hoặc truyền qua cờ --token.');
      console.error('Hệ thống sẽ chuyển sang chế độ xem trước an toàn:\n');
    }
  }

  const result = await sendExecutiveReport(markdownReport, {
    botToken: isSend ? botToken : undefined, // dry-run if not --send
    chatId: targetChatId
  });

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  // Beautiful Terminal Output
  console.log('\n================================================================================');
  console.log('       BAHA GROUP — BÁO CÁO ĐIỀU HÀNH HẰNG NGÀY CHO SẾP (TELEGRAM)');
  console.log('================================================================================');
  console.log(`🤖 Bot điều hành:     ${BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME} (ID: ${BAHA_TELEGRAM_CONSTANTS.BOT_ID})`);
  console.log(`👤 Người nhận đích:   Founder ${BAHA_TELEGRAM_CONSTANTS.DEFAULT_FOUNDER_NAME} (${targetChatId})`);
  console.log(`📁 Dự án:             ${reportData.projectName} (${reportData.projectCode})`);
  console.log(`✍️  Người phụ trách:   ${reportData.authorName}`);
  console.log(`📏 Độ dài bản tin:    ${result.charCount} / ${BAHA_TELEGRAM_CONSTANTS.TELEGRAM_MAX_CHARS} ký tự`);
  console.log('--------------------------------------------------------------------------------');

  if (result.simulated) {
    console.log('\x1b[33m⚡ TRẠNG THÁI: CHẾ ĐỘ MÔ PHỎNG AN TOÀN (CHO_KET_NOI)\x1b[0m');
    console.log('• Bản tin đã được kiểm tra định dạng Markdown và bảo vệ cấu trúc hợp lệ.');
    console.log('• Không có tin nhắn tự động nào bị phát tán ngoài ý muốn.');
    console.log('• Để gửi trực tiếp: thêm cờ --send và cấu hình TELEGRAM_BOT_TOKEN trong .env.\n');
  } else if (result.ok) {
    console.log('\x1b[32m✔ TRẠNG THÁI: ĐÃ PHÁT TIN THÀNH CÔNG TỚI TELEGRAM SẾP\x1b[0m');
    console.log(`• Telegram Message ID: \x1b[36m${result.messageId}\x1b[0m`);
    console.log(`• Thời gian gửi:       ${result.timestamp}\n`);
  } else {
    console.log('\x1b[31m✖ TRẠNG THÁI: GỬI THẤT BẠI\x1b[0m');
    console.log(`• Nguyên nhân: ${result.errorMessage}\n`);
  }

  console.log('--- [NỘI DUNG BẢN TIN MARKDOWN] ------------------------------------------------');
  console.log(markdownReport);
  console.log('--------------------------------------------------------------------------------\n');

  // Attempt to copy to clipboard on Windows if previewing
  if (result.simulated && process.platform === 'win32') {
    try {
      const tmpFile = path.join(workspaceRoot, 'scripts', '.tmp_report.txt');
      fs.writeFileSync(tmpFile, markdownReport, 'utf8');
      execSync(`powershell -NoProfile -Command "Get-Content -Raw -Encoding UTF8 '${tmpFile}' | Set-Clipboard"`, { stdio: 'ignore' });
      fs.unlinkSync(tmpFile);
      console.log('📋 \x1b[32m[ĐÃ SAO CHÉP]\x1b[0m Nội dung Markdown đã được đưa vào Clipboard của máy tính.');
      console.log('   Bạn có thể nhấn Ctrl+V trực tiếp vào khung chat riêng với bot để kiểm tra ngay.\n');
    } catch {
      // Ignore clipboard fallback
    }
  }

  process.exit(result.ok ? 0 : 1);
}

main().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});

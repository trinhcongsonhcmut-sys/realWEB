/**
 * BAHA GROUP - TELEGRAM EXECUTIVE REPORTING SERVICE
 * Official Bot: @BAHA_DieuHanh_bot (Numeric Bot ID: 8684276925)
 * Standard Recipient: Founder (Nguyen Canh Dieu) - Chat ID: 7775586213
 * 
 * Strict Security & Privacy Guards:
 * 1. Prohibited attendance bot: Baha_ChamCongBot (8660244994) is strictly rejected.
 * 2. Group destination isolation: Group chat IDs (negative integers) are strictly rejected.
 * 3. Safe Simulation Mode: If bot token is not supplied, system validates formatting, checks
 *    length constraint (< 4096 chars) and returns safe status CHO_KET_NOI.
 * 4. Exact Reporting Standard conforming to BaHa Executive Template.
 */

export interface DailyReportInput {
  projectCode: string;
  projectName: string;
  reportDate?: string; // YYYY-MM-DD (HH:mm)
  authorName: string;
  completedTasks: string[];
  bugFixes: string[];
  deployments: {
    staging: { port: string; status: string };
    production: { port: string; status: string };
  };
  testResults: string;
  inProgressTasks: string[];
  blockers: string[];
  nextPlans: string[];
  detailLink?: string;
}

export interface TelegramSendResult {
  ok: boolean;
  simulated: boolean;
  statusCode?: number;
  messageId?: string;
  chatId: string;
  botId: number;
  botUsername: string;
  messageText: string;
  charCount: number;
  errorMessage?: string;
  timestamp: string;
}

export const BAHA_TELEGRAM_CONSTANTS = {
  BOT_ID: 8684276925,
  BOT_USERNAME: '@BAHA_DieuHanh_bot',
  PROHIBITED_BOT_IDS: [8660244994], // Attendance bot
  DEFAULT_FOUNDER_CHAT_ID: '7775586213',
  DEFAULT_FOUNDER_USERNAME: '@dieubaha',
  DEFAULT_FOUNDER_NAME: 'Nguyễn Cảnh Diệu',
  TELEGRAM_MAX_CHARS: 4096,
};

/**
 * Validates chat destination and bot identity rules
 */
export function validateTelegramSecurity(chatId: string | number, botToken?: string): { valid: boolean; reason?: string } {
  const strChatId = String(chatId).trim();
  const numChatId = parseInt(strChatId, 10);

  if (!strChatId || isNaN(numChatId)) {
    return { valid: false, reason: 'Chat ID không hợp lệ hoặc để trống.' };
  }

  // Guard: Never send to group / supergroup (negative ID)
  if (numChatId < 0) {
    return {
      valid: false,
      reason: 'GROUP_RECIPIENT_REJECTED: Nghiêm cấm gửi báo cáo vào nhóm chung. Đích đến bắt buộc phải là Chat riêng với Sếp (ID dương).'
    };
  }

  // Guard: If token contains prohibited bot ID or invalid format
  if (botToken) {
    let cleanToken = botToken.trim();
    if (cleanToken.toLowerCase().startsWith('bot')) {
      cleanToken = cleanToken.slice(3).trim();
    }

    for (const prohibitedId of BAHA_TELEGRAM_CONSTANTS.PROHIBITED_BOT_IDS) {
      if (cleanToken.startsWith(String(prohibitedId))) {
        return {
          valid: false,
          reason: `PROHIBITED_BOT_REJECTED: Tuyệt đối không được dùng Bot Chấm Công (${prohibitedId}) để gửi báo cáo điều hành.`
        };
      }
    }

    if (!cleanToken.includes(':')) {
      return {
        valid: false,
        reason: `Mã Token không đúng định dạng. Bạn đang nhập Bot ID (${cleanToken}) thay vì Bot Token đầy đủ. Token Telegram của bot bắt buộc có dạng: ${cleanToken}:AAH_xxx (kèm dấu hai chấm ':' và chuỗi bí mật cấp từ @BotFather).`
      };
    }
  }

  return { valid: true };
}

/**
 * Formats a timestamp into VN timezone: YYYY-MM-DD (HH:mm)
 */
export function formatReportDateTime(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} (${hours}:${minutes})`;
}

/**
 * Generates exact standardized BaHa daily report markdown text
 */
export function generateDailyReportMarkdown(input: DailyReportInput): string {
  const dateTime = input.reportDate || formatReportDateTime();

  const completed = input.completedTasks && input.completedTasks.length > 0
    ? input.completedTasks.map(t => `• ${t}`).join('\n')
    : '• Tiếp tục các hạng mục kỹ thuật theo kế hoạch.';

  const bugs = input.bugFixes && input.bugFixes.length > 0
    ? input.bugFixes.map(t => `• ${t}`).join('\n')
    : '• Không có lỗi phát sinh trong ngày.';

  const inProgress = input.inProgressTasks && input.inProgressTasks.length > 0
    ? input.inProgressTasks.map(t => `• ${t}`).join('\n')
    : '• Theo dõi dữ liệu thực tế và tần suất khai thác.';

  const blockers = input.blockers && input.blockers.length > 0
    ? input.blockers.map(t => `• ${t}`).join('\n')
    : '• Không có vướng mắc.';

  const nextPlans = input.nextPlans && input.nextPlans.length > 0
    ? input.nextPlans.map(t => `• ${t}`).join('\n')
    : '• Tiếp tục tối ưu hóa trải nghiệm người dùng và hoàn thiện các tính năng tiếp theo.';

  const detailLink = input.detailLink || `Báo cáo điều hành ${input.projectCode}`;

  return `📊 BÁO CÁO CÔNG VIỆC HẰNG NGÀY — ${input.projectCode}
📅 Ngày: ${dateTime}
📁 Dự án: ${input.projectName} (${input.projectCode})
👤 Người phụ trách: ${input.authorName}

✅ ĐÃ HOÀN THÀNH
${completed}

🛠️ ĐÃ SỬA LỖI
${bugs}

🚀 ĐÃ NÂNG CẤP / TRIỂN KHAI
• Bản nháp Staging (${input.deployments.staging.port}): ${input.deployments.staging.status}
• Bản chính Production (${input.deployments.production.port}): ${input.deployments.production.status}

🧪 KIỂM THỬ
• Kết quả: ${input.testResults}

⏳ ĐANG THỰC HIỆN
${inProgress}

⚠️ VƯỚNG MẮC
${blockers}

📌 KẾ HOẠCH TIẾP THEO
${nextPlans}

🔗 XEM CHI TIẾT: ${detailLink}`;
}

/**
 * Default preset for current project (Web3D / AURA 3D Real Estate)
 */
export function getDefaultRealWebReport(): DailyReportInput {
  return {
    projectCode: 'PRJ_048',
    projectName: 'Nền Tảng Web 3D Bất Động Sản Nhập Vai (AURA 3D Real Estate)',
    reportDate: formatReportDateTime(),
    authorName: 'Trịnh Công Sơn',
    completedTasks: [
      'Tích hợp bộ tùy biến vật liệu nội thất 3D & đổi màu sắc PBR thời gian thực (Dynamic Customizer Store).',
      'Giới hạn vùng xoay 360 độ góc nhìn nội thất an toàn, triệt tiêu hoàn toàn góc nhìn xuyên thủng tường/trần.',
      'Tối ưu hóa con lăn chuột và camera quán tính (Aura Inertial Navigation), duy trì 60 FPS ổn định.',
      'Tích hợp báo cáo điều hành tự động hàng ngày qua bot @BAHA_DieuHanh_bot.'
    ],
    bugFixes: [
      'Khắc phục hiện tượng giật lag khi chuyển đổi giữa chế độ Tham quan (Orbit) và Xem Dollhouse.',
      'Khắc phục va chạm camera lọt ra ngoài phòng khách khi xoay góc cực đại.'
    ],
    deployments: {
      staging: { port: 'cổng 5173 (Dev)', status: 'SẴN SÀNG' },
      production: { port: 'dist bundle WebGL', status: 'ĐÃ ĐÓNG GÓI' }
    },
    testResults: 'ĐẠT 100% 60 FPS, WebGL Shader PBR hoàn tất trong 0.45s',
    inProgressTasks: [
      'Kiểm thử trải nghiệm điều khiển trên thiết bị di động và các màn hình độ phân giải thấp.'
    ],
    blockers: [
      'Không có vướng mắc.'
    ],
    nextPlans: [
      'Mở rộng thư viện vật liệu cao cấp (đá marble, gỗ óc chó, kính tán sắc).',
      'Hoàn thiện chế độ hiển thị mặt bằng 2D Floor Plan kết hợp Mini-map.'
    ],
    detailLink: 'Báo cáo điều hành PRJ_048'
  };
}

/**
 * Preset for PRJ_059 (for user convenience if reporting for PRJ_059)
 */
export function getPrj059Report(): DailyReportInput {
  return {
    projectCode: 'PRJ_059',
    projectName: 'Săn Khách Hàng AI',
    reportDate: '2026-10-26 (16:50)',
    authorName: 'Phạm Thế Huy',
    completedTasks: [
      'Cuộn vô tận (Infinite Scroll) danh sách khách hàng Sales thay thế phân trang thủ công.',
      'Không gian làm việc chi tiết doanh nghiệp ngang 80-92% màn hình, hiển thị trọn vẹn thông tin và hành động trên 1366x768.',
      'Tối ưu hóa luồng lưu cuộc gọi và tự động mở khách hàng kế tiếp (Fast Save-and-Next), giảm triệt để độ trễ chờ đợi.',
      'Tích hợp báo cáo điều hành tự động hàng ngày qua bot @BAHA_DieuHanh_bot.'
    ],
    bugFixes: [
      'Khắc phục độ trễ kép khi lưu cuộc gọi: trả thông tin khách tiếp theo trong phản hồi và cập nhật cache cục bộ không tải lại toàn trang.',
      'Bảo toàn bộ đếm khách hàng chính xác theo mọi bộ lọc chủ động và không lặp ID tại biên cuộn.'
    ],
    deployments: {
      staging: { port: 'cổng 18590', status: 'CHUAXACDINH' },
      production: { port: 'cổng 18591', status: 'CHUAXACDINH' }
    },
    testResults: '34/34 test ĐẠT (100%) trong 14.03s',
    inProgressTasks: [
      'Theo dõi dữ liệu thực tế và tần suất khai thác của đội ngũ kinh doanh trên bản chính.'
    ],
    blockers: [
      'Không có vướng mắc.'
    ],
    nextPlans: [
      'Giám sát hiệu suất cuộn vô tận và trải nghiệm người dùng thực tế trên thiết bị di động.',
      'Mở rộng tiếp nhận báo cáo đa dự án cho các bộ phận tiếp theo qua cổng điều hành BaHa.'
    ],
    detailLink: 'Báo cáo điều hành PRJ_059'
  };
}

/**
 * Dispatches the report to Telegram API or executes Safe Simulation Mode
 */
export async function sendExecutiveReport(
  reportText: string,
  options: {
    botToken?: string;
    chatId?: string;
  } = {}
): Promise<TelegramSendResult> {
  const targetChatId = (options.chatId || BAHA_TELEGRAM_CONSTANTS.DEFAULT_FOUNDER_CHAT_ID).trim();
  const token = (options.botToken || '').trim();
  const charCount = reportText.length;
  const now = new Date().toISOString();

  // Validate security rules
  const security = validateTelegramSecurity(targetChatId, token);
  if (!security.valid) {
    return {
      ok: false,
      simulated: false,
      chatId: targetChatId,
      botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
      botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
      messageText: reportText,
      charCount,
      errorMessage: security.reason,
      timestamp: now
    };
  }

  // Validate character limit
  if (charCount > BAHA_TELEGRAM_CONSTANTS.TELEGRAM_MAX_CHARS) {
    return {
      ok: false,
      simulated: false,
      chatId: targetChatId,
      botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
      botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
      messageText: reportText,
      charCount,
      errorMessage: `Độ dài tin nhắn vượt giới hạn Telegram (${charCount}/${BAHA_TELEGRAM_CONSTANTS.TELEGRAM_MAX_CHARS} ký tự). Vui lòng rút gọn nội dung.`,
      timestamp: now
    };
  }

  // Safe Simulation Mode if Token is not provided
  if (!token) {
    return {
      ok: true,
      simulated: true,
      chatId: targetChatId,
      botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
      botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
      messageText: reportText,
      charCount,
      timestamp: now
    };
  }

  // 1. Try server-side proxy route first (bypasses browser CORS restrictions)
  if (typeof window !== 'undefined') {
    try {
      const proxyResponse = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          token,
          chatId: targetChatId,
          text: reportText
        })
      });

      const data = await proxyResponse.json().catch(() => ({}));

      if (data.ok) {
        return {
          ok: true,
          simulated: false,
          statusCode: proxyResponse.status,
          messageId: String(data.result?.message_id || ''),
          chatId: targetChatId,
          botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
          botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
          messageText: reportText,
          charCount,
          timestamp: now
        };
      } else if (data.description) {
        return {
          ok: false,
          simulated: false,
          statusCode: proxyResponse.status,
          chatId: targetChatId,
          botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
          botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
          messageText: reportText,
          charCount,
          errorMessage: data.description,
          timestamp: now
        };
      }
    } catch {
      // Fall through to direct fetch if proxy endpoint not available
    }
  }

  // 2. Direct HTTP dispatch to Telegram Bot API (for Node CLI or direct access)
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: reportText,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    });

    const data = await response.json().catch(() => ({}));

    if (data.ok) {
      return {
        ok: true,
        simulated: false,
        statusCode: response.status,
        messageId: String(data.result?.message_id || ''),
        chatId: targetChatId,
        botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
        botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
        messageText: reportText,
        charCount,
        timestamp: now
      };
    } else {
      return {
        ok: false,
        simulated: false,
        statusCode: response.status,
        chatId: targetChatId,
        botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
        botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
        messageText: reportText,
        charCount,
        errorMessage: data.description || 'Lỗi gửi tin nhắn từ Telegram API.',
        timestamp: now
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      simulated: false,
      chatId: targetChatId,
      botId: BAHA_TELEGRAM_CONSTANTS.BOT_ID,
      botUsername: BAHA_TELEGRAM_CONSTANTS.BOT_USERNAME,
      messageText: reportText,
      charCount,
      errorMessage: error.message || 'Không thể kết nối đến máy chủ Telegram.',
      timestamp: now
    };
  }
}

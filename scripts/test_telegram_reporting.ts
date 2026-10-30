/**
 * BAHA GROUP - EXECUTIVE REPORTING TEST SUITE
 * Verifies format matching, length limits, and security guards.
 */

import {
  generateDailyReportMarkdown,
  getDefaultRealWebReport,
  getPrj059Report,
  sendExecutiveReport,
  validateTelegramSecurity,
  BAHA_TELEGRAM_CONSTANTS
} from '../src/services/TelegramReportService.ts';

let passCount = 0;
let failCount = 0;

function assert(title: string, condition: boolean, extra = '') {
  if (condition) {
    passCount++;
    console.log(`\x1b[32m[PASS]\x1b[0m ${title}`);
  } else {
    failCount++;
    console.error(`\x1b[31m[FAIL]\x1b[0m ${title} ${extra ? `(${extra})` : ''}`);
  }
}

async function runTests() {
  console.log('======================================================================');
  console.log('STARTING BAHA EXECUTIVE REPORTING TEST SUITE');
  console.log('Bot Target: @BAHA_DieuHanh_bot (ID: 8684276925)');
  console.log('======================================================================\n');

  // Test 1: RealWeb Default Report Generation
  const realWebReport = getDefaultRealWebReport();
  const mdRealWeb = generateDailyReportMarkdown(realWebReport);
  assert('RealWeb report contains project code PRJ_048', mdRealWeb.includes('PRJ_048'));
  assert('RealWeb report contains header emoji', mdRealWeb.includes('📊 BÁO CÁO CÔNG VIỆC HẰNG NGÀY'));
  assert('RealWeb report contains completed section', mdRealWeb.includes('✅ ĐÃ HOÀN THÀNH'));
  assert('RealWeb report contains bugs section', mdRealWeb.includes('🛠️ ĐÃ SỬA LỖI'));
  assert('RealWeb report contains deployments section', mdRealWeb.includes('🚀 ĐÃ NÂNG CẤP / TRIỂN KHAI'));
  assert('RealWeb report contains tests section', mdRealWeb.includes('🧪 KIỂM THỬ'));
  assert('RealWeb report contains in progress section', mdRealWeb.includes('⏳ ĐANG THỰC HIỆN'));
  assert('RealWeb report contains blockers section', mdRealWeb.includes('⚠️ VƯỚNG MẮC'));
  assert('RealWeb report contains next plan section', mdRealWeb.includes('📌 KẾ HOẠCH TIẾP THEO'));
  assert('RealWeb report contains detail link section', mdRealWeb.includes('🔗 XEM CHI TIẾT:'));

  // Test 2: PRJ_059 Format Matching User Prompt
  const prj059Report = getPrj059Report();
  const md059 = generateDailyReportMarkdown(prj059Report);
  assert('PRJ_059 report matches exact title', md059.includes('📊 BÁO CÁO CÔNG VIỆC HẰNG NGÀY — PRJ_059'));
  assert('PRJ_059 report contains author Pham The Huy', md059.includes('👤 Người phụ trách: Phạm Thế Huy'));
  assert('PRJ_059 report contains Infinite Scroll bullet', md059.includes('Cuộn vô tận (Infinite Scroll)'));
  assert('PRJ_059 report contains 34/34 test result', md059.includes('34/34 test ĐẠT (100%) trong 14.03s'));

  // Test 3: Telegram Length Constraint (< 4096 characters)
  assert(`RealWeb report length (${mdRealWeb.length}) <= 4096`, mdRealWeb.length <= BAHA_TELEGRAM_CONSTANTS.TELEGRAM_MAX_CHARS);
  assert(`PRJ_059 report length (${md059.length}) <= 4096`, md059.length <= BAHA_TELEGRAM_CONSTANTS.TELEGRAM_MAX_CHARS);

  // Test 4: Security Guard - Group Chat Rejection (Negative Chat ID)
  const groupCheck = validateTelegramSecurity('-1003995507922');
  assert('Group chat ID (-100...) is strictly rejected', !groupCheck.valid && groupCheck.reason?.includes('GROUP_RECIPIENT_REJECTED'));

  // Test 5: Security Guard - Attendance Bot Token Rejection
  const attCheck = validateTelegramSecurity('7775586213', '8660244994:AAHFakeAttendanceToken');
  assert('Attendance bot token (8660244994) is strictly rejected', !attCheck.valid && attCheck.reason?.includes('PROHIBITED_BOT_REJECTED'));

  // Test 6: Security Guard - Authorized Founder Chat ID Acceptance
  const founderCheck = validateTelegramSecurity('7775586213');
  assert('Founder chat ID 7775586213 is valid and accepted', founderCheck.valid);

  // Test 7: Safe Simulation Mode (No Token Provided)
  const simResult = await sendExecutiveReport(mdRealWeb, {
    chatId: '7775586213'
  });
  assert('Simulation mode returns ok = true', simResult.ok === true);
  assert('Simulation mode flags simulated = true', simResult.simulated === true);
  assert('Simulation mode binds to correct bot ID 8684276925', simResult.botId === 8684276925);
  assert('Simulation mode binds to correct username @BAHA_DieuHanh_bot', simResult.botUsername === '@BAHA_DieuHanh_bot');

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED (TOTAL: ${passCount + failCount})`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

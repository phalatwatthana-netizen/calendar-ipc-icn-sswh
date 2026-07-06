// ==========================================================
// แจ้งเตือนกำหนดการปฏิทินประจำวันเข้า Telegram
// ตั้ง time-driven trigger ให้เรียก sendCalendarDailyNotify ทุกเช้า
// ==========================================================
function sendCalendarDailyNotify() {
  var calendarId = 'icsswh2024@gmail.com';
  var calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log("❌ ไม่พบปฏิทิน กรุณาเช็ค Calendar ID");
    return;
  }

  var token = '8970873273:AAFYh7rIgeSk_o1YWMhMz5_bpBfQXWQPjwA';
  var chatId = '-5071211924';

  // ช่วงเวลาของ "วันนี้" 00:00–23:59
  var today = new Date();
  var startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  var endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  var events = calendar.getEvents(startOfDay, endOfDay);

  var dateStr = Utilities.formatDate(today, "Asia/Bangkok", "d/M/yyyy");
  var message;

  if (events.length === 0) {
    // ส่งข้อความแม้ไม่มีนัด เพื่อยืนยันว่าระบบทำงาน (ถ้าไม่อยากได้ ให้ใส่ return; แทนบรรทัดนี้)
    message = "📅 <b>กำหนดการวันที่ " + dateStr + "</b>\n\nวันนี้ไม่มีกำหนดการ ✅";
  } else {
    message = "📅 <b>กำหนดการสำหรับวันนี้ (" + dateStr + "):</b>\n\n";
    for (var i = 0; i < events.length; i++) {
      var title = escapeHtml(events[i].getTitle());
      var location = events[i].getLocation();

      if (events[i].isAllDayEvent()) {
        message += (i + 1) + ". <b>" + title + "</b> (ตลอดวัน)\n";
      } else {
        var startTime = Utilities.formatDate(events[i].getStartTime(), "Asia/Bangkok", "HH:mm");
        var endTime = Utilities.formatDate(events[i].getEndTime(), "Asia/Bangkok", "HH:mm");
        message += (i + 1) + ". <b>" + title + "</b> (เวลา " + startTime + " - " + endTime + " น.)\n";
      }

      if (location) {
        message += "📍 สถานที่: " + escapeHtml(location) + "\n";
      }
      message += "\n";
    }
  }

  sendTelegramTextCal(token, chatId, message);
}

// escape อักขระพิเศษของ HTML (ใช้กับ parse_mode HTML ปลอดภัยกว่า Markdown)
function escapeHtml(text) {
  if (!text) return "";
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ส่งข้อความเข้า Telegram + log response จริงจาก Telegram เพื่อดีบัก
function sendTelegramTextCal(token, chat_id, message) {
  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  var payload = {
    chat_id: chat_id,
    text: message,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true   // สำคัญ: ให้เห็น error จริงจาก Telegram แทนที่จะ throw เงียบ ๆ
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var body = response.getContentText();
  Logger.log("Telegram HTTP " + code + " → " + body);

  if (code === 200) {
    Logger.log("✅ ส่งแจ้งเตือนปฏิทินสำเร็จ");
  } else {
    Logger.log("❌ ส่งไม่สำเร็จ — ดู description ในบรรทัดบนเพื่อหาสาเหตุ");
  }
}

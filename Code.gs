// เปิดหน้าเว็บ Web App
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ระบบบันทึกนัดหมายและกิจกรรม')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// รับข้อมูลจากหน้าเว็บและบันทึกลง Calendar
function saveEventFromWebApp(formData) {
  var calendarId = 'icsswh2024@gmail.com';
  var calendar = CalendarApp.getCalendarById(calendarId);

  if (!calendar) {
    return { success: false, message: "❌ ไม่พบปฏิทิน กรุณาตรวจสอบสิทธิ์และ Calendar ID" };
  }

  try {
    var startDateTime = new Date(formData.date + 'T' + formData.startTime + ':00');

    // ตรวจสอบว่าวันที่/เวลาที่ส่งมาถูกต้อง
    if (isNaN(startDateTime.getTime())) {
      return { success: false, message: "❌ วันที่หรือเวลาไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" };
    }

    var endDateTime;
    var eventTitle = '';
    var eventDetails = '';

    // แยกการทำงานตามประเภทของฟอร์มที่ส่งมา
    if (formData.type === 'general') {
      // 📌 ฟอร์มกิจกรรมทั่วไป
      eventTitle = formData.title;
      eventDetails = formData.description || "";

      if (formData.endTime) {
        endDateTime = new Date(formData.date + 'T' + formData.endTime + ':00');
      } else {
        // หากไม่ระบุเวลาสิ้นสุด ให้ตั้งเป็น 1 ชั่วโมง
        endDateTime = new Date(startDateTime.getTime() + (1 * 60 * 60 * 1000));
      }

    } else if (formData.type === 'blood_test') {
      // 📌 ฟอร์มนัดเจาะเลือด
      // จัดรูปแบบหัวข้อในปฏิทิน
      eventTitle = "นัดเจาะเลือด";
      if (formData.code) eventTitle += " CODE: " + formData.code;
      if (formData.hn) eventTitle += " (HN: " + formData.hn + ")";

      endDateTime = new Date(startDateTime.getTime() + (1 * 60 * 60 * 1000)); // นัดเจาะเลือดตีเวลาไว้ 1 ชม.

      // จัดรูปแบบรายละเอียดการนัดหมาย
      eventDetails = "👤 ข้อมูลผู้ป่วย:\n";
      eventDetails += "- ชื่อ-สกุล: " + (formData.name ? formData.name : "-") + "\n";
      eventDetails += "- HN: " + (formData.hn ? formData.hn : "-") + "\n";
      eventDetails += "- CODE: " + (formData.code ? formData.code : "-") + "\n";
      eventDetails += "- เบอร์โทร: " + (formData.phone ? formData.phone : "-") + "\n\n";

      eventDetails += "🩸 รายการตรวจที่นัดหมาย:\n" + (formData.labs ? formData.labs : "ไม่มีการระบุรายการตรวจ") + "\n\n";

      if (formData.description) {
        eventDetails += "📝 หมายเหตุ: " + formData.description;
      }

    } else {
      // ประเภทฟอร์มที่ไม่รู้จัก
      return { success: false, message: "❌ ประเภทฟอร์มไม่ถูกต้อง" };
    }

    // กันกรณีเวลาสิ้นสุดอยู่ก่อนเวลาเริ่มต้น
    if (endDateTime <= startDateTime) {
      endDateTime = new Date(startDateTime.getTime() + (1 * 60 * 60 * 1000));
    }

    // สร้างกิจกรรมลงปฏิทิน
    var event = calendar.createEvent(eventTitle, startDateTime, endDateTime, {
      description: eventDetails
    });

    return {
      success: true,
      message: "✅ บันทึกข้อมูลลงปฏิทินสำเร็จ!"
    };

  } catch (error) {
    return { success: false, message: "❌ เกิดข้อผิดพลาด: " + error.toString() };
  }
}

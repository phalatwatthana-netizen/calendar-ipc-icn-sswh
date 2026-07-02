# ระบบบันทึกนัดหมายและกิจกรรม (Calendar Web App)

เว็บแอปสำหรับบันทึกนัดหมาย/กิจกรรมลง Google Calendar ทำงานบน **Google Apps Script**
รองรับ 2 ฟอร์ม: กิจกรรมทั่วไป และ นัดติดตามผลเลือด

## โครงสร้างไฟล์

| ไฟล์ใน repo | ชื่อไฟล์ในโปรเจกต์ Apps Script | หน้าที่ |
|-------------|-------------------------------|---------|
| `index.html` | `index` | หน้าเว็บ (frontend) |
| `Code.gs`    | `Code` (หรือ `รหัส`)          | โค้ดฝั่งเซิร์ฟเวอร์ (`doGet`, `saveEventFromWebApp`) |

## วิธีติดตั้ง / แก้ปัญหา `No HTML file named index was found`

`doGet()` เรียก `HtmlService.createHtmlOutputFromFile('index')` ซึ่งจะมองหาไฟล์
ที่ชื่อว่า **`index`** ในโปรเจกต์ Apps Script

- ชื่อไฟล์ HTML ในตัว editor **ไม่มีนามสกุล `.html`** ต่อท้าย — ไฟล์ `index.html` จะแสดงชื่อเป็น `index`
- ตัวพิมพ์เล็ก/ใหญ่มีผล: `Index` ≠ `index`

หากพบ error นี้ ให้เข้า Apps Script editor → คลิก `⋮` ข้างไฟล์ HTML → **Rename** →
ตั้งชื่อเป็น `index` (ตัวพิมพ์เล็กทั้งหมด) แล้ว **Deploy เวอร์ชันใหม่**

## การตั้งค่า

- แก้ `calendarId` ใน `Code.gs` ให้เป็นอีเมลของปฏิทินที่ต้องการบันทึก
- บัญชีที่รัน Apps Script ต้องมีสิทธิ์เขียนปฏิทินนั้น

## การ Deploy

Deploy → New deployment → เลือกชนิด **Web app** → ตั้ง "Execute as" และ "Who has access"
ตามต้องการ → Deploy แล้วเปิดลิงก์ Web App

หลังแก้โค้ดทุกครั้ง ต้องอัปเดตเป็น **New version** ใน Manage deployments การเปลี่ยนแปลงจึงมีผล

## การใช้งานผ่านโดเมนอื่น (เช่น Netlify)

หน้าเว็บนี้รองรับ 2 ช่องทางในการบันทึกข้อมูล โดยตรวจสอบอัตโนมัติใน `sendData()`:

1. **เปิดผ่าน Apps Script `.../exec` โดยตรง** → ใช้ `google.script.run.saveEventFromWebApp()`
2. **เปิดจากโดเมนอื่น เช่น Netlify** (ไม่มี `google.script.run`) → ยิง HTTP POST ไปยัง
   Apps Script ผ่าน `fetch()` เข้าฟังก์ชัน `doPost(e)`

ข้อกำหนดเมื่อ host frontend ไว้ที่อื่น:

- ตั้งค่าตัวแปร `SCRIPT_URL` ในหัว `<script>` ของ `index.html` ให้เป็น URL `.../exec` ล่าสุด
  (ถ้าสร้าง deployment ใหม่ URL จะเปลี่ยน ต้องอัปเดตด้วย)
- Deployment ต้องตั้ง **"Who has access" = `Anyone`** เพื่อให้ `fetch()` เข้าถึงได้โดยไม่ต้องล็อกอิน
- `fetch` ส่ง body เป็น `text/plain` (JSON string) เพื่อเลี่ยง CORS preflight — ฝั่ง `doPost`
  จะ `JSON.parse(e.postData.contents)` เอง

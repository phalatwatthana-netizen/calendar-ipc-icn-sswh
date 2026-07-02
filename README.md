# ระบบบันทึกนัดหมายและกิจกรรม (Calendar Web App)

เว็บแอปสำหรับบันทึกนัดหมาย/กิจกรรมลง Google Calendar ทำงานบน **Google Apps Script**
รองรับ 2 ฟอร์ม: กิจกรรมทั่วไป และ นัดติดตามผลเลือด

## สถาปัตยกรรม

- **Frontend:** `index.html` โฮสต์บน **Netlify** (`https://calendar-ipc-icn-sswh.netlify.app/`)
- **Backend:** `Code.gs` อยู่บน **Google Apps Script** เป็น Web App รับข้อมูลผ่าน `doPost` แล้วบันทึกลง Calendar

| ไฟล์ใน repo | ที่อยู่จริง | หน้าที่ |
|-------------|------------|---------|
| `index.html` | Netlify | หน้าเว็บฟอร์ม ยิงข้อมูลด้วย `fetch()` ไปที่ `SCRIPT_URL` |
| `Code.gs`    | Apps Script (ไฟล์เดียว) | `doPost` รับข้อมูล + `saveEvent` บันทึกปฏิทิน |

> โปรเจกต์ Apps Script **มีแค่ไฟล์ `Code.gs` ไฟล์เดียว ไม่ต้องมีไฟล์ HTML** — `doGet`
> คืนข้อความสถานะเฉย ๆ (ฟอร์มอยู่บน Netlify) จึงไม่มีปัญหา `No HTML file named index`

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

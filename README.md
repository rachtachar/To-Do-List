# 📋 TaskFlow Pro - Fullstack To-Do List & Dashboard

โปรเจกต์เว็บแอปพลิเคชันจัดการรายการงาน (To-Do List) พร้อมระบบแบ่งหมวดหมู่ แท็กผู้เกี่ยวข้อง ค้นหา/กรองข้อมูล และแดชบอร์ดแสดงผลสถิติ พัฒนาขึ้นสำหรับแบบทดสอบทักษะ Fullstack Developer Internship

---

## 🚀 สถาปัตยกรรมและเทคโนโลยีที่ใช้ (Tech Stack)

### **Frontend (Client)**
* **Framework:** React 19 + Vite (TypeScript)
* **Styling:** Tailwind CSS v4
* **Icons:** Lucide React
* **Data Visualization:** Recharts (สำหรับวาดกราฟสถิติใน Dashboard)
* **HTTP Client:** Axios (พร้อม Request Interceptor แนบ JWT Token อัตโนมัติ)
* **State Management:** React Context API (`AuthContext`)

### **Backend (Server)**
* **Runtime & Framework:** Node.js + Express (TypeScript)
* **ORM:** Prisma ORM v6
* **Database:** PostgreSQL
* **Authentication:** JSON Web Token (JWT) + bcryptjs (สำหรับ Hash รหัสผ่าน)
* **Development Tool:** TSX (TypeScript Execute with Watch Mode)

---

## ✨ ฟีเจอร์ที่พัฒนาตามโจทย์ (Key Features)

| เงื่อนไขตามโจทย์ | การทำงานในระบบ |
| :--- | :--- |
| **1. ผู้ใช้แต่ละคนมีรายการงานของตัวเอง** | ระบบลงทะเบียน/เข้าสู่ระบบด้วย JWT พร้อมแยกสิทธิ์การเข้าถึงข้อมูลตาม `creatorId` |
| **2. แบ่งหมวดหมู่ได้** | จัดการหมวดหมู่ (Categories) พร้อมกำหนดโค้ดสี Hex เพื่อแสดง Badge สวยงาม |
| **3. เพิ่ม ลบ แก้ไข ตั้งสถานะงาน** | ทำ CRUD งานได้ครบถ้วน และมี Dropdown สลับสถานะ (To Do, In Progress, Done) ได้ทันที |
| **4. แท็กผู้ที่เกี่ยวข้องได้** | รองรับ Many-to-Many (`TaskCollaborator`) สามารถเลือกแท็กเพื่อนร่วมงานได้หลายคน พร้อมแสดง Avatar และตัวกรอง "งานที่ถูกแท็ก" |
| **5. ค้นหา หรือ กรองงานได้** | ค้นหาจากชื่อ/รายละเอียด (Debounced Search) และกรองตามสถานะ, หมวดหมู่, ระดับความสำคัญ (Priority) และประเภทงาน |
| **6. กำหนดเวลา & แจ้งเตือน Overdue** | กำหนดวัน-เวลาส่งงาน (Due Date) พร้อมขึ้นข้อความแจ้งเตือนสีแดงเมื่อเลยกำหนดส่ง |
| **7. Dashboard แสดงผลสถิติ** | แสดงการ์ด KPI สรุปสถานะงาน, กราฟแท่งแยกตามหมวดหมู่, กราฟวงกลมสัดส่วนสถานะงาน และรายการงานที่ใกล้ถึงกำหนดส่งเร็วๆ นี้ |

---

## 🛠️ ขั้นตอนการติดตั้งและรันในเครื่อง (Getting Started)

### 1. ติดตั้ง Dependencies
เปิด Terminal แล้วเข้าไปติดตั้งแพ็กเกจทั้ง 2 ฝั่ง:

```bash
# ฝั่ง Backend
cd backend
npm install

# ฝั่ง Frontend
cd ../frontend
npm install
```

### 2. ตั้งค่า Environment Variables (`backend/.env`)
สร้างหรือตรวจสอบไฟล์ `backend/.env`:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME?sslmode=require"
PORT=5000
JWT_SECRET="your-super-secret-key-change-this"
```

### 3. รัน Database Migration & Seed ข้อมูลทดสอบ
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 4. รันโปรเจกต์
เปิด Terminal 2 หน้าต่าง:

**หน้าต่างที่ 1 (Backend):**
```bash
cd backend
npm run dev
# เซิร์ฟเวอร์จะรันที่: http://localhost:5000
```

**หน้าต่างที่ 2 (Frontend):**
```bash
cd frontend
npm run dev
# เว็บไซต์จะเปิดที่: http://localhost:5173
```

---

## 🔑 บัญชีตัวอย่างสำหรับเข้าทดสอบระบบ (Test Accounts)

สามารถใช้บัญชีที่สร้างจาก Seed Data ล็อกอินเพื่อทดสอบได้ทันที:

### 👤 Account 1: เจ้าของงาน
* **Email:** `alex@example.com`
* **Password:** `password123`
* *จุดเด่นสำหรับทดสอบ:* มีงานหลากหลายสถานะ, มีงานที่เลยกำหนดส่ง (Overdue) สำหรับดู Dashboard และมีงานที่แท็กหา Sarah

### 👤 Account 2: เพื่อนร่วมงานที่ถูกแท็ก
* **Email:** `sarah@example.com`
* **Password:** `password123`
* *จุดเด่นสำหรับทดสอบ:* เมื่อเลือกตัวกรอง **"งานที่ถูกแท็ก (Tagged to me)"** จะเจองานที่ Alex แท็กมาหาทันที

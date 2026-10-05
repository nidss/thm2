# ThaiMove — Landing Page

Landing page ของ ThaiMove (ทุกก้าวมีความหมาย): รวมสถิติการออกกำลังกายจากหลายแอป แปลงเป็นคะแนน แลกของรางวัล ไต่ Ranking และแข่งกับคลับ

Static site — HTML/CSS/JS ล้วน ไม่มี build step  
Motion ใช้ [GSAP](https://gsap.com/) + ScrollTrigger (โหลดจาก cdnjs)

## Pages

| ไฟล์ | หน้า |
|---|---|
| `index.html` | Landing page |
| `privacy.html` | นโยบายความเป็นส่วนตัว |
| `terms.html` | ข้อกำหนดและเงื่อนไขการใช้บริการ |
| `contact.html` | ติดต่อเรา |

`styles.css` ใช้ร่วมทุกหน้า · `main.js` motion ของหน้า landing · `page.js` motion ของหน้าย่อย

## Run locally

เปิดผ่าน static server ใดก็ได้ เช่น

```bash
npx serve .
```

## Assets

- `assets/logo-*.svg` — โลโก้ ThaiMove จาก ThaiMove Design System (เวอร์ชัน `-light` สำหรับพื้นมืด)
- `assets/brands/` — ไอคอนแอปพาร์ทเนอร์: Strava, Huawei, Google Fit จาก [Simple Icons](https://simpleicons.org/) (CC0), Apple Health จาก Wikimedia Commons (Public domain) — เป็นเครื่องหมายการค้าของเจ้าของแต่ละราย

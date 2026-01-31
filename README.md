# 🛡️ Smart New Tab Blocker

<p align="center">
  <img src="https://img.shields.io/badge/Nền%20tảng-Chrome%20%7C%20Edge-blue?logo=googlechrome&style=flat-square">
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=flat-square">
  <img src="https://img.shields.io/badge/Quyền%20riêng%20tư-Không%20theo%20dõi-success?style=flat-square">
</p>

<p align="center">
  <strong>Ngăn tab mới không mong muốn trước khi chúng được mở.</strong>
</p>

<p align="center">
  <a href="README.EN.md">English</a>
</p>

---

## ❓ Extension này dùng để làm gì?

😤 Bạn đã bao giờ:
- Click 1 link → bị mở ra **2–3 tab quảng cáo**
- Bị **tự động chuyển sang trang cá cược / spam**
- Website cứ **tự mở tab mới liên tục**

👉 **Smart New Tab Blocker** giúp bạn **chặn những hành vi đó lại**.

Extension sẽ **dừng tab mới** và **hỏi bạn trước** xem có cho phép mở hay không.

---

## ⭐ Tính năng chính (dễ hiểu)

### 🛑 Chặn tab mới không mong muốn
- Khi website muốn mở tab mới
- Extension sẽ **chặn lại ngay**
- Không có tab quảng cáo nào bật lên bất ngờ

---

### ❓ Hỏi trước khi mở tab
- Extension hiển thị một hộp hỏi:
  - ✅ **Cho phép**
  - ❌ **Chặn**
- Bạn là người **quyết định cuối cùng**

---

### 🧠 Ghi nhớ lựa chọn của bạn
- Bạn có thể chọn **Ghi nhớ**
- Extension sẽ:
  - Luôn cho phép website bạn tin tưởng
  - Luôn chặn website spam
- Lần sau **không cần hỏi lại**

---

### 🕵️‍♂️ Chặn chuyển hướng ẩn
- Một số website không mở tab trực tiếp
- Chúng dùng:
  - iframe
  - quảng cáo ẩn
  - nội dung ẩn trong trang
- Extension vẫn **phát hiện và chặn được**

---

### 🔒 Tôn trọng quyền riêng tư
- ❌ Không theo dõi bạn
- ❌ Không thu thập dữ liệu
- ✅ Mọi thiết lập chỉ lưu trên **máy của bạn**

---

## 🔄 Cách extension hoạt động (từng bước)

1️⃣ Bạn click vào một link  
2️⃣ Website cố mở tab mới  
3️⃣ Extension **chặn lại ngay lập tức**  
4️⃣ Hộp hỏi hiện ra  
5️⃣ Bạn chọn:
   - ✅ **Cho phép** → tab mở
   - ❌ **Chặn** → tab không mở  
6️⃣ (Tuỳ chọn) Bật **Ghi nhớ** để lần sau khỏi hỏi

---

## 📦 Cài đặt extension

### 🧑‍💻 Cài từ mã nguồn (Developer mode)

1️⃣ Tải repository này về máy  
2️⃣ Mở trình duyệt:
- Chrome: `chrome://extensions`
- Edge: `edge://extensions`

3️⃣ Bật **Developer mode**  
4️⃣ Chọn **Load unpacked**  
5️⃣ Chọn thư mục extension  

👉 Xong! Extension hoạt động ngay.

---

### 🏬 Cài từ Store (sắp có)

> 🚧 **Chrome Web Store & Edge Add-ons đang được chuẩn bị**

---

## 🧠 Sơ đồ hoạt động (dễ hình dung)

```mermaid
flowchart TD
    A[🖱️ Bạn click link] --> B[🌐 Website muốn mở tab mới]
    B --> C[🛑 Extension chặn lại]
    C --> D{🤔 Bạn chọn gì?}
    D -->|✅ Cho phép| E[🆕 Mở tab]
    D -->|❌ Chặn| F[🚫 Không mở tab]
    D -->|🧠 Ghi nhớ| G[💾 Lưu lựa chọn cho website]

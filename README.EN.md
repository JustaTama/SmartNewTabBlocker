# 🛡️ Smart New Tab Blocker

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge-blue?logo=googlechrome&style=flat-square">
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=flat-square">
  <img src="https://img.shields.io/badge/Privacy-No%20Tracking-success?style=flat-square">
</p>

<p align="center">
  <strong>Stop unwanted new tabs before they open.</strong>
</p>

---

## ❓ What does this extension do?

😤 Have you ever:
- Clicked a link and **multiple ad tabs suddenly opened**
- Been **redirected to betting or spam websites**
- Visited a site that keeps **forcing new tabs** on you

👉 **Smart New Tab Blocker** puts an end to that.

The extension **stops new tabs before they open** and lets **you decide** what should happen.

---

## ⭐ Key Features (easy to understand)

### 🛑 Block unwanted new tabs
- When a website tries to open a new tab
- The extension **blocks it instantly**
- No surprise ads or popups

---

### ❓ Ask before opening
- A simple popup appears with two options:
  - ✅ **Allow**
  - ❌ **Block**
- You stay in control at all times

---

### 🧠 Remember your choice
- Choose **Remember my decision**
- The extension will:
  - Always allow trusted websites
  - Always block spammy websites
- No need to answer again next time

---

### 🕵️‍♂️ Block hidden redirects
- Some websites don’t open tabs directly
- They hide redirects inside:
  - Iframes
  - Ads
  - Hidden page elements (Shadow DOM)
- **Smart New Tab Blocker still detects and blocks them**

---

### 🔒 Privacy-friendly
- ❌ No tracking
- ❌ No data collection
- ✅ All settings are stored **locally on your device**

---

## 🔄 How it works (step by step)

1️⃣ You click a link  
2️⃣ The website tries to open a new tab  
3️⃣ The extension **stops it immediately**  
4️⃣ A confirmation popup appears  
5️⃣ You choose:
   - ✅ **Allow** → the tab opens
   - ❌ **Block** → nothing happens  
6️⃣ (Optional) Enable **Remember** to save your choice

---

## 📦 Installation

### 🧑‍💻 Install from source (Developer mode)

1️⃣ Download or clone this repository  
2️⃣ Open:
- Chrome: `chrome://extensions`
- Edge: `edge://extensions`

3️⃣ Enable **Developer mode**  
4️⃣ Click **Load unpacked**  
5️⃣ Select the extension folder  

👉 Done! The extension is ready to use.

---

### 🏬 Install from Store (coming soon)

> 🚧 **Chrome Web Store & Edge Add-ons are being prepared**

---

## 🧠 How the extension works (visual overview)

```mermaid
flowchart TD
    A[🖱️ You click a link] --> B[🌐 Website tries to open a new tab]
    B --> C[🛑 Extension blocks the request]
    C --> D{🤔 Your decision}
    D -->|✅ Allow| E[🆕 New tab opens]
    D -->|❌ Block| F[🚫 Tab is blocked]
    D -->|🧠 Remember| G[💾 Save rule for this website]

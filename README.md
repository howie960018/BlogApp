# 手繪風手帳 (Doodle Journal) - Full Stack 版本

這是一個具備手繪風格的個人部落格/手帳應用程式。
本專案包含 React 前端與 Node.js/Express + MongoDB 後端。

## 專案結構

- `/` : 前端 React 應用程式
- `/server` : 後端 Node.js API 伺服器

## 如何在本地運行 (Full Stack 模式)

### 1. 準備環境
請確保您的電腦已安裝：
- Node.js (v16+)
- MongoDB (本地服務或 Atlas 雲端)

### 2. 設定後端 (Server)
1. 進入 server 資料夾 (請手動建立 server 資料夾並放入提供的檔案)
2. 安裝套件：
   ```bash
   cd server
   npm install
   ```
3. 設定環境變數：
   建立 `.env` 檔案，內容如下：
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/doodle-journal
   JWT_SECRET=your_super_secret_key_change_this
   ```
4. 啟動伺服器：
   ```bash
   node index.js
   ```

### 3. 設定前端 (Client)
1. 在專案根目錄執行 `npm install`。
2. 開啟 `services/config.ts`。
3. 將 `USE_REAL_BACKEND` 設定為 `true`。
4. 啟動前端：
   ```bash
   npm start
   ```

## 功能特色
- JWT 使用者認證 (登入/註冊)
- MongoDB 資料持久化
- 支援多圖上傳 (Base64 儲存)
- 手繪風格 UI / 深色模式
- AI 日記分析 (需設定 Google Gemini API Key)

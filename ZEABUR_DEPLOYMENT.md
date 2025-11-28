# Zeabur 部署指南

## 📋 部署概覽

這個專案包含：
- **前端**：React + Vite (根目錄)
- **後端**：Express + Node.js (server 目錄)
- **資料庫**：MongoDB (需要在 Zeabur 上設定)

---

## 🚀 在 Zeabur 上部署

### 方法一：分開部署（推薦）

#### 1️⃣ 部署 MongoDB

1. 登入 [Zeabur](https://zeabur.com)
2. 建立新專案
3. 點擊 "Add Service" → 選擇 "Prebuilt" → 選擇 "MongoDB"
4. 等待 MongoDB 部署完成
5. 記下連接資訊（會自動生成 `MONGO_URI` 環境變數）

#### 2️⃣ 部署後端 API

1. 在同一個專案中，點擊 "Add Service" → 選擇 "Git"
2. 連接你的 GitHub 倉庫
3. 設定 **Root Directory** 為 `server`
4. 設定以下環境變數：
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=${MONGODB_CONNECTION_STRING}
   JWT_SECRET=your-super-secret-jwt-key-change-this
   ```
5. Zeabur 會自動偵測 `server/Dockerfile` 並開始構建
6. 記下後端 API 的 URL（例如：`https://your-backend.zeabur.app`）

#### 3️⃣ 部署前端

1. 在同一個專案中，點擊 "Add Service" → 選擇 "Git"
2. 連接同一個 GitHub 倉庫
3. **Root Directory** 保持為 `/`（根目錄）
4. 設定以下環境變數（如果前端需要）：
   ```
   VITE_API_URL=https://your-backend.zeabur.app
   VITE_API_KEY=your-gemini-api-key
   ```
5. Zeabur 會自動偵測根目錄的 `Dockerfile` 並開始構建

---

### 方法二：使用 Docker Compose（進階）

如果你想要在單一服務中運行所有容器：

1. 將整個專案推送到 GitHub
2. 在 Zeabur 選擇 "Add Service" → "Git"
3. Zeabur 會偵測 `docker-compose.yml`
4. 設定環境變數：
   ```
   JWT_SECRET=your-secret-key
   ```

> ⚠️ **注意**：Zeabur 對 Docker Compose 的支援可能有限制，建議使用方法一。

---

## 🔧 環境變數說明

### 後端必需的環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `NODE_ENV` | 執行環境 | `production` |
| `PORT` | 後端服務埠 | `5000` |
| `MONGO_URI` | MongoDB 連接字串 | `mongodb://username:password@host:27017/doodle-journal` |
| `JWT_SECRET` | JWT 加密密鑰 | `your-super-secret-key` |

### 前端可選的環境變數

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_API_URL` | 後端 API 位址 | `https://your-backend.zeabur.app` |
| `VITE_API_KEY` | Gemini API Key | `AIza...` |

---

## 🔄 MongoDB 連接配置

### Zeabur 自動配置

當你在 Zeabur 上建立 MongoDB 服務後，系統會自動提供以下環境變數：
- `MONGODB_CONNECTION_STRING`
- `MONGODB_HOST`
- `MONGODB_PORT`
- `MONGODB_USERNAME`
- `MONGODB_PASSWORD`

在後端服務中，將 `MONGO_URI` 設定為 `${MONGODB_CONNECTION_STRING}`，Zeabur 會自動注入正確的值。

### 手動配置（使用外部 MongoDB）

如果你想使用外部的 MongoDB 服務（如 MongoDB Atlas）：

1. 在 MongoDB Atlas 建立叢集
2. 取得連接字串（格式如下）：
   ```
   mongodb+srv://username:password@cluster.mongodb.net/doodle-journal?retryWrites=true&w=majority
   ```
3. 在 Zeabur 後端服務中設定 `MONGO_URI` 環境變數為這個連接字串

### 程式碼中已包含的配置

[server/index.js:13](server/index.js#L13) 中已經配置好環境變數讀取：
```javascript
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doodle-journal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
```

**不需要修改程式碼**，只需在 Zeabur 設定正確的 `MONGO_URI` 環境變數即可。

---

## 📝 本地測試

在部署到 Zeabur 之前，建議先在本地測試：

### 使用 Docker Compose

```bash
# 1. 建立 .env 檔案（在 server 目錄）
cd server
echo "JWT_SECRET=test-secret-key" > .env
cd ..

# 2. 啟動所有服務
docker-compose up --build

# 3. 訪問服務
# 前端: http://localhost:3000
# 後端: http://localhost:5000
# MongoDB: localhost:27017
```

### 停止服務

```bash
docker-compose down

# 如果要清除資料庫資料
docker-compose down -v
```

---

## ✅ 部署檢查清單

- [ ] MongoDB 服務已啟動並運行
- [ ] 後端服務已部署，`/health` 端點返回 200
- [ ] 前端服務已部署並能正常訪問
- [ ] 環境變數已正確設定
- [ ] 後端能成功連接到 MongoDB
- [ ] 前端能成功調用後端 API

---

## 🐛 常見問題

### 1. 後端無法連接 MongoDB

**檢查**：
- 確認 `MONGO_URI` 環境變數是否正確設定
- 確認 MongoDB 服務是否正常運行
- 查看後端日誌是否有連接錯誤

### 2. 前端無法調用後端 API

**檢查**：
- 確認 CORS 設定（後端已啟用 `cors()`）
- 確認前端的 API URL 是否正確
- 檢查網路請求是否被攔截

### 3. Docker 構建失敗

**檢查**：
- 確認 `package.json` 中的依賴是否完整
- 確認 Node.js 版本是否相容（使用 Node 20）
- 查看構建日誌找出錯誤原因

---

## 📚 相關文件

- [Zeabur 文件](https://zeabur.com/docs)
- [Docker 文件](https://docs.docker.com/)
- [MongoDB 文件](https://www.mongodb.com/docs/)

---

## 🎉 部署成功後

恭喜！你的部落格應用已成功部署到 Zeabur。

記得定期備份 MongoDB 資料，並妥善保管你的環境變數和密鑰。

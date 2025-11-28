# AWS 部署指南

## 📋 部署概覽

這個專案包含：
- **前端**：React + Vite (根目錄)
- **後端**：Express + Node.js (server 目錄)
- **資料庫**：MongoDB

---

## 🚀 AWS 部署方案

### 方案一：AWS Elastic Beanstalk（推薦新手）

最簡單的部署方式，AWS 自動管理基礎設施。

#### 架構
- **前端**：Elastic Beanstalk (Nginx + Node.js)
- **後端**：Elastic Beanstalk (Node.js)
- **資料庫**：MongoDB Atlas 或 DocumentDB

#### 部署步驟

##### 1️⃣ 安裝 AWS CLI 和 EB CLI

```bash
# 安裝 AWS CLI
# Windows (使用 MSI 安裝器)
# 下載: https://aws.amazon.com/cli/

# 驗證安裝
aws --version

# 配置 AWS 憑證
aws configure
# 輸入你的 AWS Access Key ID
# 輸入你的 AWS Secret Access Key
# 輸入預設區域 (例如: ap-northeast-1)

# 安裝 EB CLI
pip install awsebcli

# 驗證安裝
eb --version
```

##### 2️⃣ 部署後端到 Elastic Beanstalk

```bash
# 進入後端目錄
cd server

# 初始化 Elastic Beanstalk
eb init

# 選擇區域: ap-northeast-1 (Tokyo) 或 ap-southeast-1 (Singapore)
# 選擇應用程式名稱: blog-backend
# 選擇平台: Node.js
# 選擇 Node.js 版本: Node.js 20
# 是否使用 CodeCommit: No
# 是否設定 SSH: Yes (建議)

# 創建環境並部署
eb create blog-backend-prod

# 設定環境變數
eb setenv NODE_ENV=production \
  PORT=5000 \
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blog \
  JWT_SECRET=your-super-secret-jwt-key-change-this

# 開啟應用程式
eb open

# 查看日誌
eb logs

# 未來更新部署
eb deploy
```

##### 3️⃣ 部署前端到 Elastic Beanstalk

```bash
# 回到根目錄
cd ..

# 創建前端 EB 配置
eb init

# 選擇區域: 與後端相同
# 選擇應用程式名稱: blog-frontend
# 選擇平台: Docker
# 是否使用 CodeCommit: No

# 創建環境並部署
eb create blog-frontend-prod

# 設定環境變數（如果需要）
eb setenv VITE_API_URL=https://your-backend.elasticbeanstalk.com

# 開啟應用程式
eb open
```

---

### 方案二：Amazon ECS (Fargate) - 容器化部署

使用 Docker 容器，更靈活且可擴展。

#### 架構
- **前端**：ECS Fargate + Application Load Balancer
- **後端**：ECS Fargate + Application Load Balancer
- **資料庫**：MongoDB Atlas 或 DocumentDB
- **容器註冊表**：Amazon ECR

#### 部署步驟

##### 1️⃣ 創建 ECR 儲存庫

```bash
# 創建後端 ECR 儲存庫
aws ecr create-repository \
  --repository-name blog-backend \
  --region ap-northeast-1

# 創建前端 ECR 儲存庫
aws ecr create-repository \
  --repository-name blog-frontend \
  --region ap-northeast-1

# 獲取登入命令
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com
```

##### 2️⃣ 構建並推送後端 Docker 映像

```bash
# 進入後端目錄
cd server

# 構建 Docker 映像
docker build -t blog-backend .

# 標記映像
docker tag blog-backend:latest \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/blog-backend:latest

# 推送到 ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/blog-backend:latest
```

##### 3️⃣ 構建並推送前端 Docker 映像

```bash
# 回到根目錄
cd ..

# 構建 Docker 映像
docker build -t blog-frontend .

# 標記映像
docker tag blog-frontend:latest \
  YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/blog-frontend:latest

# 推送到 ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/blog-frontend:latest
```

##### 4️⃣ 使用 AWS Console 創建 ECS 服務

1. 登入 AWS Console
2. 進入 ECS 服務
3. 創建集群（Cluster）
   - 選擇 "Networking only" (Fargate)
   - 集群名稱: blog-cluster
4. 創建任務定義（Task Definition）
   - 後端任務定義:
     - 容器名稱: blog-backend
     - 映像: YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/blog-backend:latest
     - 記憶體: 512 MB
     - CPU: 256
     - 端口映射: 5000
     - 環境變數: NODE_ENV, MONGO_URI, JWT_SECRET
   - 前端任務定義:
     - 容器名稱: blog-frontend
     - 映像: YOUR_AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/blog-frontend:latest
     - 記憶體: 512 MB
     - CPU: 256
     - 端口映射: 80
5. 創建服務（Service）
   - 選擇 Fargate 啟動類型
   - 配置負載均衡器
   - 設定自動擴展

##### 5️⃣ 使用 AWS Copilot CLI（推薦）

```bash
# 安裝 Copilot CLI
# Windows: 從 GitHub 下載
# https://github.com/aws/copilot-cli/releases

# 初始化應用程式
copilot app init blog-app

# 部署後端
cd server
copilot init \
  --app blog-app \
  --name backend \
  --type "Load Balanced Web Service" \
  --dockerfile ./Dockerfile \
  --port 5000

# 設定環境變數
copilot secret init --name MONGO_URI
copilot secret init --name JWT_SECRET

# 部署到生產環境
copilot env init --name production
copilot deploy --name backend --env production

# 部署前端
cd ..
copilot init \
  --app blog-app \
  --name frontend \
  --type "Load Balanced Web Service" \
  --dockerfile ./Dockerfile \
  --port 80

copilot deploy --name frontend --env production

# 查看服務狀態
copilot svc status
copilot svc logs
```

---

### 方案三：AWS Amplify（前端）+ Lambda（後端）

#### 架構
- **前端**：AWS Amplify
- **後端**：API Gateway + Lambda (Serverless)
- **資料庫**：MongoDB Atlas 或 DynamoDB

#### 前端部署到 Amplify

##### 1️⃣ 使用 Amplify Console

1. 登入 [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. 點擊 "New app" → "Host web app"
3. 連接你的 Git 倉庫（GitHub/GitLab/Bitbucket）
4. 配置構建設定:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

5. 設定環境變數:
   - `VITE_API_URL`: 你的後端 API URL

6. 點擊 "Save and deploy"

##### 2️⃣ 使用 Amplify CLI

```bash
# 安裝 Amplify CLI
npm install -g @aws-amplify/cli

# 配置 Amplify
amplify configure

# 初始化專案
amplify init

# 添加託管
amplify add hosting

# 選擇 "Hosting with Amplify Console"

# 發佈應用
amplify publish
```

#### 後端改為 Serverless（選擇性）

如果要將後端改為 Lambda 函數，需要重構為 Serverless 架構。這是較進階的選項。

---

### 方案四：Amazon S3 + CloudFront（前端）+ EC2（後端）

#### 架構
- **前端**：S3 (靜態託管) + CloudFront (CDN)
- **後端**：EC2 實例
- **資料庫**：MongoDB Atlas 或 DocumentDB

#### 前端部署到 S3 + CloudFront

##### 1️⃣ 構建前端

```bash
# 構建前端
npm run build
```

##### 2️⃣ 創建 S3 桶並上傳

```bash
# 創建 S3 桶
aws s3 mb s3://your-blog-app-frontend --region ap-northeast-1

# 配置靜態網站託管
aws s3 website s3://your-blog-app-frontend \
  --index-document index.html \
  --error-document index.html

# 上傳構建文件
aws s3 sync dist/ s3://your-blog-app-frontend --delete

# 設定公開讀取權限（使用桶策略）
```

創建桶策略（在 AWS Console 中設定）:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-blog-app-frontend/*"
    }
  ]
}
```

##### 3️⃣ 配置 CloudFront

1. 進入 CloudFront Console
2. 創建新的 Distribution
3. 源設定:
   - Origin Domain: your-blog-app-frontend.s3.ap-northeast-1.amazonaws.com
   - Origin Path: 留空
4. 預設快取行為設定:
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
5. 設定:
   - Default Root Object: index.html
6. 錯誤頁面:
   - 404 → /index.html (用於 SPA 路由)
7. 創建 Distribution

##### 4️⃣ 未來更新部署

```bash
# 構建新版本
npm run build

# 上傳到 S3
aws s3 sync dist/ s3://your-blog-app-frontend --delete

# 清除 CloudFront 快取
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

#### 後端部署到 EC2

##### 1️⃣ 啟動 EC2 實例

1. 登入 AWS Console → EC2
2. 點擊 "Launch Instance"
3. 選擇 Amazon Linux 2023 或 Ubuntu 22.04
4. 實例類型: t3.micro 或 t3.small
5. 配置安全組:
   - SSH (22): 你的 IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom TCP (5000): 0.0.0.0/0 或僅 ALB
6. 創建或選擇密鑰對
7. 啟動實例

##### 2️⃣ 連接並設定 EC2

```bash
# SSH 連接到 EC2
ssh -i your-key.pem ec2-user@your-ec2-public-ip

# 安裝 Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 安裝 Git
sudo yum install -y git

# 安裝 PM2（進程管理器）
sudo npm install -g pm2

# 克隆你的倉庫
git clone https://github.com/your-username/your-repo.git
cd your-repo/server

# 安裝依賴
npm install --production

# 創建 .env 文件
nano .env
```

在 .env 文件中添加:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/blog
JWT_SECRET=your-super-secret-jwt-key
```

```bash
# 使用 PM2 啟動應用
pm2 start index.js --name blog-backend

# 設定 PM2 開機自動啟動
pm2 startup
pm2 save

# 查看狀態
pm2 status
pm2 logs
```

##### 3️⃣ 配置 Nginx 反向代理（選擇性）

```bash
# 安裝 Nginx
sudo yum install -y nginx

# 配置 Nginx
sudo nano /etc/nginx/conf.d/blog.conf
```

添加配置:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 啟動 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 重新載入配置
sudo systemctl reload nginx
```

---

## 🗄️ MongoDB 資料庫選項

### 選項 1: MongoDB Atlas（推薦）

最簡單的選擇，完全托管的 MongoDB。

1. 註冊 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 創建免費集群（M0 Sandbox）
3. 配置網路訪問:
   - 添加 IP 地址（或允許所有: 0.0.0.0/0）
4. 創建資料庫用戶
5. 獲取連接字串:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/blog?retryWrites=true&w=majority
   ```

### 選項 2: Amazon DocumentDB

AWS 原生的 MongoDB 兼容服務。

1. 進入 DocumentDB Console
2. 創建集群
3. 配置 VPC 安全組（允許從 EC2/ECS 訪問）
4. 獲取連接字串
5. 注意: DocumentDB 僅在 VPC 內訪問，需要配置 VPC 對等或 VPN

### 選項 3: MongoDB on EC2（自己管理）

完全控制，但需要自己維護。

```bash
# 在 EC2 上安裝 MongoDB
sudo yum install -y mongodb-org

# 啟動 MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# 配置遠程訪問（不推薦用於生產環境）
sudo nano /etc/mongod.conf
# 修改 bindIp: 0.0.0.0

# 重啟 MongoDB
sudo systemctl restart mongod
```

---

## 🔒 安全最佳實踐

### 1. 使用 AWS Secrets Manager 存儲敏感資訊

```bash
# 創建密鑰
aws secretsmanager create-secret \
  --name blog/mongodb/uri \
  --secret-string "mongodb+srv://username:password@cluster.mongodb.net/blog"

aws secretsmanager create-secret \
  --name blog/jwt/secret \
  --secret-string "your-super-secret-jwt-key"

# 在應用程式中讀取（需要安裝 AWS SDK）
```

### 2. 使用環境變數

在 Elastic Beanstalk、ECS、Lambda 中都可以安全地設定環境變數。

### 3. 配置 HTTPS

- 使用 AWS Certificate Manager (ACM) 申請免費 SSL 證書
- 在 Load Balancer 或 CloudFront 上配置 HTTPS

### 4. 限制安全組

- 僅允許必要的端口和 IP 範圍
- 後端應僅允許來自前端/負載均衡器的請求

### 5. 啟用 CloudWatch 日誌

監控應用程式運行狀況。

---

## 💰 成本估算

### 方案一：Elastic Beanstalk
- **EC2 (t3.micro x2)**: ~$15/月
- **Load Balancer**: ~$20/月
- **總計**: ~$35/月

### 方案二：ECS Fargate
- **Fargate 任務**: ~$20-30/月
- **Load Balancer**: ~$20/月
- **總計**: ~$40-50/月

### 方案三：Amplify + Lambda
- **Amplify 託管**: ~$5/月
- **Lambda**: ~$5/月（低流量）
- **總計**: ~$10/月

### 方案四：S3 + CloudFront + EC2
- **S3**: ~$1/月
- **CloudFront**: ~$5/月
- **EC2 (t3.micro)**: ~$8/月
- **總計**: ~$14/月

### MongoDB
- **MongoDB Atlas (Free tier)**: $0
- **DocumentDB**: ~$50/月起

---

## 🚀 CI/CD 自動化部署

### 使用 GitHub Actions

創建 [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push backend
        working-directory: ./server
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: blog-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install and build
        run: |
          npm ci
          npm run build

      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://your-blog-app-frontend --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

---

## 📝 推薦部署流程

### 新手推薦：Amplify + Elastic Beanstalk

1. **前端**: 使用 AWS Amplify（最簡單）
2. **後端**: 使用 Elastic Beanstalk
3. **資料庫**: MongoDB Atlas（免費層）

```bash
# 前端部署
amplify init
amplify add hosting
amplify publish

# 後端部署
cd server
eb init
eb create blog-backend-prod
eb setenv MONGO_URI=xxx JWT_SECRET=xxx
```

### 進階用戶：S3 + CloudFront + ECS

1. **前端**: S3 + CloudFront（更便宜，更快）
2. **後端**: ECS Fargate（容器化，可擴展）
3. **資料庫**: MongoDB Atlas 或 DocumentDB

### 企業級：完整 CI/CD

1. 使用 GitHub Actions 自動部署
2. 多環境配置（dev, staging, production）
3. 自動化測試
4. 監控和告警

---

## ✅ 部署檢查清單

- [ ] 選擇部署方案
- [ ] 設定 AWS 帳戶和 CLI
- [ ] 配置資料庫（MongoDB Atlas）
- [ ] 部署後端服務
- [ ] 設定後端環境變數
- [ ] 測試後端 API（/health 端點）
- [ ] 部署前端服務
- [ ] 配置前端環境變數（API URL）
- [ ] 測試前端功能
- [ ] 配置自訂網域名稱（選擇性）
- [ ] 設定 HTTPS 證書
- [ ] 配置 CI/CD 自動部署（選擇性）
- [ ] 設定監控和告警
- [ ] 備份資料庫

---

## 🐛 故障排除

### 無法連接到 MongoDB
- 檢查 MongoDB Atlas IP 白名單
- 檢查 MONGO_URI 環境變數
- 檢查網路安全組設定

### ECS 任務無法啟動
- 檢查 CloudWatch 日誌
- 檢查任務定義中的環境變數
- 檢查 ECR 映像是否正確推送

### 前端無法調用後端 API
- 檢查 CORS 設定
- 檢查 VITE_API_URL 環境變數
- 檢查後端安全組是否允許入站流量

### Elastic Beanstalk 部署失敗
- 運行 `eb logs` 查看詳細日誌
- 檢查 package.json 中的 start 腳本
- 檢查環境變數設定

---

## 📚 相關資源

- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Amazon ECS](https://docs.aws.amazon.com/ecs/)
- [AWS Amplify](https://docs.amplify.aws/)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

## 🎉 下一步

選擇適合你的部署方案後：

1. 設定 AWS 帳戶
2. 選擇資料庫（推薦 MongoDB Atlas 免費層）
3. 按照上述步驟部署
4. 配置自訂網域
5. 設定自動化部署
6. 監控應用程式運行狀況

如果遇到問題，請參考 AWS 文檔或相關社群資源。

祝你部署順利！🚀

# ========== Stage 1: Builder ========== 
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm ci --only=production

# ========== Stage 2: Production ========== 
FROM node:22-alpine

# 安装 Chromium 和必要的依赖
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ttf-dejavu \
    ttf-liberation \
    wqy-zenhei

# 设置工作目录
WORKDIR /app

# 复制构建成果和应用代码
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# 创建必要的目录并设置权限
RUN mkdir -p /app/conf /app/data \
    && chmod 755 /app/conf /app/data

# 设置 Puppeteer 环境变量使用系统 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser

# 创建非 root 用户 inbot
RUN addgroup -g 1001 -S inbot \
    && adduser -S inbot -u 1001 -G inbot \
    && chown -R inbot:inbot /app

# 验证 Chromium 安装
RUN which chromium-browser && chromium-browser --version || echo "Chromium not found"

# 切换到非 root 用户
USER inbot

# 默认启动命令
CMD ["npm", "start"]
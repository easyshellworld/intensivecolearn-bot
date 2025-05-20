#tage 1: Builder ==========
FROM node:20-slim AS builder

# 安装编译和构建所需工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    libsqlite3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm ci --only=production

# ========== Stage 2: Production ==========
FROM node:20-slim

# 安装 Puppeteer 运行所需的依赖以及 git 和 sqlite3
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-freefont-ttf \
    libsqlite3-0 \
    git \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# 安装最新版 Chrome (Puppeteer 需要)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制构建成果和应用代码
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# 创建必要的目录并设置权限
RUN mkdir -p /app/conf /app/data \
    && chmod 755 /app/conf /app/data

# 设置 Puppeteer 环境变量
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/google-chrome-stable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# 创建非 root 用户
RUN groupadd -g 1001 inbot \
    && useradd -u 1001 -g inbot -s /bin/bash -m inbot \
    && chown -R inbot:inbot /app

# 验证 Chrome 安装
RUN google-chrome-stable --version

# 确认 git 和 sqlite3 已安装
RUN git --version && sqlite3 --version

# 切换到非 root 用户
USER inbot

# 默认启动命令
CMD ["npm", "start"]

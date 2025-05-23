######## 构建 ########
FROM --platform=${BUILDPLATFORM:-amd64} node:18-alpine3.21 as builder

# 安装构建工具
RUN apk add --update --no-cache build-base git bash

# YApi 版本
ENV YAPI_VERSION=1.12.0

# 编译脚本
WORKDIR /yapi/scripts
COPY . .
RUN yarn && yarn build

WORKDIR /yapi/vendors

# 拉取 YApi 源码
RUN git clone \
  --branch "v${YAPI_VERSION}" \
  --single-branch \
  --depth 1 \
  https://github.com/vtumi/yapi.git .

# 拷贝启动脚本
RUN cp /yapi/scripts/start.js ./start.js

# 执行一些准备工作
RUN node /yapi/scripts/prepare.js $(pwd)

# 安装依赖
RUN yarn

# 构建应用
RUN yarn build-client

# 清理文件
RUN node /yapi/scripts/clean.js $(pwd)

# 删除脚本
RUN rm -rf /yapi/scripts

######## 镜像 ########
FROM node:18-alpine3.21

RUN apk add --no-cache tzdata

WORKDIR /yapi

COPY --from=builder /yapi .

EXPOSE 3000

CMD ["node", "/yapi/vendors/start.js"]

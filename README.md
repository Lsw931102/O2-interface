# flux-fe

flux 前端整合重构版本

## 子模块相关

https://github.com/01-finance/fe-common/tree/main

注意，先拉子模块，再安装依赖

```shell
# 初始化子模块
git submodule init

# 远程更新子模块
git submodule update --remote

# https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97
```

# 开发

```shell
# 安装依赖(统一用yarn源)
yarn

# 启动
yarn dev
```

# 部署

```shell
# 1.先打包 ssr
yarn build
# 生成 .next/*，需用 yarn start 启动 nodejs 服务来运行

# 2.上面步骤后会提示是否可以静态化,如果可以 ssg 就打包
yarn export
# 生成 out/*，可以直接用 ng、caddy、cos 等部署
```

或者用脚本

```shell
# 测试环境 - 生成nodejs运行包： sh ./build.sh dev
# 正式环境 - 生成nodejs运行包： sh ./build.sh prod
# 测试/正式环境 - 生成nodejs运行包（忽略依赖安装）： sh ./build.sh dev install
# 上面命令会生成 flux-nodejs-dist 目录

# 测试/正式环境 - 生成ssg运行包：sh ./build.sh dev export
# 上面命令会生成 flux-nodejs-dist 和 out 目录
```

# fe-frame

# fe-frame

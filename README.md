# 🐤 啾啾图片插件 for Yunzai-Bot

多功能随机图片插件 | [更新日志](CHANGELOG.md) | [反馈问题](.github/ISSUE_TEMPLATE/bug_report.md)

![示例图片](resources/images/demo1.jpg)

## 🚀 快速开始

### 安装要求
- Node.js 16+
- Yunzai-Bot 3.0+

### 一键安装
```bash
git clone --depth=1 https://github.com/jiuzeyuli/jiujiu-plugin.git ./plugins/jiujiu-plugin

```

### 手动安装
1. 将本仓库下载到 `plugins` 目录
2. 安装依赖：
   ```bash
   pnpm install
   ```
3. 添加图片到 `assets/images/`

## 📜 功能指令
| 指令 | 权限 | 功能 |
|------|------|------|
| `#随机图片` | 所有人 | 从本地随机发送 |
| `#网络图片` | 所有人 | 从API获取图片 |
| `#图片列表` | 主人 | 查看本地图片 |
| `#清理缓存` | 主人 | 清除图片缓存 |
| `#啾啾更新` | 主人 | 检查插件更新 |
| `#设置图片目录 [路径]` | 主人 | 修改图片路径 |



## 🛠️ 开发者指南
```bash
# 安装开发依赖
pnpm install

# 运行测试
npm test

# 代码检查
npm run lint
```

## 🤝 参与贡献
1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -am 'Add some feature'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 新建 Pull Request

## 📄 许可证
MIT License © 2023

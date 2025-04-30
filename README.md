# JiuJiu-Plugin 终极版

![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18-green)
![Redis Ready](https://img.shields.io/badge/redis-supported-brightgreen)

终极多功能 QQ 机器人插件，包含 20+实用功能，支持自动更新和双数据库。

## 功能大全

| 分类     | 指令                     | 功能说明     |
| -------- | ------------------------ | ------------ |
| **系统** | `#帮助`                  | 查看所有命令 |
|          | `#九九更新`              | 更新插件     |
| **工具** | `#天气 [城市]`           | 查询天气     |
|          | `#股票 [代码]`           | 查询股票     |
|          | `#翻译 [从] [到] [文本]` | 文本翻译     |
|          | `#计算 [表达式]`         | 数学计算     |
| **娱乐** | `#随机图片`              | 获取随机图片 |
|          | `#点歌 [歌名]`           | 搜索并点歌   |
|          | `#讲个笑话`              | 随机笑话     |
|          | `#猜数字`                | 玩猜数字游戏 |
| **生活** | `#运势`                  | 查看今日运势 |
|          | `#提醒 [时间] [内容]`    | 设置提醒     |

## 完整安装指南

### 1. 克隆仓库

```bash
cd Yunzai-Bot/plugins
git clone https://github.com/jiuzeyuli/jiujiu-plugin.git
cd jiujiu-plugin
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据目录

```bash
mkdir -p data/{images,cache,backups,userdata}
```

### 4. 配置环境变量

复制并修改`.env`文件：

```bash
cp .env.example .env
nano .env
```

需要配置的 API 密钥：

- WEATHER_KEY - 天气 API 密钥
- BAIDU_APPID - 百度翻译 APP ID
- BAIDU_KEY - 百度翻译密钥
- STOCK_API - 股票 API 地址(可选)
- MUSIC_API - 音乐 API 地址(可选)

### 5. 启动插件

重启 Yunzai 机器人：

```bash
npm run restart
```

## 更新方法

### 自动更新

```
#九九更新
```

### 手动更新

```bash
cd plugins/jiujiu-plugin
git pull
npm install
```

## 开发者指南

### 项目结构

```
jiujiu-plugin/
├── config/        # 配置文件
├── data/          # 数据存储
├── plugins/       # 插件代码
├── scripts/       # 实用脚本
└── tests/         # 单元测试
```

### 添加新命令

1. 在 `plugins/` 下创建新文件，例如 `newcmd.js`
2. 实现命令类：

```javascript
export class NewCommand {
  constructor(parent) {
    this.parent = parent;
  }

  get rules() {
    return [
      {
        reg: `^${this.parent.config.prefix}新命令$`,
        fnc: "handleCommand",
      },
    ];
  }

  async handleCommand() {
    return "这是响应消息";
  }
}
```

3. 在 `main.js` 中导入并注册命令

## 注意事项

1. 首次使用前请确保已创建 data 目录
2. 图片功能需要先在 data/images 添加图片
3. 股票和音乐功能需要配置相应 API

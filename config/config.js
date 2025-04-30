import { readFileSync } from 'fs'
import path from 'path'

const loadJSON = (file) => {
  try {
    return JSON.parse(readFileSync(path.join('./config', file)))
  } catch (e) {
    console.error(`加载配置文件 ${file} 失败:`, e)
    return {}
  }
}

export default {
  // 基础配置
  prefix: "#",
  adminQQ: ["123456789"],
  shortCommands: {
    "天气": "weather",
    "运势": "fortune",
    "图片": "image"
  },

  // 数据库配置
  database: {
    type: process.env.DB_TYPE || "redis",
    redis: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || "",
      db: parseInt(process.env.REDIS_DB) || 0,
      keyPrefix: "jiujiu:",
      ttl: 86400
    },
    sqlite: {
      path: "./data/cache/main.db",
      backupDir: "./data/backups"
    }
  },

  // 功能模块配置
  modules: {
    weather: {
      apiKey: process.env.WEATHER_KEY,
      cacheTTL: 3600,
      locations: loadJSON('weather.json')
    },
    fortune: {
      dataFile: "./config/fortunes.json",
      cacheTTL: 86400
    },
    image: {
      dir: "./data/images",
      maxSize: 10 * 1024 * 1024,
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      watermark: {
        text: "JiuJiu-Plugin",
        fontSize: 24,
        color: "#FFFFFF80"
      }
    },
    translate: {
      provider: "baidu",
      baidu: {
        appid: process.env.BAIDU_APPID,
        key: process.env.BAIDU_KEY
      },
      google: {
        key: process.env.GOOGLE_TRANSLATE_KEY
      }
    }
  }
}
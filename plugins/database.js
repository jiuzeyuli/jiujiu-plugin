import sqlite3 from 'sqlite3'
import { createClient } from 'redis'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'

export class Database {
  constructor(config) {
    this.config = config
    this.logger = console
  }

  async connect() {
    try {
      if (this.config.type === "redis") {
        await this._connectRedis()
      } else {
        await this._connectSQLite()
      }
      this.logger.info(`[Database] ${this.config.type.toUpperCase()}连接成功`)
    } catch (err) {
      this.logger.error(`[Database] 连接失败:`, err)
      throw err
    }
  }

  async _connectRedis() {
    this.client = createClient({
      socket: {
        host: this.config.redis.host,
        port: this.config.redis.port,
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
      },
      password: this.config.redis.password,
      database: this.config.redis.db
    })

    this.client.on('error', err => {
      this.logger.error('[Redis] 错误:', err)
    })

    await this.client.connect()
    
    this.query = {
      get: async (key) => {
        const data = await this.client.get(this._fullKey(key))
        return data ? JSON.parse(data) : null
      },
      set: async (key, value, ttl = null) => {
        const strValue = JSON.stringify(value)
        if (ttl) {
          return this.client.setEx(this._fullKey(key), ttl, strValue)
        }
        return this.client.set(this._fullKey(key), strValue)
      },
      hget: async (hash, field) => {
        const data = await this.client.hGet(this._fullKey(hash), field)
        return data ? JSON.parse(data) : null
      },
      hset: async (hash, field, value) => {
        return this.client.hSet(this._fullKey(hash), field, JSON.stringify(value))
      },
      del: async (key) => {
        return this.client.del(this._fullKey(key))
      },
      keys: async (pattern) => {
        return this.client.keys(this._fullKey(pattern))
      }
    }
  }

  async _connectSQLite() {
    await fs.mkdir(path.dirname(this.config.sqlite.path), { recursive: true })
    this.client = new sqlite3.Database(this.config.sqlite.path)
    
    const dbAll = promisify(this.client.all).bind(this.client)
    const dbRun = promisify(this.client.run).bind(this.client)
    
    this.query = {
      get: async (key) => {
        const rows = await dbAll("SELECT value FROM cache WHERE key = ?", [key])
        return rows[0] ? JSON.parse(rows[0].value) : null
      },
      set: async (key, value, ttl = null) => {
        const expires = ttl ? Date.now() + ttl * 1000 : null
        await dbRun(
          "INSERT OR REPLACE INTO cache (key, value, expires) VALUES (?, ?, ?)",
          [key, JSON.stringify(value), expires]
        )
      },
      hget: async (hash, field) => {
        const row = await dbAll(
          "SELECT value FROM hash_data WHERE hash = ? AND field = ?",
          [hash, field]
        )
        return row[0] ? JSON.parse(row[0].value) : null
      },
      hset: async (hash, field, value) => {
        await dbRun(
          "INSERT OR REPLACE INTO hash_data (hash, field, value) VALUES (?, ?, ?)",
          [hash, field, JSON.stringify(value)]
        )
      },
      del: async (key) => {
        await dbRun("DELETE FROM cache WHERE key = ?", [key])
      },
      keys: async (pattern) => {
        const rows = await dbAll(
          "SELECT key FROM cache WHERE key LIKE ?",
          [pattern.replace('*', '%')]
        )
        return rows.map(row => row.key)
      }
    }
    
    await this._initSQLite()
  }

  async _initSQLite() {
    await this.query.run(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT,
        expires INTEGER
      )
    `)
    await this.query.run(`
      CREATE TABLE IF NOT EXISTS hash_data (
        hash TEXT,
        field TEXT,
        value TEXT,
        PRIMARY KEY (hash, field)
      )
    `)
  }

  _fullKey(key) {
    return this.config.type === "redis" 
      ? `${this.config.redis.keyPrefix}${key}`
      : key
  }

  async backup() {
    if (this.config.type === "sqlite") {
      await fs.mkdir(this.config.sqlite.backupDir, { recursive: true })
      const backupPath = path.join(
        this.config.sqlite.backupDir,
        `backup-${Date.now()}.db`
      )
      await fs.copyFile(this.config.sqlite.path, backupPath)
      return backupPath
    }
    return this.client.bgSave()
  }

  async close() {
    if (this.config.type === "redis") {
      await this.client.quit()
    } else {
      this.client.close()
    }
  }
}
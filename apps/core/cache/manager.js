import LRU from 'lru-cache'
import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

export default class CacheManager {
  constructor(plugin) {
    this.plugin = plugin
    this.memory = new LRU({
      max: 500,
      ttl: 3600 * 1000,
      updateAgeOnGet: true
    })
    this.diskPath = path.join(plugin.dataPath, 'cache')
  }

  async get(key) {
    // 内存 -> 磁盘
    if (this.memory.has(key)) return this.memory.get(key)
    
    try {
      const data = await fs.readFile(this.getCachePath(key))
      this.memory.set(key, data) // 回填内存
      return data
    } catch {
      return null
    }
  }

  async set(key, value, { persistent = true } = {}) {
    this.memory.set(key, value)
    if (persistent) {
      await fs.mkdir(this.diskPath, { recursive: true })
      await fs.writeFile(this.getCachePath(key), value)
    }
  }

  getCachePath(key) {
    return path.join(this.diskPath, 
      createHash('sha256').update(key).digest('hex') + '.cache'
    )
  }
}
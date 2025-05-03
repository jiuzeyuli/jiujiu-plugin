import fs from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

export default class DiskCache {
  constructor(options = {}) {
    this.path = options.path || './data/cache'
    this.maxSize = this.parseSize(options.maxSize || '100MB')
  }

  async get(key) {
    try {
      return await fs.readFile(this.getFilePath(key))
    } catch {
      return null
    }
  }

  async set(key, value) {
    await fs.mkdir(this.path, { recursive: true })
    await fs.writeFile(this.getFilePath(key), value)
    await this.cleanup()
  }

  async clear() {
    await fs.rm(this.path, { recursive: true, force: true })
  }

  getFilePath(key) {
    const hash = createHash('sha256').update(key).digest('hex')
    return path.join(this.path, `${hash}.bin`)
  }

  async cleanup() {
    const files = await fs.readdir(this.path)
    let totalSize = 0
    
    for (const file of files) {
      const stats = await fs.stat(path.join(this.path, file))
      totalSize += stats.size
    }

    if (totalSize > this.maxSize) {
      // 简单策略：删除最旧的10%文件
      const toDelete = files.slice(0, Math.ceil(files.length * 0.1))
      await Promise.all(toDelete.map(f => 
        fs.unlink(path.join(this.path, f))
      ))
    }
  }

  parseSize(sizeStr) {
    const units = { KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }
    const match = sizeStr.match(/^(\d+)([KMG]?B)$/)
    return match ? parseInt(match[1]) * units[match[2]] : 100 * 1024 * 1024
  }
}
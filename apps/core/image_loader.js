import fs from 'fs/promises'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'

export default class ImageLoader {
  constructor(plugin) {
    this.plugin = plugin
    this.localImages = []
  }

  async init() {
    await this.scanLocalImages()
    setInterval(() => this.scanLocalImages(), 3600 * 1000) // 每小时刷新
  }

  async scanLocalImages() {
    const dir = this.plugin.config.get('local.path')
    try {
      const files = await fs.readdir(dir)
      this.localImages = files.filter(f => 
        ['.jpg','.png','.webp'].includes(path.extname(f).toLowerCase())
      )
    } catch (err) {
      this.plugin.logger.error('图片扫描失败:', err)
    }
  }

  async getLocalRandom() {
    if (!this.localImages.length) throw new Error('图片目录为空')
    
    const file = this.localImages[
      Math.floor(Math.random() * this.localImages.length)
    ]
    const fullPath = path.join(this.plugin.config.get('local.path'), file)
    
    return {
      path: fullPath,
      buffer: await fs.readFile(fullPath)
    }
  }

  async getWebImage() {
    const apis = this.plugin.config.get('web.apis')
    const api = apis[Math.floor(Math.random() * apis.length)]
    const res = await fetch(api)
    const buffer = await res.buffer()
    
    if (!(await fileTypeFromBuffer(buffer))?.mime.startsWith('image/')) {
      throw new Error('无效的图片响应')
    }
    
    return { url: api, buffer }
  }
}
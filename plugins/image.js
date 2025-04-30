import fs from 'fs/promises'
import path from 'path'
import sizeOf from 'image-size'
import sharp from 'sharp'

export class ImageCommand {
  constructor(parent) {
    this.parent = parent
    this.config = parent.config.modules.image
    this.logger = parent.logger
    this.stats = {
      total: 0,
      formats: {}
    }
    this._init()
  }

  async _init() {
    try {
      await fs.access(this.config.dir)
      const files = await fs.readdir(this.config.dir)
      this.stats.total = files.length
      
      files.forEach(file => {
        const ext = path.extname(file).toLowerCase()
        if (this.config.extensions.includes(ext)) {
          this.stats.formats[ext] = (this.stats.formats[ext] || 0) + 1
        }
      })
    } catch (err) {
      await fs.mkdir(this.config.dir, { recursive: true })
      this.logger.warn(`创建图片目录: ${this.config.dir}`)
    }
  }

  get rules() {
    return [
      {
        reg: `^${this.parent.config.prefix}随机图片$`,
        fnc: 'randomImage'
      },
      {
        reg: `^${this.parent.config.prefix}图片统计$`,
        fnc: 'imageStats'
      }
    ]
  }

  async randomImage() {
    try {
      const files = await fs.readdir(this.config.dir)
      const images = files.filter(file => 
        this.config.extensions.includes(path.extname(file).toLowerCase())
      
      if (images.length === 0) {
        return "❌ 图片库为空，请添加图片到data/images目录"
      }

      const selected = images[Math.floor(Math.random() * images.length)]
      const imagePath = path.join(this.config.dir, selected)
      
      const stats = await fs.stat(imagePath)
      if (stats.size > this.config.maxSize) {
        return `❌ 图片过大 (${(stats.size/1024/1024).toFixed(1)}MB)`
      }

      let finalImage = imagePath
      if (this.config.watermark) {
        const watermarkedPath = path.join(this.config.dir, `wm_${selected}`)
        await this._addWatermark(imagePath, watermarkedPath)
        finalImage = watermarkedPath
      }

      const dimensions = sizeOf(finalImage)
      
      return [
        `🖼️ 随机图片: ${selected}`,
        `📏 尺寸: ${dimensions.width}x${dimensions.height}`,
        `💾 大小: ${(stats.size/1024).toFixed(1)}KB`,
        {
          type: "image",
          file: `file://${finalImage}`,
          cache: false
        }
      ]
    } catch (err) {
      this.logger.error('随机图片错误:', err)
      return "❌ 图片获取失败"
    }
  }

  async _addWatermark(input, output) {
    try {
      await sharp(input)
        .composite([{
          input: {
            text: {
              text: this.config.watermark.text,
              fontsize: this.config.watermark.fontSize,
              rgba: true,
              align: 1
            }
          },
          gravity: 'southeast',
          blend: 'over'
        }])
        .toFile(output)
    } catch (err) {
      this.logger.error('添加水印失败:', err)
      return input
    }
  }

  async imageStats() {
    return [
      "📊 图片库统计",
      `📂 总图片数: ${this.stats.total}`,
      ...Object.entries(this.stats.formats).map(([ext, count]) => 
        `${ext.toUpperCase()}: ${count}张`
      )
    ].join('\n')
  }
}
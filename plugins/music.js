import axios from 'axios'

export class MusicCommand {
  constructor(parent) {
    this.parent = parent
    this.config = parent.config.modules.music
    this.logger = parent.logger
  }

  get rules() {
    return [
      {
        reg: `^${this.parent.config.prefix}点歌 (.+)$`,
        fnc: 'searchMusic'
      },
      {
        reg: `^${this.parent.config.prefix}播放 (.+)$`,
        fnc: 'playMusic'
      }
    ]
  }

  async searchMusic() {
    const keyword = this.parent.e.msg.replace(/^#点歌 /, '')
    const cacheKey = `music:search:${keyword}`
    
    try {
      const cached = await this.parent.services.db.query.get(cacheKey)
      if (cached) return cached

      const { data } = await axios.get(`${this.config.api}/search`, {
        params: { keyword, limit: this.config.limit },
        timeout: 5000
      })

      const result = [
        "🎵 搜索结果:",
        ...data.songs.map((song, i) => `${i+1}. ${song.name} - ${song.artist}`),
        "回复编号播放歌曲"
      ].join('\n')

      await this.parent.services.db.query.set(
        cacheKey,
        result,
        300 // 5分钟缓存
      )
      
      return result
    } catch (err) {
      this.logger.error('音乐搜索失败:', err)
      return "❌ 音乐搜索失败"
    }
  }

  async playMusic() {
    const selection = this.parent.e.msg.replace(/^#播放 /, '')
    const songId = await this._getSongId(selection)
    
    if (!songId) return "❌ 无效的歌曲选择"

    try {
      const { data } = await axios.get(`${this.config.api}/url`, {
        params: { id: songId },
        timeout: 5000
      })

      return {
        type: "music",
        url: data.url,
        title: data.name,
        artist: data.artist
      }
    } catch (err) {
      this.logger.error('获取音乐URL失败:', err)
      return "❌ 获取音乐失败"
    }
  }

  async _getSongId(selection) {
    // 从缓存或数据库中获取歌曲ID
    return "12345" // 示例返回值
  }
}
import axios from 'axios'

export class StockCommand {
  constructor(parent) {
    this.parent = parent
    this.config = parent.config.modules.stock
    this.logger = parent.logger
  }

  get rules() {
    return [
      {
        reg: `^${this.parent.config.prefix}股票 (.+)$`,
        fnc: 'queryStock'
      },
      {
        reg: `^${this.parent.config.prefix}添加自选股 (.+)$`,
        fnc: 'addFavoriteStock',
        permission: 'master'
      }
    ]
  }

  async queryStock() {
    const stockCode = this.parent.e.msg.replace(/^#股票 /, '')
    const cacheKey = `stock:${stockCode}`
    
    try {
      const cached = await this.parent.services.db.query.get(cacheKey)
      if (cached) return cached

      const { data } = await axios.get(`${this.config.api}/${stockCode}`, {
        timeout: 5000
      })

      const result = [
        `📈 ${data.name} (${data.code})`,
        `💰 当前价格: ${data.price}`,
        `📊 涨跌幅: ${data.changePercent}%`,
        `🕒 更新时间: ${data.time}`
      ].join('\n')

      await this.parent.services.db.query.set(
        cacheKey, 
        result, 
        this.config.cacheTTL
      )
      
      return result
    } catch (err) {
      this.logger.error('股票查询失败:', err)
      return "❌ 股票查询失败，请检查代码是否正确"
    }
  }

  async addFavoriteStock() {
    const stockCode = this.parent.e.msg.replace(/^#添加自选股 /, '')
    await this.parent.services.db.query.hset(
      'favorite_stocks',
      stockCode,
      new Date().toISOString()
    )
    return `✅ 已添加自选股: ${stockCode}`
  }
}
import axios from 'axios'
import moment from 'moment'

export class WeatherCommand {
  constructor(parent) {
    this.parent = parent
    this.config = parent.config.modules.weather
    this.logger = parent.logger
  }

  get rules() {
    return [
      {
        reg: `^${this.parent.config.prefix}天气$`,
        fnc: 'defaultWeather'
      },
      {
        reg: `^${this.parent.config.prefix}天气 (.+)$`,
        fnc: 'queryWeather'
      },
      {
        reg: `^${this.parent.config.prefix}设置默认城市 (.+)$`,
        fnc: 'setDefaultCity',
        permission: 'master'
      }
    ]
  }

  async defaultWeather() {
    const userId = this.parent.e.user_id
    const defaultCity = await this.parent.services.db.query.hget(
      `user:${userId}`, 
      'default_city'
    ) || this.config.locations.default
    
    return this.queryWeather(defaultCity)
  }

  async queryWeather(city) {
    const cacheKey = `weather:${city}`
    
    // 检查缓存
    const cached = await this.parent.services.db.query.get(cacheKey)
    if (cached) {
      this.logger.debug(`使用缓存天气数据: ${city}`)
      return this._formatWeather(cached)
    }

    try {
      const locationId = this.config.locations.cities[city] || city
      const { data } = await axios.get(
        `https://api.weather.com/v3/wx/observations/current`,
        {
          params: {
            location: locationId,
            apiKey: this.config.apiKey,
            language: 'zh-CN',
            units: 'm'
          },
          timeout: 5000
        }
      )

      const weatherData = {
        city,
        temp: data.temperature,
        feelsLike: data.temperatureFeelsLike,
        condition: data.weatherDescription,
        humidity: data.relativeHumidity,
        windSpeed: data.windSpeed,
        time: data.observationTime
      }

      // 缓存数据
      await this.parent.services.db.query.set(
        cacheKey,
        weatherData,
        this.config.cacheTTL
      )
      
      return this._formatWeather(weatherData)
    } catch (err) {
      this.logger.error('天气查询失败:', err)
      return "❌ 天气查询失败，请检查城市名称或稍后再试"
    }
  }

  _formatWeather(data) {
    return [
      `🌍 ${data.city} 天气`,
      `🌡️ 当前温度: ${data.temp}°C (体感 ${data.feelsLike}°C)`,
      `🌤️ 天气状况: ${data.condition}`,
      `💧 湿度: ${data.humidity}%`,
      `🍃 风速: ${data.windSpeed} km/h`,
      `🕒 更新时间: ${moment(data.time).format('YYYY-MM-DD HH:mm')}`
    ].join('\n')
  }

  async setDefaultCity(city) {
    const userId = this.parent.e.user_id
    await this.parent.services.db.query.hset(
      `user:${userId}`,
      'default_city',
      city
    )
    return `✅ 已设置默认城市为: ${city}`
  }
}
import LRU from 'lru-cache'
import { logger } from '../../lib/logger.js'

/**
 * 基于LRU算法的内存缓存系统
 */
export default class MemoryCache {
  constructor(options = {}) {
    // 合并默认配置
    this.options = {
      maxSize: 100,           // 最大缓存条目数
      ttl: 3600 * 1000,       // 默认缓存时间(毫秒)
      sizeCalculation: null,   // 自定义条目大小计算
      ...options
    }

    // 初始化LRU缓存
    this.cache = new LRU({
      max: this.options.maxSize,
      ttl: this.options.ttl,
      sizeCalculation: this.calculateItemSize.bind(this),
      updateAgeOnGet: true    // 访问时刷新TTL
    })

    logger.debug(`[MemoryCache] 初始化完成 (最大 ${this.options.maxSize} 个条目)`)
  }

  /**
   * 计算缓存项大小
   * @param {Buffer|object} value - 缓存值
   * @returns {number} 字节大小
   */
  calculateItemSize(value) {
    if (Buffer.isBuffer(value)) {
      return value.length
    }
    if (typeof value === 'string') {
      return Buffer.byteLength(value)
    }
    // 对象按JSON字符串大小计算
    return Buffer.byteLength(JSON.stringify(value))
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} [ttl] - 自定义存活时间(毫秒)
   */
  set(key, value, ttl) {
    try {
      const options = ttl ? { ttl } : undefined
      this.cache.set(key, value, options)
      logger.silly(`[MemoryCache] 设置缓存 ${key}`)
    } catch (err) {
      logger.error(`[MemoryCache] 设置缓存失败: ${err.message}`)
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存值或null
   */
  get(key) {
    const value = this.cache.get(key)
    if (value !== undefined) {
      logger.silly(`[MemoryCache] 缓存命中 ${key}`)
      return value
    }
    logger.silly(`[MemoryCache] 缓存未命中 ${key}`)
    return null
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key)
    logger.debug(`[MemoryCache] 删除缓存 ${key}`)
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear()
    logger.info('[MemoryCache] 已清空所有内存缓存')
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key)
  }

  /**
   * 获取缓存状态
   * @returns {object} 缓存统计信息
   */
  stats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.cache.hitRatio(),
      keys: [...this.cache.keys()],
      ttl: this.options.ttl
    }
  }

  /**
   * 清理过期缓存
   * @returns {number} 清理的条目数
   */
  prune() {
    const oldSize = this.cache.size
    this.cache.purgeStale()
    const cleared = oldSize - this.cache.size
    logger.debug(`[MemoryCache] 已清理 ${cleared} 个过期条目`)
    return cleared
  }
}
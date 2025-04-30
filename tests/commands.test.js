import { Database } from '../plugins/core/database.js'
import { WeatherCommand } from '../plugins/commands/tools/weather.js'
import { ImageCommand } from '../plugins/commands/fun/image.js'
import config from '../config/config.js'
import fs from 'fs/promises'
import path from 'path'

describe('命令测试', () => {
  let db
  let weatherCmd
  let imageCmd

  beforeAll(async () => {
    db = new Database(config.database)
    await db.connect()
    
    const mockParent = {
      config,
      services: { db },
      logger: console,
      e: { user_id: 'test_user' }
    }
    
    weatherCmd = new WeatherCommand(mockParent)
    imageCmd = new ImageCommand(mockParent)
    
    // 准备测试图片
    await fs.mkdir(config.modules.image.dir, { recursive: true })
    await fs.writeFile(
      path.join(config.modules.image.dir, 'test.jpg'), 
      'test image content'
    )
  })

  afterAll(async () => {
    await db.close()
  })

  test('天气命令', async () => {
    const response = await weatherCmd.queryWeather('北京')
    expect(response).toContain('北京')
  })

  test('随机图片', async () => {
    const response = await imageCmd.randomImage()
    expect(response).toContain('test.jpg')
  })
})
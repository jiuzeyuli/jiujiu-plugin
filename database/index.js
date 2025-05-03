import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import UsageModel from './models/usage'

export default class Database {
  constructor(plugin) {
    this.plugin = plugin
    this.dbPath = path.join(plugin.dataPath, 'data.db')
    this.models = {
      usage: new UsageModel(this)
    }
  }

  async connect() {
    this.connection = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    })
    await this.runMigrations()
  }

  async runMigrations() {
    const migrationFiles = await fs.readdir(
      path.join(__dirname, 'migrations')
    )
    
    for (const file of migrationFiles.sort()) {
      const migration = require(`./migrations/${file}`)
      await migration.up(this.connection)
    }
  }
}
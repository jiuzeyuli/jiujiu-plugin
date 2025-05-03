export default class UsageModel {
  constructor(db) {
    this.db = db
  }

  async recordUsage(userId) {
    await this.db.connection.run(
      `INSERT INTO usage_stats 
       (user_id, date, count) 
       VALUES (?, DATE('now'), 1)
       ON CONFLICT(user_id, date) 
       DO UPDATE SET count = count + 1`,
      [userId]
    )
  }

  async getDailyUsage(userId) {
    return this.db.connection.get(
      `SELECT count FROM usage_stats 
       WHERE user_id = ? AND date = DATE('now')`,
      [userId]
    )
  }
}
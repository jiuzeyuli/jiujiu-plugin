export async function up(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usage_stats (
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, date)
    )
  `)
}

export async function down(db) {
  await db.exec('DROP TABLE IF EXISTS usage_stats')
}
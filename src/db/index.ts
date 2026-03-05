import { Database } from 'bun:sqlite'
import { readFileSync } from 'fs'
import { join } from 'path'
import { logger } from '../utils/logger'

let db: Database

export function getDb(): Database {
  if (!db) {
    db = new Database('sideline.db', { create: true })
    db.run('PRAGMA journal_mode=WAL')
    db.run('PRAGMA foreign_keys=ON')
    const schema = readFileSync(join(import.meta.dir, 'schema.sql'), 'utf-8')
    db.run(schema)
    logger.info('database initialized')
  }
  return db
}

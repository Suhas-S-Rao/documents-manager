import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { getDb } from './database'

const db = getDb()

const schemaPath = app.isPackaged
    ? path.join(process.resourcesPath, 'electron-main', 'database', 'schema.sql')
    : path.join(process.cwd(), 'electron-main', 'database', 'schema.sql')

const schema = fs.readFileSync(schemaPath, 'utf8')

db.exec(schema)
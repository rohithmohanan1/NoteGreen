import { mkdir } from 'fs/promises'
import path from 'path'

const DB_DIR = path.join(process.cwd(), 'data')

async function ensureDbDirectory() {
  try {
    await mkdir(DB_DIR, { recursive: true })
    console.log('Database directory created/verified successfully')
  } catch (error) {
    console.error('Error creating database directory:', error)
    throw error
  }
}

ensureDbDirectory()

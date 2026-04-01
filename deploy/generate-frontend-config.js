/**
 * Writes /var/www/html/config.js for the SPA.
 * Loads /app/config/frontend (KEY=value) if present; process.env wins (Elastic Beanstalk console).
 */
const fs = require('node:fs')
const path = require('node:path')

const outPath = process.argv[2] || '/var/www/html/config.js'
const envFile = process.argv[3] || '/app/config/frontend'

function loadEnvFile(filePath) {
  const out = {}
  if (!fs.existsSync(filePath)) {
    return out
  }
  const text = fs.readFileSync(filePath, 'utf8')
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) {
      continue
    }
    const i = t.indexOf('=')
    if (i === -1) {
      continue
    }
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const fromFile = loadEnvFile(envFile)
const keys = ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID', 'VITE_GOOGLE_MAPS_API_KEY']
const config = {}
for (const k of keys) {
  if (process.env[k] !== undefined && process.env[k] !== '') {
    config[k] = process.env[k]
  } else if (fromFile[k] !== undefined && fromFile[k] !== '') {
    config[k] = fromFile[k]
  }
}
if (!config.VITE_API_URL) {
  config.VITE_API_URL = '/api'
}
if (config.VITE_GOOGLE_CLIENT_ID === undefined) {
  config.VITE_GOOGLE_CLIENT_ID = ''
}
if (config.VITE_GOOGLE_MAPS_API_KEY === undefined) {
  config.VITE_GOOGLE_MAPS_API_KEY = ''
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `window.__ENV__=${JSON.stringify(config)};\n`)

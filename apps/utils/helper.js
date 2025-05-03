import path from 'path'

export function formatPath(p) {
  return p.replace(process.cwd(), '').replace(/\\/g, '/')
}

export function parseSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(1)} ${units[i]}`
}

export async function safeReadDir(dir) {
  try {
    return await fs.readdir(dir)
  } catch {
    return []
  }
}
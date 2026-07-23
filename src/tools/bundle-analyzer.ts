#!/usr/bin/env node
import { readdirSync, statSync, existsSync } from 'fs'
import { join, relative } from 'path'

const SRC = join(process.cwd(), 'src')

interface ModuleInfo {
  name: string
  files: number
  lines: number
  bytes: number
}

function getModuleSize(dir: string, extensions: string[]): ModuleInfo {
  let files = 0
  let lines = 0
  let bytes = 0
  
  function walk(path: string) {
    try {
      const entries = readdirSync(path, { withFileTypes: true })
      for (const entry of entries) {
        const full = join(path, entry.name)
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('node_modules') && !entry.name.startsWith('.')) {
            walk(full)
          }
        } else if (extensions.some(e => entry.name.endsWith(e))) {
          files++
          const stats = statSync(full)
          bytes += stats.size
        }
      }
    } catch {}
  }
  
  walk(dir)
  return { name: relative(SRC, dir), files, lines, bytes }
}

const extensions = ['.ts', '.tsx']

// Analyze modules
const modulesDir = join(SRC, 'server')
const modules = readdirSync(modulesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => getModuleSize(join(modulesDir, d.name), extensions))

const componentsSize = getModuleSize(join(SRC, 'components'), extensions)

console.log('=== Perionyx Bundle Analysis ===')
console.log()
console.log('Server Modules:')
console.log('─'.repeat(60))
console.log('Module'.padEnd(25), 'Files'.padEnd(8), 'Size'.padEnd(10))
console.log('─'.repeat(60))

modules
  .sort((a, b) => b.bytes - a.bytes)
  .forEach(m => {
    console.log(m.name.padEnd(25), String(m.files).padEnd(8), formatBytes(m.bytes).padEnd(10))
  })

console.log()
console.log('Components:')
console.log(`  Files: ${componentsSize.files}`)
console.log(`  Size: ${formatBytes(componentsSize.bytes)}`)
console.log()
console.log(`Total modules: ${modules.length}`)
console.log(`Total server files: ${modules.reduce((s, m) => s + m.files, 0)}`)

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const manifest = JSON.parse(readFileSync(new URL('../vendor/sources.json', import.meta.url), 'utf8'))
const root = new URL('../vendor/upstream/', import.meta.url)
mkdirSync(root, { recursive: true })

for (const source of manifest.sources) {
  const folder = source.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const destination = join(root.pathname, source.mode === 'restricted-reference' ? 'restricted' : 'reviewable', folder)
  mkdirSync(dirname(destination), { recursive: true })

  if (existsSync(destination)) {
    console.log(`SKIP ${source.name}: ${destination} already exists`)
    continue
  }

  console.log(`CLONE ${source.name} -> ${destination}`)
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:limit=2m', source.repo, destination], {
    stdio: 'inherit',
  })
}

console.log('Collection complete. Review every upstream LICENSE before copying code into LGFC runtime paths.')

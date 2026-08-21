import { promises as fs } from 'fs'
import path from 'path'
import type { StudioImageInput } from './gemini'

const CATALOG_REF_DIR = path.join(process.cwd(), 'studio-assets', 'catalog-refs')

const CATALOG_REF_FILES = [
  '01-jersey.png',
  '02-tee.png',
  '03-sweatshirt.png',
  '04-pants.png',
  '05-knit-zip.png',
  '06-jacket.png',
] as const

export async function loadBundledCatalogRefs(): Promise<StudioImageInput[]> {
  const refs: StudioImageInput[] = []

  for (const file of CATALOG_REF_FILES) {
    const full = path.join(CATALOG_REF_DIR, file)
    try {
      const buffer = await fs.readFile(full)
      refs.push({
        mimeType: 'image/png',
        base64: buffer.toString('base64'),
        label: file.replace(/\.png$/, ''),
      })
    } catch {
      // Missing file on a given deploy should not block generation.
    }
  }

  return refs
}

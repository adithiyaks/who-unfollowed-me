import { strFromU8, unzipSync } from 'fflate'

export type ZipEntry = {
  name: string
  text: string
}

export const extractZipJsonEntries = async (file: File): Promise<ZipEntry[]> => {
  const buffer = new Uint8Array(await file.arrayBuffer())
  const decoded = unzipSync(buffer)
  const entries: ZipEntry[] = []
  for (const [name, data] of Object.entries(decoded)) {
    if (!name.toLowerCase().endsWith('.json')) continue
    entries.push({ name, text: strFromU8(data) })
  }
  return entries
}

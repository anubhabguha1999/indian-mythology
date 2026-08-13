import sharp from 'sharp'
import { statSync } from 'node:fs'

const dir = 'public/1930.331_nataraja_shiva_as_the_lord_of_dance/textures'

const jobs = [
  // baseColor is the one thing worth keeping some fidelity in — 2048 is
  // already generous for a figure that never fills more than a fraction
  // of the frame at this scene's scale.
  { file: 'Nataraja_Mat_baseColor.jpeg', size: 2048, format: 'jpeg', options: { quality: 82, mozjpeg: true } },
  // Normal maps read fine at lower res since they're high-frequency detail
  // averaged by mipmapping anyway at any real viewing distance.
  { file: 'Nataraja_Mat_normal.jpeg', size: 1536, format: 'jpeg', options: { quality: 80, mozjpeg: true } },
  // Metallic/roughness is almost always a low-frequency map — this is
  // the one that was 55MB as an uncompressed 8K PNG for no visual reason.
  { file: 'Nataraja_Mat_metallicRoughness.png', size: 1024, format: 'jpeg', options: { quality: 78, mozjpeg: true }, renameToJpeg: true },
]

for (const job of jobs) {
  const inPath = `${dir}/${job.file}`
  const before = statSync(inPath).size
  const outPath = job.renameToJpeg ? inPath.replace(/\.png$/, '.jpeg') : inPath
  const buffer = await sharp(inPath).resize(job.size, job.size, { fit: 'fill' })[job.format](job.options).toBuffer()
  await sharp(buffer).toFile(outPath + (outPath === inPath ? '.tmp' : ''))
  if (outPath === inPath) {
    const { renameSync } = await import('node:fs')
    renameSync(outPath + '.tmp', outPath)
  } else {
    const { unlinkSync } = await import('node:fs')
    unlinkSync(inPath)
  }
  const after = statSync(outPath).size
  console.log(`${job.file} -> ${outPath.split('/').pop()}: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB`)
}

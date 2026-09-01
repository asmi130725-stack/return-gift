const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function createPNG(width, height) {
  // Generate a valid RGBA PNG buffer with pink gradient and a heart
  const rowSize = width * 4 + 1
  const rawData = Buffer.alloc(rowSize * height)

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize
    rawData[rowOffset] = 0 // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4
      
      // Normalized coords from center [-1, 1]
      const nx = (x - width / 2) / (width / 2.2)
      const ny = -(y - height / 2) / (height / 2.2)

      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const a = nx * nx + ny * ny - 0.7
      const isHeart = (a * a * a - nx * nx * ny * ny * ny) <= 0.05

      // Background rounded squircle / circle
      const r = Math.sqrt(nx * nx + ny * ny)
      if (r < 0.95) {
        if (isHeart) {
          // White heart
          rawData[pxOffset] = 255     // R
          rawData[pxOffset + 1] = 255 // G
          rawData[pxOffset + 2] = 255 // B
          rawData[pxOffset + 3] = 255 // A
        } else {
          // Pink/Rose gradient
          const grad = (x + y) / (width + height)
          rawData[pxOffset] = Math.round(255 - grad * 15) // R: 255 -> 240
          rawData[pxOffset + 1] = Math.round(107 - grad * 30) // G: 107 -> 77
          rawData[pxOffset + 2] = Math.round(157 - grad * 20) // B: 157 -> 137
          rawData[pxOffset + 3] = 255
        }
      } else {
        // Transparent
        rawData[pxOffset] = 0
        rawData[pxOffset + 1] = 0
        rawData[pxOffset + 2] = 0
        rawData[pxOffset + 3] = 0
      }
    }
  }

  const compressed = zlib.deflateSync(rawData)

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function makeChunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length, 0)
    const typeBuf = Buffer.from(type, 'ascii')
    const crc = crc32(Buffer.concat([typeBuf, data]))
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc >>> 0, 0)
    return Buffer.concat([len, typeBuf, data, crcBuf])
  }

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type (RGBA)
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr)
  const idatChunk = makeChunk('IDAT', compressed)
  const iendChunk = makeChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

// CRC32 implementation
const crcTable = []
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return crc ^ 0xffffffff
}

const publicDir = path.join(__dirname, '..', 'public')
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 192))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 512))
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(64, 64))
console.log('Icons generated successfully!')

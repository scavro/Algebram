/* Decoder PNG mínimo (sin dependencias) para muestreo de píxeles.
   Soporta bit depth 8, colorTypes 0/2/4/6, no interlaced. */
const zlib = require("zlib");

function decodePNG(buf) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error("no es PNG");
  let off = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      w = data.readUInt32BE(0);
      h = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    off += 12 + len;
  }
  if (bitDepth !== 8) throw new Error("bitDepth no soportado: " + bitDepth);
  if (interlace !== 0) throw new Error("interlaced no soportado");
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error("colorType no soportado: " + colorType);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * channels;
  const out = Buffer.alloc(h * stride);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[pos++];
    const row = raw.subarray(pos, pos + stride);
    pos += stride;
    const o = y * stride;
    const prev = y > 0 ? out.subarray(o - stride, o) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[o + x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = row[x];
      switch (ft) {
        case 0: break;
        case 1: v = (v + a) & 255; break;
        case 2: v = (v + b) & 255; break;
        case 3: v = (v + ((a + b) >> 1)) & 255; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
          break;
        }
        default: throw new Error("filtro desconocido " + ft);
      }
      out[o + x] = v;
    }
  }
  return {
    width: w,
    height: h,
    channels,
    /* rgb(x,y) -> [r,g,b] */
    rgb(x, y) {
      const i = y * stride + x * channels;
      if (colorType === 0 || colorType === 4) return [out[i], out[i], out[i]];
      return [out[i], out[i + 1], out[i + 2]];
    },
  };
}

module.exports = { decodePNG };

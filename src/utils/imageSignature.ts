// Detecta o tipo REAL de um arquivo pelos "magic bytes" — os primeiros bytes
// que todo formato carrega como assinatura. Confiar no nome (foto.jpg) ou no
// mimetype enviado pelo cliente é inseguro: ambos são texto que o cliente
// escolhe. Os bytes do conteúdo, não.
//   JPEG: FF D8 FF
//   PNG:  89 50 4E 47 0D 0A 1A 0A
//   WebP: bytes 0-3 = "RIFF" e bytes 8-11 = "WEBP"

function startsWith(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) {
    return false;
  }
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
}

function isJpeg(buffer: Buffer): boolean {
  return startsWith(buffer, [0xff, 0xd8, 0xff]);
}

function isPng(buffer: Buffer): boolean {
  return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function isWebp(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }
  const hasRiff = buffer.toString("ascii", 0, 4) === "RIFF";
  const hasWebp = buffer.toString("ascii", 8, 12) === "WEBP";
  return hasRiff && hasWebp;
}

export function isRealImage(buffer: Buffer): boolean {
  return isJpeg(buffer) || isPng(buffer) || isWebp(buffer);
}

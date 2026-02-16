const sharp = require('sharp');
const fs = require('fs');

const src = 'public/assets/fishcart-logo.png';
const outDir = 'public/assets';
const sizes = [
  { w: 200, h: 60, name: 'logo-200x60' },
  { w: 160, h: 48, name: 'logo-160x48' },
  { w: 120, h: 36, name: 'logo-120x36' },
  { w: 48, h: 48, name: 'favicon-48' },
  { w: 32, h: 32, name: 'favicon-32' },
];

(async () => {
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    for (const s of sizes) {
      const pngOut = `${outDir}/fishcart-${s.name}.png`;
      const webpOut = `${outDir}/fishcart-${s.name}.webp`;
      await sharp(src)
        .resize(s.w, s.h, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toFile(pngOut);
      await sharp(src)
        .resize(s.w, s.h, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 80 })
        .toFile(webpOut);
    }
    console.log('resized done');
  } catch (err) {
    console.error('resize error:', err);
    process.exit(1);
  }
})();


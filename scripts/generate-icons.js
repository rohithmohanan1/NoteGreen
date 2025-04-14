import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceIcon = path.join(__dirname, "..", "generated-icon.png");
const iconsDir = path.join(__dirname, "..", "client", "public", "icons");

async function generateIcons() {
  const sizes = [192, 512];

  for (const size of sizes) {
    // Regular icon
    await sharp(sourceIcon)
      .resize(size, size)
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

    // Maskable icon (with padding for safe area)
    if (size === 512) {
      await sharp(sourceIcon)
        .resize(Math.floor(size * 0.8), Math.floor(size * 0.8))
        .extend({
          top: Math.floor(size * 0.1),
          bottom: Math.floor(size * 0.1),
          left: Math.floor(size * 0.1),
          right: Math.floor(size * 0.1),
          background: { r: 9, g: 54, b: 36, alpha: 1 }, // #093624
        })
        .toFile(path.join(iconsDir, `maskable-icon-${size}x${size}.png`));
    }
  }

  console.log("PWA icons generated successfully!");
}

generateIcons().catch(console.error);

import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';

async function uploadAssets() {
  const { r2Service } = await import('../lib/r2');
  const assets = [
    'landing1.png',
    'landing2.png',
    'landing3.png',
    'landing4.png',
    'landing5.png'
  ];

  const publicPath = path.join(process.cwd(), 'public');

  for (const asset of assets) {
    const filePath = path.join(publicPath, asset);
    if (fs.existsSync(filePath)) {
      console.log(`Uploading ${asset}...`);
      const fileBuffer = fs.readFileSync(filePath);
      try {
        const url = await r2Service.uploadFile(fileBuffer, asset, 'image/png');
        console.log(`Uploaded ${asset} to ${url}`);
      } catch (error) {
        console.error(`Failed to upload ${asset}:`, error);
      }
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  }
}

uploadAssets()
  .then(() => console.log('Done!'))
  .catch(console.error);

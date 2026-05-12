import dotenv from 'dotenv';
dotenv.config();
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

async function checkAssets() {
  const assets = [
    'landing1.png',
    'landing2.png',
    'landing3.png',
    'landing4.png',
    'landing5.png'
  ];

  for (const asset of assets) {
    try {
      await r2Client.send(new HeadObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: asset,
      }));
      console.log(`${asset}: EXISTS`);
    } catch (error: any) {
      console.log(`${asset}: NOT FOUND (${error.name})`);
    }
  }
}

checkAssets().catch(console.error);

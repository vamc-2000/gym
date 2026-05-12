import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

export const r2Service = {
  async uploadFile(file: Buffer, fileName: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    try {
      await r2Client.send(command);
      return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;
    } catch (error) {
      console.error("R2 Upload Error:", error);
      throw error;
    }
  },

  async getPresignedUploadUrl(fileName: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    try {
      const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      console.error("R2 Presigned URL Error:", error);
      throw error;
    }
  },

  async deleteFile(fileName: string) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
    });

    try {
      await r2Client.send(command);
    } catch (error) {
      console.error("R2 Delete Error:", error);
      throw error;
    }
  }
};

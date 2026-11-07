import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

function configure() {
  return cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.cloudinary_name,
    api_key: process.env.CLOUDINARY_API_KEY ?? process.env.cloudinary_key,
    api_secret: process.env.CLOUDINARY_API_SECRET ?? process.env.cloudinary_secret,
    secure: true,
  });
}

function isConfigured() {
  const config = configure();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
}

function uploadImage(fileStream) {
  if (!isConfigured()) throw new Error("Cloudinary is not configured.");
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: "trail-mate",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1600, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }],
    }, (error, result) => {
      if (error) return reject(error);
      return resolve({ url: result.secure_url, publicId: result.public_id });
    });

    fileStream.once("error", reject);
    fileStream.pipe(uploadStream);
  });
}

async function deleteImage(publicId) {
  if (!publicId || !isConfigured()) return false;
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  return result.result === "ok";
}

export const imageStore = { isConfigured, uploadImage, deleteImage };

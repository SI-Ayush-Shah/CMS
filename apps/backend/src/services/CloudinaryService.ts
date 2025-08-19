import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { env } from '../config/env'

export interface CloudinaryService {
  uploadBuffer(params: { buffer: Buffer; filename?: string; folder?: string; mimeType?: string }): Promise<string>
}

export function createCloudinaryService(): CloudinaryService {
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true
    })
  }

  async function uploadBuffer({ buffer, filename, folder, mimeType }: { buffer: Buffer; filename?: string; folder?: string; mimeType?: string }): Promise<string> {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment not configured')
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'generated-content',
        resource_type: 'image',
        filename_override: filename,
        use_filename: Boolean(filename),
        unique_filename: !filename
      },
      (error, result?: UploadApiResponse) => {
        /* placeholder, real impl wrapped below */
      }
    )
    return await new Promise<string>((resolve, reject) => {
      const s = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'generated-content',
          resource_type: 'image',
          filename_override: filename,
          use_filename: Boolean(filename),
          unique_filename: !filename
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) return reject(error)
          resolve(result.secure_url)
        }
      )
      s.end(buffer)
    })
  }

  return { uploadBuffer }
}



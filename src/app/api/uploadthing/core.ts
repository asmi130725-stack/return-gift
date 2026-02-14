import { createUploadthing, type FileRouter } from "uploadthing/next"
import type { FileRouter as UploadthingFileRouter } from "uploadthing/server"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      // Return metadata to be available in onUploadComplete
      return { userId: "00000000-0000-0000-0000-000000000001", type: "image" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)
      return { uploadedBy: metadata.userId, type: "image" }
    }),
  
  mediaUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    video: { maxFileSize: "16MB", maxFileCount: 5 }
  })
    .middleware(async ({ req }) => {
      // Return metadata to be available in onUploadComplete
      return { userId: "00000000-0000-0000-0000-000000000001" }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Media upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)
      const type = file.type?.startsWith('image/') ? 'image' : file.type?.startsWith('video/') ? 'video' : 'image'
      return { uploadedBy: metadata.userId, type }

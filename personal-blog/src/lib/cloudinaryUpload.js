export async function uploadToCloudinary(file, onProgress) {
  const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)
    form.append("upload_preset", UPLOAD_PRESET)
    form.append("folder", "blog")

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText)
        resolve(data.secure_url)
      } else {
        reject(new Error("Upload thất bại: " + xhr.statusText))
      }
    }

    xhr.onerror = () => reject(new Error("Lỗi kết nối"))
    xhr.send(form)
  })
}
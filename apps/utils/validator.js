import { fileTypeFromBuffer } from 'file-type'

export default class ImageValidator {
  static SUPPORTED_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  async validate(buffer) {
    if (!buffer || buffer.length < 12) return false // 最小文件头校验
    
    const type = await fileTypeFromBuffer(buffer)
    return type && ImageValidator.SUPPORTED_MIMES.includes(type.mime)
  }

  checkExtension(filename) {
    const ext = filename.toLowerCase().split('.').pop()
    return ['jpg', 'jpeg', 'png', 'webp'].includes(ext)
  }
}
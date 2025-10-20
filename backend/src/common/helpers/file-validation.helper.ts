import { BadRequestException } from '@nestjs/common';

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB for images
  DOCUMENT: 5 * 1024 * 1024, // 5MB for documents
};

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// File extension validation
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx'];

/**
 * Validate image file
 */
export function validateImageFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  // Check file size
  if (file.size > MAX_FILE_SIZES.IMAGE) {
    throw new BadRequestException(
      `File size too large. Maximum size is ${MAX_FILE_SIZES.IMAGE / 1024 / 1024}MB`,
    );
  }

  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    );
  }

  // Check file extension
  const fileExt = file.originalname.toLowerCase().match(/\.[^.]*$/)?.[0];
  if (!fileExt || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExt)) {
    throw new BadRequestException(
      `Invalid file extension. Allowed extensions: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
    );
  }

  // Basic magic number validation for images
  if (!isValidImageMagicNumber(file.buffer)) {
    throw new BadRequestException('File content does not match file extension');
  }
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }

  if (file.size > MAX_FILE_SIZES.DOCUMENT) {
    throw new BadRequestException(
      `File size too large. Maximum size is ${MAX_FILE_SIZES.DOCUMENT / 1024 / 1024}MB`,
    );
  }

  if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(', ')}`,
    );
  }

  const fileExt = file.originalname.toLowerCase().match(/\.[^.]*$/)?.[0];
  if (!fileExt || !ALLOWED_DOCUMENT_EXTENSIONS.includes(fileExt)) {
    throw new BadRequestException(
      `Invalid file extension. Allowed extensions: ${ALLOWED_DOCUMENT_EXTENSIONS.join(', ')}`,
    );
  }
}

/**
 * Validate image magic number (file signature)
 * This prevents executable files disguised as images
 */
function isValidImageMagicNumber(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  // GIF: 47 49 46 38
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return true;
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters
    .replace(/\.{2,}/g, '_') // Prevent directory traversal (..)
    .substring(0, 255); // Limit length
}

/**
 * Generate safe random filename
 */
export function generateSafeFilename(originalName: string): string {
  const ext = originalName.match(/\.[^.]*$/)?.[0] || '';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}${ext}`;
}

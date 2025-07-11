/**
 * Utility functions for image handling and compression
 */

export interface CompressedImage {
  dataUrl: string;
  size: number; // size in bytes
  width: number;
  height: number;
}

/**
 * Compress an image file to reduce storage size
 * Target: ~100KB max with reasonable quality
 */
export function compressImage(
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.7
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const size = Math.round((dataUrl.length * 3) / 4); // Approximate size in bytes

      resolve({
        dataUrl,
        size,
        width: Math.round(width),
        height: Math.round(height),
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB max upload
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPEG, PNG, or WebP image file.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file must be smaller than 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Create a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Clean up preview URL to prevent memory leaks
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}
type TransformOpts = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  dpr?: 'auto' | number; // Device pixel ratio for retina displays
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  aspectRatio?: string; // e.g., '16:9', '1:1'
  blur?: number;
  sharpen?: boolean;
};

/**
 * Transform Cloudinary image URLs with optimizations
 * @param url - Original Cloudinary URL
 * @param opts - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function transformCloudinary(url: string, opts: TransformOpts = {}): string {
  if (!url || !url.includes('/image/upload/')) return url;
  
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good', // Better default quality
    format = 'auto',       // Auto-selects WebP/AVIF
    dpr = 'auto',         // Auto device pixel ratio
    gravity,
    aspectRatio,
    blur,
    sharpen = false,
  } = opts;
  
  const parts = url.split('/image/upload/');
  const transforms: string[] = [];
  
  // Dimensions
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (aspectRatio) transforms.push(`ar_${aspectRatio}`);
  
  // Cropping and positioning
  if (crop) transforms.push(`c_${crop}`);
  if (gravity) transforms.push(`g_${gravity}`);
  
  // Quality and format (always optimize)
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  
  // DPR for retina displays
  if (dpr) transforms.push(`dpr_${dpr}`);
  
  // Effects
  if (blur) transforms.push(`e_blur:${blur}`);
  if (sharpen) transforms.push('e_sharpen');
  
  // Additional optimizations
  transforms.push('fl_progressive'); // Progressive JPEG
  transforms.push('fl_preserve_transparency'); // Preserve PNG transparency
  
  const t = transforms.join(',');
  return `${parts[0]}/image/upload/${t}/${parts[1]}`;
}

/**
 * Preset transformations for common use cases
 */
export const cloudinaryPresets = {
  thumbnail: (url: string) => transformCloudinary(url, {
    width: 150,
    height: 150,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:eco',
  }),
  
  card: (url: string) => transformCloudinary(url, {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
  }),
  
  hero: (url: string) => transformCloudinary(url, {
    width: 1200,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:best',
  }),
  
  profile: (url: string) => transformCloudinary(url, {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
  }),
  
  gallery: (url: string) => transformCloudinary(url, {
    width: 800,
    crop: 'limit',
    quality: 'auto:good',
  }),
};

export async function uploadToCloudinary(file: File | Blob, options?: { folder?: string }): Promise<any> {
  // Validate file before upload (security check)
  if (file instanceof File) {
    const { validateImageFile, isValidImageByContent } = await import('@/lib/file-validation');
    
    try {
      validateImageFile(file);
      
      // Additional check: validate by content (magic numbers)
      const isValidImage = await isValidImageByContent(file);
      if (!isValidImage) {
        throw new Error('File content does not match image format. This file may be corrupted or not a real image.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`File validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary is not configured. Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_API_KEY.');
  }

  const sigRes = await fetch('/api/cloudinary/signature', { credentials: 'include' });
  if (!sigRes.ok) {
    throw new Error('Could not get upload signature. Please try again.');
  }
  const { signature, timestamp } = await sigRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  if (options?.folder) form.append('folder', options.folder);
  form.append('signature', signature);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!uploadRes.ok) {
    let err: any = null;
    try { err = await uploadRes.json(); } catch {}
    throw err || new Error('Upload failed.');
  }
  return uploadRes.json();
}

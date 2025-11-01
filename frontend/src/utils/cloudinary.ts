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

/**
 * Fetch with timeout to prevent hanging requests
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 120000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. Please check your connection and try again with a smaller file.');
    }
    throw error;
  }
}

export async function uploadToCloudinary(
  file: File | Blob, 
  options?: { 
    folder?: string; 
    publicId?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<any> {
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

  const sigRes = await fetchWithTimeout('/api/cloudinary/signature', { credentials: 'include' }, 30000);
  if (!sigRes.ok) {
    throw new Error('Could not get upload signature. Please try again.');
  }
  const { signature, timestamp } = await sigRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  if (options?.folder) form.append('folder', options.folder);
  
  // Add custom public_id to preserve filename (sanitized)
  if (options?.publicId) {
    form.append('public_id', options.publicId);
  } else if (file instanceof File && file.name) {
    // Auto-generate public_id from filename (remove extension, sanitize)
    const publicId = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars
      .substring(0, 100); // Limit length
    form.append('public_id', publicId);
  }
  
  form.append('signature', signature);

  // Use XMLHttpRequest if progress callback provided, otherwise use fetch
  if (options?.onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && options.onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          options.onProgress(progress);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(error);
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });
      
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });
      
      xhr.timeout = 120000; // 2 minute timeout
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
      xhr.send(form);
    });
  } else {
    // Fallback to fetch without progress
    const uploadRes = await fetchWithTimeout(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: form,
      },
      120000 // 2 minute timeout for large files
    );
    if (!uploadRes.ok) {
      let err: any = null;
      try { err = await uploadRes.json(); } catch {}
      throw err || new Error('Upload failed.');
    }
    return uploadRes.json();
  }
}

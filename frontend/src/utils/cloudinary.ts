type TransformOpts = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
};

export function transformCloudinary(url: string, opts: TransformOpts = {}): string {
  if (!url || !url.includes('/image/upload/')) return url;
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = opts;
  const parts = url.split('/image/upload/');
  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  const t = transforms.join(',');
  return `${parts[0]}/image/upload/${t}/${parts[1]}`;
}

export async function uploadToCloudinary(file: File | Blob, options?: { folder?: string }): Promise<any> {
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

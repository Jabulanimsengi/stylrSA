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

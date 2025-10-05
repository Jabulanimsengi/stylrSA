// frontend/src/components/GalleryUploadModal.tsx
import { useState } from 'react';
import { GalleryImage } from '@/types';
import { toast } from 'react-toastify';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { uploadToCloudinary } from '@/utils/cloudinary';
import styles from './EditSalonModal.module.css'; // Using similar styles

interface GalleryUploadModalProps {
  salonId: string;
  onClose: () => void;
  onImageAdded: (newImage: GalleryImage) => void;
}

export default function GalleryUploadModal({ salonId, onClose, onImageAdded }: GalleryUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.warn('Please select at least one image to upload.');
      return;
    }
    setIsUploading(true);
    const token = localStorage.getItem('access_token');
    
    try {
      for (const file of files) {
        const imageUrl = await uploadToCloudinary(file);
        const res = await fetch('http://localhost:3000/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ salonId, imageUrl, caption }),
        });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        const newImage = await res.json();
        onImageAdded(newImage);
      }
      toast.success(`${files.length} image(s) uploaded successfully!`);
      setFiles([]);
      setCaption('');
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}><FaTimes /></button>
        <h2>Upload to Gallery</h2>
        <div className={styles.formGroup}>
            <label htmlFor="galleryImages">Select Images</label>
            <input type="file" id="galleryImages" multiple onChange={handleFileChange} />
        </div>
         <div className={styles.formGroup}>
            <label htmlFor="caption">Caption (optional)</label>
            <input type="text" id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Describe the image(s)"/>
        </div>
        <button onClick={handleUpload} disabled={isUploading || files.length === 0} className="btn btn-primary">
          <FaUpload /> {isUploading ? `Uploading ${files.length} images...` : 'Upload'}
        </button>
      </div>
    </div>
  );
}
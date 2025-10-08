// frontend/src/components/ServiceFormModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styles from './ServiceFormModal.module.css';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { Service } from '@/types';

interface ServiceFormInputs {
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  images: string[];
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  onServiceAddedOrUpdated: (service: Service) => void;
  serviceToEdit?: Service | null;
}

interface Category {
  id: string;
  name: string;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  salonId,
  onServiceAddedOrUpdated,
  serviceToEdit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration: 30,
      categoryId: '',
      images: [],
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const existingImages = watch('images');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/services/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        } else {
          toast.error('Failed to load service categories.');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('An error occurred while fetching categories.');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (serviceToEdit) {
      reset({
        name: serviceToEdit.name,
        description: serviceToEdit.description,
        price: serviceToEdit.price,
        duration: serviceToEdit.duration,
        categoryId: serviceToEdit.category, // FIX: Use 'category' for existing services
        images: serviceToEdit.images || [],
      });
      setImagePreviews(serviceToEdit.images || []);
      setImageFiles([]);
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        categoryId: '',
        images: [],
      });
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [serviceToEdit, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImageFiles = [...imageFiles, ...files];
      setImageFiles(newImageFiles);

      const newImagePreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newImagePreviews]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    if (index < existingImages.length) {
        const updatedImages = existingImages.filter((_, i) => i !== index);
        setValue('images', updatedImages);
        setImagePreviews(updatedImages);
    } else {
        const fileIndex = index - existingImages.length;
        const updatedFiles = imageFiles.filter((_, i) => i !== fileIndex);
        setImageFiles(updatedFiles);

        const updatedPreviews = updatedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews([...existingImages, ...updatedPreviews]);
    }
  };

  const onSubmit: SubmitHandler<ServiceFormInputs> = async (data) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      let uploadedImageUrls = [...(data.images || [])];
      
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => uploadToCloudinary(file));
        const responses = await Promise.all(uploadPromises);
        const newUrls = responses.map(res => res.secure_url); // This now works correctly
        uploadedImageUrls.push(...newUrls);
      }
      
      const serviceData = {
        ...data,
        price: Number(data.price),
        duration: Number(data.duration),
        images: uploadedImageUrls,
        salonId,
      };

      const url = serviceToEdit
        ? `/api/services/${serviceToEdit.id}`
        : `/api/services`;
      const method = serviceToEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save service.');
      }

      const savedService = await response.json();
      toast.success(`Service ${serviceToEdit ? 'updated' : 'added'} successfully! It will be reviewed by an admin.`);
      onServiceAddedOrUpdated(savedService);
      onClose();
    } catch (error: any) {
      console.error('Failed to save service:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      toast.error(error.message || 'Failed to save service.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (isSubmitting || isUploading) return;
    reset();
    setImageFiles([]);
    setImagePreviews([]);
    setErrorMessage(null);
    onClose();
  }, [isSubmitting, isUploading, reset, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} disabled={isSubmitting || isUploading}>&times;</button>
        <h2 className={styles.title}>{serviceToEdit ? 'Edit Service' : 'Add a New Service'}</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.formScrollableContent}>
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>Service Name</label>
                    <input
                        id="name"
                        type="text"
                        {...register('name', { required: 'Service name is required' })}
                        className={styles.input}
                        placeholder="e.g., Classic Manicure"
                    />
                    {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="categoryId" className={styles.label}>Category</label>
                    <select
                        id="categoryId"
                        {...register('categoryId', { required: 'Please select a category' })}
                        className={styles.select}
                    >
                        <option value="">Select a category...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && <p className={styles.errorMessage}>{errors.categoryId.message}</p>}
                </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="description" className={styles.label}>Description</label>
                <textarea
                    id="description"
                    {...register('description', { required: 'Description is required' })}
                    className={styles.textarea}
                    placeholder="Describe the service in detail"
                />
                {errors.description && <p className={styles.errorMessage}>{errors.description.message}</p>}
            </div>
            
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="price" className={styles.label}>Price (R)</label>
                    <input
                        id="price"
                        type="number"
                        {...register('price', { 
                            required: 'Price is required',
                            valueAsNumber: true,
                            min: { value: 0, message: 'Price cannot be negative' } 
                        })}
                        className={styles.input}
                        placeholder="e.g., 250"
                    />
                    {errors.price && <p className={styles.errorMessage}>{errors.price.message}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="duration" className={styles.label}>Duration (minutes)</label>
                    <input
                        id="duration"
                        type="number"
                        {...register('duration', { 
                            required: 'Duration is required',
                            valueAsNumber: true,
                            min: { value: 5, message: 'Duration must be at least 5 minutes' }
                        })}
                        className={styles.input}
                        step="5"
                        placeholder="e.g., 60"
                    />
                    {errors.duration && <p className={styles.errorMessage}>{errors.duration.message}</p>}
                </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="images" className={styles.label}>Service Images</label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className={styles.input}
                disabled={isUploading}
              />
              <div className={styles.imagePreviewContainer}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imageWrapper}>
                    <Image src={preview} alt="Service preview" layout="fill" className={styles.imagePreview} />
                    <button type="button" onClick={() => handleRemoveImage(index)} className={styles.deleteButton}>&times;</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.buttonContainer}>
            <button type="button" onClick={handleClose} className={styles.cancelButton} disabled={isSubmitting || isUploading}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? 'Saving...' : (serviceToEdit ? 'Save Changes' : 'Save Service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
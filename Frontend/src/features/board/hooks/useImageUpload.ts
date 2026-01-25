import { useRef } from 'react';

export const useImageUpload = (onImageLoaded: (base64: string) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageLoaded(reader.result); // Trả về chuỗi Base64
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input để chọn lại cùng 1 file vẫn trigger change
    e.target.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return { fileInputRef, handleFileChange, triggerUpload };
};
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-90">
      <div ref={modalRef} className="relative w-[90vw] h-[90vh] bg-gray-900 p-4 rounded-lg">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-8 h-8 bg-red-600 text-white rounded-full
                   flex items-center justify-center hover:bg-red-700 transition-colors z-10"
        >
          ×
        </button>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="Question reference"
              className="rounded"
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
              priority
              quality={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

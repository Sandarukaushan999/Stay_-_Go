import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Camera, Upload, X, Loader2, Trash2, Edit2 } from 'lucide-react';
import { createApiClient } from '../../../lib/axios';
import { useAuthStore } from '../../../app/store/authStore';
import toast from 'react-hot-toast';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ProfileImageCropper({ imgSrc, initials, onUploadSuccess }) {
  const { hydrateMe } = useAuthStore();
  const api = createApiClient({ getToken: () => useAuthStore.getState().token });

  const [imgSrcUrl, setImgSrcUrl] = useState('');
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File exceeds 5MB limit.');
        return;
      }
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrcUrl(reader.result?.toString() || ''));
      reader.readAsDataURL(file);
      setIsModalOpen(true);
      // Reset input so the same file could be selected again if needed
      e.target.value = '';
    }
  };

  const handleEditCurrent = () => {
    if (imgSrc) {
      setCrop(undefined);
      setImgSrcUrl(imgSrc);
      setIsModalOpen(true);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      setUploading(true);
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(imgRef.current, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Canvas is empty');
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        try {
          const { data } = await api.post('/users/profile/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (data.success) {
            toast.success('Profile picture updated!');
            await hydrateMe({ force: true });
            if (onUploadSuccess) onUploadSuccess();
            setIsModalOpen(false);
            setImgSrcUrl('');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      }, 'image/jpeg', 0.95);
    } catch (e) {
      toast.error('Error cropping image');
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove current profile picture?')) return;
    setUploading(true);
    try {
      const { data } = await api.delete('/users/profile/image');
      if (data.success) {
        toast.success('Profile picture removed!');
        await hydrateMe({ force: true });
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full mb-5">
        <div className="relative mx-auto mb-4 h-[100px] w-[100px]">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-[#BAF91A] blur-md opacity-40 scale-110" />
          
          <div className="relative h-[100px] w-[100px] overflow-hidden rounded-full ring-[4px] ring-[#BAF91A]/90 bg-white shadow-[0_4px_24px_rgba(186,249,26,0.35)]">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  // If URL is broken/blocked, hide img and show initials fallback
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="h-full w-full items-center justify-center bg-gradient-to-br from-[#101312] to-[#2a2f2c] text-[32px] font-extrabold text-[#BAF91A] select-none"
              style={{ display: imgSrc ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Explicit Buttons Layer */}
        <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#BAF91A] hover:bg-[#a9ea00] text-[#101312] px-4 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" /> Upload Photo
          </button>
          
          {imgSrc && (
            <div className="flex gap-2 w-full">
              <button
                onClick={handleEditCurrent}
                disabled={uploading}
                title="Crop existing photo further"
                className="flex-1 flex justify-center items-center gap-1.5 rounded-xl border border-[#101312]/15 bg-white hover:bg-[#101312]/5 text-[#101312] px-2 py-2 text-xs font-bold transition-all disabled:opacity-60"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={handleRemove}
                disabled={uploading}
                title="Remove photo completely"
                className="flex-1 flex justify-center items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-2 text-xs font-bold transition-all disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          ref={fileInputRef}
          onChange={onSelectFile}
          className="hidden"
        />
      </div>

      {/* Cropper Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#101312]/10 flex items-center justify-between bg-gray-50 flex-none">
              <h3 className="font-bold text-[#101312]">Crop Profile Picture</h3>
              <button
                onClick={() => { setIsModalOpen(false); setImgSrcUrl(''); }}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-black/5 flex-1 overflow-auto flex items-center justify-center min-h-[250px]">
              {!!imgSrcUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Upload"
                    src={imgSrcUrl}
                    onLoad={onImageLoad}
                    crossOrigin="anonymous"
                    className="max-h-[50vh] w-auto mx-auto object-contain"
                  />
                </ReactCrop>
              )}
            </div>

            <div className="p-4 border-t border-[#101312]/10 flex items-center justify-end gap-3 flex-none bg-white">
              <button
                onClick={() => { setIsModalOpen(false); setImgSrcUrl(''); }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !completedCrop}
                className="flex items-center gap-2 px-5 py-2 min-w-[100px] justify-center bg-[#BAF91A] text-[#101312] text-sm font-bold shadow-md hover:bg-[#a9ea00] rounded-xl transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

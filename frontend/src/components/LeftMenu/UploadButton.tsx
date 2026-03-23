import { useRef } from 'react';
import './LeftMenu.css';

interface UploadButtonProps {
  onUpload: (files: FileList) => void;
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="left-menu__section">
      <h4>Upload</h4>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onUpload(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <button
        className="left-menu__btn"
        onClick={() => inputRef.current?.click()}
      >
        Upload Photo / Video
      </button>
    </div>
  );
}

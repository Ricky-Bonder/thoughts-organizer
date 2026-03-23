import type { Attachment } from '../../types';

interface CardAttachmentProps {
  attachment: Attachment;
  onRemove?: () => void;
  showRemove?: boolean;
}

export default function CardAttachment({ attachment, onRemove, showRemove }: CardAttachmentProps) {
  const isImage = attachment.mime_type.startsWith('image/');
  const isVideo = attachment.mime_type.startsWith('video/');

  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      {isImage && (
        <img
          src={attachment.url}
          alt={attachment.filename}
          style={{ maxWidth: '100%', borderRadius: 4 }}
        />
      )}
      {isVideo && (
        <video
          src={attachment.url}
          controls
          style={{ maxWidth: '100%', borderRadius: 4 }}
        />
      )}
      {!isImage && !isVideo && (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
          {attachment.filename}
        </a>
      )}
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            cursor: 'pointer',
            fontSize: 12,
            lineHeight: '22px',
            textAlign: 'center',
          }}
        >
          x
        </button>
      )}
    </div>
  );
}

import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MentorImagePreviewProps {
  file: File;
  uploading: boolean;
  onRemove: () => void;
}

export function MentorImagePreview({ file, uploading, onRemove }: MentorImagePreviewProps) {
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="relative inline-block rounded-xl overflow-hidden border border-white/[0.08] bg-secondary/30 shadow-sm">
      <img
        src={previewUrl}
        alt="Preview"
        className="h-20 w-20 object-cover"
        onLoad={() => URL.revokeObjectURL(previewUrl)}
      />
      {uploading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      )}
      {!uploading && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive/90 hover:bg-destructive text-white p-0"
          onClick={onRemove}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

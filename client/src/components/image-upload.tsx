import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Upload } from "lucide-react";
import { compressImage, validateImageFile, createImagePreview, revokeImagePreview } from "@/lib/image-utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (compressedImage: string | null) => void;
  currentImage?: string | null;
  className?: string;
}

export function ImageUpload({ onImageSelect, currentImage, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid Image",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsCompressing(true);
    
    try {
      // Create preview
      const previewUrl = createImagePreview(file);
      setPreview(previewUrl);

      // Compress image
      const compressed = await compressImage(file);
      
      // Show compression info
      const originalSize = (file.size / 1024).toFixed(1);
      const compressedSize = (compressed.size / 1024).toFixed(1);
      
      toast({
        title: "Image Ready",
        description: `Compressed from ${originalSize}KB to ${compressedSize}KB`,
      });

      onImageSelect(compressed.dataUrl);
    } catch (error) {
      toast({
        title: "Compression Failed",
        description: "Failed to process image. Please try another image.",
        variant: "destructive",
      });
      clearImage();
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearImage = () => {
    if (preview && !currentImage) {
      revokeImagePreview(preview);
    }
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Workout Photo (Optional)
      </Label>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview ? (
        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Workout preview"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearImage}
                disabled={isCompressing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {isCompressing && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 text-center">
                Compressing image...
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-2 w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
          onClick={triggerFileInput}
          disabled={isCompressing}
        >
          <div className="flex flex-col items-center space-y-2">
            <Camera className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Add workout photo
            </span>
          </div>
        </Button>
      )}

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Capture your progress with a mirror selfie or gym photo. Images are automatically compressed to ~50KB.
      </p>
    </div>
  );
}
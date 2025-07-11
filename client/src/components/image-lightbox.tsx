import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  thumbnail?: boolean;
  className?: string;
}

export function ImageLightbox({ src, alt, thumbnail = true, className = "" }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImageClick = () => {
    setIsOpen(true);
  };

  const ThumbnailImage = () => (
    <div 
      className={`relative group cursor-pointer overflow-hidden rounded-lg ${className}`}
      onClick={handleImageClick}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </div>
  );

  const FullImage = () => (
    <img
      src={src}
      alt={alt}
      className={`max-w-full max-h-full object-contain ${className}`}
      onClick={handleImageClick}
    />
  );

  return (
    <>
      {thumbnail ? <ThumbnailImage /> : <FullImage />}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[50vh]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
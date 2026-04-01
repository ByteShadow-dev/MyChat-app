import { ImagePlus } from "lucide-react";

const DragDropOverlay = ({ onDrop, onDragLeave }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-base-300/90 backdrop-blur-sm border-4 border-dashed border-primary rounded-xl m-4"
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <ImagePlus className="size-16 text-primary mb-4 animate-bounce" />
      <h2 className="text-2xl font-bold text-primary">Drop images to attach</h2>
    </div>
  );
};

export default DragDropOverlay;
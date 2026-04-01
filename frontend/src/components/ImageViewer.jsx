import { X, Download } from "lucide-react";
import { useEffect } from "react";

const ImageViewer = ({ src, onClose }) => {

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = src;
        a.download = src.split("/").pop();
        a.target = "_blank";
        a.click();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose} // click outside to close
        >
            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    className="btn btn-circle btn-sm bg-base-300 border-none"
                    onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                >
                    <Download className="size-4" />
                </button>
                <button
                    className="btn btn-circle btn-sm bg-base-300 border-none"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <X className="size-4" />
                </button>
            </div>

            {/* Image */}
            <img
                src={src}
                alt="Full view"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} // don't close when clicking image itself
            />
        </div>
    );
};

export default ImageViewer;
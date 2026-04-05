import { useEffect, useState, useRef } from "react";
import { Camera, Upload, X, Trash2, Image as ImageIcon, AlertCircle, Download } from "lucide-react";
import { useLocation as useReactRouterLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const ImageLibrary = () => {
    const location = useReactRouterLocation();
    const { sectionId } = location.state || {};

    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [matches, setMatches] = useState([]); 

    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const [cameraError, setCameraError] = useState("");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load images from local storage on component mount
    useEffect(() => {
        setIsLoading(true);
        try {
            const storedImages = localStorage.getItem("userImages");
            if (storedImages) {
                setImages(JSON.parse(storedImages));
            }
        } catch (e) {
            console.error("Failed to load images from local storage", e);
            toast.error("Could not load saved images.");
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [stream]);

    const formatBytes = (bytes) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    const onFileSelect = (e) => {
        const list = e.target.files ? Array.from(e.target.files) : [];
        const validFiles = [];
        const oversizedFiles = [];
        const twoMB = 2 * 1024 * 1024;

        list.forEach((file) => {
            if (file.type.startsWith("image/")) {
                if (file.size <= twoMB) {
                    validFiles.push(file);
                } else {
                    oversizedFiles.push(file.name);
                }
            }
        });

        if (oversizedFiles.length > 0) {
            toast.error(`Some files were too large (max 2MB): ${oversizedFiles.join(", ")}`);
        }

        if (validFiles.length) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const removeSelected = (idx) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearSelected = () => setSelectedFiles([]);

    // Check if camera is available
    const isCameraAvailable = () => {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };

    // Start camera with better error handling
    const startCamera = async () => {
        setCameraError("");

        // Check if running on HTTPS or localhost
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            setCameraError("Camera access requires HTTPS connection");
            return;
        }

        if (!isCameraAvailable()) {
            setCameraError("Camera is not supported on this device/browser");
            return;
        }

        try {
            // Try different camera configurations
            let mediaStream;

            // First try: User-facing camera
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false,
                });
            } catch (err) {
                console.log("User-facing camera failed, trying any camera:", err);

                // Second try: Any available camera
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });
            }

            setStream(mediaStream);
            setShowCamera(true);

            // Wait for video element and set stream
            setTimeout(() => {
                if (videoRef.current && mediaStream) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);

        } catch (error) {
            console.error("Camera error:", error);

            // Provide specific error messages
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setCameraError("No camera found on this device.");
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                setCameraError("Camera is already in use by another application.");
            } else if (error.name === 'OverconstrainedError') {
                setCameraError("Camera constraints could not be satisfied.");
            } else {
                setCameraError(`Camera error: ${error.message || 'Unknown error'}`);
            }
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setShowCamera(false);
        setCameraError("");
    };

    // Capture photo from camera
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `selfie-${Date.now()}.jpg`, {
                        type: "image/jpeg",
                    });
                    setSelectedFiles((prev) => [...prev, file]);
                    stopCamera();
                }
            }, "image/jpeg", 0.8); // Compress to 80% quality
        }
    };

    // Alternative: Use mobile camera via file input
    const openMobileCamera = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // "Upload" selected files to local storage
// Upload selected files to backend for face comparison
const uploadSelected = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);

    try {
       const formData = new FormData();
    formData.append("file", selectedFiles[0]);

        const res = await fetch(import.meta.env.VITE_APP_COMPARE_FACE, {
            method: "POST",
            body: formData,
        });

          const data = await res.json();
    console.log("🔍 Face match response:", data);

    if (res.ok) {
      // Save matched images to state
      setMatches(data.matches || []);
      toast.success("Image uploaded and compared successfully!");
    } else {
      toast.error(data.error || "Upload failed");
    }
    } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images");
    } finally {
        setIsUploading(false);
    }
};

console.log(matches);

    // Download image
    const downloadImage = (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Delete image
    const deleteImage = (id) => {
        try {
            setImages(prevImages => {
                const updatedImages = prevImages.filter((img) => img.id !== id);
                localStorage.setItem("userImages", JSON.stringify(updatedImages));
                toast.success("Image deleted.");
                return updatedImages;
            });
        } catch (error) {
            console.error("Delete from local storage error:", error);
            toast.error("Failed to delete image.");
        }
    };

    useEffect(() => {
        if (sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location, sectionId]);

    return (
        <div className="overflow-x-hidden">
            <div id="aboutTop" className="relative h-[60vh] overflow-hidden flex items-center justify-center">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: "",
                        backgroundSize: "cover",
                        backgroundPosition: "center 30%",
                    }}
                />
                <div className="absolute inset-0 bg-[#7B0000] z-10"></div>
                <div className="relative z-20 text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-serif mb-4">Image Library</h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
                        A collection of moments, a gallery of grace. Share the light from your journey.
                    </p>
                    <div className="mt-8 inline-block">
                        <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
                        <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
                        <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
                    </div>
                </div>
                <div className="absolute bottom-4 right-4 text-white/20 text-6xl font-serif z-10">ॐ</div>
            </div>

            <div className="container flex gap-0  mx-auto px-4">
                {/* Upload Section */}
                <div className="bg-white w-1/2 mt-32 rounded-lg shadow-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-[#6E0000] mb-4">
                        Upload Photos
                    </h3>

                    {/* Error Message */}
                    {cameraError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-800 font-medium">Camera Access Error</p>
                                <p className="text-sm text-red-600 mt-1">{cameraError}</p>
                                <button
                                    onClick={openMobileCamera}
                                    className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                                >
                                    Try using file picker instead
                                </button>
                            </div>
                            <button
                                onClick={() => setCameraError("")}
                                className="text-red-400 hover:text-red-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Upload Options */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* File Upload Button */}
                        <label className="flex-1">
                            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6E0000] text-white rounded-lg cursor-pointer hover:bg-[#8B0000] transition-colors">
                                <Upload className="w-5 h-5" />
                                <span>Choose Files</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={onFileSelect}
                            />
                        </label>

                        {/* Hidden file input for mobile camera */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="user"
                            className="hidden"
                            onChange={onFileSelect}
                        />

                        {/* Camera Button - Desktop */}
                        <button
                            onClick={startCamera}
                            className="hidden sm:flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-[#FFB71B] text-white rounded-lg hover:bg-[#E5A319] transition-colors"
                        >
                            <Camera className="w-5 h-5" />
                            <span>Open Camera</span>
                        </button>

                        {/* Camera Button - Mobile (uses native camera) */}
                        <button
                            onClick={openMobileCamera}
                            className="flex sm:hidden flex-1 items-center justify-center gap-2 px-6 py-3 bg-[#FFB71B] text-white rounded-lg hover:bg-[#E5A319] transition-colors"
                        >
                            <Camera className="w-5 h-5" />
                            <span>Take Photo</span>
                        </button>
                    </div>

                    {/* Camera Modal */}
                    {showCamera && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-[#6E0000]">
                                        Take a Photo
                                    </h3>
                                    <button
                                        onClick={stopCamera}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-auto"
                                    />
                                </div>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={capturePhoto}
                                        className="px-6 py-3 bg-[#6E0000] text-white rounded-lg hover:bg-[#8B0000] transition-colors"
                                    >
                                        Capture Photo
                                    </button>
                                    <button
                                        onClick={stopCamera}
                                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hidden canvas for photo capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-medium text-[#6E0000]">
                                    Selected ({selectedFiles.length}) •{" "}
                                    {formatBytes(selectedFiles.reduce((a, f) => a + f.size, 0))}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={clearSelected}
                                        disabled={isUploading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={uploadSelected}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-[#6E0000] text-white rounded-lg hover:bg-[#8B0000] transition-colors disabled:opacity-50"
                                    >
                                        {isUploading
                                            ? "Uploading..."
                                            : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}`}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {selectedFiles.map((file, i) => (
                                    <div
                                        key={`${file.name}-${i}`}
                                        className="relative group rounded-lg overflow-hidden border border-gray-200"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-32 object-cover"
                                        />
                                        <button
                                            onClick={() => removeSelected(i)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4" />
                                        </button>
                                        <div className="p-2 bg-white">
                                            <p className="text-xs truncate text-gray-600">{file.name}</p>
                                            <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Gallery Section */}
                <div className="mb-16 w-1/2 mt-32 mx-auto px-16">
                    <h3 className="text-2xl font-serif text-black mb-6">Photo Gallery</h3>

                    {isLoading ? (
                        <div className="text-center py-16 flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#6E0000]"></div>
                            <p className="text-[#6E0000]">Loading images...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-gray-600 mb-2">
                                No photos yet
                            </h4>
                            <p className="text-gray-500">
                                Upload your first photo to get started
                            </p>
                        </div>
                    ) : (
                         <div>
      <h4 className="font-semibold mb-2">Matched Images</h4>
      <div className="grid grid-cols-3 gap-4">
        {matches.map((match, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative group">
              <img
                src={match.url}
                alt={match.name}
                className="w-[100%] h-[100%] object-cover rounded-lg"
              />
              <button
                onClick={() => downloadImage(match.url, match.name)}
                className="absolute top-2 right-2 p-1 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-700 mt-1 truncate">
              {match.name}
            </p>
            <p className="text-xs text-green-600">
              Accuracy: {match.confidence.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default ImageLibrary;
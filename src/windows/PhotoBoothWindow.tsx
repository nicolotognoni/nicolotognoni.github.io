import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Images, Timer, Camera } from "lucide-react";
import { Webcam } from "../components/Webcam";
import { usePhotoBoothStore, type PhotoReference } from "../stores/usePhotoBoothStore";
import { HelpDialog } from "../components/dialogs/HelpDialog";
import { AboutDialog } from "../components/dialogs/AboutDialog";
import { helpItems, appMetadata } from "../data/photoBooth";

interface Effect {
  name: string;
  filter: string;
}

// Split effects into two categories
const cssFilters: Effect[] = [
  { name: "Rainbow", filter: "hue-rotate(180deg) saturate(200%)" },
  { name: "Vibrant", filter: "saturate(200%) contrast(150%)" },
  { name: "Cold Blue", filter: "hue-rotate(240deg) saturate(150%)" },
  { name: "High Contrast", filter: "contrast(200%) brightness(110%)" },
  { name: "Normal", filter: "none" },
  { name: "Vintage", filter: "sepia(80%) brightness(90%) contrast(120%)" },
  {
    name: "X-Ray",
    filter: "invert(100%) hue-rotate(180deg) hue-rotate(180deg)",
  },
  {
    name: "Neon",
    filter: "brightness(120%) contrast(120%) saturate(200%) hue-rotate(310deg)",
  },
  {
    name: "Black & White",
    filter: "brightness(90%) hue-rotate(20deg) saturate(0%)",
  },
];

const distortionFilters: Effect[] = [
  { name: "Bulge", filter: "bulge(-0.5)" },
  { name: "Stretch", filter: "stretch(1.0)" },
  { name: "Pinch", filter: "pinch(2.0)" },
  { name: "Twirl", filter: "twist(-8.0)" },
  { name: "Fish Eye", filter: "fisheye(1.5)" },
  { name: "Squeeze", filter: "squeeze(1.0)" },
  // New exciting effects
  { name: "Kaleidoscope", filter: "kaleidoscope(0.5)" },
  { name: "Ripple", filter: "ripple(1.5)" },
  { name: "Glitch", filter: "glitch(2.0)" },
];

// Combined array for compatibility with existing code
const effects: Effect[] = [...cssFilters, ...distortionFilters];

// Add function to detect swipe gestures
function useSwipeDetection(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Minimum distance required for a swipe
  const MIN_SWIPE_DISTANCE = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > MIN_SWIPE_DISTANCE;

    if (isSwipe) {
      if (distance > 0) {
        // Swipe left
        onSwipeLeft();
      } else {
        // Swipe right
        onSwipeRight();
      }
    }

    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// Helper to convert data URL to Blob synchronously
function dataURItoBlob(dataURI: string) {
  try {
    const split = dataURI.split(',');
    if (split.length < 2) return null;

    const byteString = atob(split[1]);
    const mimeString = split[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (e) {
    console.error("Error converting data URI to blob:", e);
    return null;
  }
}

// Helper to add watermark and return Blob
async function applyWatermark(photoUrl: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = photoUrl;
    img.crossOrigin = "anonymous"; // Handle potential CORS if needed

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Set canvas dimensions to match photo
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original photo
      ctx.drawImage(img, 0, 0);

      // Load watermark image
      const watermark = new Image();
      watermark.src = "/images/frame.png";
      watermark.crossOrigin = "anonymous";

      watermark.onload = () => {
        // Calculate watermark size and position
        // Target width: 8% of photo width (much smaller)
        const wmWidth = canvas.width * 0.08;
        const wmHeight = (watermark.height / watermark.width) * wmWidth;

        const padding = canvas.width * 0.02; // 2% padding

        // Position: Bottom Right
        const wmX = canvas.width - wmWidth - padding;
        const wmY = canvas.height - wmHeight - padding;

        // Draw Watermark Image (Semi-transparent)
        ctx.save();
        ctx.globalAlpha = 0.5; // More transparent
        ctx.drawImage(watermark, wmX, wmY, wmWidth, wmHeight);
        ctx.restore();

        // Convert to Blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };

      watermark.onerror = () => {
        console.error("Failed to load watermark image");
        // If watermark fails, return original photo as blob (using dataURItoBlob logic or canvas)
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      };
    };

    img.onerror = (e) => {
      console.error("Failed to load source image for watermark", e);
      resolve(null);
    };
  });
}

interface PhotoBoothWindowProps {
  onClose: () => void;
  isForeground: boolean;
}

export default function PhotoBoothWindow({ onClose, isForeground = true }: PhotoBoothWindowProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showPhotoStrip, setShowPhotoStrip] = useState(false);
  const [currentEffectsPage, setCurrentEffectsPage] = useState(0); // 0 = CSS filters, 1 = distortions
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<Effect>(
    effects.find((effect) => effect.name === "Normal") || effects[0]
  );
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const { photos, addPhoto, addPhotos, clearPhotos } = usePhotoBoothStore();
  const [isMultiPhotoMode, setIsMultiPhotoMode] = useState(false);
  const [multiPhotoCount, setMultiPhotoCount] = useState(0);
  const [multiPhotoTimer, setMultiPhotoTimer] = useState<number | null>(null);
  const [currentPhotoBatch, setCurrentPhotoBatch] = useState<string[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [newPhotoIndex, setNewPhotoIndex] = useState<number | null>(null);
  const [mainStream, setMainStream] = useState<MediaStream | null>(null);

  const handleClearPhotos = () => {
    clearPhotos();
    setCurrentPhotoBatch([]);
  };

  const handleExportPhotos = () => {
    console.log("Export photos clicked");
  };

  // Add effect to get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setAvailableCameras(cameras);

        // If no camera is selected and cameras are available, select the first one
        if (!selectedCameraId && cameras.length > 0) {
          setSelectedCameraId(cameras[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
      }
    };

    getCameras();
  }, []);

  const handleCameraSelect = (deviceId: string) => {
    setSelectedCameraId(deviceId);
  };

  const handlePhoto = (photoDataUrl: string) => {
    // Trigger flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 800);

    // Generate unique filename with timestamp and correct extension
    const timestamp = Date.now();
    const timestampStr = new Date(timestamp)
      .toISOString()
      .replace(/[-:.]/g, "")
      .substring(0, 15);
    const filename = `photo_${timestampStr}.png`;

    // Create a reference to the saved photo
    // In a real app we would save the blob to FS here, but we're simplifying by storing dataURL in store for now
    // or assuming the store handles it (which we updated to persist to localStorage)
    const photoRef: PhotoReference = {
      filename,
      path: photoDataUrl, // Using dataUrl as path for simplicity in this port
      timestamp,
    };

    // Add the new photo reference to the photos array
    addPhoto(photoRef);

    setLastPhoto(photoDataUrl);
    setNewPhotoIndex(photos.length);
    setShowThumbnail(true);

    setTimeout(() => {
      setShowThumbnail(false);
      setTimeout(() => setNewPhotoIndex(null), 500);
    }, 2000);
  };

  const startMultiPhotoSequence = () => {
    setIsMultiPhotoMode(true);
    setMultiPhotoCount(0);
    setCurrentPhotoBatch([]);

    // Take 4 photos with a 1-second interval
    const timer = window.setInterval(() => {
      setMultiPhotoCount((count) => {
        const newCount = count + 1;

        if (newCount <= 4) {
          // Trigger photo capture
          const event = new CustomEvent("webcam-capture");
          window.dispatchEvent(event);
        }

        if (newCount === 4) {
          clearInterval(timer);
          setIsMultiPhotoMode(false);

          // After the sequence completes, process batch photos
          const batchWithReferences = currentPhotoBatch.map((dataUrl) => {
            const timestamp = Date.now();
            const timestampStr = new Date(timestamp)
              .toISOString()
              .replace(/[-:.]/g, "")
              .substring(0, 15);
            const filename = `photo_${timestampStr}.png`;

            return {
              filename,
              path: dataUrl,
              timestamp,
            };
          });

          // Update photos state with the new references
          addPhotos(batchWithReferences);

          // Show thumbnail animation for the last photo in the sequence
          if (currentPhotoBatch.length > 0) {
            setLastPhoto(currentPhotoBatch[currentPhotoBatch.length - 1]);
            setShowThumbnail(true);
            setTimeout(() => setShowThumbnail(false), 3000);
          }
        }

        return newCount;
      });
    }, 1000);

    setMultiPhotoTimer(timer);

    // Take the first photo immediately
    const event = new CustomEvent("webcam-capture");
    window.dispatchEvent(event);
  };

  const toggleEffects = () => {
    setShowEffects(!showEffects);
  };

  const togglePhotoStrip = () => {
    setShowPhotoStrip(!showPhotoStrip);
  };

  const toggleEffectsPage = (pageIndex: number) => {
    setCurrentEffectsPage(pageIndex);
  };

  // Handlers for page navigation
  const goToNextPage = () => {
    setCurrentEffectsPage(1);
  };

  const goToPrevPage = () => {
    setCurrentEffectsPage(0);
  };

  // Setup swipe handlers
  const swipeHandlers = useSwipeDetection(goToNextPage, goToPrevPage);

  // Update the photo-taken event handler
  useEffect(() => {
    const handlePhotoTaken = (e: Event) => {
      const customEvent = e as CustomEvent;
      // Skip if we're not in multi-photo mode
      if (!isMultiPhotoMode) return;

      // Get the photo data URL from the event
      const photoDataUrl = customEvent.detail;
      if (!photoDataUrl || typeof photoDataUrl !== "string") {
        console.error("Invalid photo data in photo-taken event");
        return;
      }

      // Add to batch
      setCurrentPhotoBatch((prev) => [...prev, photoDataUrl]);
    };

    // Add event listener
    window.addEventListener("photo-taken", handlePhotoTaken);

    return () => {
      window.removeEventListener("photo-taken", handlePhotoTaken);
    };
  }, [isMultiPhotoMode]);

  // Add a small delay before showing photo strip to prevent flickering
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    if (showPhotoStrip && isInitialLoad) {
      // Let the component fully mount before showing photostrip
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showPhotoStrip, isInitialLoad]);

  return (
    <div className="flex flex-col w-full h-full bg-neutral-500 max-h-full overflow-hidden">
      {/* Camera view area */}
      <div
        className={`flex-1 min-h-0 relative ${!stream && !isLoadingCamera && !cameraError
          ? ""
          : ""
          }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Webcam
            onPhoto={(photoDataUrl) => {
              if (photoDataUrl) {
                handlePhoto(photoDataUrl);
              }
            }}
            className="w-full h-full"
            filter={selectedEffect.filter}
            onStreamReady={setMainStream}
            selectedCameraId={selectedCameraId}
          />

          {/* Camera flash effect */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>

          {/* Multi-photo countdown overlay */}
          <AnimatePresence>
            {isMultiPhotoMode && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="text-8xl font-bold text-white drop-shadow-lg">
                  {multiPhotoCount < 4 ? 4 - multiPhotoCount : ""}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Effects overlay */}
          <AnimatePresence>
            {showEffects && (
              <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                {...swipeHandlers}
              >
                <motion.div
                  className="grid grid-cols-3 gap-6 p-6 w-full max-w-3xl max-h-[calc(100%-40px)] overflow-auto"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                  style={{ originX: 0.5, originY: 0.5 }}
                >
                  {(currentEffectsPage === 0
                    ? cssFilters
                    : distortionFilters
                  ).map((effect) => (
                    <motion.div
                      key={effect.name}
                      className={`relative aspect-video overflow-hidden rounded-lg cursor-pointer border-2 ${selectedEffect.name === effect.name
                        ? "border-white"
                        : "border-transparent"
                        }`}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.15 },
                      }}
                      whileTap={{
                        scale: 0.95,
                        transition: { duration: 0.1 },
                      }}
                      onClick={() => {
                        setSelectedEffect(effect);
                        setShowEffects(false);
                      }}
                    >
                      <Webcam
                        isPreview
                        filter={effect.filter}
                        className="w-full h-full"
                        sharedStream={mainStream}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 text-center py-1.5 text-white text-[12px]"
                        style={{
                          textShadow:
                            "0px 0px 2px black, 0px 0px 2px black, 0px 0px 2px black",
                        }}
                      >
                        {effect.name}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination dots */}
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <button
                    className="text-white rounded-full p-0.5 hover:bg-white/10"
                    onClick={() => toggleEffectsPage(0)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${currentEffectsPage === 0
                        ? "bg-white"
                        : "bg-white/40"
                        }`}
                    />
                  </button>
                  <button
                    className="text-white rounded-full p-0.5 hover:bg-white/10"
                    onClick={() => toggleEffectsPage(1)}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${currentEffectsPage === 1
                        ? "bg-white"
                        : "bg-white/40"
                        }`}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo strip preview */}
          <AnimatePresence mode="wait">
            {showPhotoStrip && photos.length > 0 && (
              <motion.div
                className="absolute bottom-0 inset-x-0 w-full bg-white/40 backdrop-blur-sm p-1 overflow-x-auto"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{
                  type: "tween",
                  ease: "easeOut",
                  duration: 0.2,
                }}
              >
                <div className="flex flex-row space-x-1 h-20 w-max">
                  {[...photos].reverse().map((photo, index) => {
                    const originalIndex = photos.length - 1 - index;
                    const isNewPhoto = originalIndex === newPhotoIndex;

                    // In this simplified version, path is the dataUrl
                    const photoUrl = photo.path;

                    return (
                      <motion.div
                        key={`photo-${photo.filename}`}
                        className="h-full flex-shrink-0"
                        initial={
                          isNewPhoto
                            ? { scale: 0.5, opacity: 0 }
                            : { opacity: 1, scale: 1 }
                        }
                        animate={{ scale: 1, opacity: 1 }}
                        layout
                        transition={{
                          type: "spring",
                          damping: 25,
                          stiffness: 400,
                          duration: isNewPhoto ? 0.4 : 0,
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt={`Photo ${originalIndex}`}
                          className="h-full w-auto object-contain cursor-pointer transition-opacity hover:opacity-80"
                          onClick={async () => {
                            // Ensure we have a filename
                            const downloadFilename = photo.filename || `photo_${photo.timestamp || Date.now()}.png`;

                            try {
                              // Apply watermark and get Blob
                              const blob = await applyWatermark(photoUrl);

                              if (blob) {
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = downloadFilename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } else {
                                // Fallback to direct data URL usage if watermark fails
                                console.warn("Watermark application failed, falling back to direct download");
                                const link = document.createElement("a");
                                link.href = photoUrl;
                                link.download = downloadFilename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            } catch (error) {
                              console.error("Error downloading photo:", error);
                              const link = document.createElement("a");
                              link.href = photoUrl;
                              link.download = downloadFilename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed bottom control bar */}
      <div className="flex-shrink-0 w-full bg-black/70 backdrop-blur-md px-6 py-4 flex justify-between items-center z-[60]">
        <div className="flex space-x-3 relative">
          {/* Thumbnail animation */}
          <AnimatePresence>
            {showThumbnail && lastPhoto && !showPhotoStrip && (
              <motion.div
                className="absolute -top-24 left-0 pointer-events-none z-[100]"
                initial={{ opacity: 0, y: 10, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 60,
                  scale: 0.2,
                  x: -16,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
                style={{
                  originX: "0",
                  originY: "1",
                }}
              >
                <motion.img
                  src={lastPhoto}
                  alt="Last photo thumbnail"
                  className="h-20 w-auto object-cover rounded-md shadow-md border-2 border-white"
                  initial={{ rotateZ: 0 }}
                  animate={{ rotateZ: 0 }}
                  exit={{ rotateZ: 5 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className={`h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white ${photos.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
              }`}
            onClick={togglePhotoStrip}
            disabled={photos.length === 0}
          >
            <Images size={18} />
          </button>
          <button
            className="h-10 w-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            onClick={startMultiPhotoSequence}
            disabled={isMultiPhotoMode}
          >
            <Timer size={18} />
          </button>
        </div>

        <button
          onClick={
            isMultiPhotoMode
              ? () => { }
              : () => {
                const event = new CustomEvent("webcam-capture");
                window.dispatchEvent(event);
              }
          }
          className={`rounded-full h-14 w-14 flex items-center justify-center ${isMultiPhotoMode
            ? `bg-gray-500 cursor-not-allowed`
            : `bg-red-500 hover:bg-red-600`
            }`}
          disabled={isMultiPhotoMode}
        >
          <Camera size={20} stroke="white" />
        </button>

        <button
          onClick={toggleEffects}
          className="h-10 px-5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[16px]"
        >
          Effects
        </button>
      </div>

      <HelpDialog
        isOpen={showHelp}
        onOpenChange={setShowHelp}
        helpItems={helpItems}
        appName="Photo Booth"
      />
      <AboutDialog
        isOpen={showAbout}
        onOpenChange={setShowAbout}
        metadata={appMetadata}
      />
    </div>
  );
}

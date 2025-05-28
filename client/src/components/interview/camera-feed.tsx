import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Volume2,
  Video,
  VideoOff,
  Settings,
  RefreshCcw,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraFeedProps {
  videoEnabled: boolean;
  audioEnabled?: boolean;
  onError?: (error: Error) => void;
}

interface MediaDevice {
  deviceId: string;
  label: string;
}

const DEFAULT_CONSTRAINTS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: true
};

export const CameraFeed = ({ 
  videoEnabled, 
  audioEnabled = true,
  onError 
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
  // State
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Get available media devices
  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${devices.indexOf(device) + 1}`
        }));
      setDevices(videoDevices);
      
      // Select first device if none selected
      if (videoDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error getting media devices:", error);
      toast({
        title: "Device Error",
        description: "Failed to get available camera devices",
        variant: "destructive"
      });
    }
  };

  // Initialize media devices when component mounts
  useEffect(() => {
    getMediaDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getMediaDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getMediaDevices);
    };
  }, []);

  // Setup camera with error handling and cleanup
  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        if (videoEnabled) {
          const constraints = {
            ...DEFAULT_CONSTRAINTS,
            video: {
              ...DEFAULT_CONSTRAINTS.video,
              deviceId: selectedDevice ? { exact: selectedDevice } : undefined
            },
            audio: audioEnabled
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          setHasPermission(true);

          // Monitor track states
          stream.getTracks().forEach(track => {
            track.onended = () => {
              if (mounted) {
                toast({
                  title: "Device Disconnected",
                  description: `${track.kind === 'video' ? 'Camera' : 'Microphone'} was disconnected`,
                  variant: "destructive"
                });
              }
            };
          });
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasPermission(false);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Failed to access camera";
          
        toast({
          title: "Camera Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        if (onError) {
          onError(new Error(errorMessage));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    setupCamera();

    // Cleanup function
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoEnabled, audioEnabled, selectedDevice, onError]);

  // Handle device selection
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  // Handle retry
  const handleRetry = () => {
    getMediaDevices();
  };

  return (
    <Card className="bg-gray-900 rounded-lg h-64 md:h-full flex items-center justify-center relative overflow-hidden">
      {videoEnabled && hasPermission && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!audioEnabled}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      <div className="absolute top-0 right-0 m-4 flex space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-gray-800/50 hover:bg-gray-700/50 text-white"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-gray-800/50 hover:bg-gray-700/50 text-white"
          onClick={handleRetry}
        >
          <RefreshCcw className="h-5 w-5" />
        </Button>
      </div>

      {showSettings && devices.length > 0 && (
        <div className="absolute top-16 right-4 w-64 bg-gray-800 p-4 rounded-lg shadow-lg">
          <label className="text-white text-sm mb-2 block">Select Camera</label>
          <Select
            value={selectedDevice}
            onValueChange={handleDeviceChange}
            items={devices.map(device => ({
              value: device.deviceId,
              label: device.label
            }))}
          />
        </div>
      )}
      
      {isLoading ? (
        <div className="text-gray-400 flex flex-col items-center">
          <RefreshCcw className="h-8 w-8 animate-spin mb-2" />
          <span>Loading camera...</span>
        </div>
      ) : !videoEnabled || !hasPermission ? (
        <div className="text-gray-400 flex flex-col items-center">
          {!hasPermission ? (
            <>
              <Camera className="h-10 w-10 mb-2" />
              <span className="text-center px-4">
                Camera access denied. Please check your browser permissions and try again.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleRetry}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </>
          ) : (
            <>
              <VideoOff className="h-10 w-10 mb-2" />
              <span>Camera is currently disabled</span>
            </>
          )}
        </div>
      ) : null}
    </Card>
  );
};

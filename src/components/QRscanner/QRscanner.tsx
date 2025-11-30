import React, { useState, useEffect, useCallback, useRef } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import Cameraswitch from "@mui/icons-material/Cameraswitch";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "@/services/i18n/client";

const QRscanner = ({ callBack }: { callBack: (data: string) => void }) => {
  const { t } = useTranslation("scan");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const scannerKeyRef = useRef(0);
  const handlingErrorRef = useRef(false);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSwitchingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const getDevices = async () => {
      try {
        // Request camera permission first (required to get deviceIds)
        await navigator.mediaDevices.getUserMedia({ video: true });

        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = mediaDevices.filter(
          (device) => device.kind === "videoinput"
        );

        // Filter out devices with empty deviceIds (they're not usable)
        const validVideoDevices = videoDevices.filter(
          (device) => device.deviceId && device.deviceId.trim() !== ""
        );

        console.log(
          "Available video devices:",
          validVideoDevices.map((d) => ({
            deviceId: d.deviceId,
            label: d.label,
          }))
        );

        if (mounted && validVideoDevices.length > 0) {
          setDevices(validVideoDevices);

          // Always use the first camera
          const firstDeviceId = validVideoDevices[0].deviceId;
          setCurrentDeviceId(firstDeviceId);
          setHasError(false);
          setErrorMessage(null);
          setIsLoadingCamera(true);

          console.log("Initial device set to:", {
            deviceId: firstDeviceId,
            label: validVideoDevices[0].label,
          });
        } else if (mounted) {
          setHasError(true);
          setErrorMessage(t("camera.noCameraAvailable"));
        }
      } catch (error) {
        console.error("Error getting devices:", error);
        if (mounted) {
          setHasError(true);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : t("camera.errorAccessingCameras")
          );
        }
      }
    };

    getDevices();
    return () => {
      mounted = false;
    };
  }, [t]);

  const handleScan = useCallback(
    (detectedCodes: IDetectedBarcode[]) => {
      const data = detectedCodes[0] || null;
      if (data) {
        // Clear any previous errors and loading state on successful scan
        setHasError(false);
        setErrorMessage(null);
        setIsLoadingCamera(false);
        callBack(data.rawValue.toString());
      }
    },
    [callBack]
  );

  const switchCamera = useCallback(() => {
    if (devices.length <= 1) {
      console.log("Switch prevented: not enough devices");
      return;
    }

    // Prevent multiple simultaneous switches using ref (more reliable than state)
    if (isSwitchingRef.current) {
      console.log("Switch prevented: already switching");
      return;
    }

    // Clear any pending switch timeout
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }

    // Set switching flag immediately
    isSwitchingRef.current = true;
    setIsSwitching(true);
    setHasError(false);
    setErrorMessage(null);
    handlingErrorRef.current = false;

    const currentIndex = devices.findIndex(
      (device) => device.deviceId === currentDeviceId
    );

    // If current device not found, start from first device
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (startIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    const nextDeviceId = nextDevice.deviceId;

    console.log("Switching camera:", {
      from: {
        deviceId: currentDeviceId,
        label: devices[startIndex]?.label || "Unknown",
        index: startIndex,
      },
      to: {
        deviceId: nextDeviceId,
        label: nextDevice.label || "Unknown",
        index: nextIndex,
      },
      totalDevices: devices.length,
    });

    // Step 1: Unmount scanner completely
    setShowScanner(false);
    setIsLoadingCamera(true);

    // Step 2: After a brief delay, update device ID and remount
    setTimeout(() => {
      scannerKeyRef.current += 1;
      setCurrentDeviceId(nextDeviceId);

      // Step 3: Remount scanner after another brief delay
      setTimeout(() => {
        setShowScanner(true);

        // Reset switching state after Scanner has time to initialize
        switchTimeoutRef.current = setTimeout(() => {
          isSwitchingRef.current = false;
          setIsSwitching(false);
          console.log("Switching complete");
        }, 1000);
      }, 200);
    }, 200);
  }, [devices, currentDeviceId]);

  const handleScannerError = useCallback(
    (error: unknown) => {
      console.error("Scanner error:", error);

      // Prevent handling the same error multiple times
      if (handlingErrorRef.current) {
        return;
      }

      // Check if it's a camera access error
      if (
        error instanceof Error &&
        (error.name === "NotAllowedError" ||
          error.name === "NotFoundError" ||
          error.name === "NotReadableError" ||
          error.name === "OverconstrainedError")
      ) {
        // If OverconstrainedError, automatically switch camera without showing error
        if (error.name === "OverconstrainedError" && devices.length > 1) {
          handlingErrorRef.current = true;
          console.log(
            "OverconstrainedError detected, automatically switching camera in 2 seconds"
          );
          // Wait and switch
          setTimeout(() => {
            handlingErrorRef.current = false;
            switchCamera();
          }, 2000);
          return; // Exit early, don't show error message
        }

        // For other errors, show error message
        setHasError(true);
        setErrorMessage(
          t("camera.errorAccessingCamera", { errorName: error.name })
        );
        setIsLoadingCamera(false);
        handlingErrorRef.current = false;
      } else {
        setHasError(true);
        setErrorMessage(t("camera.unknownError"));
        setIsLoadingCamera(false);
        handlingErrorRef.current = false;
      }
    },
    [devices.length, switchCamera, t]
  );

  // Simple check: hide loading after Scanner has been mounted for a bit
  // We rely on successful scans or errors to confirm camera is working
  useEffect(() => {
    if (!currentDeviceId || hasError) {
      setIsLoadingCamera(false);
      return;
    }

    // Hide loading after a reasonable time if no error occurs
    const timeoutId = setTimeout(() => {
      // Only hide if we haven't had an error and scanner seems to be working
      if (!hasError) {
        setIsLoadingCamera(false);
      }
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [currentDeviceId, hasError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    maxWidth: "none",
    minHeight: "200px", // Ensure container has height for absolute positioning
  };

  const scannerStyle: React.CSSProperties = {
    width: "100%",
    height: "auto",
  };

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    opacity: isSwitching ? 0.5 : 1,
    pointerEvents: isSwitching ? "none" : "auto",
    zIndex: 10,
  };

  return (
    <div style={containerStyle}>
      {hasError && errorMessage && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            p: 2,
            borderRadius: 1,
            textAlign: "center",
            zIndex: 20,
            maxWidth: "80%",
          }}
        >
          <Typography variant="body1" sx={{ mb: devices.length > 1 ? 1 : 0 }}>
            {errorMessage}
          </Typography>
          {devices.length > 1 && (
            <Button
              onClick={switchCamera}
              variant="contained"
              size="small"
              sx={{ mt: 1 }}
            >
              {t("camera.switchCamera")}
            </Button>
          )}
        </Box>
      )}
      {isLoadingCamera && !hasError && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 15,
            pointerEvents: "none", // Don't block interactions
          }}
        >
          <CircularProgress size={60} sx={{ color: "white" }} />
        </Box>
      )}
      {!currentDeviceId ? (
        <p>{t("camera.openingCameras")}</p>
      ) : showScanner ? (
        <Scanner
          key={`scanner-${currentDeviceId}-${scannerKeyRef.current}`}
          onScan={handleScan}
          components={{ audio: false }}
          constraints={{
            deviceId: { exact: currentDeviceId }, // Use exact for reliable switching
          }}
          styles={{ container: scannerStyle }}
          onError={handleScannerError}
        />
      ) : null}
      {devices.length > 1 && !hasError && (
        <button
          onClick={switchCamera}
          style={buttonStyle}
          title={t("camera.switchCameraTitle")}
          disabled={isSwitching}
        >
          <Cameraswitch />
        </button>
      )}
    </div>
  );
};

export default QRscanner;

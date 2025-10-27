import React, { useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import { toast } from "react-toastify";

const FaceTracker = ({ onPresenceChange }) => {
  const videoRef = useRef(null);
  const modelLoadedRef = useRef(false);
  const lastDetectedTimeRef = useRef(Date.now());
  const currentlyPresentRef = useRef(true);

  // Beep sound
  const playBeep = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1); // 100ms
  };

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      modelLoadedRef.current = true;
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        onPresenceChange(false);
      }
    };

    const handlePresence = (present) => {
      const now = Date.now();
      if (present) {
        lastDetectedTimeRef.current = now;
        if (!currentlyPresentRef.current) {
          currentlyPresentRef.current = true;
          onPresenceChange(true);
          playBeep();
          toast.success("✅ You're back!");
        }
      } else {
        if (now - lastDetectedTimeRef.current > 3000) {
          if (currentlyPresentRef.current) {
            currentlyPresentRef.current = false;
            onPresenceChange(false);
            playBeep();
            toast.warn("⚠️ You're away!");
          }
        }
      }
    };

    const detectFace = async () => {
      if (
        modelLoadedRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        const isPresent = !!detection;
        handlePresence(isPresent);
      }
    };

    loadModels().then(() => {
      startCamera();
      const interval = setInterval(detectFace, 1000);
      return () => clearInterval(interval);
    });

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onPresenceChange]);

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: 160,
          height: 120,
          borderRadius: 8,
          border: "2px solid white",
          boxShadow: "0 0 6px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
};

export default FaceTracker;

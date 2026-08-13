import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, ShieldAlert, Sparkles, CheckCircle2, ScanFace } from 'lucide-react';

/**
 * FaceCameraModal Component
 * ─────────────────────────────────────────────────────────────────────────────
 * Opens live camera feed, renders a cybernetic scanning overlay,
 * captures camera snapshot to base64, and sends it to backend for registration
 * or face verification login.
 *
 * Props:
 *   mode: 'register' | 'verify'
 *   username: string
 *   onSuccess: (resultData) => void
 *   onClose: () => void
 */
const FaceCameraModal = ({ mode = 'register', username, onSuccess, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Position your face inside the circle');
  const [scanError, setScanError] = useState('');
  const [successDone, setSuccessDone] = useState(false);

  // Initialize camera
  const startCamera = useCallback(async () => {
    setCameraError('');
    setScanError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus('Center your face and look into the camera...');
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions in your browser.'
      );
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture video frame as base64 JPEG
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    // Mirror horizontally so it matches webcam display
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Handle Capture & Send to Backend
  const handleScanAction = async () => {
    if (scanning || !cameraActive) return;

    setScanError('');
    setScanning(true);
    setScanStatus(mode === 'register' ? 'Registering face profile...' : 'Verifying face profile...');

    const imageBase64 = captureFrame();
    if (!imageBase64) {
      setScanError('Failed to capture frame from camera.');
      setScanning(false);
      return;
    }

    try {
      const endpoint = mode === 'register' ? '/api/face/register/' : '/api/face/verify/';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          face_image: imageBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Face scan verification failed.');
      }

      // Success
      setSuccessDone(true);
      setScanStatus(
        mode === 'register'
          ? 'Face profile registered successfully!'
          : `Face verified (${data.similarity_score}% match)! Logging in...`
      );
      stopCamera();

      setTimeout(() => {
        onSuccess?.(data);
      }, 1200);
    } catch (err) {
      console.error('Face auth error:', err);
      setScanError(err.message || 'Face verification failed.');
      setScanStatus('Verification failed. Adjust lighting and try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 10, 20, 0.88)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Off-screen canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(8,12,24,0.99))',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(56,189,248,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose?.();
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(168,85,247,0.2))',
              border: '1px solid rgba(56,189,248,0.3)',
              marginBottom: '10px',
              boxShadow: '0 0 20px rgba(56,189,248,0.25)',
              color: '#38bdf8',
            }}
          >
            <ScanFace size={24} />
          </div>
          <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#f8fafc' }}>
            {mode === 'register' ? 'Register Face ID' : 'Face ID Scan Login'}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
            User: <strong style={{ color: '#38bdf8' }}>{username}</strong>
          </p>
        </div>

        {/* Camera Feed Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '280px',
            borderRadius: '18px',
            overflow: 'hidden',
            background: '#040711',
            border: '2px solid rgba(56,189,248,0.3)',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 20px rgba(56,189,248,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cameraError ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#f87171' }}>
              <ShieldAlert size={36} style={{ margin: '0 auto 10px', opacity: 0.8 }} />
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{cameraError}</div>
              <button
                onClick={startCamera}
                style={{
                  marginTop: '14px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(56,189,248,0.2)',
                  border: '1px solid rgba(56,189,248,0.4)',
                  color: '#38bdf8',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Retry Camera
              </button>
            </div>
          ) : successDone ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                animation: 'scaleUp 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.15)',
                  border: '2px solid rgba(34,197,94,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4ade80',
                  boxShadow: '0 0 30px rgba(34,197,94,0.3)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>
                Face Scan Confirmed!
              </div>
            </div>
          ) : (
            <>
              {/* Webcam Video */}
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror webcam view
                }}
              />

              {/* Sci-Fi Scanner Frame Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Face Guide Circle */}
                <div
                  style={{
                    width: '180px',
                    height: '210px',
                    borderRadius: '50%',
                    border: scanning
                      ? '2px solid #38bdf8'
                      : '2px dashed rgba(56,189,248,0.6)',
                    boxShadow: scanning
                      ? '0 0 25px rgba(56,189,248,0.5), inset 0 0 25px rgba(56,189,248,0.2)'
                      : '0 0 15px rgba(56,189,248,0.2)',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Four Corner Target Markers */}
                  <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '14px', height: '14px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
                  <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '14px', height: '14px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />
                  <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '14px', height: '14px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8' }} />
                  <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '14px', height: '14px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8' }} />
                </div>

                {/* Scanning Laser Line */}
                {scanning && (
                  <div
                    style={{
                      position: 'absolute',
                      width: '200px',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #38bdf8, #a855f7, transparent)',
                      boxShadow: '0 0 15px #38bdf8, 0 0 25px #a855f7',
                      animation: 'scanLaser 1.5s ease-in-out infinite alternate',
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Status Text & Error Display */}
        <div style={{ marginTop: '14px', textAlign: 'center', width: '100%' }}>
          {scanError ? (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              ⚠️ {scanError}
            </div>
          ) : (
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: scanning ? '#38bdf8' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {scanning && <RefreshCw size={13} className="spin" />}
              {scanStatus}
            </div>
          )}
        </div>

        {/* Action Button */}
        {!successDone && (
          <button
            onClick={handleScanAction}
            disabled={scanning || !cameraActive}
            style={{
              marginTop: '16px',
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              background: scanning
                ? 'rgba(56, 189, 248, 0.2)'
                : 'linear-gradient(135deg, #0284c7, #7e22ce)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: scanning || !cameraActive ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: scanning ? 'none' : '0 8px 20px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {scanning ? (
              <>
                <RefreshCw size={16} className="spin" />
                Scanning Face...
              </>
            ) : mode === 'register' ? (
              <>
                <Camera size={18} />
                Capture & Register Face
              </>
            ) : (
              <>
                <ScanFace size={18} />
                Verify Face & Sign In
              </>
            )}
          </button>
        )}
      </div>

      {/* Embedded Animation CSS */}
      <style>{`
        @keyframes scanLaser {
          0% { top: 60px; }
          100% { top: 220px; }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FaceCameraModal;

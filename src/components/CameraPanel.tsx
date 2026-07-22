import { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { useStore } from '../store/useStore';
import { cameraWorkers } from '../data/cameraWorkers';
import CornerBrackets from './CornerBrackets';
import './CameraPanel.css';

type ModelState = 'idle' | 'loading' | 'ready' | 'error';
type CocoSsdModel = { detect: (input: HTMLCanvasElement) => Promise<{ class: string; score: number; bbox: [number, number, number, number] }[]> };

const DETECT_WIDTH = 320;
const DETECT_HEIGHT = 240;
const DISPLAY_WIDTH = 240;
const DISPLAY_HEIGHT = 180;
const DETECTION_INTERVAL_MS = 2000;

export default function CameraPanel() {
  const [expanded, setExpanded] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [modelState, setModelState] = useState<ModelState>('idle');
  const [showQrIndex, setShowQrIndex] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<CocoSsdModel | null>(null);
  const detectCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastQrRef = useRef<string | null>(null);

  const cameraActive = useStore(s => s.cameraActive);
  const cameraWorkerCount = useStore(s => s.cameraWorkerCount);
  const identifiedWorkers = useStore(s => s.identifiedWorkers);
  const setCameraActive = useStore(s => s.setCameraActive);
  const setCameraWorkerCount = useStore(s => s.setCameraWorkerCount);
  const checkInWorker = useStore(s => s.checkInWorker);

  const lastCheckIn = identifiedWorkers[identifiedWorkers.length - 1] ?? null;
  const unidentifiedCount = Math.max(0, cameraWorkerCount - identifiedWorkers.length);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, [setCameraActive]);

  const runDetectionTick = useCallback(async () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const model = modelRef.current;
    if (!video || !overlay || !model || video.readyState < 2) return;

    if (!detectCanvasRef.current) {
      detectCanvasRef.current = document.createElement('canvas');
      detectCanvasRef.current.width = DETECT_WIDTH;
      detectCanvasRef.current.height = DETECT_HEIGHT;
    }
    const detectCanvas = detectCanvasRef.current;
    const dctx = detectCanvas.getContext('2d');
    if (!dctx) return;
    dctx.drawImage(video, 0, 0, DETECT_WIDTH, DETECT_HEIGHT);

    // Person detection
    let persons: { class: string; score: number; bbox: [number, number, number, number] }[] = [];
    try {
      const predictions = await model.detect(detectCanvas);
      persons = predictions.filter(p => p.class === 'person');
    } catch {
      // Detection failure on a single tick shouldn't crash the loop.
    }
    setCameraWorkerCount(persons.length);

    // Draw overlay boxes, scaled from detection resolution to display resolution
    const octx = overlay.getContext('2d');
    if (octx) {
      octx.clearRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
      const sx = DISPLAY_WIDTH / DETECT_WIDTH;
      const sy = DISPLAY_HEIGHT / DETECT_HEIGHT;
      persons.forEach((p, i) => {
        const [x, y, w, h] = p.bbox;
        const identified = i < identifiedWorkers.length ? identifiedWorkers[i] : null;
        octx.strokeStyle = identified ? (identified.trained ? '#22d3ee' : '#f59e0b') : '#facc15';
        octx.lineWidth = 2;
        if (!identified) octx.setLineDash([5, 4]); else octx.setLineDash([]);
        octx.strokeRect(x * sx, y * sy, w * sx, h * sy);
        octx.font = '10px monospace';
        octx.fillStyle = octx.strokeStyle;
        octx.fillText(identified ? identified.name.split(' ')[0] : 'UNIDENTIFIED', x * sx + 2, y * sy - 4);
      });
    }

    // QR detection on the same downscaled frame
    try {
      const imageData = dctx.getImageData(0, 0, DETECT_WIDTH, DETECT_HEIGHT);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data !== lastQrRef.current) {
        lastQrRef.current = code.data;
        const worker = cameraWorkers.find(w => w.id === code.data.trim());
        if (worker) {
          checkInWorker(worker, 'qr', worker.zone);
        }
      } else if (!code) {
        lastQrRef.current = null;
      }
    } catch {
      // getImageData can throw on a tainted/unready canvas — ignore for this tick.
    }
  }, [identifiedWorkers, setCameraWorkerCount, checkInWorker]);

  const startCamera = useCallback(async () => {
    setPermissionError(null);
    setModelState('loading');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setPermissionError('Camera access denied — showing simulation mode');
      setModelState('idle');
      return;
    }

    try {
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' }) as unknown as CocoSsdModel;
      setModelState('ready');
    } catch {
      setModelState('error');
      setPermissionError('Detection model failed to load — camera feed only');
    }

    setCameraActive(true);
    intervalRef.current = window.setInterval(() => { void runDetectionTick(); }, DETECTION_INTERVAL_MS);
  }, [setCameraActive, runDetectionTick]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleShowQr = async () => {
    const nextIndex = showQrIndex === null ? 0 : (showQrIndex + 1) % cameraWorkers.length;
    setShowQrIndex(nextIndex);
    const url = await QRCode.toDataURL(cameraWorkers[nextIndex].id, { margin: 1, width: 220 });
    setQrDataUrl(url);
  };

  if (!expanded) {
    return (
      <button className={`camera-badge ${cameraActive ? 'live' : ''}`} onClick={() => setExpanded(true)}>
        📷 CAMERA: {cameraActive ? 'LIVE' : 'OFF'}
      </button>
    );
  }

  return (
    <div className="camera-panel">
      <CornerBrackets size={7} />
      <div className="camera-panel-header">
        <span className={`camera-status-dot ${cameraActive ? 'live' : ''}`} />
        <span className="camera-panel-title">ZONE Z1 CAMERA — STEEL MELT SHOP</span>
        <button className="camera-collapse-btn" onClick={() => setExpanded(false)}>−</button>
      </div>

      <div className="camera-feed-wrap" style={{ width: DISPLAY_WIDTH, height: DISPLAY_HEIGHT }}>
        {/* Always mounted — startCamera() attaches the stream to this exact
            element, so the ref must exist before cameraActive flips true. */}
        <video ref={videoRef} className="camera-video" muted playsInline width={DISPLAY_WIDTH} height={DISPLAY_HEIGHT} />
        <canvas ref={overlayRef} className="camera-overlay" width={DISPLAY_WIDTH} height={DISPLAY_HEIGHT} />
        {!cameraActive && (
          <div className="camera-feed-placeholder">
            {permissionError ? (
              <p>{permissionError}</p>
            ) : (
              <button className="camera-enable-btn" onClick={() => void startCamera()} disabled={modelState === 'loading'}>
                {modelState === 'loading' ? 'STARTING…' : '▶ ENABLE CAMERA'}
              </button>
            )}
          </div>
        )}
        {showQrIndex !== null && qrDataUrl && (
          <div className="camera-qr-overlay" onClick={() => setShowQrIndex(null)}>
            <img src={qrDataUrl} alt={`QR code for ${cameraWorkers[showQrIndex].id}`} />
            <span>{cameraWorkers[showQrIndex].name} — tap to dismiss</span>
          </div>
        )}
      </div>

      <div className="camera-counts">
        <span>Persons detected: <strong>{cameraWorkerCount}</strong></span>
        <span>Identified via QR: <strong>{identifiedWorkers.length}</strong> | Unidentified: <strong>{unidentifiedCount}</strong></span>
      </div>

      {unidentifiedCount > 0 && (
        <div className="camera-warning">
          <span>⚠ UNIDENTIFIED PERSON IN HAZARD ZONE</span>
          <button className="camera-show-qr-btn" onClick={() => void handleShowQr()}>SHOW QR</button>
        </div>
      )}
      {unidentifiedCount === 0 && cameraActive && (
        <div className="camera-warning-neutral">
          <button className="camera-show-qr-btn" onClick={() => void handleShowQr()}>SHOW QR (demo)</button>
        </div>
      )}

      {lastCheckIn && (
        <div className={`camera-checkin ${!lastCheckIn.trained ? 'expired' : ''}`}>
          <div className="camera-checkin-row"><span>Last check-in:</span> <strong>{lastCheckIn.name}</strong></div>
          <div className="camera-checkin-row"><span>Role:</span> {lastCheckIn.employer}</div>
          <div className="camera-checkin-row">
            <span>Training:</span>
            {lastCheckIn.trained ? ' Current' : ` ⚠ EXPIRED — ${lastCheckIn.trainingExpiry}`}
          </div>
          {!lastCheckIn.trained && (
            <div className="camera-checkin-degraded">→ IPL-5 degraded: unqualified worker in zone</div>
          )}
        </div>
      )}

      {cameraActive && (
        <button className="camera-stop-btn" onClick={stopCamera}>■ STOP CAMERA</button>
      )}
    </div>
  );
}

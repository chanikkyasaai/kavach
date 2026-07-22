import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { cameraWorkers } from './data/cameraWorkers';

/** Printable QR codes for the Camera Intelligence demo. Print this page
 *  before the demo, or hold up the on-screen "SHOW QR" overlay instead. */
export default function QRCodesPage() {
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        cameraWorkers.map(async w => [w.id, await QRCode.toDataURL(w.id, { margin: 1, width: 320 })] as const)
      );
      if (!cancelled) setCodes(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ background: '#fff', color: '#111', minHeight: '100vh', padding: '32px', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media print {
          .qr-page-header { display: none; }
          .qr-card { break-inside: avoid; }
        }
      `}</style>
      <div className="qr-page-header" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>KAVACH — Camera Intelligence Demo QR Codes</h1>
        <p style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Print this page. Scanning W002 (Bheem Kumar) triggers the training-expired demo path.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, maxWidth: 720 }}>
        {cameraWorkers.map(w => (
          <div
            key={w.id}
            className="qr-card"
            style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, textAlign: 'center' }}
          >
            {codes[w.id] ? (
              <img src={codes[w.id]} alt={`QR for ${w.id}`} width={220} height={220} />
            ) : (
              <div style={{ width: 220, height: 220, margin: '0 auto', background: '#eee' }} />
            )}
            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700 }}>{w.name}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{w.id} · {w.role}</div>
            <div style={{ fontSize: 12, color: '#555' }}>{w.type === 'permanent' ? 'Permanent — VSP' : `Contract — ${w.employer}`}</div>
            <div style={{ fontSize: 12, marginTop: 4, fontWeight: 600, color: w.trained ? '#059669' : '#d97706' }}>
              {w.trained ? 'Training current' : `Training EXPIRED (${w.trainingExpiry})`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

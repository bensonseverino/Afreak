import { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Placeholder from '../ui/Placeholder';
import Price from '../ui/Price';
import { api } from '../../lib/api';

const PLACEMENTS = ['Front', 'Back', 'Left sleeve', 'Right sleeve'];
const ACCEPT = '.png,.jpg,.jpeg,.webp,.svg,.pdf';
const MAX_BYTES = 5 * 1024 * 1024;

// Custom print: the artwork is uploaded to the private `artwork/` R2 prefix
// (audit row 22) and only the opaque key travels with the cart/order.
export default function CustomPrintModal({ open, onClose, onSave, priceAdd = 15 }) {
  const [fileName, setFileName] = useState(null);
  const [placement, setPlacement] = useState('Front');
  const [artworkKey, setArtworkKey] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFileName(null);
      setPlacement('Front');
      setArtworkKey(null);
      setUploading(false);
      setError('');
    }
  }, [open]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('File must be 5MB or smaller.');
      return;
    }

    setError('');
    setFileName(file.name);
    setArtworkKey(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await api('/uploads/artwork', { method: 'POST', body });
      const key = res?.data?.artworkKey;
      if (!key) throw new Error('Upload failed. Please try again.');
      setArtworkKey(key);
    } catch (err) {
      setError(err?.message || 'Could not upload that file. Please try again.');
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!artworkKey) return;
    onSave?.({ enabled: true, placement, fileName, artworkKey });
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Custom print"
      size="md"
      footer={
        <div className="p-4 flex items-center gap-3">
          {fileName && <span className="text-[13px] text-ink font-semibold"><Price amount={priceAdd} /></span>}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!artworkKey || uploading}
            className="flex-1 h-[52px] text-[12px]"
          >
            {uploading ? 'Uploading…' : artworkKey ? 'Save print' : 'Upload a file first'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="print-file" className="block font-sans text-[13px] font-medium text-ink mb-2">
            Artwork file
          </label>
          <input
            ref={inputRef}
            id="print-file"
            type="file"
            accept={ACCEPT}
            onChange={handleFile}
            className="sr-only"
          />
          <Button variant="outline" size="md" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full h-[52px]">
            {uploading ? 'Uploading…' : fileName ? 'Replace artwork' : 'Choose file (PNG / JPG / WEBP / SVG / PDF)'}
          </Button>
          <p className="mt-2 text-[12px] text-graphite">Maximum 5MB. Your artwork stays private and is never served publicly.</p>
          {error && (
            <p className="mt-1.5 text-[12px] text-danger" aria-live="polite">
              {error}
            </p>
          )}
        </div>

        <div className="border border-line p-4 flex items-center gap-4">
          <div className="w-[72px] h-[88px] bg-card shrink-0 overflow-hidden">
            <Placeholder ratio="h-full" label="" alt="Print preview" className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <p className="font-sans font-semibold text-[13px] text-ink truncate">{fileName || 'No artwork selected'}</p>
            <p className="text-[12px] text-graphite mt-1">Placement · {placement}</p>
            <p className="text-[12px] text-graphite">Add-on · <Price amount={priceAdd} /></p>
          </div>
        </div>

        <div>
          <label htmlFor="print-placement" className="block font-sans text-[13px] font-medium text-ink mb-2">
            Placement
          </label>
          <select
            id="print-placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            className="w-full min-h-[52px] px-4 bg-paper text-base text-ink border border-line outline-none focus:border-ink focus:ring-2 focus:ring-ink"
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}

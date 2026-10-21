import { useEffect, useRef, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Placeholder from '../ui/Placeholder';
import Price from '../ui/Price';

const PLACEMENTS = ['Front', 'Back', 'Left sleeve', 'Right sleeve'];
const ACCEPT = '.png,.jpg,.jpeg,.svg';
const MAX_BYTES = 5 * 1024 * 1024;

// TODO: wire to print service.
export default function CustomPrintModal({ open, onClose, onSave, priceAdd = 15 }) {
  const [fileName, setFileName] = useState(null);
  const [placement, setPlacement] = useState('Front');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFileName(null);
      setPlacement('Front');
      setError('');
    }
  }, [open]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('File must be 5MB or smaller.');
      return;
    }
    setError('');
    setFileName(file.name);
  };

  const handleSave = () => {
    onSave?.({ enabled: true, placement, fileName });
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
          <Button variant="primary" onClick={handleSave} disabled={!fileName} className="flex-1 h-[52px] text-[12px]">
            {fileName ? 'Save print' : 'Upload a file first'}
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
          <Button variant="outline" size="md" onClick={() => inputRef.current?.click()} className="w-full h-[52px]">
            {fileName ? 'Replace artwork' : 'Choose file (PNG / JPG / SVG)'}
          </Button>
          <p className="mt-2 text-[12px] text-graphite">Maximum 5MB. Print preview is a placeholder.</p>
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

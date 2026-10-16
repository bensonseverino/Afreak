import Modal from '../ui/Modal';

const ROWS = [
  ['XS', 86, 66, 66],
  ['S', 90, 70, 70],
  ['M', 94, 74, 74],
  ['L', 98, 78, 78],
  ['XL', 102, 82, 82],
];

// Placeholder size chart.
export default function SizeGuideModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Size guide" size="md">
      <p className="text-[13px] text-graphite mb-4">
        Body measurements in centimetres. For a relaxed fit, size up one.
      </p>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-3 font-sans font-bold uppercase text-[11px] tracking-label text-ink">Size</th>
            <th className="py-3 font-sans font-bold uppercase text-[11px] tracking-label text-ink">Chest</th>
            <th className="py-3 font-sans font-bold uppercase text-[11px] tracking-label text-ink">Waist</th>
            <th className="py-3 font-sans font-bold uppercase text-[11px] tracking-label text-ink">Length</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r[0]} className="border-b border-line">
              <td className="py-3 font-medium text-ink">{r[0]}</td>
              <td className="py-3 text-graphite">{r[1]} cm</td>
              <td className="py-3 text-graphite">{r[2]} cm</td>
              <td className="py-3 text-graphite">{r[3]} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

import Modal from '../ui/Modal';

const unitLabel = (unit) => {
  if (!unit) return '';
  return unit === 'inches' ? 'in' : unit;
};

/**
 * Renders the size chart assigned to the product in the CMS.
 * Charts are garment-side measurement tables (sizes across the columns).
 */
export default function SizeGuideModal({ open, onClose, chart }) {
  const sizes = Array.isArray(chart?.sizes) ? chart.sizes : [];
  const measurements =
    chart?.measurements && typeof chart.measurements === 'object' ? chart.measurements : {};
  const measurementNames = Object.keys(measurements);
  const unit = unitLabel(chart?.unit);

  return (
    <Modal open={open} onClose={onClose} title="Size guide" size="lg">
      {!chart || sizes.length === 0 || measurementNames.length === 0 ? (
        <p className="text-[13px] text-graphite">
          A size guide is not available for this product yet.
        </p>
      ) : (
        <>
          <p className="font-sans text-[13px] font-medium text-ink mb-1">{chart.title}</p>
          <p className="text-[13px] text-graphite mb-4">
            Garment measurements{unit ? ` in ${unit}` : ''}, measured flat. Compare with a piece
            you already own for the best fit.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-ink text-left">
                  <th className="py-3 pr-4 font-sans font-bold uppercase text-[11px] tracking-label text-ink whitespace-nowrap">
                    Size
                  </th>
                  {measurementNames.map((name) => (
                    <th
                      key={name}
                      className="py-3 pr-4 font-sans font-bold uppercase text-[11px] tracking-label text-ink whitespace-nowrap"
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizes.map((size, index) => (
                  <tr key={`${size}-${index}`} className="border-b border-line">
                    <td className="py-3 pr-4 font-medium text-ink whitespace-nowrap">{size}</td>
                    {measurementNames.map((name) => {
                      const values = Array.isArray(measurements[name]) ? measurements[name] : [];
                      const value = values[index];
                      return (
                        <td key={name} className="py-3 pr-4 text-graphite whitespace-nowrap">
                          {value == null || value === '' ? '—' : `${value}${unit ? ` ${unit}` : ''}`}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
}

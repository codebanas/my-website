export function SectionBarcodeFooter() {
  return (
    <div className="section-barcode-footer" aria-hidden="true">
      <div className="section-barcode-label">
        <span>XXXXXX</span>
      </div>
      <div className="section-barcode-frame">
        <img src="/codes/barcode.svg" alt="" />
      </div>
    </div>
  );
}

export default function QuickLinksArtwork({ visible }: { visible: boolean }) {
  return (
    <div className="quick-links-artwork" data-visible={visible} aria-hidden="true">
      <div className="quick-links-art-group quick-links-art-left">
        <img className="quick-links-art art-bbf" src="/arts/lets-be-bbf.svg" alt="" width={264} height={264} draggable={false} />
        <img className="quick-links-art art-globe" src="/arts/blue-box-green-globe.svg" alt="" width={159} height={159} draggable={false} />
        <img className="quick-links-art art-banas" src="/arts/banas-yellow-box.svg" alt="" width={141} height={83} draggable={false} />
      </div>
      <div className="quick-links-art-group quick-links-art-right">
        <img className="quick-links-art art-code" src="/arts/pink-rectangle-code.svg" alt="" width={299} height={170} draggable={false} />
        <span className="quick-links-art art-at">
          <img src="/arts/blue-white-at-symbol.svg" alt="" width={262} height={220} draggable={false} />
        </span>
        <img className="quick-links-art art-hands" src="/arts/white-box-black-hands.svg" alt="" width={179} height={179} draggable={false} />
      </div>
    </div>
  );
}

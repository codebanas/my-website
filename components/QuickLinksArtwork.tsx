export default function QuickLinksArtwork({ visible }: { visible: boolean }) {
  return (
    <div className="quick-links-artwork" data-visible={visible} aria-hidden="true">
      <div className="quick-links-media">
        <img
          className="quick-links-background-gif"
          src="/gallery/quick-links-background.gif"
          alt=""
          width={500}
          height={700}
          draggable={false}
        />
        <img
          className="quick-links-background-fade"
          src="/nav/blur-top.png"
          alt=""
          width={7680}
          height={720}
          draggable={false}
        />
      </div>
    </div>
  );
}

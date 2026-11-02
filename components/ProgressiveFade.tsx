import { getProgressiveFade, type FadeEdge } from "@/lib/progressive-fade";

type ProgressiveFadeProps = {
  edge: FadeEdge;
  strength: 2 | 6;
  className: string;
  maxBlur?: number;
  tintOpacity?: number;
};

export default function ProgressiveFade({
  edge,
  strength,
  className,
  maxBlur = 16,
  tintOpacity = 1,
}: ProgressiveFadeProps) {
  const { backgroundImage, blurLayers } = getProgressiveFade(edge, strength, maxBlur);

  return (
    <div className={`progressive-fade ${className}`} aria-hidden="true">
      {blurLayers.map(({ radius, maskImage }) => (
        <span
          className="progressive-fade-blur"
          key={radius}
          style={{
            backdropFilter: `blur(${radius}px)`,
            WebkitBackdropFilter: `blur(${radius}px)`,
            maskImage,
            WebkitMaskImage: maskImage,
          }}
        />
      ))}
      <span className="progressive-fade-tint" style={{ backgroundImage, opacity: tintOpacity }} />
    </div>
  );
}

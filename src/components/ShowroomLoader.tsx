import { useProgress } from "@react-three/drei";

export default function ShowroomLoader({ isSceneReady }: { isSceneReady: boolean }) {
  const { progress } = useProgress();

  // Keep curtain visible until BOTH download reaches 100% AND Three.js renders 2 frames
  const finished = progress >= 100 && isSceneReady;
  const displayPercent = isSceneReady ? 100 : Math.min(99, Math.round(progress));

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0c0b] transition-opacity duration-700 ${
        finished ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Brand Wordmark */}
      <p className="text-xs font-medium tracking-[0.45em] text-[#e8dec8] uppercase">
        LUSTRE
      </p>

      {/* Gold Progress Bar */}
      <div className="mt-6 h-[1px] w-48 overflow-hidden bg-white/10">
        <div
          className="h-full bg-[#d4bc8b] transition-all duration-300 ease-out"
          style={{ width: `${displayPercent}%` }}
        />
      </div>

      {/* Status Label */}
      <p className="mt-3 text-[9px] tracking-[0.35em] text-[#9e8c6c] uppercase">
        {progress < 100
          ? `LOADING SHOWROOM — ${displayPercent}%`
          : "PREPARING STUDIO LIGHTING..."}
      </p>
    </div>
  );
}

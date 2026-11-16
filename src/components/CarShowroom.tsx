import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import ShowroomLoader from "./ShowroomLoader";

const ASSET_BASE = import.meta.env.BASE_URL;

useGLTF.preload(`${ASSET_BASE}models/car-concept-opt.glb`);
console.log(`${ASSET_BASE}models/car-concept-opt.glb`);
type CamKey = [number, number, number, number, number];

const KEYS: CamKey[] = [
  [0.0, 0.65, 8.8, 1.55, 0.55], // 01 Exterior 3/4 hero
  [0.18, 2.2, 7.2, 1.15, 0.5], // 02 Paint correction front-3/4
  [0.36, 3.8, 6.4, 1.0, 0.5], // 03 Ceramic coating side profile
  [0.5, 4.71, 3.2, 1.18, 0.95], // Line up level with the driver's window glass
  [0.62, 4.71, 1.45, 1.12, 0.95], // Glide right up to the window glass as screen fades to black
];

interface StorySlide {
  id: string;
  tag: string;
  line1: string;
  line2: string;
  description: string;
  start: number;
  end: number;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: "exterior",
    tag: "01 — EXTERIOR",
    line1: "Every surface,",
    line2: "perfected.",
    description: "Precision detailing for cars that deserve more than a wash.",
    start: 0.0,
    end: 0.16,
  },
  {
    id: "paint",
    tag: "02 — PAINT CORRECTION",
    line1: "Swirls out.",
    line2: "Depth in.",
    description:
      "Multi-stage machine polishing removes defects and restores a mirror finish.",
    start: 0.18,
    end: 0.34,
  },
  {
    id: "ceramic",
    tag: "03 — CERAMIC COATING",
    line1: "Armour you",
    line2: "can't see.",
    description:
      "9H ceramic protection bonds to clear coat for years of gloss and hydrophobic shine.",
    start: 0.36,
    end: 0.52,
  },
  {
    id: "leather",
    tag: "04 — LEATHER",
    line1: "Fed, not",
    line2: "just cleaned.",
    description:
      "pH-neutral cleaning and conditioning keeps leather supple and stitching crisp.",
    start: 0.63,
    end: 0.81,
  },
  {
    id: "touchpoints",
    tag: "05 — TOUCHPOINTS",
    line1: "Like the",
    line2: "first drive.",
    description:
      "Steering, trim and displays sanitised and dressed to a factory satin.",
    start: 0.82,
    end: 1.0,
  },
];

interface InteriorPhoto {
  src: string;
  alt: string;
  start: number;
  end: number;
}

const INTERIOR_PHOTOS: InteriorPhoto[] = [
  {
    src: `${ASSET_BASE}images/interior-leather.jpg`,
    alt: "Quilted perforated brown leather bolster",
    start: 0.62,
    end: 0.81,
  },
  {
    src: `${ASSET_BASE}images/interior-wheel.jpg`,
    alt: "Mercedes-Benz steering wheel touchpoints",
    start: 0.81,
    end: 1.0,
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function sampleCamera(p: number): CamKey {
  const first = KEYS[0];
  if (p <= first[0]) return first;

  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (p <= b[0]) {
      const t = easeInOutCubic((p - a[0]) / (b[0] - a[0]));
      return [
        p,
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t),
        lerp(a[3], b[3], t),
        lerp(a[4], b[4], t),
      ];
    }
  }

  return KEYS[KEYS.length - 1];
}

function SceneReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const fired = useRef(false);

  useFrame(() => {
    if (fired.current) return;
    frames.current += 1;
    // Wait 2 frames so GPU shader compilation completes behind the curtain
    if (frames.current >= 2) {
      fired.current = true;
      onReady();
    }
  });

  return null;
}

function CarModel() {
  const { scene } = useGLTF(`${ASSET_BASE}models/car-concept-opt.glb`);
  // const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 4.6 / Math.max(size.x, size.z);
    scene.scale.setScalar(scale);

    const scaledBox = new THREE.Box3().setFromObject(scene);
    const center = scaledBox.getCenter(new THREE.Vector3());
    scene.position.set(-center.x, -scaledBox.min.y, -center.z);

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}
function PipeFillText({
  text,
  progress,
}: {
  text: string;
  progress: number; // 0.0 -> 1.0
}) {
  const chars = Array.from(text);
  const total = chars.length;

  return (
    <span className="inline-block">
      {chars.map((char, index) => {
        // Keep spaces normal so words wrap cleanly
        if (char === " ") {
          return <span key={index}> </span>;
        }

        // Slice the 0..1 progress so each character fills one after another
        const charStart = index / total;
        const charEnd = (index + 1) / total;
        const charProgress = clamp01(
          (progress - charStart) / (charEnd - charStart),
        );
        const fillPercent = charProgress * 100;

        return (
          <span key={index} className="relative inline-block">
            {/* 1. Hollow outline ("empty pipe") */}
            <span
              aria-hidden="true"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(212, 188, 139, 0.38)",
              }}
            >
              {char}
            </span>

            {/* 2. Solid cream fill ("water" filling left-to-right per letter) */}
            <span
              className="absolute inset-0 text-[#f5f0e6]"
              style={{
                clipPath: `inset(0 ${(100 - fillPercent).toFixed(1)}% 0 0)`,
              }}
            >
              {char}
            </span>
          </span>
        );
      })}
    </span>
  );
}
function ScrollFillTitle({ scrollP }: { scrollP: number }) {
  // Map scroll range (0.0 -> 0.15) to 0% -> 100% fill height
  const fillPercent = Math.max(0, Math.min(100, (scrollP / 0.15) * 100));

  return (
    <h2
      className="font-serif-display text-6xl tracking-[0.15em] uppercase select-none"
      style={{
        color: "transparent",
        WebkitTextStroke: "1px rgba(212, 188, 139, 0.55)", // Faint gold border
        backgroundImage: `linear-gradient(to top, #f5f0e6 ${fillPercent}%, transparent ${fillPercent}%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
    >
      LUSTRE
    </h2>
  );
}
function ScrollStrokeTitle({ scrollP }: { scrollP: number }) {
  // Map scroll range (e.g. 0.0 -> 0.15) to 0 -> 1 progress
  const drawProgress = Math.max(0, Math.min(1, scrollP / 0.15));
  const dashOffset = 100 - drawProgress * 100;

  return (
    <svg viewBox="0 0 600 120" className="w-full max-w-md overflow-visible">
      <text
        x="0"
        y="85"
        pathLength="100"
        stroke="#d4bc8b"
        strokeWidth="1.2"
        fill={`rgba(245, 240, 230, ${drawProgress > 0.85 ? (drawProgress - 0.85) / 0.15 : 0})`}
        strokeDasharray="100"
        strokeDashoffset={dashOffset}
        className="font-serif-display text-7xl tracking-[0.2em] uppercase"
      >
        LUSTRE
      </text>
    </svg>
  );
}

function CurvedScrollText({ scrollP }: { scrollP: number }) {
  // Moves text from 100% (off right) to 0% (left) along the curve as you scroll
  const offsetPercent = `${(1 - scrollP) * 100}%`;

  return (
    <svg viewBox="0 0 800 200" className="w-full">
      <defs>
        <path id="carCurve" d="M 20,160 Q 400,20 780,160" fill="none" />
      </defs>
      <text className="fill-[#e8dec8] text-xs tracking-[0.35em] uppercase">
        <textPath href="#carCurve" startOffset={offsetPercent}>
          PRECISION PAINT CORRECTION • 9H CERAMIC ARMOUR
        </textPath>
      </text>
    </svg>
  );
}

function CameraRig({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const { camera } = useThree();
  const smoothed = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    smoothed.current +=
      (progressRef.current - smoothed.current) * (1 - Math.exp(-7 * dt));
    const [, angle, radius, height, lookY] = sampleCamera(smoothed.current);
    camera.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius,
    );
    camera.lookAt(0, lookY, 0);
  });

  return null;
}

function isWebGL2Available(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: false,
    });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function CarShowroom({
  onBookClick,
}: {
  onBookClick: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [scrollP, setScrollP] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const webglSupported = useMemo(() => isWebGL2Available(), []);
  const handleSceneReady = useMemo(() => () => setSceneReady(true), []);

  useEffect(() => {
    if (!webglSupported) {
      setSceneReady(true);
      return;
    }
    document.body.style.overflow = sceneReady ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sceneReady, webglSupported]);

  useEffect(() => {
    let rafId = 0;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        if (scrollable <= 0) return;
        const p = clamp01(-rect.top / scrollable);
        progressRef.current = p;
        setScrollP(p);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const canvasOpacity =
    scrollP < 0.53 ? 1 : scrollP > 0.61 ? 0 : 1 - (scrollP - 0.53) / 0.08;

  return (
    <div ref={containerRef} className="relative h-[650vh] w-full bg-[#0d0c0b]">
      <ShowroomLoader isSceneReady={sceneReady} />
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0d0c0b]">
        {webglSupported && (
          <div
            className="absolute inset-0 transition-opacity duration-75"
            style={{
              opacity: canvasOpacity,
              visibility: canvasOpacity <= 0.01 ? "hidden" : "visible",
            }}
          >
            <Canvas
              frameloop={canvasOpacity > 0.01 ? "always" : "never"}
              shadows
              dpr={[1, 1.5]}
              camera={{ fov: 35, position: [7, 1.55, 5], near: 0.05, far: 100 }}
              gl={{
                antialias: true,
                powerPreference: "default",
                failIfMajorPerformanceCaveat: false,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.05,
              }}
            >
              <color attach="background" args={["#0d0c0b"]} />
              <fog attach="fog" args={["#0d0c0b", 10, 25]} />
              <ambientLight intensity={0.25} />
              <spotLight
                position={[0, 8, 0]}
                angle={0.6}
                penumbra={1}
                intensity={65}
                castShadow
              />
              <spotLight
                position={[-6, 3, 4]}
                angle={0.5}
                penumbra={1}
                intensity={30}
                color="#ffb070"
              />

              <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <circleGeometry args={[30, 64]} />
                <meshStandardMaterial
                  color="#161412"
                  roughness={0.35}
                  metalness={0.2}
                />
              </mesh>
              <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.85}
                scale={12}
                blur={2.4}
                far={3}
                frames={1}
                resolution={256}
              />

              <Environment resolution={256} frames={1}>
                <Lightformer
                  intensity={3}
                  position={[0, 6, 0]}
                  rotation-x={Math.PI / 2}
                  scale={[10, 3, 1]}
                />
                <Lightformer
                  intensity={1.5}
                  color="#ffd2a0"
                  position={[-6, 2, 0]}
                  rotation-y={Math.PI / 2}
                  scale={[12, 1, 1]}
                />
                <Lightformer
                  intensity={1.5}
                  position={[6, 2, 0]}
                  rotation-y={-Math.PI / 2}
                  scale={[12, 1, 1]}
                />
                <Lightformer
                  intensity={1}
                  position={[0, 2, -8]}
                  scale={[16, 1.5, 1]}
                />
              </Environment>

              <Suspense fallback={null}>
                <CarModel />
                <SceneReadySignal onReady={handleSceneReady} />
              </Suspense>
              <CameraRig progressRef={progressRef} />
            </Canvas>
          </div>
        )}

        {INTERIOR_PHOTOS.map((photo) => {
          const span = photo.end - photo.start;
          const localT = clamp01((scrollP - photo.start) / span);
          const isVisible =
            scrollP >= photo.start - 0.01 && scrollP <= photo.end + 0.01;

          const scale = lerp(1.24, 1.0, localT);

          let opacity = 0;
          if (isVisible) {
            if (localT < 0.14) {
              opacity = localT / 0.14;
            } else if (localT > 0.86) {
              opacity = (1 - localT) / 0.14;
            } else {
              opacity = 1;
            }
          }

          return (
            <div
              key={photo.src}
              className="pointer-events-none absolute inset-0 bg-[#0d0c0b]"
              style={{ opacity }}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover will-change-transform"
                style={{ transform: `scale(${scale.toFixed(4)})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            </div>
          );
        })}

        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 md:px-12">
          <a
            href="#top"
            className="pointer-events-auto text-xs font-medium tracking-[0.35em] text-[#e8dec8] uppercase"
          >
            <ScrollStrokeTitle scrollP={scrollP} />
          </a>
          <button
            type="button"
            onClick={onBookClick}
            className="pointer-events-auto border border-[#8c7853]/70 bg-black/40 px-4 py-2 text-[10px] font-medium tracking-[0.22em] text-[#e8dec8] uppercase backdrop-blur-sm transition hover:border-[#d4bc8b] hover:bg-[#d4bc8b]/10"
          >
            BOOK A DETAIL
          </button>
        </header>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end pb-20 pl-6 md:items-center md:pb-0 md:pl-14">
          {STORY_SLIDES.map((slide) => {
            const span = slide.end - slide.start;
            const localT = (scrollP - slide.start) / span;
            const active = localT >= -0.05 && localT <= 1.05;
            const fillProgress = clamp01((localT - 0.15) / 0.5);
            const line1Progress = clamp01(fillProgress * 2);
            const line2Progress = clamp01((fillProgress - 0.5) * 2);
            let opacity = 0;
            let translateY = 16;
            if (active) {
              if (localT < 0.18) {
                const t = clamp01(localT / 0.18);
                opacity = t;
                translateY = lerp(16, 0, t);
              } else if (localT > 0.82) {
                const t = clamp01((1 - localT) / 0.18);
                opacity = t;
                translateY = lerp(-12, 0, t);
              } else {
                opacity = 1;
                translateY = 0;
              }
            }

            return (
              <div
                key={slide.id}
                className="absolute max-w-xs md:max-w-sm"
                style={{
                  opacity,
                  transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
                }}
              >
                <ScrollFillTitle scrollP={scrollP} />
                <CurvedScrollText scrollP={scrollP} />

                <p className="mb-3 text-[10px] font-medium tracking-[0.28em] text-[#9e8c6c] uppercase">
                  {slide.tag}
                </p>

                <h2 className="font-serif-display text-4xl leading-[1.05] font-normal tracking-tight md:text-6xl">
                  <PipeFillText text={slide.line1} progress={line1Progress} />
                  <br />
                  <PipeFillText text={slide.line2} progress={line2Progress} />
                </h2>

                <h2 className="font-serif-display text-4xl leading-[1.05] font-normal tracking-tight text-[#f5f0e6] md:text-6xl">
                  {slide.line1}
                  <br />
                  {slide.line2}
                </h2>
                <p className="mt-4 text-xs leading-relaxed text-[#b8b0a2] md:text-sm">
                  {slide.description}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 transition-opacity duration-300"
          style={{ opacity: scrollP > 0.94 ? 0 : 0.75 }}
        >
          <span className="text-[9px] tracking-[0.35em] text-[#b8b0a2] uppercase">
            SCROLL
          </span>
          <div className="h-6 w-px bg-gradient-to-b from-[#9e8c6c] to-transparent" />
        </div>
      </div>
    </div>
  );
}

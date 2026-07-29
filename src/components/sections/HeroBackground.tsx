import { cn } from "@/lib/utils";

export function HeroBackground() {
  return (
    <>
      {/* Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div
          className={cn(
            "absolute w-[500px] h-[500px] rounded-full",
            "bg-gradient-to-br from-brand/15 to-brand-light/8",
            "blur-[60px] opacity-50",
            "-top-[15%] right-[10%]",
            "animate-blob-float"
          )}
        />
        <div
          className={cn(
            "absolute w-[350px] h-[350px] rounded-full",
            "bg-gradient-to-br from-brand-dark/10 to-brand/5",
            "blur-[60px] opacity-50",
            "bottom-[10%] -left-[5%]",
            "animate-blob-float-reverse"
          )}
        />
        <div
          className={cn(
            "absolute w-[250px] h-[250px] rounded-full",
            "bg-brand/8",
            "blur-[60px] opacity-50",
            "top-1/2 right-[30%]",
            "animate-blob-float-delayed"
          )}
        />
      </div>

      {/* Floating Shapes */}
      <div
        className={cn(
          "absolute w-20 h-20 rounded-full",
          "border-2 border-brand/20",
          "top-[15%] left-[8%]",
          "animate-shape-spin z-0"
        )}
      />
      <div
        className={cn(
          "absolute w-[120px] h-[120px]",
          "border-2 border-brand/15",
          "bottom-[20%] right-[8%]",
          "animate-shape-morph z-0"
        )}
      />
      <div
        className={cn(
          "absolute w-[60px] h-[60px] rounded-full",
          "border-2 border-brand-dark/15",
          "top-[40%] left-[15%]",
          "animate-shape-float z-0"
        )}
      />
      <div
        className={cn(
          "absolute w-10 h-10 rounded-lg",
          "border-2 border-brand/12",
          "bottom-[30%] left-[20%]",
          "animate-shape-spin-reverse z-0"
        )}
      />

      {/* Pulsing Dots */}
      <div className="absolute w-full h-full z-0">
        <div
          className={cn(
            "absolute w-2 h-2 bg-brand rounded-full opacity-30",
            "top-[20%] right-[15%]",
            "animate-dot-pulse"
          )}
        />
        <div
          className={cn(
            "absolute w-1.5 h-1.5 bg-brand rounded-full opacity-30",
            "top-[60%] right-[5%]",
            "animate-dot-pulse-delayed"
          )}
        />
        <div
          className={cn(
            "absolute w-2.5 h-2.5 bg-brand rounded-full opacity-30",
            "bottom-[25%] left-[10%]",
            "animate-dot-pulse-delayed-2"
          )}
        />
        <div
          className={cn(
            "absolute w-[5px] h-[5px] bg-brand rounded-full opacity-20",
            "top-[30%] left-[25%]",
            "animate-dot-pulse-slow"
          )}
        />
        <div
          className={cn(
            "absolute w-[7px] h-[7px] bg-brand rounded-full opacity-30",
            "bottom-[40%] right-[25%]",
            "animate-dot-pulse-delayed-3"
          )}
        />
      </div>

      {/* Grid Lines */}
      <div
        className={cn(
          "absolute top-0 right-0 w-1/2 h-full z-0 opacity-40",
          "bg-[linear-gradient(rgba(30,92,70,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,92,70,0.05)_1px,transparent_1px)]",
          "bg-[size:60px_60px]",
          "[mask-image:radial-gradient(ellipse_at_70%_50%,black_20%,transparent_70%)]"
        )}
      />

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full h-[120px] z-[1]">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z"
            className="fill-gray-50/50"
          />
          <path
            d="M0,80 C360,20 720,100 1080,50 C1260,25 1380,40 1440,50 L1440,120 L0,120 Z"
            className="fill-gray-50"
          />
        </svg>
      </div>
    </>
  );
}

"use client";

import { UnicornScene } from "unicornstudio-react/next";

/**
 * Full-bleed Unicorn Studio WebGL scene for the hero background.
 * Sits behind the hero content; a fallback gradient shows before the scene
 * loads, and a scrim (rendered by the hero) keeps text legible on top.
 */
export function UnicornBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        // Fallback while the WebGL scene streams in.
        background:
          "radial-gradient(60rem 40rem at 75% -10%, rgba(0,82,217,0.18), transparent 60%), radial-gradient(46rem 36rem at 0% 10%, rgba(14,165,233,0.14), transparent 55%), #f4f7fb",
      }}
    >
      <UnicornScene
        jsonFilePath="/unicorn-hero-scene.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.1/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        scale={1}
        dpi={1.5}
        fps={60}
        lazyLoad
        production
        ariaLabel=""
        className="h-full w-full"
      />
    </div>
  );
}

import { useState, useRef } from "react";
import Pokemon from "../Entities/Pokemon";
import { Booster } from "../Components/Booster";

const MIN_GEN = 1;
const MAX_GEN = 9;

export function BoostersPage({ pokemons }: { pokemons: Pokemon[] }) {
  const [generation, setGeneration] = useState(1);
  const [boosterOpen, setBoosterOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) setGeneration((g) => Math.min(MAX_GEN, g + 1));
    else setGeneration((g) => Math.max(MIN_GEN, g - 1));
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-[2vh] h-full overflow-hidden"
      onTouchStart={!boosterOpen ? handleTouchStart : undefined}
      onTouchEnd={!boosterOpen ? handleTouchEnd : undefined}
    >
      <div className="flex items-center gap-[4vh]">
        {!boosterOpen && (
          <button
            className="portrait:hidden btn btn-ghost text-[8vh] cursor-pointer px-[4vh] h-auto"
            onClick={() => setGeneration((g) => Math.max(MIN_GEN, g - 1))}
            disabled={generation === MIN_GEN}
          >
            ‹
          </button>
        )}

        <Booster generation={generation} pokemons={pokemons} onPhaseChange={setBoosterOpen} />

        {!boosterOpen && (
          <button
            className="portrait:hidden btn btn-ghost text-[8vh] cursor-pointer px-[4vh] h-auto"
            onClick={() => setGeneration((g) => Math.min(MAX_GEN, g + 1))}
            disabled={generation === MAX_GEN}
          >
            ›
          </button>
        )}
      </div>

      {!boosterOpen && (
        <div className="flex gap-[1vh] bg-black px-[1.5vh] py-[0.75vh] rounded-full">
          {Array.from({ length: MAX_GEN }, (_, i) => i + 1).map((g) => (
            <button
              key={g}
              className={`w-[2.5vh] h-[2.5vh] rounded-full transition-colors cursor-pointer ${
                g === generation ? "bg-red-700" : "bg-gray-300"
              }`}
              onClick={() => setGeneration(g)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

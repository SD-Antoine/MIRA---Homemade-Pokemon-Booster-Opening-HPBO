import { useEffect, useState } from "react";
import Pokemon from "../Entities/Pokemon";
import { PokemonToCard } from "./Carte";
import { useAuth } from "../context/AuthContext";

type Phase = "closed" | "open";
type InventoryEntry = { cardId: number; quantity: number };

const GEN_CONFIG: Record<number, { image: string; strip: string; bg: string; stroke: string; textColor: string }> = {
  1: { image: "src/assets/mew.jpg",        strip: "from-pink-300 to-pink-500",       bg: "from-pink-900 to-pink-950",       stroke: "#ec4899", textColor: "text-pink-950"    },
  2: { image: "src/assets/celebi.jpg",     strip: "from-emerald-300 to-emerald-500", bg: "from-emerald-900 to-emerald-950", stroke: "#10b981", textColor: "text-emerald-950" },
  3: { image: "src/assets/rayquaza.jpg",   strip: "from-green-400 to-green-700",     bg: "from-green-900 to-green-950",     stroke: "#16a34a", textColor: "text-green-950"   },
  4: { image: "src/assets/giratina.jpg",   strip: "from-purple-300 to-purple-600",   bg: "from-purple-900 to-purple-950",   stroke: "#9333ea", textColor: "text-purple-950"  },
  5: { image: "src/assets/kyurem.jpg",     strip: "from-sky-200 to-sky-500",         bg: "from-sky-800 to-sky-950",         stroke: "#0ea5e9", textColor: "text-sky-950"     },
  6: { image: "src/assets/zygarde.jpg",    strip: "from-lime-300 to-lime-600",       bg: "from-lime-900 to-lime-950",       stroke: "#65a30d", textColor: "text-lime-950"    },
  7: { image: "src/assets/necrozma.jpg",   strip: "from-amber-300 to-amber-600",     bg: "from-amber-900 to-amber-950",     stroke: "#d97706", textColor: "text-amber-950"   },
  8: { image: "src/assets/ethernatos.jpg", strip: "from-violet-400 to-violet-700",   bg: "from-violet-900 to-violet-950",   stroke: "#7c3aed", textColor: "text-violet-950"  },
  9: { image: "src/assets/terapagos.jpg",  strip: "from-teal-300 to-teal-600",       bg: "from-teal-900 to-teal-950",       stroke: "#0d9488", textColor: "text-teal-950"    },
};

const HALF_HOURLY_LIMIT = 10;
const HALF_HOUR_MS = 1_800_000;
const OPENINGS_KEY = "boosterOpenings";

function getRecentOpenings(): number[] {
  const now = Date.now();
  const stored: number[] = JSON.parse(localStorage.getItem(OPENINGS_KEY) ?? "[]");
  return stored.filter((t) => now - t < HALF_HOUR_MS);
}

function formatTimeLeft(ms: number): string {
  const min = Math.ceil(ms / 60_000);
  return min >= 60 ? `${Math.ceil(ms / HALF_HOUR_MS)}h` : `${min}min`;
}

interface BoosterProps {
  generation: number;
  pokemons: Pokemon[];
  onPhaseChange?: (isOpen: boolean) => void;
}

function weightedRandom(pool: Pokemon[]): Pokemon {
  const total = pool.reduce((sum, p) => {
    const rate = typeof p.getDropRate === "number" ? p.getDropRate : 50;
    return sum + rate;
  }, 0);
  let rand = Math.random() * total;
  for (const p of pool) {
    const rate = typeof p.getDropRate === "number" ? p.getDropRate : 50;
    rand -= rate;
    if (rand <= 0) return p;
  }
  return pool[pool.length - 1];
}

function drawCards(pokemons: Pokemon[], generation: number): Pokemon[] {
  const pool = pokemons.filter(
    (p) => p.getGeneration === generation || p.getGeneration === "Inconnue"
  );
  if (pool.length === 0) return [];

  const result: Pokemon[] = [];
  for (let i = 0; i < 4; i++) {
    result.push(weightedRandom(pool));
  }

  const rarePool = pool.filter(
    (p) => typeof p.getDropRate === "number" && p.getDropRate <= 11
  );
  result.push(weightedRandom(rarePool.length > 0 ? rarePool : pool));

  return result;
}

function mergeIntoInventory(existing: InventoryEntry[], cardIds: number[]): InventoryEntry[] {
  const updated = existing.map((e) => ({ ...e }));
  for (const cardId of cardIds) {
    const entry = updated.find((e) => e.cardId === cardId);
    if (entry) { entry.quantity++; }
    else { updated.push({ cardId, quantity: 1 }); }
  }
  return updated;
}

export function Booster({ generation, pokemons, onPhaseChange }: BoosterProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("closed");
  const [topHidden, setTopHidden] = useState(false);
  const [boosterHidden, setBoosterHidden] = useState(false);
  const [cards, setCards] = useState<Pokemon[]>([]);
  const [openings, setOpenings] = useState<number[]>(getRecentOpenings);

  useEffect(() => {
    const id = setInterval(() => setOpenings(getRecentOpenings()), 30_000);
    return () => clearInterval(id);
  }, []);

  const remaining = HALF_HOURLY_LIMIT - openings.length;
  const nextOpenMs = openings.length > 0 ? openings[0] + HALF_HOUR_MS - Date.now() : 0;

  async function handleOpen() {
    if (pokemons.length === 0 || remaining <= 0) return;
    const drawn = drawCards(pokemons, generation);
    if (drawn.length === 0) return;
    setCards(drawn);

    const now = Date.now();
    const newOpenings = [...openings, now];
    localStorage.setItem(OPENINGS_KEY, JSON.stringify(newOpenings));
    setOpenings(newOpenings);

    const cardIds = drawn.map((c) => c.id);
    const existing: InventoryEntry[] = JSON.parse(localStorage.getItem("inventory") ?? "[]");
    localStorage.setItem("inventory", JSON.stringify(mergeIntoInventory(existing, cardIds)));

    if (user && navigator.onLine) {
      try {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardIds }),
          credentials: "include",
        });
        if (res.ok) {
          localStorage.setItem("inventory", JSON.stringify(await res.json()));
        }
      } catch { /* localStorage conservé */ }
    }

    setTopHidden(true);
    setTimeout(() => setBoosterHidden(true), 500);
    setTimeout(() => { setPhase("open"); onPhaseChange?.(true); }, 900);
  }

  function handleCollect() {
    setPhase("closed");
    setTopHidden(false);
    setBoosterHidden(false);
    setCards([]);
    onPhaseChange?.(false);
  }

  if (phase === "open") {
    return (
      <div className="flex flex-col items-center gap-[4vh]">
        <div className="flex flex-wrap justify-center gap-[2vh]">
          {cards.map((pokemon, i) => (
            <PokemonToCard key={i} pokemon={pokemon} />
          ))}
        </div>
        <button className="btn bg-red-700 border-black border-[0.5vh] portrait:border-[1vh] text-white text-[2vh] py-[1.5vh] px-[5vh] cursor-pointer rounded-full" onClick={handleCollect}>
          Récupérer
        </button>
      </div>
    );
  }

  const cfg = GEN_CONFIG[generation];

  return (
    <div className="flex flex-col items-center gap-[2vh]">
      <div
        className={`flex flex-col w-[38vh] transition-opacity duration-500 ${
          boosterHidden ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Haut — se détache */}
        <div
          className={`h-[9vh] rounded-t-xl bg-gradient-to-b ${cfg.strip} border-x-[0.3vh] border-t-[0.3vh] border-white/30 flex items-center justify-center transition-all duration-500 ${
            topHidden ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <span className={`text-[3.5vh] font-bold ${cfg.textColor} truncate px-[1.5vh]`}>
            Gén. {generation}
          </span>
        </div>

        {/* Illustration */}
        <div className={`relative h-[45vh] bg-gradient-to-b ${cfg.bg} border-x-[0.3vh] border-white/30 overflow-hidden flex items-center justify-center`}>
          <img
            src={cfg.image}
            alt={`Booster génération ${generation}`}
            className="w-full h-full object-cover"
          />
          <span
            className="absolute bottom-0 left-0 right-0 text-center text-white font-black leading-none select-none pb-[0.5vh]"
            style={{
              fontSize: "18vh",
              WebkitTextStroke: `6px ${cfg.stroke}`,
              textShadow: `0 0 40px ${cfg.stroke}`,
            }}
          >
            {generation}
          </span>
        </div>

        {/* Bas */}
        <div className={`h-[9vh] rounded-b-xl bg-gradient-to-t ${cfg.strip} border-x-[0.3vh] border-b-[0.3vh] border-white/30 flex items-center justify-center`}>
          <span className={`text-[2.5vh] ${cfg.textColor} font-semibold`}>Pokémon TCG</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-[0.5vh]">
        <button
          className="btn bg-red-700 border-black border-[0.5vh] portrait:border-[1vh] text-white text-[2vh] py-[1.5vh] px-[5vh] cursor-pointer rounded-full disabled:opacity-50"
          onClick={handleOpen}
          disabled={topHidden || pokemons.length === 0 || remaining <= 0}
        >
          {pokemons.length === 0
            ? <><span className="loading loading-spinner loading-sm" /> Chargement...</>
            : "Ouvrir"
          }
        </button>
        {remaining <= 0
          ? <span className="text-[1.5vh] text-red-400">Prochain slot dans {formatTimeLeft(nextOpenMs)}</span>
          : <span className="text-[1.5vh] opacity-50">{remaining}/{HALF_HOURLY_LIMIT} ouvertures restantes</span>
        }
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import Pokemon from "../Entities/Pokemon";
import { PokemonToCard } from "../Components/Carte";
import { useAuth } from "../context/AuthContext";

type InventoryEntry = { cardId: number; quantity: number };
type SortKey = "dropRate" | "id" | "quantity" | "name";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortKey, string> = {
  dropRate: "Rareté",
  id:       "N° Pokédex",
  quantity: "Quantité",
  name:     "Nom",
};

const inputCls   = "input input-sm border border-black rounded-lg focus:outline-none";
const selectCls  = "select select-sm bg-red-700 text-white border border-black rounded-lg cursor-pointer focus:outline-none";

export function DisplayPokemons({ pokemons }: { pokemons: Pokemon[] }) {
  const { user } = useAuth();
  const [inventory, setInventory]     = useState<InventoryEntry[]>([]);
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("");
  const [sortKey, setSortKey]         = useState<SortKey>("dropRate");
  const [sortDir, setSortDir]         = useState<SortDir>("asc");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    async function loadInventory() {
      if (user && navigator.onLine) {
        try {
          const res = await fetch("/api/inventory", { credentials: "include" });
          if (res.ok) {
            const items: InventoryEntry[] = await res.json();
            localStorage.setItem("inventory", JSON.stringify(items));
            setInventory(items);
            return;
          }
        } catch { /* fallback */ }
      }
      setInventory(JSON.parse(localStorage.getItem("inventory") ?? "[]"));
    }
    loadInventory();
  }, [user]);

  const owned = useMemo(() => {
    return pokemons
      .map((p) => {
        const entry = inventory.find((e) => e.cardId === p.id);
        return entry ? { pokemon: p, quantity: entry.quantity } : null;
      })
      .filter((e): e is { pokemon: Pokemon; quantity: number } => e !== null);
  }, [pokemons, inventory]);

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    owned.forEach(({ pokemon: p }) => {
      types.add(p.getType1);
      if (p.getType2 !== "Pas de second type") types.add(p.getType2);
    });
    return [...types].sort();
  }, [owned]);

  const displayed = useMemo(() => {
    let result = owned;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(({ pokemon: p }) => p.getName.toLowerCase().includes(q));
    }
    if (filterType) {
      result = result.filter(({ pokemon: p }) =>
        p.getType1 === filterType || p.getType2 === filterType
      );
    }
    result = [...result].sort((a, b) => {
      let va: number, vb: number;
      switch (sortKey) {
        case "dropRate": {
          const ra = a.pokemon.getDropRate;
          const rb = b.pokemon.getDropRate;
          va = typeof ra === "number" ? ra : Infinity;
          vb = typeof rb === "number" ? rb : Infinity;
          break;
        }
        case "id":
          va = a.pokemon.id; vb = b.pokemon.id; break;
        case "quantity":
          va = a.quantity;   vb = b.quantity;   break;
        case "name":
          return sortDir === "asc"
            ? a.pokemon.getName.localeCompare(b.pokemon.getName)
            : b.pokemon.getName.localeCompare(a.pokemon.getName);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return result;
  }, [owned, search, filterType, sortKey, sortDir]);

  function toggleDir() { setSortDir((d) => (d === "asc" ? "desc" : "asc")); }

  function handleSortKey(key: SortKey) {
    if (key === sortKey) { toggleDir(); return; }
    setSortKey(key);
    setSortDir(key === "dropRate" ? "asc" : "desc");
  }

  if (owned.length === 0) {
    return <p className="text-center opacity-50 mt-16">Ton inventaire est vide — ouvre des boosters !</p>;
  }

  const sortButtons = (Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
    <button
      key={key}
      className={`btn btn-xs border border-black rounded-lg px-3 py-1 cursor-pointer ${sortKey === key ? "bg-white text-red-700" : "bg-red-700 text-white"}`}
      onClick={() => handleSortKey(key)}
    >
      {SORT_LABELS[key]}
      {sortKey === key && <span className="ml-0.5">{sortDir === "asc" ? "↑" : "↓"}</span>}
    </button>
  ));

  return (
    <div className="flex flex-col gap-4">

      {/* ── Portrait : barre de recherche + bouton Filtres ── */}
      <div className="portrait:flex hidden items-center justify-center gap-2 pt-2">
        <input
          type="text"
          placeholder="Rechercher un Pokémon..."
          className={`${inputCls} w-48`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn btn-sm bg-red-700 text-white border border-black"
          onClick={() => setFiltersOpen(true)}
        >
          Filtres
        </button>
      </div>

      {/* ── Portrait : modal filtres ── */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="bg-red-700 border border-black rounded-lg p-7 text-white flex flex-col gap-5 w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg text-center">Filtres</h3>

            <select
              className="select select-sm bg-red-800 text-white border border-black rounded-lg focus:outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Tous les types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="flex flex-col gap-2">
              <span className="text-sm opacity-80">Trier par</span>
              <div className="flex flex-wrap gap-2">{sortButtons}</div>
            </div>

            <button
              className="btn btn-sm bg-red-900 text-white border border-black mt-1"
              onClick={() => setFiltersOpen(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop/paysage : filtres inline ── */}
      <div className="portrait:hidden flex flex-wrap items-center gap-x-4 gap-y-2 justify-center py-4 px-6">
        <input
          type="text"
          placeholder="Rechercher un Pokémon..."
          className={`${inputCls} w-52`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={selectCls}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Tous les types</option>
          {availableTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm opacity-60">Trier par</span>
          <div className="flex gap-2">{sortButtons}</div>
        </div>
      </div>

      {/* ── Résultats ── */}
      {displayed.length === 0 ? (
        <p className="text-center opacity-50 mt-8">Aucune carte ne correspond à ces filtres.</p>
      ) : (
        <div className="pokemon-container flex flex-wrap justify-center gap-16 portrait:grid portrait:grid-cols-2 portrait:md:grid-cols-3 portrait:gap-3 portrait:justify-items-center">
          {displayed.map(({ pokemon, quantity }, index) => (
            <div key={index}>
              <PokemonToCard pokemon={pokemon} quantity={quantity} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

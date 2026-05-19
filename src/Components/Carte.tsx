import Pokemon from "../Entities/Pokemon";
import { normalizer } from "../Functions/UrlNormalizer";
import { useState } from "react";

function PokemonToFrontCard(props: { pokemon: Pokemon; onToggle: () => void; quantity?: number }) {
  const { pokemon, onToggle, quantity } = props;
  const type = pokemon.getType1.toLowerCase();

  return (
    <div className={`cursor-pointer flex items-center rounded-2xl p-[1vh] ${pokemon.isRare() ? "border-rainbow" : "bg-linear-to-br from-slate-400 via-gray-200 to-slate-400"}`}
      onClick={onToggle}>
      <div
        id={`${pokemon.id}`}
        className={`pokemon-card relative flex flex-col w-[35vh] h-[48vh] portrait:w-[43vw] portrait:h-[59vw] portrait:md:w-[29vw] portrait:md:h-[40vw] rounded-2xl shadow-2xl p-3 font-sans theme-${normalizer(type)}`}
      >
        {/* En-tête : nom + type */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg portrait:text-[3.8vw] portrait:md:text-[2.4vw] font-extrabold drop-shadow-sm tracking-wide">
            {pokemon.getName}
          </h2>
          <img
            className="w-9 h-9 portrait:w-[6vw] portrait:h-[6vw] portrait:md:w-[3.5vw] portrait:md:h-[3.5vw] rounded-full border-2 border-yellow-200 bg-white/40 p-0.5"
            src={pokemon.getType1_Url}
            alt={pokemon.getType1}
          />
        </div>

        {/* Cadre de l'artwork */}
        <div
          className={`relative bg-gradient-to-b from-black from-[-30%] via-white to-black to-130% border-4 border-slate-300 overflow-hidden flex justify-center items-center h-[25vh] portrait:h-[30vw] portrait:md:h-[20vw]`}
        >
          <img
            className="w-[20vh] portrait:w-[24vw] portrait:md:w-[16vw] object-contain drop-shadow-lg"
            src={pokemon.getArtwork}
            alt={`${pokemon.getName} artwork`}
          />
        </div>

        {/* Infos sous l'artwork */}
        <div className="mt-2 text-center text-[1.3vh] portrait:text-[1.5vw] italic border-y border-yellow-300 py-1">
          N° {String(pokemon.id).padStart(3, "0")} · {pokemon.getMiniDescription}
        </div>

        {/* Pied de carte */}
        <div className="flex items-center justify-between mt-auto text-[1.3vh] portrait:text-[1.5vw]">
          <div className="flex flex-col">
            <span className="italic">Illus. Game Freak</span>
            {quantity !== undefined && (
              <span className="text-[1vh] portrait:text-[3vw] font-semibold opacity-70">x {quantity}</span>
            )}
          </div>
          <span className="font-semibold">
            {String(pokemon.id).padStart(4, "0")}/1025
          </span>
        </div>
      </div>
    </div>
  );
}

function PokemonBackCard(props: { onToggle: () => void }) {
  return (
    <div 
      className="cursor-pointer"
      onClick={props.onToggle}
    >
      <img
      src="src/assets/pokemon_card_back_JP.png"
      alt="Japanese Pokemon Card Back"
      className="w-[37vh] h-[50vh] portrait:w-[calc(43vw+2vh)] portrait:h-[calc(59vw+2vh)] rounded-2xl"
      />
    </div>
  );
}

export function PokemonToCard(props: { pokemon: Pokemon; quantity?: number }) {
  const { pokemon, quantity } = props;
  const [showImage, setShowImage] = useState(true);

  const toggleDisplay = () => {
    setShowImage(!showImage);
  };

  return (
    <>
      {showImage ? (
        <PokemonToFrontCard pokemon={pokemon} quantity={quantity} onToggle={toggleDisplay} />
      ) : (
        <PokemonBackCard onToggle={toggleDisplay} />
      )}
    </>
  );
}
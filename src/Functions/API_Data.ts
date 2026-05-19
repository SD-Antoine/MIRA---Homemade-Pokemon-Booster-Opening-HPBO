import Pokemon from "../Entities/Pokemon";

export type PokemonRecord = {
  id: number;
  name: { fr: string; en: string; jp: string };
  surname: string;
  type1_Url: string;
  type1: string;
  type2_Url: string;
  type2: string;
  artwork: string;
  generation: number;
  miniDescription: string;
  dropRate: number;
};

const DEFAULT_MAX_POKEMON = 1025;

export async function DataFetcher(maxId = DEFAULT_MAX_POKEMON): Promise<Pokemon[]> {
  console.log("ça commence le fetch des pkmn");

  const results: Pokemon[] = [];

  // Récupération de tous les pokemons de tyradexAPI pou éviter le rate limit
  const url_Tyradex = `https://tyradex.app/api/v1/pokemon`;
  const response_Tyradex = await fetch(url_Tyradex);
  const data_Tyradex = await response_Tyradex.json();

  // Gestion erreur tyradexAPI
  if (!response_Tyradex.ok) {
    throw new Error(`TyradexAPI DE ZEBI DE MERDE QUI MARCHE PAAAAAAAAS (${response_Tyradex.status}): ${response_Tyradex.statusText}`);
  }

  // Boucle de recupération des données de chaque pokemon + sprites de PokeAPI
  for (let id = 0; id <= maxId; id++) {

    // Gestion de MissingNo spécifique car champs null la plupart du temps
    if (id === 0) {
      results.push(new Pokemon(0, {fr: "M̴͕̋i̸̗̚s̸͚͋̓s̵͑̀ͅi̶̤͊͊n̸͇͊g̴̩͗̅N̶̼͎͊o̵̖͗.̷̘̒.̵͈͑.̴͍̮̗̓́͑", en: "M̴͕̋i̸̗̚s̸͚͋̓s̵͑̀ͅi̶̤͊͊n̸͇͊g̴̩͗̅N̶̼͎͊o̵̖͗.̷̘̒.̵͈͑.̴͍̮̗̓́͑", jp: "M̴͕̋i̸̗̚s̸͚͋̓s̵͑̀ͅi̶̤͊͊n̸͇͊g̴̩͗̅N̶̼͎͊o̵̖͗.̷̘̒.̵͈͑.̴͍̮̗̓́͑"}, "M̴͕̋i̸̗̚s̸͚͋̓s̵͑̀ͅi̶̤͊͊n̸͇͊g̴̩͗̅N̶̼͎͊o̵̖͗.̷̘̒.̵͈͑.̴͍̮̗̓́͑", "Inconnu", data_Tyradex[0].sprites?.regular, 1, data_Tyradex[0].miniDescription ?? "Pokémon bug", 0.1));
      console.log("MissingNo. pris en charge");
      continue;
    }

    // Récupération des données de PokeAPI
    const url_PokeAPI = `https://pokeapi.co/api/v2/pokemon/${id}`
    const response_PokeAPI = await fetch(url_PokeAPI);

    // Gestion des erreurs de PokeAPI
    if (!response_PokeAPI.ok) {
      throw new Error(`PokeAPI DE ZEBI DE MERDE QUI MARCHE PAAAAAAAAS (${response_PokeAPI.status}): ${response_PokeAPI.statusText}`);
    }
    
    // Récupération des données
    const data_PokeAPI = await response_PokeAPI.json();

    // Extraction des types
    const types: string[] =  [];
    types.push(data_Tyradex[id].types[0].name);
    if (data_Tyradex[id].types[1]) {
        types.push(data_Tyradex[id].types[1].name);
    }
    // console.log(types);

    // Extraction du sprite
    const artwork = 
      data_PokeAPI?.sprites?.other?.["official-artwork"]?.front_default || data_PokeAPI?.sprites?.front_default || "";
    // console.log(artwork);

    // Ajout du Pokémon à la liste du résultat
    results.push(
      new Pokemon(
        id,
        data_Tyradex[id].name ?? "",
        data_Tyradex[id].name ?? "",
        types[0],
        artwork ?? "",
        data_Tyradex[id].generation ?? 0,
        data_Tyradex[id].category ?? "",
        data_Tyradex[id].catch_rate ?? 0,
        types[1],
      ),
    );
  }

  return results;
}

export async function DataStorer() {
  const cacheKey = "pokedex";

  try {
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: PokemonRecord[] = JSON.parse(cached);
      return parsed.map(
        (p) =>
          new Pokemon(p.id, p.name, p.surname, p.type1, p.artwork, p.generation, p.miniDescription, p.dropRate, p.type2),
      );
    }
  } catch (error) {
    // localStorage may be unavailable or contain invalid data.
    console.warn("Unable to read pokedex cache", error);
  }

  const data = await DataFetcher();

  try {
    const stored = data.map((p) => ({
      id: p.id,
      name: { fr: p.getName, en: p.getName, jp: p.getName },
      surname: p.getSurname,
      type1_Url: p.getType1_Url,
      type1: p.getType1,
      type2_Url: p.getType2_Url,
      type2: p.getType2 !== "Pas de second type" ? p.getType2 : "",
      artwork: p.getArtwork,
      generation: typeof p.getGeneration === "number" ? p.getGeneration : 0,
      miniDescription: p.getMiniDescription,
      // Reconvertit le dropRate (%) en catchRate pour que le constructeur recalcule correctement
      dropRate: typeof p.getDropRate === "number" ? p.getDropRate * 255 * 1.1 / 100 : 0,
    }));

    window.localStorage.setItem(cacheKey, JSON.stringify(stored));
  } catch (error) {
    // localStorage may be unavailable in some environments.
    console.warn("Unable to store pokedex data", error);
  }

  return data;
}

export default DataStorer;

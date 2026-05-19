import { normalizer } from "../Functions/UrlNormalizer"

class Pokemon {
    readonly id: number
    private name: {fr: string, en: string, jp: string}
    private surname: string
    private type1: string
    private type1_Url: string;
    private type2?: string;
    private type2_Url?: string;
    private artwork: string;
    private generation: number;
    private miniDescription: string;
    private dropRate?: number;

    constructor(id: number, name: {fr: string, en: string, jp: string}, surname: string = name.fr, type1: string, artwork: string, generation: number, miniDescription: string, catchRate: number, type2?: string) {
        this.id = id
        this.name = name
        this.surname = surname
        this.type1 = type1
        this.type1_Url = type1 !== "Inconnu" ? `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/types/${normalizer(type1)}.png` : "https://raw.githubusercontent.com/Yarkis01/TyraDex/images/types/insecte.png";
        if (type2) {
            this.type2 = type2
            this.type2_Url = type2 !== "Inconnu" ? `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/types/${normalizer(type2)}.png` : "";
        }
        this.artwork = artwork
        this.generation = generation
        this.miniDescription = miniDescription
        this.dropRate = catchRate/(255 * 1.1) * 100
        console.log(`${this.name} créé avec succès !`)
    }
    
    public set setName(v : {fr: string, en: string, jp: string}) {
        this.name = v;
    }

    public get getName(): string {
        return this.name.fr;
    }

    public set setSurname(v : string) {
        this.surname = v;
    }

    public get getSurname(): string {
        return this.surname;
    }

    public get getType1_Url(): string {
        return this.type1_Url;
    }
    
    public set setType1(v : string) {
        this.type1 = v;
    }

    public get getType1(): string {
        return this.type1;
    }

    public get getType2_Url(): string {
        return this.type2_Url ?? "Pas de second type";
    }

    public set setType2(v : string) {
        this.type2 = v;
    }

    public get getType2(): string {
        return this.type2 ?? "Pas de second type";
    }

    public set setArtwork(v : string) {
        this.artwork = v;
    }

    public get getArtwork(): string {
        return this.artwork;
    }

    public set setGeneration(v : number) {
        this.generation = v;
    }

    public get getGeneration(): number | string {
        return this.generation > 0 ? this.generation : "Inconnue";
    }

    public set setMiniDescription(v : string) {
        this.miniDescription = v;
    }

    public get getMiniDescription(): string {
        return this.miniDescription;
    }

    public set setDropRate(v : number) {
        this.dropRate = v;
    }

    public get getDropRate(): number | string {
        return this.dropRate ?? "Inconnue";
    }

    public isRare(): boolean {
        return typeof this.dropRate === "number" && this.dropRate <= 5;
    }
}

export default Pokemon;
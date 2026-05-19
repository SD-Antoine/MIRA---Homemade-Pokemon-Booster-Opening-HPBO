export function normalizer(word: string): string {
    console.log(word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    
    return word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
// Strings littérales requises pour que Tailwind v4 détecte ces classes au build
const BG = "bg-normal bg-feu bg-eau bg-electrik bg-plante bg-glace bg-combat bg-poison bg-sol bg-vol bg-psy bg-insecte bg-roche bg-spectre bg-dragon bg-tenebres bg-acier bg-fee bg-unknown";
const BORDER = "border-normal border-feu border-eau border-electrik border-plante border-glace border-combat border-poison border-sol border-vol border-psy border-insecte border-roche border-spectre border-dragon border-tenebres border-acier border-fee border-unknown";
const FROM = "from-normal from-feu from-eau from-electrik from-plante from-glace from-combat from-poison from-sol from-vol from-psy from-insecte from-roche from-spectre from-dragon from-tenebres from-acier from-fee from-unknown";
const VIA = "via-normal via-feu via-eau via-electrik via-plante via-glace via-combat via-poison via-sol via-vol via-psy via-insecte via-roche via-spectre via-dragon via-tenebres via-acier via-fee via-unknown";
const TO = "to-normal to-feu to-eau to-electrik to-plante to-glace to-combat to-poison to-sol to-vol to-psy to-insecte to-roche to-spectre to-dragon to-tenebres to-acier to-fee to-unknown";

export function TailwindLoader() {
    return <input type="hidden" className={`${BG} ${VIA} ${FROM} ${TO} ${BORDER}`} />;
}

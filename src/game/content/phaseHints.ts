import type { Level } from "../simulation/puzzle";

const phaseHints: Readonly<Record<string, string>> = {
  "level-1": "A peça cabe exatamente na saída que repete sua cor e seu símbolo.",
  "level-2": "As peças não precisam procurar saídas no mesmo lado do tabuleiro.",
  "level-3": "Uma peça comprida pode estar ocupando o corredor de outra.",
  "level-4": "Observe qual peça precisa sair para liberar a passagem principal.",
  "level-5": "Nem todo movimento precisa terminar numa saída; uma vaga temporária pode abrir o caminho.",
  "level-6": "Libere um corredor antes de tentar resolver as peças que cruzam o tabuleiro.",
  "level-7": "Peças pequenas também podem segurar uma passagem importante.",
  "level-8": "Organize um corredor de cada vez e preserve uma vaga para manobrar.",
  "level-9": "O espaço central é disputado: pense onde cada peça pode esperar sem bloquear as outras.",
  "level-10": "Planeje um lado do tabuleiro por vez antes de ocupar o centro.",
  "level-11": "Uma saída florida transforma o tabuleiro. Procure a peça que pode despertar a flor.",
  "level-12": "Quando a flor abrir, observe todas as células que a vinha deixou livres.",
  "level-13": "A ordem em que as flores despertam importa mais do que a distância até as saídas.",
  "level-14": "Crie uma vaga temporária antes de tentar atravessar o jardim apertado.",
  "level-15": "Libere os corredores floridos antes de disputar o espaço central.",
};

export function getPhaseHint(levelId: string): string | undefined {
  return phaseHints[levelId];
}

export function missingPhaseHintIds(
  catalog: readonly Pick<Level, "id">[],
): string[] {
  return catalog
    .map((level) => level.id)
    .filter((levelId) => !phaseHints[levelId]?.trim());
}

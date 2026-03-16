import type { SportPlanConfig } from "@/types/stats";

export const CALCIO_DEFAULT_CONFIG: SportPlanConfig = {
  playerCount: 11,
  statDefinitions: [
    { key: "passaggiRiusciti", label: "Passaggi riusciti", short: "P.R." },
    { key: "passaggiSbagliati", label: "Passaggi sbagliati", short: "P.S." },
    { key: "recuperi", label: "Recuperi", short: "Rec" },
    { key: "crossEffettuati", label: "Cross effettuati", short: "C.E." },
    { key: "crossRiusciti", label: "Cross riusciti", short: "C.R." },
    { key: "gol", label: "Gol", short: "Gol" },
  ],
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CALCIO_STATS = [
  { key: "passaggiRiusciti", label: "Passaggi riusciti", short: "P.R." },
  { key: "passaggiSbagliati", label: "Passaggi sbagliati", short: "P.S." },
  { key: "recuperi", label: "Recuperi", short: "Rec" },
  { key: "crossEffettuati", label: "Cross effettuati", short: "C.E." },
  { key: "crossRiusciti", label: "Cross riusciti", short: "C.R." },
  { key: "gol", label: "Gol", short: "Gol" },
];

const PALLAVOLO_STATS = [
  { key: "punti", label: "Punti", short: "Pti" },
  { key: "attacchi", label: "Attacchi", short: "Att" },
  { key: "muri", label: "Muri", short: "Mur" },
  { key: "battute", label: "Battute", short: "Bat" },
  { key: "ricezioni", label: "Ricezioni", short: "Ric" },
  { key: "errori", label: "Errori", short: "Err" },
];

const BASKET_STATS = [
  { key: "punti", label: "Punti", short: "Pti" },
  { key: "rimbalzi", label: "Rimbalzi", short: "Rim" },
  { key: "assist", label: "Assist", short: "Ass" },
  { key: "pallePerse", label: "Palle perse", short: "PP" },
  { key: "stoppate", label: "Stoppate", short: "Sto" },
];

const DEFAULT_PLAN_IDS = {
  calcio: "plan-calcio",
  pallavolo: "plan-pallavolo",
  basket: "plan-basket",
} as const;

async function main() {
  await prisma.sportPlan.upsert({
    where: { id: DEFAULT_PLAN_IDS.calcio },
    update: {},
    create: {
      id: DEFAULT_PLAN_IDS.calcio,
      name: "Calcio",
      slug: "calcio",
      playerCount: 11,
      statDefinitions: CALCIO_STATS,
      userId: null,
    },
  });
  await prisma.sportPlan.upsert({
    where: { id: DEFAULT_PLAN_IDS.pallavolo },
    update: {},
    create: {
      id: DEFAULT_PLAN_IDS.pallavolo,
      name: "Pallavolo",
      slug: "pallavolo",
      playerCount: 6,
      statDefinitions: PALLAVOLO_STATS,
      userId: null,
    },
  });
  await prisma.sportPlan.upsert({
    where: { id: DEFAULT_PLAN_IDS.basket },
    update: {},
    create: {
      id: DEFAULT_PLAN_IDS.basket,
      name: "Basket",
      slug: "basket",
      playerCount: 5,
      statDefinitions: BASKET_STATS,
      userId: null,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

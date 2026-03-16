# Statser – Statistiche Partita

App Next.js per registrare le statistiche di due squadre (calcio, pallavolo, basket o piani custom) con auth Supabase e salvataggio locale/cloud.

## Setup

1. **Variabili d’ambiente**

   Copia `.env.example` in `.env.local` e compila:

   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (da Supabase → Project Settings → API)
   - `DATABASE_URL`: connection string Postgres (Supabase → Project Settings → Database)

2. **Database**

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

   Il seed crea i 3 piani default: Calcio (11 giocatori), Pallavolo (6), Basket (5).

3. **Avvio**

   ```bash
   npm install
   npm run dev
   ```

   Apri [http://localhost:3000](http://localhost:3000).

## Funzionalità

- **Auth**: Login e Registrazione (Supabase Email). Link in header (Accedi / Account).
- **Piani**: 3 default (Calcio, Pallavolo, Basket) + piani personalizzati dall’account. In homepage selezioni il piano e la tabella si adatta (numero giocatori e statistiche).
- **Statistiche**: Per ogni giocatore: nome + contatori (+ / −) per ogni stat del piano. Totali sotto la tabella.
- **Salvataggio locale**: **Salva partita** → localStorage. **Partite salvate** elenca partite sul dispositivo e, se sei loggato, **Su account (cloud)**.
- **Salva su account**: Se loggato, **Salva su account** invia la partita al DB (Prisma + Supabase Postgres).
- **Account** (`/account`): Profilo, piano predefinito, crea/modifica/elimina piani personalizzati (nome, numero giocatori, elenco statistiche con key/label/breve).

## Tech

- Next.js 16 (App Router), React 19, Tailwind
- Supabase (Auth + Postgres)
- Prisma (schema: User, SportPlan, Match)

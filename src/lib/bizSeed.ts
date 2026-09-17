/**
 * ─── FORME D'UN ÉTAT DE DÉPART DE LA PARTIE MAGASIN ────────────────────────────
 * Ce fichier ne fournit que la FORME d'un état — toutes les collections vides —
 * pour que le store ait quelque chose à rendre avant que les données de
 * démonstration soient chargées (voir `src/lib/demoData.ts`).
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { BizState, ModuleState } from './bizConfig';

/** Une partie sans aucune ligne — toutes les collections de `ModuleState`. */
const emptyModule = (): ModuleState => ({
  categories: [], marques: [], roles: [], products: [], purchases: [], sales: [],
  clients: [], suppliers: [], workers: [], expenses: [], caisse: [],
  destructions: [], sessions: [], inventaires: [], posPinned: [],
});

/** État de départ du store : la partie Magasin, vide. */
export function emptyBizState(): BizState {
  return { magasin: emptyModule() };
}

export const EMPTY_MODULE = emptyModule;

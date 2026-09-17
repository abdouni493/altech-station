/**
 * ─── Retour de marchandise en stock (Magasin) ──────────────────────────────────
 *
 * TOUT ce qui sort du stock doit pouvoir y revenir, et par le même chemin.
 * Une vente ou un bon d'achat qu'on SUPPRIME est une opération qui n'a jamais
 * eu lieu : la marchandise qu'elle avait fait sortir (ou entrer) doit retrouver
 * sa place, sinon le catalogue annonce un stock que la partie n'a pas — ou
 * cache celui qu'elle a.
 *
 * Les quantités sont CUMULÉES avant d'être écrites : deux lignes qui touchent
 * le même produit repartiraient sinon du même stock lu au début, et la seconde
 * écraserait la première.
 *
 * Le stock peut repasser en NÉGATIF : c'est voulu, le point de vente vend à
 * découvert et le manque se rattrape au prochain achat.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { BizLineItem, ModuleState, formatQty, roundQty } from './bizConfig';

/** Ce que des lignes rendent — calculé d'abord, écrit ensuite. */
export interface RestockPlan {
  /** productId → quantité à rendre au catalogue (négatif = sortie). */
  stock: Map<string, number>;
  /** Lignes dont le produit n'existe plus au catalogue : rien à rendre. */
  orphans: BizLineItem[];
}

/** API minimale de `useBiz(moduleKey)` dont ce module a besoin. */
export interface RestockApi {
  state: ModuleState;
  update: (coll: 'products', item: any) => void;
}

export const bumpQty = (m: Map<string, number>, id: string, qty: number) =>
  m.set(id, (m.get(id) || 0) + qty);

/** D'où sortait une ligne vendue — donc où sa quantité doit revenir. */
export type SaleOrigin = { kind: 'product'; id: string } | null;

/**
 * L'IDENTIFIANT d'abord, le rapprochement par nom ensuite : les lignes d'avant
 * les identifiants stables ne portent que le nom du produit.
 */
export function originOf(state: ModuleState, l: BizLineItem): SaleOrigin {
  const { products } = state;
  const id = l.productId;
  if (products.some(p => p.id === id)) return { kind: 'product', id };
  const pn = products.find(x => x.name === l.productName);
  if (pn) return { kind: 'product', id: pn.id };
  return null;
}

/** Plan de retour pour des lignes vendues — rien n'est encore écrit. */
export function restockPlan(state: ModuleState, lines: BizLineItem[]): RestockPlan {
  const plan: RestockPlan = { stock: new Map(), orphans: [] };

  (lines || []).forEach(l => {
    const qty = Number(l.qty) || 0;
    if (qty === 0) return;
    const origin = originOf(state, l);
    if (!origin) { plan.orphans.push(l); return; }
    bumpQty(plan.stock, origin.id, qty);
  });

  return plan;
}

/** Écrit un plan. Chaque produit n'est touché qu'UNE fois, delta déjà cumulé. */
export function applyRestock(api: RestockApi, plan: RestockPlan) {
  const { products } = api.state;
  plan.stock.forEach((qty, productId) => {
    if (!qty) return;
    const p = products.find(x => x.id === productId);
    if (p) api.update('products', { ...p, currentQty: roundQty(p.currentQty + qty) });
  });
}

/** Raccourci : calcule et applique en une fois. */
export function restockLines(api: RestockApi, lines: BizLineItem[]) {
  applyRestock(api, restockPlan(api.state, lines));
}

/**
 * Où une ligne revient — sert à dire à l'utilisateur, AVANT qu'il ne confirme,
 * quelle quantité va réapparaître et sur quel écran.
 */
export function restockTargetOf(
  state: ModuleState, l: BizLineItem,
): { label: string; detail: string } {
  const origin = originOf(state, l);
  if (!origin) return { label: 'Produit introuvable au catalogue', detail: formatQty(Number(l.qty) || 0) };
  const p = state.products.find(x => x.id === origin.id);
  return { label: 'Gestion de stock', detail: `${formatQty(Number(l.qty) || 0)} ${p?.unit || ''}`.trim() };
}

/**
 * Phrase de confirmation listant ce qui va revenir en stock, ligne par ligne.
 * L'utilisateur voit AVANT de valider ce que chaque produit va devenir — même
 * mécanique que la suppression d'un bon d'achat, en sens inverse.
 */
export function describeRestock(state: ModuleState, lines: BizLineItem[]): string {
  const plan = restockPlan(state, lines);
  const out: string[] = [];

  plan.stock.forEach((qty, productId) => {
    if (!qty) return;
    const p = state.products.find(x => x.id === productId);
    if (!p) return;
    const after = roundQty(p.currentQty + qty);
    out.push(`• ${p.name} : +${formatQty(qty)}${p.unit ? ` ${p.unit}` : ''}`
      + `   (${formatQty(p.currentQty)} → ${formatQty(after)})`);
  });
  plan.orphans.forEach(l => {
    out.push(`• ${l.productName} : ${formatQty(Number(l.qty) || 0)} — produit absent du catalogue`);
  });

  return out.join('\n');
}

/** Total des quantités remises en stock — pour le message de succès. */
export function totalRestocked(plan: RestockPlan): number {
  let total = 0;
  plan.stock.forEach(q => { total += q; });
  return roundQty(total);
}

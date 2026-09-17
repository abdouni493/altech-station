/**
 * ─── LA BASE DE DÉMONSTRATION, EN MÉMOIRE ──────────────────────────────────────
 *
 * Cette version de l'application est une DÉMONSTRATION : elle n'ouvre aucune
 * connexion réseau. Tout ce qu'elle affiche vient des données constantes de
 * `demoSeed.ts`, chargées ici dans des tables en mémoire.
 *
 * Le client exposé (`demoClient`) imite la partie de l'API `supabase-js` que
 * l'application utilise réellement — `from(...).select().eq()…`, `insert`,
 * `update`, `upsert`, `delete`, `auth`, `rpc`, `storage`, `channel`. C'est ce
 * qui permet de couper la base sans réécrire les soixante écrans qui la
 * lisaient : ils appellent les mêmes méthodes, elles répondent depuis la RAM.
 *
 * ─── CE QUE « EN MÉMOIRE » VEUT DIRE ───────────────────────────────────────────
 * Les écritures fonctionnent — créer un produit, encaisser une vente, payer un
 * employé — et se voient immédiatement à l'écran. Elles vivent le temps de
 * l'onglet : un rechargement de la page rend le jeu de démonstration intact.
 * ──────────────────────────────────────────────────────────────────────────────
 */
import { DEMO_TABLES } from './demoSeed';

// ─── Les tables ───────────────────────────────────────────────────────────────

type Row = Record<string, any>;

/** Copie profonde du jeu constant : la démo se réinitialise sans le corrompre. */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const tables: Record<string, Row[]> = clone(DEMO_TABLES);

/** Les lignes d'une table — créée vide si la démo n'en fournit pas. */
export function tableOf(name: string): Row[] {
  if (!tables[name]) tables[name] = [];
  return tables[name];
}

/** Remet la démo dans son état d'origine (utilisé par la restauration). */
export function resetDemoTables(): void {
  for (const k of Object.keys(tables)) delete tables[k];
  Object.assign(tables, clone(DEMO_TABLES));
}

export const newDemoId = (prefix = 'row'): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// ─── Le résultat d'une requête ────────────────────────────────────────────────

export interface DemoResult<T = any> {
  data: T;
  error: { message: string; code?: string } | null;
  count?: number | null;
}

const ok = <T,>(data: T, count?: number): DemoResult<T> => ({ data, error: null, count: count ?? null });

// ─── Le constructeur de requête ───────────────────────────────────────────────
/**
 * Un builder « thenable » : `await qb`, `qb.then(...)`, `qb.select().eq(...)`
 * se comportent comme chez supabase-js. Les filtres sont appliqués à la
 * résolution, jamais avant — c'est ce qui permet de les enchaîner dans
 * n'importe quel ordre.
 */
type Op =
  | { kind: 'eq'; col: string; val: any }
  | { kind: 'neq'; col: string; val: any }
  | { kind: 'in'; col: string; vals: any[] }
  | { kind: 'is'; col: string; val: any }
  | { kind: 'gte'; col: string; val: any }
  | { kind: 'lte'; col: string; val: any }
  | { kind: 'like'; col: string; pattern: string };

type Action =
  | { kind: 'select' }
  | { kind: 'insert'; rows: Row[] }
  | { kind: 'update'; patch: Row }
  | { kind: 'upsert'; rows: Row[]; onConflict?: string }
  | { kind: 'delete' };

class DemoQuery<T = any> implements PromiseLike<DemoResult<T>> {
  private ops: Op[] = [];
  private action: Action = { kind: 'select' };
  private orderBy?: { col: string; ascending: boolean };
  private rangeFrom?: number;
  private rangeTo?: number;
  private limitN?: number;
  private singleRow = false;
  private maybe = false;
  private wantsRows = true;

  constructor(private readonly table: string) {}

  // ── Actions ──
  select(_cols?: string, opts?: { count?: string; head?: boolean }): this {
    if (this.action.kind === 'select') this.action = { kind: 'select' };
    this.wantsRows = !opts?.head;
    return this;
  }
  insert(rows: Row | Row[]): this {
    this.action = { kind: 'insert', rows: Array.isArray(rows) ? rows : [rows] };
    this.wantsRows = false;
    return this;
  }
  update(patch: Row): this {
    this.action = { kind: 'update', patch };
    this.wantsRows = false;
    return this;
  }
  upsert(rows: Row | Row[], opts?: { onConflict?: string }): this {
    this.action = { kind: 'upsert', rows: Array.isArray(rows) ? rows : [rows], onConflict: opts?.onConflict };
    this.wantsRows = false;
    return this;
  }
  delete(): this {
    this.action = { kind: 'delete' };
    this.wantsRows = false;
    return this;
  }

  // ── Filtres ──
  eq(col: string, val: any): this { this.ops.push({ kind: 'eq', col, val }); return this; }
  neq(col: string, val: any): this { this.ops.push({ kind: 'neq', col, val }); return this; }
  in(col: string, vals: any[]): this { this.ops.push({ kind: 'in', col, vals }); return this; }
  is(col: string, val: any): this { this.ops.push({ kind: 'is', col, val }); return this; }
  gte(col: string, val: any): this { this.ops.push({ kind: 'gte', col, val }); return this; }
  lte(col: string, val: any): this { this.ops.push({ kind: 'lte', col, val }); return this; }
  like(col: string, pattern: string): this { this.ops.push({ kind: 'like', col, pattern }); return this; }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderBy = { col, ascending: opts?.ascending !== false };
    return this;
  }
  range(from: number, to: number): this { this.rangeFrom = from; this.rangeTo = to; return this; }
  limit(n: number): this { this.limitN = n; return this; }
  maybeSingle(): this { this.maybe = true; this.wantsRows = true; return this; }
  single(): this { this.singleRow = true; this.wantsRows = true; return this; }

  // ── Résolution ──
  private matches(row: Row): boolean {
    return this.ops.every(op => {
      const v = row[op.col];
      switch (op.kind) {
        case 'eq': return v === op.val;
        case 'neq': return v !== op.val;
        case 'in': return op.vals.includes(v);
        case 'is': return op.val === null ? (v === null || v === undefined) : v === op.val;
        case 'gte': return v >= op.val;
        case 'lte': return v <= op.val;
        case 'like': return String(v ?? '').toLowerCase()
          .includes(op.pattern.replace(/%/g, '').toLowerCase());
        default: return true;
      }
    });
  }

  private run(): DemoResult<any> {
    const rows = tableOf(this.table);

    if (this.action.kind === 'insert' || this.action.kind === 'upsert') {
      const written: Row[] = [];
      for (const raw of this.action.rows) {
        const row: Row = { ...raw };
        if (!row.id) row.id = newDemoId(this.table);
        if (!row.created_at) row.created_at = new Date().toISOString();
        const at = rows.findIndex(r => r.id === row.id);
        if (at >= 0) rows[at] = { ...rows[at], ...row };
        else rows.push(row);
        written.push(row);
      }
      return ok(this.wantsRows || this.maybe || this.singleRow
        ? (this.maybe || this.singleRow ? written[0] ?? null : written)
        : null);
    }

    if (this.action.kind === 'update') {
      const patch = this.action.patch;
      const touched: Row[] = [];
      rows.forEach((r, i) => {
        if (!this.matches(r)) return;
        rows[i] = { ...r, ...patch };
        touched.push(rows[i]);
      });
      return ok(this.maybe || this.singleRow ? touched[0] ?? null : touched);
    }

    if (this.action.kind === 'delete') {
      const kept = rows.filter(r => !this.matches(r));
      const removed = rows.length - kept.length;
      rows.length = 0;
      rows.push(...kept);
      return ok(null, removed);
    }

    // select
    let out = rows.filter(r => this.matches(r));
    if (this.orderBy) {
      const { col, ascending } = this.orderBy;
      out = [...out].sort((a, b) => {
        const x = a[col], y = b[col];
        if (x === y) return 0;
        if (x === undefined || x === null) return 1;
        if (y === undefined || y === null) return -1;
        return (x > y ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    const total = out.length;
    if (this.rangeFrom !== undefined) out = out.slice(this.rangeFrom, (this.rangeTo ?? total) + 1);
    if (this.limitN !== undefined) out = out.slice(0, this.limitN);
    if (this.maybe || this.singleRow) return ok(out[0] ?? null, total);
    return ok(clone(out), total);
  }

  then<R1 = DemoResult<T>, R2 = never>(
    onfulfilled?: ((value: DemoResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    let result: DemoResult<any>;
    try {
      result = this.run();
    } catch (e: any) {
      result = { data: null, error: { message: e?.message || 'Erreur de la base de démonstration' } };
    }
    return Promise.resolve(result as DemoResult<T>).then(onfulfilled, onrejected);
  }
}

// ─── Le compte de démonstration ───────────────────────────────────────────────

export const DEMO_ADMIN = {
  id: 'demo-admin',
  email: 'demo@altech-station.dz',
  name: 'Administrateur Démo',
  password: 'demo',
} as const;

type SessionUser = { id: string; email: string };
type AuthSession = { user: SessionUser; access_token: string; refresh_token: string; expires_at: number };

let session: AuthSession | null = null;
const authListeners = new Set<(event: string, s: AuthSession | null) => void>();

function makeSession(): AuthSession {
  return {
    user: { id: DEMO_ADMIN.id, email: DEMO_ADMIN.email },
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
}

/** Ouvre la session du compte de démonstration. */
export function demoSignIn(): AuthSession {
  session = makeSession();
  authListeners.forEach(cb => cb('SIGNED_IN', session));
  return session;
}

export function demoSignOut(): void {
  session = null;
  authListeners.forEach(cb => cb('SIGNED_OUT', null));
}

export function demoSession(): AuthSession | null {
  return session;
}

// ─── Les procédures stockées ──────────────────────────────────────────────────
/** Les quelques `rpc()` que l'application appelle, rendues depuis la mémoire. */
function demoRpc(name: string, _args?: Row): DemoResult<any> {
  switch (name) {
    case 'get_my_role':
      return ok(session ? 'admin' : null);
    case 'get_my_worker':
      return ok(null);
    case 'public_station_identity': {
      const s = tableOf('station_settings')[0];
      return ok(s ? { name: s.name, logo_url: s.logo_url, address: s.address, phone: s.phone } : null);
    }
    default:
      return ok(null);
  }
}

// ─── Le client ────────────────────────────────────────────────────────────────

const noopChannel = {
  on() { return this; },
  subscribe(cb?: (status: string) => void) { cb?.('SUBSCRIBED'); return this; },
  unsubscribe() { return Promise.resolve('ok'); },
};

export const demoClient = {
  from<T = any>(table: string) { return new DemoQuery<T>(table); },

  rpc(name: string, args?: Row) { return Promise.resolve(demoRpc(name, args)); },

  channel(_name: string) { return noopChannel as any; },
  removeChannel(_ch: any) { return Promise.resolve('ok'); },

  auth: {
    async getSession() { return ok({ session }); },
    async getUser() { return ok({ user: session?.user ?? null }); },
    async signInWithPassword(_creds: { email: string; password: string }) {
      return ok({ session: demoSignIn(), user: session!.user });
    },
    async signUp(_creds: { email: string; password: string }) {
      return ok({ session: demoSignIn(), user: session!.user });
    },
    async signOut() { demoSignOut(); return { error: null }; },
    async updateUser(_patch: Row) { return ok({ user: session?.user ?? null }); },
    async refreshSession() { return ok({ session }); },
    onAuthStateChange(cb: (event: string, s: AuthSession | null) => void) {
      authListeners.add(cb);
      return { data: { subscription: { unsubscribe: () => { authListeners.delete(cb); } } } };
    },
  },

  storage: {
    from(_bucket: string) {
      return {
        async upload(path: string, _file: any) { return ok({ path }); },
        getPublicUrl(path: string) { return { data: { publicUrl: path } }; },
        async remove(_paths: string[]) { return ok(null); },
      };
    },
  },
};

export type DemoClient = typeof demoClient;

/**
 * ─── LE JEU DE DONNÉES DE LA DÉMONSTRATION ─────────────────────────────────────
 *
 * Une station-service complète, écrite à la main : deux activités seulement —
 * le CARBURANT (cuves, pompes, pompistes, brigades) et le MAGASIN (catalogue,
 * achats, ventes, clients, employés). Aucune base de données n'est contactée :
 * ce fichier EST la base.
 *
 * Les tables sont nommées et colonnées comme la base réelle (snake_case), pour
 * que les écrans qui les lisent n'aient rien à changer. La partie Magasin, elle,
 * vit dans un unique blob JSON (`biz_store`), comme en production.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ─── Repères de temps ─────────────────────────────────────────────────────────
// La démo doit sembler vivante quel que soit le jour où on l'ouvre : les dates
// sont donc calculées à partir d'aujourd'hui, jamais figées dans le passé.

const DAY = 86_400_000;
const at = (daysAgo: number): string => new Date(Date.now() - daysAgo * DAY).toISOString();
const day = (daysAgo: number): string => at(daysAgo).split('T')[0];
const monthOf = (daysAgo: number): string => at(daysAgo).slice(0, 7);

// ─── Identifiants stables ─────────────────────────────────────────────────────

const T = { essence: 'tank-1', gasoil: 'tank-2', gpl: 'tank-3' };
const P = { p1: 'pump-1', p2: 'pump-2', p3: 'pump-3' };
const W = { karim: 'pomp-1', yacine: 'pomp-2', sofiane: 'pomp-3', chef: 'chef-1', gerant: 'ger-1', mag: 'mag-1' };
const C = { transdz: 'cli-1', btp: 'cli-2', taxi: 'cli-3' };
const S = { naftal: 'sup-1', total: 'sup-2', distri: 'sup-3' };
const B = { bna: 'bank-1', cpa: 'bank-2' };

// ─── Les tables ───────────────────────────────────────────────────────────────

export const DEMO_TABLES: Record<string, Record<string, any>[]> = {

  // ── Identité de la station ──────────────────────────────────────────────
  station_settings: [{
    id: 'settings-1',
    name: 'Altech Station',
    address: 'RN 5, Zone industrielle — Sétif',
    phone: '036 12 34 56',
    email: 'contact@altech-station.dz',
    fiscal_id: '000419001234567',
    rc: '19/00-1234567 B 24',
    fuel_prices: { ESSENCE: 45.62, GASOIL: 29.01, GPL: 9.00, DIESEL: 29.01, SUPER: 45.62 },
    fuel_buy_prices: { ESSENCE: 41.10, GASOIL: 25.80, GPL: 7.40, DIESEL: 25.80, SUPER: 41.10 },
    conversion_tables: {},
    product_categories: ['Lubrifiants', 'Filtration', 'Accessoires', 'Boissons', 'Entretien'],
    expense_categories: ['Électricité', 'Eau', 'Loyer', 'Entretien', 'Transport', 'Fournitures', 'Divers'],
    product_units: ['unité', 'L', 'kg', 'carton', 'bidon'],
    decalage_positif_actif: true,
    decalage_negatif_actif: true,
    decalage_positif_seuil: 50,
    decalage_negatif_seuil: 50,
  }],

  admin_profiles: [{
    id: 'demo-admin',
    name: 'Administrateur Démo',
    email: 'demo@altech-station.dz',
    avatar_url: null,
  }],

  // ── Cuves ────────────────────────────────────────────────────────────────
  tanks: [
    { id: T.essence, name: 'Cuve 1 — Essence', type: 'ESSENCE', capacity: 30000, current: 18420, degrees: 61, alert_threshold: 5000, notes: 'Sans plomb 95', is_favorite: true },
    { id: T.gasoil, name: 'Cuve 2 — Gasoil', type: 'GASOIL', capacity: 40000, current: 26750, degrees: 67, alert_threshold: 6000, notes: '', is_favorite: true },
    { id: T.gpl, name: 'Cuve 3 — GPL', type: 'GPL', capacity: 15000, current: 3120, degrees: 21, alert_threshold: 4000, notes: 'Sous le seuil d’alerte', is_favorite: false },
  ],

  tracks: [
    { id: 'track-1', name: 'Piste A' },
    { id: 'track-2', name: 'Piste B' },
  ],

  // ── Pompes & pistolets ───────────────────────────────────────────────────
  pumps: [
    { id: P.p1, number: '1', name: 'Pompe 1', tank_id: T.essence, track_id: 'track-1', type: 'ESSENCE', last_index: 482310, status: 'active', created_at: at(400) },
    { id: P.p2, number: '2', name: 'Pompe 2', tank_id: T.gasoil, track_id: 'track-1', type: 'GASOIL', last_index: 913480, status: 'active', created_at: at(400) },
    { id: P.p3, number: '3', name: 'Pompe 3', tank_id: T.gpl, track_id: 'track-2', type: 'GPL', last_index: 205640, status: 'active', created_at: at(400) },
  ],

  pump_nozzles: [
    { id: 'noz-1', pump_id: P.p1, name: 'Pistolet 1A', tank_id: T.essence, type: 'ESSENCE', last_index: 241150, status: 'active' },
    { id: 'noz-2', pump_id: P.p1, name: 'Pistolet 1B', tank_id: T.essence, type: 'ESSENCE', last_index: 241160, status: 'active' },
    { id: 'noz-3', pump_id: P.p2, name: 'Pistolet 2A', tank_id: T.gasoil, type: 'GASOIL', last_index: 456740, status: 'active' },
    { id: 'noz-4', pump_id: P.p2, name: 'Pistolet 2B', tank_id: T.gasoil, type: 'GASOIL', last_index: 456740, status: 'active' },
    { id: 'noz-5', pump_id: P.p3, name: 'Pistolet 3A', tank_id: T.gpl, type: 'GPL', last_index: 205640, status: 'active' },
  ],

  drivers: [
    { id: 'drv-1', name: 'Mohamed Larbi', status: 'active', phone: '0661 20 30 40', email: '', address: 'Sétif' },
    { id: 'drv-2', name: 'Salim Oukaci', status: 'active', phone: '0770 11 22 33', email: '', address: 'El Eulma' },
  ],

  // ── Personnel Carburant ──────────────────────────────────────────────────
  pompistes: [
    { id: W.karim, name: 'Karim Belhadj', phone: '0661 45 78 12', email: 'karim@altech-station.dz', cin: '1122334455', address: 'Sétif', photo_url: null, status: 'active', track_id: 'track-1', chef_id: W.chef, base_salary: 38000, salary_type: 'mois', work_days: [0, 1, 2, 3, 4, 6], cnas_date: day(700), has_access: false, username: null, auth_user_id: null, permissions: {}, hire_date: day(720) },
    { id: W.yacine, name: 'Yacine Meddour', phone: '0770 33 21 09', email: '', cin: '2233445566', address: 'El Eulma', photo_url: null, status: 'active', track_id: 'track-1', chef_id: W.chef, base_salary: 36000, salary_type: 'mois', work_days: [0, 1, 2, 3, 4, 6], cnas_date: day(500), has_access: false, username: null, auth_user_id: null, permissions: {}, hire_date: day(520) },
    { id: W.sofiane, name: 'Sofiane Amrani', phone: '0555 78 90 12', email: '', cin: '3344556677', address: 'Sétif', photo_url: null, status: 'active', track_id: 'track-2', chef_id: W.chef, base_salary: 36000, salary_type: 'mois', work_days: [0, 1, 2, 3, 5, 6], cnas_date: day(300), has_access: false, username: null, auth_user_id: null, permissions: {}, hire_date: day(310) },
  ],

  brigade_chefs: [
    { id: W.chef, name: 'Nadir Boukhalfa', phone: '0661 90 12 34', email: 'nadir@altech-station.dz', cin: '4455667788', address: 'Sétif', photo_url: null, status: 'active', base_salary: 52000, has_access: true, username: 'nadir', auth_user_id: null, permissions: {}, hire_date: day(900) },
  ],

  gerants: [
    { id: W.gerant, name: 'Amine Kaci', phone: '0770 55 66 77', email: 'amine@altech-station.dz', cin: '5566778899', address: 'Sétif', photo_url: null, status: 'active', base_salary: 65000, salary_type: 'mois', work_days: [0, 1, 2, 3, 4], cnas_date: day(1000), has_access: true, username: 'amine', auth_user_id: null, permissions: {}, hire_date: day(1020) },
  ],

  magasin_workers: [
    { id: W.mag, name: 'Lila Cherifi', phone: '0555 12 34 56', email: '', cin: '6677889900', address: 'Sétif', photo_url: null, status: 'active', base_salary: 34000, salary_type: 'mois', work_days: [0, 1, 2, 3, 4, 6], cnas_date: day(200), has_access: false, username: null, auth_user_id: null, permissions: {}, hire_date: day(220) },
  ],

  chef_pompiste_assignments: [
    { chef_id: W.chef, pompiste_id: W.karim },
    { chef_id: W.chef, pompiste_id: W.yacine },
    { chef_id: W.chef, pompiste_id: W.sofiane },
  ],

  // ── Paie ─────────────────────────────────────────────────────────────────
  worker_acomptes: [
    { id: 'aco-1', worker_id: W.karim, worker_type: 'pompiste', date: day(9), amount: 6000, description: 'Avance sur salaire', is_paid: false, month_paid: null },
    { id: 'aco-2', worker_id: W.mag, worker_type: 'magasin', date: day(6), amount: 4000, description: 'Avance', is_paid: false, month_paid: null },
  ],

  worker_absences: [
    { id: 'abs-1', worker_id: W.yacine, worker_type: 'pompiste', date: day(12), cost: 1200, description: 'Absence non justifiée', is_paid: false, month_paid: null },
  ],

  worker_payment_records: [
    { id: 'pay-1', worker_id: W.karim, worker_type: 'pompiste', month: monthOf(35), base_salary: 38000, total_acomptes: 0, total_absences: 0, bonus_decalage: 0, retenue_decalage: 0, net_salary: 38000, payment_date: day(32), payment_mode: 'espèces', cheque_number: null, notes: '', is_paid: true },
    { id: 'pay-2', worker_id: W.chef, worker_type: 'chef_brigade', month: monthOf(35), base_salary: 52000, total_acomptes: 0, total_absences: 0, bonus_decalage: 0, retenue_decalage: 0, net_salary: 52000, payment_date: day(32), payment_mode: 'virement', cheque_number: null, notes: '', is_paid: true },
    { id: 'pay-3', worker_id: W.mag, worker_type: 'magasin', month: monthOf(35), base_salary: 34000, total_acomptes: 0, total_absences: 0, bonus_decalage: 0, retenue_decalage: 0, net_salary: 34000, payment_date: day(32), payment_mode: 'espèces', cheque_number: null, notes: '', is_paid: true },
  ],

  pompiste_decalage_history: [],

  // ── Clients & fournisseurs (Carburant) ───────────────────────────────────
  clients: [
    { id: C.transdz, name: 'Trans-DZ Logistique', phone: '036 45 67 89', cin: '', email: 'contact@transdz.dz', address: 'Zone industrielle, Sétif', contact_person: 'M. Rabah', balance: 0, debt: 184500, credit_limit: 500000, payment_delay: 30, type: 'entreprise', payment_mode: 'crédit', nif: '000419008765432', nis: '098765432', article: '19001234', rc: '19/00-7654321 B 20', advance_balance: 0, opening_debt: 0, opening_advance: 0, opening_date: null, opening_notes: null, created_at: at(600) },
    { id: C.btp, name: 'SARL Belkacem BTP', phone: '0661 33 44 55', cin: '', email: '', address: 'El Eulma', contact_person: 'M. Belkacem', balance: 0, debt: 62300, credit_limit: 300000, payment_delay: 15, type: 'entreprise', payment_mode: 'crédit', nif: '000419001111222', nis: '011112222', article: '19005678', rc: '19/00-1112222 B 21', advance_balance: 0, opening_debt: 0, opening_advance: 0, opening_date: null, opening_notes: null, created_at: at(430) },
    { id: C.taxi, name: 'Coopérative Taxis Sétif', phone: '0770 88 99 00', cin: '', email: '', address: 'Sétif centre', contact_person: 'M. Hocine', balance: 0, debt: 0, credit_limit: 150000, payment_delay: 7, type: 'entreprise', payment_mode: 'espèces', nif: '', nis: '', article: '', rc: '', advance_balance: 45000, opening_debt: 0, opening_advance: 45000, opening_date: day(60), opening_notes: 'Compte prépayé', created_at: at(300) },
  ],

  suppliers: [
    { id: S.naftal, ref: 'F-001', name: 'NAFTAL District Sétif', contact: 'M. Ziani', phone: '036 90 10 20', email: 'setif@naftal.dz', address: 'Sétif', balance: 0, total_purchases: 8940000, nif: '000416001234567', nis: '001234567', article: '16001234', rc: '16/00-1234567 B 95', type: 'carburant' },
    { id: S.total, ref: 'F-002', name: 'Lubrifiants Total Algérie', contact: 'Mme Hamidi', phone: '021 44 55 66', email: '', address: 'Alger', balance: 0, total_purchases: 412000, nif: '000416007654321', nis: '007654321', article: '16007654', rc: '16/00-7654321 B 02', type: 'magasin' },
    { id: S.distri, ref: 'F-003', name: 'Distri-Pièces Est', contact: 'M. Saïdi', phone: '036 77 88 99', email: '', address: 'Constantine', balance: 0, total_purchases: 268000, nif: '000425001122334', nis: '001122334', article: '25001122', rc: '25/00-1122334 B 11', type: 'magasin' },
  ],

  client_transactions: [
    { id: 'ctx-1', client_id: C.transdz, date: day(24), type: 'payment', amount: 200000, description: 'Règlement facture', mode: 'virement' },
    { id: 'ctx-2', client_id: C.btp, date: day(11), type: 'payment', amount: 80000, description: 'Acompte', mode: 'chèque' },
  ],
  client_appointments: [],
  supplier_appointments: [],
  supplier_debt_payments: [],

  // ── Produits de la boutique station ──────────────────────────────────────
  product_brands: [
    { id: 'brand-1', name: 'Total' },
    { id: 'brand-2', name: 'Mann' },
    { id: 'brand-3', name: 'Ifri' },
  ],

  products: [
    { id: 'prd-1', ref: 'P-001', name: 'Huile moteur 10W40 — 5 L', category: 'Lubrifiants', buy_price: 2400, selling_price: 3200, stock: 42, min_stock: 10, barcode: '6130001112223', image_url: null, unit: 'bidon', brand: 'Total', brand_id: 'brand-1', tva_rate: 19, sell_by_details: false },
    { id: 'prd-2', ref: 'P-002', name: 'Filtre à huile', category: 'Filtration', buy_price: 620, selling_price: 950, stock: 68, min_stock: 15, barcode: '6130002223334', image_url: null, unit: 'unité', brand: 'Mann', brand_id: 'brand-2', tva_rate: 19, sell_by_details: false },
    { id: 'prd-3', ref: 'P-003', name: 'Eau minérale 1,5 L', category: 'Boissons', buy_price: 35, selling_price: 60, stock: 240, min_stock: 48, barcode: '6130003334445', image_url: null, unit: 'unité', brand: 'Ifri', brand_id: 'brand-3', tva_rate: 9, sell_by_details: false },
    { id: 'prd-4', ref: 'P-004', name: 'Liquide lave-glace 5 L', category: 'Entretien', buy_price: 320, selling_price: 520, stock: 8, min_stock: 12, barcode: '6130004445556', image_url: null, unit: 'bidon', brand: 'Total', brand_id: 'brand-1', tva_rate: 19, sell_by_details: false },
  ],

  // ── Brigades ─────────────────────────────────────────────────────────────
  brigades: [
    {
      id: 'brig-1', created_at: at(1), date: day(1), shift: 'Matin', chef_id: W.chef, status: 'closed',
      start_datetime: `${day(1)}T06:00:00.000Z`, end_datetime: `${day(1)}T14:00:00.000Z`,
      is_active: false, notes: '', printed_at: null,
      start_nozzle_indices: { 'noz-1': 239800, 'noz-2': 240100, 'noz-3': 454900, 'noz-4': 455200, 'noz-5': 205100 },
      end_nozzle_indices: { 'noz-1': 240480, 'noz-2': 240760, 'noz-3': 455880, 'noz-4': 456020, 'noz-5': 205390 },
      active_nozzle_ids: ['noz-1', 'noz-2', 'noz-3', 'noz-4', 'noz-5'],
      start_tank_levels: { [T.essence]: 20100, [T.gasoil]: 28600, [T.gpl]: 3500 },
      end_tank_levels: { [T.essence]: 18780, [T.gasoil]: 26900, [T.gpl]: 3210 },
      pompiste_pump_assignments: [
        { pompisteId: W.karim, pumpIds: [P.p1] },
        { pompisteId: W.yacine, pumpIds: [P.p2] },
        { pompisteId: W.sofiane, pumpIds: [P.p3] },
      ],
      versements: [],
      can_reactivate: false,
    },
    {
      id: 'brig-2', created_at: at(0), date: day(0), shift: 'Matin', chef_id: W.chef, status: 'active',
      start_datetime: `${day(0)}T06:00:00.000Z`, end_datetime: null,
      is_active: true, notes: 'Brigade en cours', printed_at: null,
      start_nozzle_indices: { 'noz-1': 240480, 'noz-2': 240760, 'noz-3': 455880, 'noz-4': 456020, 'noz-5': 205390 },
      end_nozzle_indices: {},
      active_nozzle_ids: ['noz-1', 'noz-2', 'noz-3', 'noz-4', 'noz-5'],
      start_tank_levels: { [T.essence]: 18780, [T.gasoil]: 26900, [T.gpl]: 3210 },
      end_tank_levels: {},
      pompiste_pump_assignments: [
        { pompisteId: W.karim, pumpIds: [P.p1] },
        { pompisteId: W.yacine, pumpIds: [P.p2] },
      ],
      versements: [],
      can_reactivate: false,
    },
  ],

  brigade_pompiste_assignments: [
    { brigade_id: 'brig-1', pompiste_id: W.karim },
    { brigade_id: 'brig-1', pompiste_id: W.yacine },
    { brigade_id: 'brig-1', pompiste_id: W.sofiane },
    { brigade_id: 'brig-2', pompiste_id: W.karim },
    { brigade_id: 'brig-2', pompiste_id: W.yacine },
  ],

  brigade_accounting: [{
    id: 'bacc-1', brigade_id: 'brig-1',
    total_due: 173_420, cash_received: 128_900, rest: 0,
    tank_summary: [], nozzle_summary: [], decalage_summary: {},
    cuve_verifications: {}, nozzle_verifications: {},
    rest_assigned_worker_type: null, rest_assigned_worker_id: null, rest_assigned_amount: 0,
    created_at: at(1),
  }],

  brigade_accounting_justifications: [],
  brigade_decalage_alerts: [],
  tpe_transactions: [],

  // ── Ventes carburant & boutique station ──────────────────────────────────
  fuel_sales: [],

  shop_sales: [
    { id: 'shs-1', date: at(1), client_id: null, client_name: 'Comptoir', total: 3260, paid: 3260, rest: 0, payment_mode: 'espèces', status: 'payée', created_at: at(1) },
    { id: 'shs-2', date: at(0), client_id: null, client_name: 'Comptoir', total: 1010, paid: 1010, rest: 0, payment_mode: 'espèces', status: 'payée', created_at: at(0) },
  ],
  shop_sale_items: [
    { id: 'shi-1', sale_id: 'shs-1', product_id: 'prd-1', product_name: 'Huile moteur 10W40 — 5 L', quantity: 1, price: 3200, tva: 19 },
    { id: 'shi-2', sale_id: 'shs-1', product_id: 'prd-3', product_name: 'Eau minérale 1,5 L', quantity: 1, price: 60, tva: 9 },
    { id: 'shi-3', sale_id: 'shs-2', product_id: 'prd-2', product_name: 'Filtre à huile', quantity: 1, price: 950, tva: 19 },
    { id: 'shi-4', sale_id: 'shs-2', product_id: 'prd-3', product_name: 'Eau minérale 1,5 L', quantity: 1, price: 60, tva: 9 },
  ],

  // ── Achats carburant ─────────────────────────────────────────────────────
  purchases: [
    { id: 'pur-1', ref: 'ACH-2401', supplier_id: S.naftal, supplier_name: 'NAFTAL District Sétif', date: day(5), total: 1_032_000, paid: 1_032_000, rest: 0, status: 'payée', notes: 'Livraison gasoil', created_at: at(5) },
    { id: 'pur-2', ref: 'ACH-2402', supplier_id: S.naftal, supplier_name: 'NAFTAL District Sétif', date: day(2), total: 822_000, paid: 400_000, rest: 422_000, status: 'crédit', notes: 'Livraison essence', created_at: at(2) },
  ],
  purchase_items: [
    { id: 'pui-1', purchase_id: 'pur-1', product_id: null, product_name: 'Gasoil', tank_id: T.gasoil, quantity: 40000, price: 25.8, total: 1_032_000 },
    { id: 'pui-2', purchase_id: 'pur-2', product_id: null, product_name: 'Essence', tank_id: T.essence, quantity: 20000, price: 41.1, total: 822_000 },
  ],
  purchase_payments: [
    { id: 'pup-1', purchase_id: 'pur-1', date: day(5), amount: 1_032_000, mode: 'virement', account_id: B.bna, reference: 'VIR-88120' },
    { id: 'pup-2', purchase_id: 'pur-2', date: day(2), amount: 400_000, mode: 'virement', account_id: B.bna, reference: 'VIR-88431' },
  ],

  delivery_notes: [],
  delivery_note_items: [],
  delivery_note_photos: [],
  delivery_note_payments: [],
  fuel_invoices: [],
  fuel_invoice_bls: [],
  fuel_receipts: [],
  fuel_receipt_invoices: [],

  // ── Trésorerie ───────────────────────────────────────────────────────────
  bank_accounts: [
    { id: B.bna, name: 'BNA — Compte courant', bank: 'BNA', number: '001 00123 4567890123 45', initial_balance: 2_500_000, notes: 'Compte principal', created_at: at(800) },
    { id: B.cpa, name: 'CPA — Compte épargne', bank: 'CPA', number: '004 00987 6543210987 65', initial_balance: 1_200_000, notes: '', created_at: at(800) },
  ],

  treasury_transactions: [
    { id: 'tre-1', date: day(30), kind: 'DEPOSIT', amount: 900_000, account_to: B.bna, account_from: null, label: 'Versement des recettes du mois', part: 'carburant', ref_type: null, ref_id: null, created_at: at(30) },
    { id: 'tre-2', date: day(5), kind: 'PURCHASE', amount: 1_032_000, account_from: B.bna, account_to: null, label: 'Achat ACH-2401 — NAFTAL', part: 'carburant', ref_type: 'purchase', ref_id: 'pur-1', created_at: at(5) },
    { id: 'tre-3', date: day(2), kind: 'PURCHASE', amount: 400_000, account_from: B.bna, account_to: null, label: 'Achat ACH-2402 — NAFTAL', part: 'carburant', ref_type: 'purchase', ref_id: 'pur-2', created_at: at(2) },
    { id: 'tre-4', date: day(3), kind: 'DEPOSIT', amount: 120_000, account_to: B.bna, account_from: 'CAISSE_MAGASIN', label: 'Recette magasin versée en banque', part: 'magasin', ref_type: null, ref_id: null, created_at: at(3) },
    { id: 'tre-5', date: day(20), kind: 'TRANSFER', amount: 300_000, account_from: B.bna, account_to: B.cpa, label: 'Mise en épargne', part: 'systeme', ref_type: null, ref_id: null, created_at: at(20) },
  ],

  // ── Dépenses de la station ───────────────────────────────────────────────
  expenses: [
    { id: 'exp-1', name: 'Facture Sonelgaz', category: 'Électricité', amount: 48_200, date: day(14), description: 'Bimestre', mode: 'virement', account_id: B.bna, part: 'carburant', brigade_id: null, created_at: at(14) },
    { id: 'exp-2', name: 'Entretien pistolets', category: 'Entretien', amount: 12_500, date: day(8), description: 'Remplacement flexibles', mode: 'espèces', account_id: 'CAISSE_CARBURANT', part: 'carburant', brigade_id: null, created_at: at(8) },
    { id: 'exp-3', name: 'Fournitures de bureau', category: 'Fournitures', amount: 6_800, date: day(4), description: '', mode: 'espèces', account_id: 'CAISSE_MAGASIN', part: 'magasin', brigade_id: null, created_at: at(4) },
    { id: 'exp-4', name: 'Loyer du local', category: 'Loyer', amount: 90_000, date: day(28), description: 'Mensuel', mode: 'virement', account_id: B.bna, part: 'systeme', brigade_id: null, created_at: at(28) },
  ],

  inventories: [],
  daily_reports: [],
  permission_templates: [],
  activity_log: [],

  // ── Retours clients (page publique /client) ──────────────────────────────
  client_feedbacks: [
    { id: 'fb-1', part: 'fuel', rating: 5, message: 'Service rapide et personnel très aimable.', full_name: 'Réda B.', phone: '0661 00 11 22', email: '', is_read: false, created_at: at(2) },
    { id: 'fb-2', part: 'magasin', rating: 4, message: 'Bon choix de lubrifiants, mais il manquait mon filtre.', full_name: 'Hakim M.', phone: '', email: '', is_read: false, created_at: at(6) },
    { id: 'fb-3', part: 'fuel', rating: 3, message: 'Attente un peu longue le vendredi soir.', full_name: '', phone: '', email: '', is_read: true, created_at: at(15) },
  ],

  // ── Partie Magasin : le catalogue relationnel et les sessions de caisse ──
  biz_products: [],
  biz_sessions: [],

  // ── Partie Magasin : l'état complet (même blob qu'en production) ─────────
  biz_store: [{ id: 'biz-v1', rev: 1, state: buildMagasinState(), updated_at: at(0) }],
};

// ─── L'état de la partie Magasin ──────────────────────────────────────────────
/**
 * Le Magasin tient dans UN objet JSON — exactement comme en production, où il
 * vit dans la ligne `biz_store`. Les identifiants sont explicites pour que les
 * écrans de la démonstration se lisent facilement.
 */
function buildMagasinState() {
  const cat = {
    lubrifiants: { id: 'mcat-1', name: 'Lubrifiants' },
    filtration: { id: 'mcat-2', name: 'Filtration' },
    freinage: { id: 'mcat-3', name: 'Freinage' },
    accessoires: { id: 'mcat-4', name: 'Accessoires' },
  };
  const marque = {
    total: { id: 'mmrq-1', name: 'Total' },
    mann: { id: 'mmrq-2', name: 'Mann' },
    bosch: { id: 'mmrq-3', name: 'Bosch' },
  };

  const products = [
    {
      id: 'mp-1', name: 'Huile moteur 10W40 — 5 L', description: 'Semi-synthèse essence & diesel',
      barcode: '6130001112223', marqueId: marque.total.id, marqueName: 'Total',
      categoryId: cat.lubrifiants.id, categoryName: 'Lubrifiants',
      principalQty: 120, currentQty: 38, minQty: 10,
      purchasePrice: 2400, lastPurchasePrice: 2400, salePrice: 3200, unit: 'bidon',
      refs: [{ id: 'mr-1', ref: 'TOT-10W40-5', brand: 'Total' }],
      cars: [], createdAt: at(120),
    },
    {
      id: 'mp-2', name: 'Filtre à huile', description: '',
      barcode: '6130002223334', marqueId: marque.mann.id, marqueName: 'Mann',
      categoryId: cat.filtration.id, categoryName: 'Filtration',
      principalQty: 180, currentQty: 72, minQty: 15,
      purchasePrice: 620, lastPurchasePrice: 620, salePrice: 950, unit: 'unité',
      refs: [
        { id: 'mr-2', ref: 'W 75/3', brand: 'Mann' },
        { id: 'mr-3', ref: '7701 478 261', brand: 'Origine' },
      ],
      cars: [
        { id: 'mc-1', name: 'Clio 4', marque: 'Renault', year: '2012-2019', description: '1.5 dCi' },
        { id: 'mc-2', name: 'Symbol', marque: 'Renault', year: '2013-2020' },
      ],
      createdAt: at(120),
    },
    {
      id: 'mp-3', name: 'Plaquettes de frein avant', description: 'Jeu de 4',
      barcode: '6130005556667', marqueId: marque.bosch.id, marqueName: 'Bosch',
      categoryId: cat.freinage.id, categoryName: 'Freinage',
      principalQty: 60, currentQty: 14, minQty: 6,
      purchasePrice: 3100, lastPurchasePrice: 3100, salePrice: 4500, unit: 'jeu',
      refs: [{ id: 'mr-4', ref: '0 986 494 600', brand: 'Bosch' }],
      cars: [{ id: 'mc-3', name: 'Clio 4', marque: 'Renault', year: '2012-2019', gearbox: 'manuelle' }],
      createdAt: at(95),
    },
    {
      id: 'mp-4', name: 'Balai d’essuie-glace 60 cm', description: '',
      barcode: '6130006667778', marqueId: marque.bosch.id, marqueName: 'Bosch',
      categoryId: cat.accessoires.id, categoryName: 'Accessoires',
      principalQty: 60, currentQty: 5, minQty: 8,
      purchasePrice: 780, lastPurchasePrice: 780, salePrice: 1250, unit: 'unité',
      refs: [], cars: [], createdAt: at(80),
    },
    {
      id: 'mp-5', name: 'Liquide de refroidissement 5 L', description: 'Prêt à l’emploi −25 °C',
      barcode: '6130007778889', marqueId: marque.total.id, marqueName: 'Total',
      categoryId: cat.lubrifiants.id, categoryName: 'Lubrifiants',
      principalQty: 60, currentQty: 21, minQty: 5,
      purchasePrice: 900, lastPurchasePrice: 900, salePrice: 1400, unit: 'bidon',
      refs: [], cars: [], createdAt: at(60),
    },
  ];

  const clients = [
    { id: 'mcl-1', name: 'Garage El Amel', phone: '0661 77 88 99', address: 'Sétif', createdAt: at(150), openingDebt: 0, openingAdvance: 0 },
    { id: 'mcl-2', name: 'Auto-École Nour', phone: '0770 22 33 44', address: 'El Eulma', createdAt: at(110), openingDebt: 18_000, openingAdvance: 0, openingDate: day(110), openingNotes: 'Ardoise reprise du carnet', openingPayments: [{ id: 'mop-1', date: at(40), amount: 8_000, mode: 'espèces' }] },
    { id: 'mcl-3', name: 'Client de passage', phone: '', address: '', createdAt: at(200), openingDebt: 0, openingAdvance: 0 },
  ];

  const suppliers = [
    { id: 'msu-1', name: 'Lubrifiants Total Algérie', phone: '021 44 55 66', address: 'Alger', createdAt: at(200) },
    { id: 'msu-2', name: 'Distri-Pièces Est', phone: '036 77 88 99', address: 'Constantine', createdAt: at(200) },
  ];

  const roles = [
    { id: 'mrl-1', name: 'Magasinier' },
    { id: 'mrl-2', name: 'Caissier' },
  ];

  const workers = [
    {
      id: 'mw-1', name: 'Lila Cherifi', phone: '0555 12 34 56', cin: '6677889900',
      roleName: 'Caissier', paid: true, salaryType: 'mois', salaryAmount: 34_000,
      hasAccount: false, startDate: day(220), permissions: {},
      acomptes: [{ id: 'mac-1', date: day(6), amount: 4_000, description: 'Avance', paid: false }],
      absences: [],
      payments: [{ id: 'mpy-1', period: monthOf(35), amount: 34_000, date: day(32), mode: 'espèces' }],
      inventoryLiable: true, createdAt: at(220),
    },
    {
      id: 'mw-2', name: 'Bilal Zerrouki', phone: '0661 09 87 65', cin: '7788990011',
      roleName: 'Magasinier', paid: true, salaryType: 'mois', salaryAmount: 32_000,
      hasAccount: false, startDate: day(150), permissions: {},
      acomptes: [], absences: [],
      payments: [{ id: 'mpy-2', period: monthOf(35), amount: 32_000, date: day(32), mode: 'espèces' }],
      inventoryLiable: false, createdAt: at(150),
    },
  ];

  const purchases = [
    {
      id: 'mpu-1', ref: 'MAG-ACH-001', supplierId: 'msu-1', supplierName: 'Lubrifiants Total Algérie',
      items: [
        { productId: 'mp-1', productName: 'Huile moteur 10W40 — 5 L', qty: 30, unitPrice: 2400, total: 72_000, salePrice: 3200 },
        { productId: 'mp-5', productName: 'Liquide de refroidissement 5 L', qty: 25, unitPrice: 900, total: 22_500, salePrice: 1400 },
      ],
      total: 94_500, paid: 94_500, rest: 0, date: day(22), createdAt: at(22),
    },
    {
      id: 'mpu-2', ref: 'MAG-ACH-002', supplierId: 'msu-2', supplierName: 'Distri-Pièces Est',
      items: [
        { productId: 'mp-2', productName: 'Filtre à huile', qty: 60, unitPrice: 620, total: 37_200, salePrice: 950 },
        { productId: 'mp-3', productName: 'Plaquettes de frein avant', qty: 20, unitPrice: 3100, total: 62_000, salePrice: 4500 },
      ],
      total: 99_200, paid: 60_000, rest: 39_200, date: day(9), createdAt: at(9),
    },
  ];

  /**
   * Les ventes de la période. Elles sont construites à partir d'une liste
   * compacte — jour, client, panier — pour que la démonstration montre un
   * rythme crédible (plusieurs tickets par semaine) sans trois cents lignes
   * de JSON écrites à la main.
   */
  const PRICE: Record<string, { name: string; sale: number; cost: number }> = {
    'mp-1': { name: 'Huile moteur 10W40 — 5 L', sale: 3200, cost: 2400 },
    'mp-2': { name: 'Filtre à huile', sale: 950, cost: 620 },
    'mp-3': { name: 'Plaquettes de frein avant', sale: 4500, cost: 3100 },
    'mp-4': { name: 'Balai d’essuie-glace 60 cm', sale: 1250, cost: 780 },
    'mp-5': { name: 'Liquide de refroidissement 5 L', sale: 1400, cost: 900 },
  };

  type SaleSpec = {
    n: number; daysAgo: number; clientId?: string; clientName: string;
    basket: [string, number][]; reduction?: number; paidPart?: number;
  };

  const SALE_SPECS: SaleSpec[] = [
    { n: 1, daysAgo: 27, clientId: 'mcl-1', clientName: 'Garage El Amel', basket: [['mp-2', 12], ['mp-1', 8]], reduction: 1_000 },
    { n: 2, daysAgo: 25, clientName: 'Client de passage', basket: [['mp-4', 3], ['mp-5', 2]] },
    { n: 3, daysAgo: 22, clientId: 'mcl-2', clientName: 'Auto-École Nour', basket: [['mp-3', 4], ['mp-2', 6]], paidPart: 0.5 },
    { n: 4, daysAgo: 20, clientName: 'Client de passage', basket: [['mp-1', 5]] },
    { n: 5, daysAgo: 18, clientId: 'mcl-1', clientName: 'Garage El Amel', basket: [['mp-3', 6], ['mp-1', 6], ['mp-2', 10]], reduction: 2_000 },
    { n: 6, daysAgo: 15, clientName: 'Client de passage', basket: [['mp-2', 4], ['mp-5', 3]] },
    { n: 7, daysAgo: 13, clientId: 'mcl-3', clientName: 'Client de passage', basket: [['mp-4', 6]] },
    { n: 8, daysAgo: 11, clientId: 'mcl-1', clientName: 'Garage El Amel', basket: [['mp-1', 10], ['mp-2', 14]], reduction: 1_500 },
    { n: 9, daysAgo: 8, clientName: 'Client de passage', basket: [['mp-5', 4], ['mp-4', 2]] },
    { n: 10, daysAgo: 7, clientId: 'mcl-1', clientName: 'Garage El Amel', basket: [['mp-2', 8], ['mp-1', 4]], reduction: 400 },
    { n: 11, daysAgo: 5, clientId: 'mcl-2', clientName: 'Auto-École Nour', basket: [['mp-3', 3]], paidPart: 0.45 },
    { n: 12, daysAgo: 4, clientName: 'Client de passage', basket: [['mp-1', 3], ['mp-3', 2]] },
    { n: 13, daysAgo: 2, clientId: 'mcl-1', clientName: 'Garage El Amel', basket: [['mp-2', 9], ['mp-5', 5]] },
    { n: 14, daysAgo: 1, clientName: 'Client de passage', basket: [['mp-4', 4], ['mp-2', 3]] },
    { n: 15, daysAgo: 0, clientId: 'mcl-1', clientName: 'Garage El Amel', basket: [['mp-1', 2], ['mp-2', 5]] },
  ];

  const sales = SALE_SPECS.map(spec => {
    const items = spec.basket.map(([pid, qty]) => {
      const p = PRICE[pid];
      return {
        productId: pid, productName: p.name, qty,
        unitPrice: p.sale, unitCost: p.cost, total: p.sale * qty,
      };
    });
    const subtotal = items.reduce((t, i) => t + i.total, 0);
    const reduction = spec.reduction || 0;
    const total = subtotal - reduction;
    const paid = spec.paidPart !== undefined ? Math.round(total * spec.paidPart) : total;
    const rest = total - paid;
    const date = at(spec.daysAgo);
    return {
      id: `ms-${spec.n}`,
      ref: `MAG-V-${String(spec.n).padStart(4, '0')}`,
      clientId: spec.clientId,
      clientName: spec.clientName,
      items, subtotal, reduction, total, paid, rest,
      date,
      status: rest > 0 ? 'crédit' : 'payée',
      workerId: 'mw-1', workerName: 'Lila Cherifi',
      payments: paid > 0 ? [{ id: `msp-${spec.n}`, date, amount: paid, mode: 'espèces' }] : [],
    };
  });

  const expenses = [
    { id: 'mex-1', name: 'Sacs et emballages', amount: 3_200, date: day(12), description: '', mode: 'espèces', createdAt: at(12) },
    { id: 'mex-2', name: 'Transport marchandise', amount: 5_500, date: day(5), description: 'Livraison Constantine', mode: 'espèces', createdAt: at(5) },
  ];

  const caisse = [
    { id: 'mca-1', date: at(40), type: 'deposit', amount: 150_000, description: 'Fond de caisse', category: 'Fond de caisse' },
    { id: 'mca-2', date: at(3), type: 'withdraw', amount: 120_000, description: 'Versement en banque', category: 'Versement banque' },
  ];

  const destructions = [
    {
      id: 'mds-1', productId: 'mp-5', productName: 'Liquide de refroidissement 5 L',
      qty: 1, unitPrice: 900, unitCost: 900, value: 900, reason: 'Bidon percé',
      date: at(10), source: 'stock', categoryName: 'Lubrifiants', unit: 'bidon',
      createdBy: 'Lila Cherifi', recovered: false, notes: '',
    },
  ];

  return {
    magasin: {
      categories: Object.values(cat),
      marques: Object.values(marque),
      roles,
      products,
      purchases,
      sales,
      clients,
      suppliers,
      workers,
      expenses,
      caisse,
      destructions,
      sessions: [],
      inventaires: [],
      posPinned: ['product:mp-2', 'product:mp-1'],
      avgCostEnabled: false,
    },
  };
}

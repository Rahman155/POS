import { useState, useMemo, useCallback } from "react";
import {
  ShoppingCart, Plus, Minus, X, BarChart2, Package, Clock, LogOut,
  Search, TrendingUp, DollarSign, ShoppingBag, Check, Edit2, Trash2,
  PlusCircle, CreditCard, Banknote, Store, User, FileText, AlertTriangle,
  ChevronRight, Tag, Wifi, Bell, Settings, ArrowUpRight, ArrowDownRight,
  Receipt, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";

/* ─── FORMATTERS ─────────────────────────────────────────── */
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const fDate = d => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const fTime = d => new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const fShort = d => new Date(d).toLocaleDateString("id-ID", { weekday: "short" });

/* ─── INITIAL DATA ───────────────────────────────────────── */
const CATS = ["Semua", "Makanan", "Minuman", "Snack", "Lainnya"];

const INIT_PRODUCTS = [
  { id: 1, name: "Nasi Goreng Spesial", cat: "Makanan", price: 28000, stock: 50, icon: "🍳" },
  { id: 2, name: "Mie Goreng Ayam", cat: "Makanan", price: 22000, stock: 50, icon: "🍜" },
  { id: 3, name: "Ayam Bakar", cat: "Makanan", price: 35000, stock: 30, icon: "🍗" },
  { id: 4, name: "Nasi Uduk", cat: "Makanan", price: 20000, stock: 40, icon: "🍚" },
  { id: 5, name: "Es Teh Manis", cat: "Minuman", price: 8000, stock: 100, icon: "🧋" },
  { id: 6, name: "Kopi Hitam", cat: "Minuman", price: 12000, stock: 80, icon: "☕" },
  { id: 7, name: "Es Jeruk", cat: "Minuman", price: 10000, stock: 80, icon: "🍊" },
  { id: 8, name: "Air Mineral", cat: "Minuman", price: 5000, stock: 200, icon: "💧" },
  { id: 9, name: "Jus Alpukat", cat: "Minuman", price: 18000, stock: 40, icon: "🥑" },
  { id: 10, name: "Keripik Singkong", cat: "Snack", price: 12000, stock: 60, icon: "🥔" },
  { id: 11, name: "Kacang Kulit", cat: "Snack", price: 8000, stock: 70, icon: "🥜" },
  { id: 12, name: "Pisang Goreng", cat: "Snack", price: 15000, stock: 40, icon: "🍌" },
  { id: 13, name: "Tahu Crispy", cat: "Snack", price: 10000, stock: 50, icon: "⭐" },
  { id: 14, name: "Rokok Surya 12", cat: "Lainnya", price: 28000, stock: 100, icon: "📦" },
  { id: 15, name: "Pulsa 10.000", cat: "Lainnya", price: 11000, stock: 999, icon: "📱" },
];

const genSales = () => {
  const s = []; let id = 1000;
  for (let d = 29; d >= 0; d--) {
    const base = new Date(); base.setDate(base.getDate() - d);
    const n = 4 + Math.floor(Math.random() * 9);
    for (let t = 0; t < n; t++) {
      const txDate = new Date(base);
      txDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
      const itemCnt = 1 + Math.floor(Math.random() * 4);
      const items = [];
      for (let i = 0; i < itemCnt; i++) {
        const p = INIT_PRODUCTS[Math.floor(Math.random() * INIT_PRODUCTS.length)];
        const qty = 1 + Math.floor(Math.random() * 3);
        items.push({ pid: p.id, name: p.name, price: p.price, qty, sub: p.price * qty });
      }
      const total = items.reduce((a, i) => a + i.sub, 0);
      s.push({
        id: id++,
        date: new Date(txDate).toISOString(),
        items, total,
        method: ["Tunai", "Kartu", "QRIS"][Math.floor(Math.random() * 3)],
        cashier: Math.random() > 0.5 ? "Budi" : "Sari",
      });
    }
  }
  return s.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/* ─── THEME ──────────────────────────────────────────────── */
const T = {
  bg: "#0b0e17", surf: "#141824", surf2: "#1e2436",
  border: "#2a3050", text: "#e4e9f5", muted: "#6b7db3",
  accent: "#4f8ef7", green: "#22c55e", yellow: "#f59e0b",
  red: "#ef4444", purple: "#a78bfa", teal: "#2dd4bf",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 5px; height: 5px; background: #141824; }
  ::-webkit-scrollbar-thumb { background: #2a3050; border-radius: 3px; }
  .prod-card:hover { border-color: #4f8ef7 !important; transform: translateY(-1px); }
  .nav-btn:hover { background: rgba(79,142,247,0.12) !important; color: #e4e9f5 !important; }
  .row-hover:hover { background: #1e2436 !important; }
  .btn-hover:hover { opacity: 0.85; }
  input:focus, select:focus { outline: none; border-color: #4f8ef7 !important; box-shadow: 0 0 0 3px rgba(79,142,247,0.15); }
  .pill-btn:hover { border-color: #4f8ef7 !important; }
`;

/* ─── STYLE HELPERS ──────────────────────────────────────── */
const S = {
  card: (extra = {}) => ({
    background: T.surf, border: `1px solid ${T.border}`,
    borderRadius: 12, ...extra
  }),
  btn: (bg, color, extra = {}) => ({
    background: bg, color, border: "none", borderRadius: 8,
    cursor: "pointer", fontFamily: "Sora", fontWeight: 600,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all .18s", ...extra
  }),
  outlineBtn: (extra = {}) => ({
    background: "transparent", color: T.muted,
    border: `1px solid ${T.border}`, borderRadius: 8,
    cursor: "pointer", fontFamily: "Sora", fontWeight: 600,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all .18s", ...extra
  }),
  input: (extra = {}) => ({
    background: T.surf2, color: T.text, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "10px 12px", fontFamily: "Sora",
    fontSize: 14, transition: "border .18s", ...extra
  }),
  pill: (active, extra = {}) => ({
    padding: "6px 14px", borderRadius: 20,
    border: `1px solid ${active ? T.accent : T.border}`,
    background: active ? `${T.accent}22` : "transparent",
    color: active ? T.accent : T.muted, cursor: "pointer",
    fontFamily: "Sora", fontWeight: 600, fontSize: 12,
    transition: "all .18s", whiteSpace: "nowrap", ...extra
  }),
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, backdropFilter: "blur(6px)",
  },
  modal: (extra = {}) => ({
    background: T.surf, border: `1px solid ${T.border}`,
    borderRadius: 16, padding: 28, width: "90%",
    maxHeight: "90vh", overflowY: "auto", ...extra
  }),
  iconBtn: (clr, extra = {}) => ({
    background: T.surf2, color: clr || T.muted,
    border: `1px solid ${T.border}`, borderRadius: 6,
    cursor: "pointer", padding: "6px",
    display: "inline-flex", alignItems: "center", transition: "all .18s", ...extra
  }),
};

/* ─── CUSTOM TOOLTIP ─────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontFamily: "Sora", fontSize: 12 }}>
      <p style={{ color: T.muted, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {prefix}{typeof p.value === "number" && prefix === "Rp " ? rp(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function POSku() {
  /* State */
  const [role, setRole] = useState(null);
  const [prods, setProds] = useState(INIT_PRODUCTS);
  const [sales, setSales] = useState(() => genSales());
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Semua");
  const [tab, setTab] = useState("dashboard");
  const [salesFilter, setSalesFilter] = useState("all");

  /* Modals */
  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("Tunai");
  const [cash, setCash] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [prodModal, setProdModal] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [form, setForm] = useState({ name: "", cat: "Makanan", price: "", stock: "", icon: "🛍️" });
  const [expandedTx, setExpandedTx] = useState(null);

  /* Cart helpers */
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const change = cash ? parseInt(cash) - cartTotal : 0;

  const addItem = useCallback((p) => {
    if (p.stock <= 0) return;
    setCart(c => {
      const e = c.find(i => i.id === p.id);
      return e ? c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...p, qty: 1 }];
    });
  }, []);

  const updQty = useCallback((id, d) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
  }, []);

  const doPayment = () => {
    const tx = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart.map(i => ({ pid: i.id, name: i.name, price: i.price, qty: i.qty, sub: i.price * i.qty })),
      total: cartTotal, method: payMethod, cashier: "Kasir",
      cashPaid: payMethod === "Tunai" ? (parseInt(cash) || cartTotal) : cartTotal,
    };
    setSales(s => [tx, ...s]);
    setProds(p => p.map(pr => {
      const ci = cart.find(i => i.id === pr.id);
      return ci ? { ...pr, stock: Math.max(0, pr.stock - ci.qty) } : pr;
    }));
    setReceipt(tx);
    setCart([]);
    setPayOpen(false);
    setCash("");
  };

  /* Filtered products */
  const filtered = useMemo(() => prods.filter(p => {
    const mc = cat === "Semua" || p.cat === cat;
    const ms = p.name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  }), [prods, cat, search]);

  /* Analytics */
  const todayStr = new Date().toDateString();
  const todaySales = useMemo(() => sales.filter(s => new Date(s.date).toDateString() === todayStr), [sales]);
  const todayRev = useMemo(() => todaySales.reduce((s, t) => s + t.total, 0), [todaySales]);
  const totalRev = useMemo(() => sales.reduce((s, t) => s + t.total, 0), [sales]);
  const avgTx = useMemo(() => sales.length ? Math.round(totalRev / sales.length) : 0, [sales, totalRev]);

  const weekData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    const day = sales.filter(s => new Date(s.date).toDateString() === ds);
    return {
      name: fShort(d),
      Pendapatan: day.reduce((a, t) => a + t.total, 0),
      Transaksi: day.length,
    };
  }), [sales]);

  const monthData = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const ds = d.toDateString();
    const day = sales.filter(s => new Date(s.date).toDateString() === ds);
    return {
      name: d.getDate(),
      Pendapatan: day.reduce((a, t) => a + t.total, 0),
    };
  }), [sales]);

  const topProds = useMemo(() => {
    const mp = {};
    sales.forEach(tx => tx.items.forEach(i => { mp[i.name] = (mp[i.name] || 0) + i.qty; }));
    return Object.entries(mp).sort((a, b) => b[1] - a[1]).slice(0, 6)
      .map(([name, qty]) => ({ name: name.length > 14 ? name.slice(0, 14) + "…" : name, qty }));
  }, [sales]);

  const paymentPie = useMemo(() => {
    const m = {};
    sales.forEach(s => { m[s.method] = (m[s.method] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const filtSales = useMemo(() => {
    if (salesFilter === "today") return sales.filter(s => new Date(s.date).toDateString() === todayStr);
    if (salesFilter === "week") {
      const wa = new Date(); wa.setDate(wa.getDate() - 7);
      return sales.filter(s => new Date(s.date) >= wa);
    }
    return sales;
  }, [sales, salesFilter]);

  const lowStock = useMemo(() => prods.filter(p => p.stock <= 15), [prods]);

  /* Product CRUD */
  const openAdd = () => {
    setEditProd(null);
    setForm({ name: "", cat: "Makanan", price: "", stock: "", icon: "🛍️" });
    setProdModal(true);
  };
  const openEdit = (p) => {
    setEditProd(p);
    setForm({ name: p.name, cat: p.cat, price: String(p.price), stock: String(p.stock), icon: p.icon });
    setProdModal(true);
  };
  const saveProd = () => {
    if (!form.name || !form.price) return;
    if (editProd) {
      setProds(p => p.map(x => x.id === editProd.id
        ? { ...x, ...form, price: parseInt(form.price), stock: parseInt(form.stock) } : x));
    } else {
      setProds(p => [...p, { ...form, id: Date.now(), price: parseInt(form.price), stock: parseInt(form.stock) }]);
    }
    setProdModal(false);
  };
  const delProd = (id) => {
    if (window.confirm("Hapus produk ini?")) setProds(p => p.filter(x => x.id !== id));
  };

  /* ─── LOGIN SCREEN ─────────────────────────────────────── */
  if (!role) return (
    <div style={{ fontFamily: "Sora", background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: T.text }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 440, padding: 24 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `${T.accent}22`, border: `2px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>🏪</div>
          <h1 style={{ fontFamily: "Sora", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>POSku</h1>
          <p style={{ color: T.muted, fontSize: 14, marginTop: 6 }}>Sistem Kasir Modern & Monitoring Bisnis</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button className="btn-hover" onClick={() => setRole("cashier")}
            style={{ ...S.btn(T.accent, "#fff", { padding: "18px 24px", fontSize: 15, gap: 12, borderRadius: 12 }) }}>
            <ShoppingBag size={20} />
            <div style={{ textAlign: "left" }}>
              <div>Masuk sebagai Kasir</div>
              <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8, marginTop: 2 }}>Proses transaksi penjualan</div>
            </div>
            <ChevronRight size={18} style={{ marginLeft: "auto" }} />
          </button>

          <button className="btn-hover" onClick={() => setRole("owner")}
            style={{ ...S.btn("transparent", T.text, { padding: "18px 24px", fontSize: 15, gap: 12, borderRadius: 12, border: `1px solid ${T.border}` }) }}>
            <BarChart2 size={20} color={T.green} />
            <div style={{ textAlign: "left" }}>
              <div>Masuk sebagai Owner</div>
              <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.6, marginTop: 2 }}>Monitoring & kelola bisnis</div>
            </div>
            <ChevronRight size={18} style={{ marginLeft: "auto", opacity: 0.5 }} />
          </button>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 24 }}>
          {[["30", "Hari Data"], [String(INIT_PRODUCTS.length), "Produk"], [String(sales?.length || "0"), "Transaksi"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 600, color: T.accent }}>{v}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: T.muted, fontSize: 11, marginTop: 32 }}>
          ✓ PWA Ready · ✓ Offline Support · ✓ Multi Pembayaran
        </p>
      </div>
    </div>
  );

  /* ─── CASHIER VIEW ─────────────────────────────────────── */
  if (role === "cashier") return (
    <div style={{ fontFamily: "Sora", background: T.bg, minHeight: "100vh", color: T.text, display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ background: T.surf, borderBottom: `1px solid ${T.border}`, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${T.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.3 }}>POSku</div>
            <div style={{ color: T.muted, fontSize: 11 }}>Mode Kasir</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ color: T.muted, fontSize: 12 }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div style={{ width: 1, height: 20, background: T.border }} />
          <div style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>● Online</div>
          <button className="btn-hover" onClick={() => setRole(null)}
            style={{ ...S.btn("transparent", T.muted, { border: `1px solid ${T.border}`, padding: "7px 14px", fontSize: 12, gap: 6 }) }}>
            <LogOut size={13} />Keluar
          </button>
        </div>
      </div>

      {/* Main body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 57px)" }}>

        {/* Products Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, background: T.surf }}>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..."
                style={{ ...S.input({ paddingLeft: 34, width: "100%", fontSize: 13 }) }} />
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} className="pill-btn" style={S.pill(cat === c)}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: T.muted, marginTop: 60 }}>
                <Search size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
                <p>Produk tidak ditemukan</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 10 }}>
                {filtered.map(p => {
                  const inCart = cart.find(i => i.id === p.id);
                  return (
                    <button key={p.id} onClick={() => addItem(p)} className="prod-card"
                      style={{
                        ...S.card({ padding: 14, cursor: p.stock <= 0 ? "not-allowed" : "pointer", textAlign: "left", position: "relative", transition: "all .18s", opacity: p.stock <= 0 ? 0.5 : 1, background: inCart ? `${T.accent}11` : T.surf, borderColor: inCart ? `${T.accent}44` : T.border, width: "100%", fontFamily: "Sora" })
                      }}>
                      {inCart && (
                        <div style={{ position: "absolute", top: 8, right: 8, background: T.accent, color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                          {inCart.qty}
                        </div>
                      )}
                      <div style={{ fontSize: 34, marginBottom: 8 }}>{p.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, lineHeight: 1.3, color: T.text }}>{p.name}</div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 600, color: T.accent }}>{rp(p.price)}</div>
                      <div style={{ fontSize: 10, color: p.stock <= 5 ? T.red : T.muted, marginTop: 4 }}>
                        {p.stock <= 0 ? "HABIS" : `Stok: ${p.stock}`}
                      </div>
                      {p.stock <= 0 && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.red, fontWeight: 700 }}>STOK HABIS</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart Panel */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", background: T.surf, borderLeft: `1px solid ${T.border}` }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCart size={17} color={T.accent} />Keranjang
              {cartCount > 0 && (
                <span style={{ background: T.accent, color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{cartCount}</span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={{ color: T.red, fontSize: 12, background: "none", border: "none", cursor: "pointer", fontFamily: "Sora" }}>Kosongkan</button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", color: T.muted, marginTop: 60 }}>
                <ShoppingCart size={44} style={{ marginBottom: 12, opacity: 0.2 }} />
                <p style={{ fontSize: 13 }}>Keranjang masih kosong</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Pilih produk dari menu kiri</p>
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "10px 12px", background: T.surf2, borderRadius: 10 }}>
                <div style={{ fontSize: 26 }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: T.accent, marginTop: 1 }}>{rp(item.price)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <button onClick={() => updQty(item.id, -1)} style={{ background: T.surf, color: T.text, border: `1px solid ${T.border}`, borderRadius: 6, cursor: "pointer", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 700, width: 22, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updQty(item.id, 1)} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart footer */}
          <div style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 4 }}>
              <span>{cartCount} item</span>
              <span style={{ fontFamily: "JetBrains Mono" }}>{rp(cartTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
              <span>Total</span>
              <span style={{ fontFamily: "JetBrains Mono", color: T.accent }}>{rp(cartTotal)}</span>
            </div>
            <button className="btn-hover" onClick={() => cart.length > 0 && setPayOpen(true)}
              style={{ ...S.btn(cart.length > 0 ? T.green : T.surf2, cart.length > 0 ? "#fff" : T.muted, { width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, gap: 8, borderRadius: 10, cursor: cart.length > 0 ? "pointer" : "not-allowed" }) }}>
              <CreditCard size={17} />
              {cart.length > 0 ? "Bayar Sekarang" : "Keranjang Kosong"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ─────────────────────── */}
      {payOpen && (
        <div style={S.overlay} onClick={() => setPayOpen(false)}>
          <div style={{ ...S.modal({ maxWidth: 440 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Pembayaran</h3>
              <button onClick={() => setPayOpen(false)} style={S.iconBtn()}><X size={18} /></button>
            </div>

            {/* Method */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Metode Pembayaran</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["Tunai", <Banknote size={18} />], ["Kartu", <CreditCard size={18} />], ["QRIS", <Store size={18} />]].map(([m, icon]) => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${payMethod === m ? T.accent : T.border}`, background: payMethod === m ? `${T.accent}18` : "transparent", color: payMethod === m ? T.accent : T.muted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, transition: "all .18s", fontFamily: "Sora" }}>
                    {icon}{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash input */}
            {payMethod === "Tunai" && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Uang Diterima</div>
                <input type="number" value={cash} onChange={e => setCash(e.target.value)}
                  placeholder="Masukkan jumlah uang..."
                  style={{ ...S.input({ width: "100%", fontFamily: "JetBrains Mono", fontSize: 18, fontWeight: 600 }) }} />
                {cash && (
                  <div style={{ marginTop: 10, padding: "12px 14px", background: T.surf2, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: T.muted }}>Kembalian</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: 700, color: change >= 0 ? T.green : T.red }}>
                      {change >= 0 ? rp(change) : "Kurang " + rp(-change)}
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {[50000, 100000, 50000 * Math.ceil(cartTotal / 50000)].filter((v, i, a) => a.indexOf(v) === i && v >= cartTotal).slice(0, 4).map(v => (
                    <button key={v} onClick={() => setCash(String(v))}
                      style={{ fontSize: 11, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.surf2, color: T.muted, cursor: "pointer", fontFamily: "JetBrains Mono" }}>
                      {rp(v)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div style={{ padding: "14px 16px", background: T.surf2, borderRadius: 12, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: T.muted, marginBottom: 2 }}>Total Tagihan</div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: 26, fontWeight: 700, color: T.accent }}>{rp(cartTotal)}</div>
              </div>
              <div style={{ fontSize: 12, color: T.muted, textAlign: "right" }}>
                <div>{cartCount} item</div>
                <div style={{ marginTop: 2 }}>{payMethod}</div>
              </div>
            </div>

            <button className="btn-hover" onClick={doPayment}
              disabled={payMethod === "Tunai" && cash && change < 0}
              style={{ ...S.btn(T.green, "#fff", { width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, gap: 8, borderRadius: 10, opacity: (payMethod === "Tunai" && cash && change < 0) ? 0.5 : 1 }) }}>
              <Check size={18} />Konfirmasi Pembayaran
            </button>
          </div>
        </div>
      )}

      {/* ── Receipt Modal ─────────────────────── */}
      {receipt && (
        <div style={S.overlay} onClick={() => setReceipt(null)}>
          <div style={{ ...S.modal({ maxWidth: 380 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${T.green}22`, border: `2px solid ${T.green}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.green }}>Pembayaran Berhasil!</h3>
              <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Terima kasih sudah berbelanja</p>
            </div>

            <div style={{ borderTop: `1px dashed ${T.border}`, borderBottom: `1px dashed ${T.border}`, padding: "14px 0", margin: "0 0 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: T.muted }}>No. Transaksi</span>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: 11 }}>#{receipt.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 12 }}>
                <span style={{ color: T.muted }}>Waktu</span>
                <span style={{ fontSize: 11 }}>{fDate(receipt.date)} {fTime(receipt.date)}</span>
              </div>
              {receipt.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: T.text }}>{item.name} <span style={{ color: T.muted }}>×{item.qty}</span></span>
                  <span style={{ fontFamily: "JetBrains Mono" }}>{rp(item.sub)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              <span>Total</span>
              <span style={{ fontFamily: "JetBrains Mono", color: T.accent }}>{rp(receipt.total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.muted, marginBottom: 4 }}>
              <span>Metode</span><span>{receipt.method}</span>
            </div>
            {receipt.method === "Tunai" && receipt.cashPaid > receipt.total && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 16 }}>
                <span style={{ color: T.muted }}>Kembalian</span>
                <span style={{ fontFamily: "JetBrains Mono", color: T.green, fontWeight: 600 }}>{rp(receipt.cashPaid - receipt.total)}</span>
              </div>
            )}
            <button className="btn-hover" onClick={() => setReceipt(null)}
              style={{ ...S.btn(T.accent, "#fff", { width: "100%", padding: "13px", marginTop: 8, fontWeight: 700, borderRadius: 10 }) }}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ─── OWNER VIEW ───────────────────────────────────────── */
  return (
    <div style={{ fontFamily: "Sora", background: T.bg, minHeight: "100vh", color: T.text, display: "flex" }}>
      <style>{css}</style>

      {/* Sidebar */}
      <div style={{ width: 230, background: T.surf, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "20px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "0 6px" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${T.green}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>POSku</div>
            <div style={{ color: T.green, fontSize: 11, fontWeight: 600 }}>● Owner Mode</div>
          </div>
        </div>

        <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: 1, padding: "0 8px", marginBottom: 8, textTransform: "uppercase" }}>Menu</div>
        {[
          { id: "dashboard", icon: <BarChart2 size={17} />, label: "Dashboard" },
          { id: "products", icon: <Package size={17} />, label: "Produk" },
          { id: "history", icon: <Clock size={17} />, label: "Riwayat Transaksi" },
        ].map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} className="nav-btn"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 3, border: "none", cursor: "pointer", background: tab === item.id ? `${T.accent}22` : "transparent", color: tab === item.id ? T.accent : T.muted, fontFamily: "Sora", fontWeight: 600, fontSize: 13, transition: "all .18s" }}>
            {item.icon}{item.label}
            {item.id === "products" && lowStock.length > 0 && (
              <span style={{ marginLeft: "auto", background: T.red, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{lowStock.length}</span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, marginTop: 8 }}>
          <button className="nav-btn" onClick={() => setRole(null)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: T.muted, fontFamily: "Sora", fontWeight: 600, fontSize: 13, width: "100%" }}>
            <LogOut size={17} />Keluar
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>

        {/* ─── DASHBOARD ─────────────────────── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Dashboard</h2>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 3 }}>
                  {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div style={{ fontSize: 12, color: T.muted }}>Update: {fTime(new Date().toISOString())}</div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Pendapatan Hari Ini", value: rp(todayRev), icon: "💰", color: T.green, sub: `${todaySales.length} transaksi`, trend: "+12%" },
                { label: "Total Pendapatan (30h)", value: rp(totalRev), icon: "📈", color: T.accent, sub: `${sales.length} transaksi`, trend: "+8%" },
                { label: "Rata-rata per Transaksi", value: rp(avgTx), icon: "🎯", color: T.yellow, sub: "nilai rata-rata", trend: "+3%" },
                { label: "Stok Menipis", value: `${lowStock.length} produk`, icon: "⚠️", color: T.red, sub: "perlu restock segera", trend: "" },
              ].map((s, i) => (
                <div key={i} style={{ ...S.card({ padding: 18 }) }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: T.muted, fontWeight: 500, lineHeight: 1.4 }}>{s.label}</div>
                    <div style={{ fontSize: 22 }}>{s.icon}</div>
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.value}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: T.muted }}>{s.sub}</span>
                    {s.trend && <span style={{ fontSize: 11, color: T.green, fontWeight: 600 }}>{s.trend}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ ...S.card({ padding: 20 }) }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Pendapatan 30 Hari Terakhir</h3>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Tren penjualan bulanan</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.accent} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                    <Tooltip content={<ChartTooltip prefix="Rp " />} />
                    <Area type="monotone" dataKey="Pendapatan" stroke={T.accent} strokeWidth={2} fill="url(#colorRev)" dot={false} activeDot={{ r: 5, fill: T.accent }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ ...S.card({ padding: 20 }) }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Metode Pembayaran</h3>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Distribusi 30 hari</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={paymentPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {paymentPie.map((entry, i) => (
                        <Cell key={i} fill={[T.green, T.accent, T.purple][i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} tx`, "Transaksi"]} contentStyle={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: "Sora", fontSize: 12 }} />
                    <Legend iconSize={8} formatter={(v) => <span style={{ color: T.muted, fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ ...S.card({ padding: 20 }) }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Transaksi 7 Hari Terakhir</h3>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Jumlah transaksi harian</p>
                </div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={weekData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="name" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Transaksi" fill={T.yellow} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ ...S.card({ padding: 20 }) }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Produk Terlaris</h3>
                  <p style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Berdasarkan qty terjual</p>
                </div>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={topProds} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
                    <XAxis type="number" tick={{ fill: T.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: T.text, fontSize: 10 }} width={85} axisLine={false} tickLine={false} />
                    <Tooltip formatter={v => [`${v} pcs`, "Terjual"]} contentStyle={{ background: T.surf2, border: `1px solid ${T.border}`, borderRadius: 8, fontFamily: "Sora", fontSize: 12 }} />
                    <Bar dataKey="qty" fill={T.teal} radius={[0, 4, 4, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Low stock warning */}
            {lowStock.length > 0 && (
              <div style={{ ...S.card({ padding: 16, marginTop: 16, borderColor: `${T.yellow}44`, background: `${T.yellow}08` }) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={16} color={T.yellow} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.yellow }}>Peringatan Stok Menipis</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lowStock.map(p => (
                    <div key={p.id} style={{ fontSize: 12, padding: "5px 12px", background: T.surf2, borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{p.icon}</span>
                      <span style={{ color: T.text }}>{p.name}</span>
                      <span style={{ fontFamily: "JetBrains Mono", color: p.stock <= 5 ? T.red : T.yellow, fontWeight: 600 }}>{p.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PRODUCTS ──────────────────────── */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Manajemen Produk</h2>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 3 }}>{prods.length} produk terdaftar</p>
              </div>
              <button className="btn-hover" onClick={openAdd}
                style={{ ...S.btn(T.accent, "#fff", { padding: "10px 18px", fontSize: 13, gap: 7, borderRadius: 9 }) }}>
                <PlusCircle size={15} />Tambah Produk
              </button>
            </div>

            {/* Category summary */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {CATS.filter(c => c !== "Semua").map(c => {
                const n = prods.filter(p => p.cat === c).length;
                return (
                  <div key={c} style={{ ...S.card({ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }) }}>
                    <span style={{ fontSize: 12, color: T.muted }}>{c}</span>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 600, color: T.accent }}>{n}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ ...S.card({ overflow: "hidden" }) }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["#", "Produk", "Kategori", "Harga", "Stok", "Status", "Aksi"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.muted, fontFamily: "Sora", letterSpacing: 0.3 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prods.map((p, idx) => (
                    <tr key={p.id} className="row-hover" style={{ borderBottom: `1px solid ${T.border}`, transition: "background .15s" }}>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: T.muted, fontFamily: "JetBrains Mono" }}>{idx + 1}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{p.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: T.surf2, color: T.muted, fontWeight: 600 }}>{p.cat}</span>
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: "JetBrains Mono", fontSize: 12, color: T.accent }}>{rp(p.price)}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 700, color: p.stock <= 5 ? T.red : p.stock <= 15 ? T.yellow : T.green }}>{p.stock}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: p.stock <= 0 ? `${T.red}22` : p.stock <= 15 ? `${T.yellow}22` : `${T.green}22`, color: p.stock <= 0 ? T.red : p.stock <= 15 ? T.yellow : T.green }}>
                          {p.stock <= 0 ? "Habis" : p.stock <= 15 ? "Menipis" : "Tersedia"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={S.iconBtn(T.accent)}><Edit2 size={14} /></button>
                          <button onClick={() => delProd(p.id)} style={S.iconBtn(T.red)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── HISTORY ───────────────────────── */}
        {tab === "history" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Riwayat Transaksi</h2>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 3 }}>{filtSales.length} transaksi ditemukan</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["all", "Semua"], ["today", "Hari Ini"], ["week", "7 Hari"]].map(([v, l]) => (
                  <button key={v} onClick={() => setSalesFilter(v)}
                    style={S.pill(salesFilter === v, { fontSize: 12, padding: "7px 14px" })}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Transaksi", value: filtSales.length, color: T.accent, mono: true },
                { label: "Total Pendapatan", value: rp(filtSales.reduce((s, t) => s + t.total, 0)), color: T.green, mono: true },
                { label: "Rata-rata", value: rp(filtSales.length ? Math.round(filtSales.reduce((s, t) => s + t.total, 0) / filtSales.length) : 0), color: T.yellow, mono: true },
                { label: "Pembayaran Tunai", value: filtSales.filter(s => s.method === "Tunai").length + " tx", color: T.purple, mono: false },
              ].map((s, i) => (
                <div key={i} style={{ ...S.card({ padding: 14 }) }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtSales.slice(0, 60).map(tx => (
                <div key={tx.id} style={{ ...S.card({ padding: 0, overflow: "hidden", cursor: "pointer" }) }}
                  onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${T.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧾</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fDate(tx.date)} · {fTime(tx.date)}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                        Kasir: {tx.cashier} · {tx.items.length} item
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: 15, fontWeight: 700, color: T.green }}>{rp(tx.total)}</div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, marginTop: 3, display: "inline-block", background: tx.method === "Tunai" ? `${T.green}22` : tx.method === "Kartu" ? `${T.accent}22` : `${T.purple}22`, color: tx.method === "Tunai" ? T.green : tx.method === "Kartu" ? T.accent : T.purple }}>
                        {tx.method}
                      </span>
                    </div>
                    <ChevronRight size={16} color={T.muted} style={{ transform: expandedTx === tx.id ? "rotate(90deg)" : "none", transition: "transform .2s", flexShrink: 0 }} />
                  </div>
                  {expandedTx === tx.id && (
                    <div style={{ borderTop: `1px solid ${T.border}`, padding: "10px 16px", background: T.surf2 }}>
                      {tx.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: i < tx.items.length - 1 ? `1px solid ${T.border}` : "none" }}>
                          <span style={{ color: T.muted }}>{item.name} <span style={{ color: T.text }}>×{item.qty}</span></span>
                          <span style={{ fontFamily: "JetBrains Mono", color: T.text }}>{rp(item.sub)}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: 700, color: T.green }}>
                        <span>Total</span>
                        <span style={{ fontFamily: "JetBrains Mono" }}>{rp(tx.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtSales.length > 60 && (
                <div style={{ textAlign: "center", color: T.muted, fontSize: 12, padding: 12 }}>
                  Menampilkan 60 dari {filtSales.length} transaksi
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Product Modal ─────────────────────── */}
      {prodModal && (
        <div style={S.overlay} onClick={() => setProdModal(false)}>
          <div style={{ ...S.modal({ maxWidth: 440 }) }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>{editProd ? "Edit Produk" : "Tambah Produk Baru"}</h3>
              <button onClick={() => setProdModal(false)} style={S.iconBtn()}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: T.muted, marginBottom: 7, display: "block", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Nama Produk</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama produk..." style={{ ...S.input({ width: "100%" }) }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: T.muted, marginBottom: 7, display: "block", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Kategori</label>
                  <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}
                    style={{ ...S.input({ width: "100%" }) }}>
                    {["Makanan", "Minuman", "Snack", "Lainnya"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.muted, marginBottom: 7, display: "block", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Ikon Emoji</label>
                  <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
                    style={{ ...S.input({ width: "100%", fontSize: 22, textAlign: "center" }) }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: T.muted, marginBottom: 7, display: "block", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Harga (Rp)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    placeholder="0" style={{ ...S.input({ width: "100%", fontFamily: "JetBrains Mono", fontSize: 15 }) }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: T.muted, marginBottom: 7, display: "block", fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase" }}>Stok Awal</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="0" style={{ ...S.input({ width: "100%", fontFamily: "JetBrains Mono", fontSize: 15 }) }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btn-hover" onClick={() => setProdModal(false)} style={{ ...S.outlineBtn({ flex: 1, padding: "12px", fontSize: 13, borderRadius: 9 }) }}>Batal</button>
              <button className="btn-hover" onClick={saveProd} style={{ ...S.btn(T.accent, "#fff", { flex: 2, padding: "12px", fontWeight: 700, gap: 7, borderRadius: 9 }) }}>
                <Check size={16} />{editProd ? "Simpan Perubahan" : "Tambah Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from "react";

const CATEGORIES = ["食品・調味料", "日用品", "掃除用品", "衛生用品", "文房具", "その他"];
const UNITS = ["個", "本", "袋", "箱", "缶", "枚", "ロール", "パック", "セット"];

const SAMPLE_DATA = [
  { id: 1, name: "しょうゆ", category: "食品・調味料", quantity: 2, unit: "本", purchaseDate: "2026-02-20", store: "イトーヨーカドー", price: 298, memo: "" },
  { id: 2, name: "シャンプー", category: "衛生用品", quantity: 1, unit: "本", purchaseDate: "2026-02-15", store: "マツキヨ", price: 680, memo: "" },
  { id: 3, name: "トイレットペーパー", category: "日用品", quantity: 8, unit: "ロール", purchaseDate: "2026-02-10", store: "コストコ", price: 1980, memo: "12ロール入り" },
];

const CAT_COLOR = {
  "食品・調味料": { bg: "#e8f5e9", dot: "#4caf50" },
  "日用品":       { bg: "#e3f2fd", dot: "#2196f3" },
  "掃除用品":     { bg: "#fff3e0", dot: "#ff9800" },
  "衛生用品":     { bg: "#fce4ec", dot: "#e91e63" },
  "文房具":       { bg: "#f3e5f5", dot: "#9c27b0" },
  "その他":       { bg: "#f5f5f5", dot: "#9e9e9e" },
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function daysLeft(deletedAt) {
  const diff = ONE_WEEK_MS - (Date.now() - deletedAt);
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export default function App() {
  const [items, setItems] = useState(SAMPLE_DATA);
  const [trash, setTrash] = useState([]);
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("すべて");
  const [sortBy, setSortBy] = useState("name");
  const [nextId, setNextId] = useState(10);
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);
  const blank = { name: "", category: "食品・調味料", quantity: 1, unit: "個", purchaseDate: new Date().toISOString().split("T")[0], store: "", price: "", memo: "" };
  const [form, setForm] = useState(blank);

  const activeTrash = trash.filter(i => Date.now() - i.deletedAt < ONE_WEEK_MS);

  const filtered = useMemo(() => {
    let list = items.filter(i =>
      (i.name.includes(search) || i.store.includes(search) || i.memo.includes(search)) &&
      (filterCat === "すべて" || i.category === filterCat)
    );
    list.sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name, "ja") :
      sortBy === "date" ? new Date(b.purchaseDate) - new Date(a.purchaseDate) :
      b.price - a.price
    );
    return list;
  }, [items, search, filterCat, sortBy]);

  const openAdd = () => { setEditItem(null); setForm(blank); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowForm(true); };

  const save = () => {
    if (!form.name.trim()) return;
    const data = { ...form, price: Number(form.price) || 0, quantity: Number(form.quantity) || 1 };
    if (editItem) {
      setItems(prev => prev.map(i => i.id === editItem.id ? { ...data, id: editItem.id } : i));
    } else {
      setItems(prev => [...prev, { ...data, id: nextId }]);
      setNextId(n => n + 1);
    }
    setShowForm(false);
  };

  const moveToTrash = (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setTrash(prev => [...prev.filter(i => Date.now() - i.deletedAt < ONE_WEEK_MS), { ...item, deletedAt: Date.now() }]);
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const restore = (id) => {
    const item = activeTrash.find(i => i.id === id);
    if (item) {
      const { deletedAt, ...rest } = item;
      setItems(prev => [...prev, rest]);
      setTrash(prev => prev.filter(i => i.id !== id));
    }
  };

  const deletePermanently = (id) => setTrash(prev => prev.filter(i => i.id !== id));
  const emptyTrash = () => { setTrash([]); setShowConfirmEmpty(false); };
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ fontFamily: "-apple-system, 'Hiragino Sans', 'Noto Sans JP', sans-serif", background: "#f2f2f7", minHeight: "100vh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .hdr { background: ${view === "trash" ? "#8e2222" : "#2d6a4f"}; padding: 12px 16px 0; transition: background 0.3s; flex-shrink: 0; }
        .hdr-inner { padding-bottom: 16px; }
        .card { background: white; border-radius: 14px; margin-bottom: 10px; overflow: hidden; }
        .card:active { opacity: 0.85; }
        .inp { background: #f2f2f7; border: none; border-radius: 10px; padding: 12px 14px; font-size: 16px; font-family: inherit; width: 100%; outline: none; -webkit-appearance: none; }
        .inp:focus { background: #e8e8ed; }
        .sel { background: #f2f2f7; border: none; border-radius: 10px; padding: 12px 14px; font-size: 16px; font-family: inherit; width: 100%; outline: none; -webkit-appearance: none; appearance: none; }
        .btn-add { background: white; color: ${view === "trash" ? "#8e2222" : "#2d6a4f"}; border: none; border-radius: 20px; padding: 8px 18px; font-size: 15px; font-weight: 600; font-family: inherit; cursor: pointer; }
        .btn-add:active { opacity: 0.7; }
        .btn-save { background: #2d6a4f; color: white; border: none; border-radius: 12px; padding: 14px; font-size: 16px; font-weight: 600; font-family: inherit; cursor: pointer; width: 100%; }
        .btn-cancel { background: #f2f2f7; color: #555; border: none; border-radius: 12px; padding: 14px; font-size: 16px; font-family: inherit; cursor: pointer; width: 100%; }
        .chip { padding: 7px 14px; border-radius: 20px; border: none; background: rgba(255,255,255,0.2); color: white; font-size: 13px; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .chip.on { background: white; color: #2d6a4f; font-weight: 600; }
        .stab { padding: 6px 14px; border-radius: 8px; border: none; background: transparent; font-size: 13px; font-family: inherit; color: #888; cursor: pointer; }
        .stab.on { background: #e8f5e9; color: #2d6a4f; font-weight: 600; }
        .sheet-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 200; display: flex; align-items: flex-end; }
        .sheet { background: white; border-radius: 20px 20px 0 0; width: 100%; max-height: 92vh; overflow-y: auto; padding: 0 0 20px; }
        .sheet-handle { width: 36px; height: 4px; background: #ddd; border-radius: 2px; margin: 12px auto 0; }
        .lbl { font-size: 12px; font-weight: 600; color: #888; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .qty-badge { background: #f0fdf4; color: #2d6a4f; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 6px; }
        .icon-btn { background: none; border: none; font-size: 20px; padding: 6px 8px; cursor: pointer; border-radius: 8px; }
        .icon-btn:active { background: #f2f2f7; }
        .nav-bar { display: flex; background: white; border-top: 1px solid #e5e5ea; flex-shrink: 0; }
        .nav-btn { flex: 1; padding: 10px 0 16px; border: none; background: none; font-size: 11px; font-family: inherit; color: #8e8e93; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .nav-btn.on { color: #2d6a4f; }
        .nav-btn .icon { font-size: 22px; }
        .trash-badge { position: absolute; top: -2px; right: -6px; background: #e53935; color: white; font-size: 10px; font-weight: 700; border-radius: 10px; padding: 1px 5px; min-width: 16px; text-align: center; }
        .days-badge { font-size: 11px; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
        .restore-btn { background: #e8f5e9; color: #2d6a4f; border: none; border-radius: 8px; padding: 6px 12px; font-size: 13px; font-family: inherit; cursor: pointer; font-weight: 600; }
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .confirm-box { background: white; border-radius: 16px; padding: 24px; width: 100%; max-width: 320px; text-align: center; }
        .scroll-body { flex: 1; overflow-y: auto; }
      `}</style>

      {/* Header */}
      <div className="hdr">
        <div className="hdr-inner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
                {view === "trash" ? "🗑 ゴミ箱" : "🏠 おうち在庫"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
                {view === "trash"
                  ? `${activeTrash.length}件 · 7日後に自動削除`
                  : `${items.length}アイテム · ${items.reduce((s,i)=>s+i.quantity,0)}点`}
              </div>
            </div>
            {view === "list"
              ? <button className="btn-add" onClick={openAdd}>＋ 追加</button>
              : activeTrash.length > 0
                ? <button className="btn-add" style={{ color: "#8e2222" }} onClick={() => setShowConfirmEmpty(true)}>すべて削除</button>
                : null
            }
          </div>
          {view === "list" && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 4, scrollbarWidth: "none" }}>
              {["すべて", ...CATEGORIES].map(c => (
                <button key={c} className={`chip ${filterCat===c?"on":""}`} onClick={() => setFilterCat(c)}>{c}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="scroll-body">
        <div style={{ padding: "14px 14px 10px" }}>

          {/* LIST VIEW */}
          {view === "list" && <>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#aaa" }}>🔍</span>
              <input className="inp" placeholder="検索..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#aaa", marginRight: 4 }}>並び替え</span>
              {[["name","名前"],["date","購入日"],["price","金額"]].map(([v,l]) => (
                <button key={v} className={`stab ${sortBy===v?"on":""}`} onClick={()=>setSortBy(v)}>{l}</button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#aaa" }}>{filtered.length}件</span>
            </div>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: "#bbb" }}>
                <div style={{ fontSize: 40 }}>📦</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>アイテムがありません</div>
              </div>
            )}
            {filtered.map(item => {
              const cc = CAT_COLOR[item.category] || CAT_COLOR["その他"];
              return (
                <div key={item.id} className="card">
                  <div style={{ display: "flex", alignItems: "center", padding: "14px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: cc.dot }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>
                        <span className="qty-badge">{item.quantity}{item.unit}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 3, display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                        {item.store && <span>🏪 {item.store}</span>}
                        {item.price > 0 && <span>¥{item.price.toLocaleString()}</span>}
                        {item.purchaseDate && <span>📅 {item.purchaseDate}</span>}
                      </div>
                      {item.memo && <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>📝 {item.memo}</div>}
                    </div>
                    <div style={{ display: "flex", flexShrink: 0 }}>
                      <button className="icon-btn" onClick={() => openEdit(item)}>✏️</button>
                      <button className="icon-btn" onClick={() => moveToTrash(item.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>}

          {/* TRASH VIEW */}
          {view === "trash" && <>
            {activeTrash.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#bbb" }}>
                <div style={{ fontSize: 48 }}>🗑</div>
                <div style={{ marginTop: 10, fontSize: 15, fontWeight: 600 }}>ゴミ箱は空です</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>削除したアイテムがここに入ります</div>
              </div>
            )}
            {activeTrash.map(item => {
              const cc = CAT_COLOR[item.category] || CAT_COLOR["その他"];
              const dl = daysLeft(item.deletedAt);
              const urgent = dl <= 2;
              return (
                <div key={item.id} className="card" style={{ opacity: 0.85 }}>
                  <div style={{ display: "flex", alignItems: "center", padding: "14px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: cc.dot }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</span>
                        <span className="qty-badge">{item.quantity}{item.unit}</span>
                        <span className="days-badge" style={{ background: urgent ? "#ffebee" : "#fff3e0", color: urgent ? "#e53935" : "#ff9800" }}>
                          あと{dl}日
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#aaa", marginTop: 3, display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                        {item.store && <span>🏪 {item.store}</span>}
                        {item.price > 0 && <span>¥{item.price.toLocaleString()}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                      <button className="restore-btn" onClick={() => restore(item.id)}>↩ 元に戻す</button>
                      <button className="icon-btn" style={{ fontSize: 13, color: "#aaa" }} onClick={() => deletePermanently(item.id)}>完全削除</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>}
        </div>
      </div>

      {/* Bottom Nav — 常に下に固定 */}
      <div className="nav-bar">
        <button className={`nav-btn ${view==="list"?"on":""}`} onClick={() => setView("list")}>
          <span className="icon">🏠</span>
          在庫一覧
        </button>
        <button className={`nav-btn ${view==="trash"?"on":""}`} onClick={() => setView("trash")} style={{ position: "relative" }}>
          <span style={{ position: "relative", display: "inline-block" }}>
            <span className="icon">🗑</span>
            {activeTrash.length > 0 && <span className="trash-badge">{activeTrash.length}</span>}
          </span>
          ゴミ箱
        </button>
      </div>

      {/* Add/Edit Sheet */}
      {showForm && (
        <div className="sheet-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="sheet">
            <div className="sheet-handle" />
            <div style={{ padding: "16px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{editItem ? "編集" : "アイテム追加"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "#f2f2f7", border: "none", borderRadius: 20, width: 30, height: 30, fontSize: 16, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label className="lbl">商品名</label><input className="inp" placeholder="例：しょうゆ" value={form.name} onChange={e => f("name", e.target.value)} /></div>
              <div className="row2">
                <div><label className="lbl">数量</label><input className="inp" type="number" min="1" value={form.quantity} onChange={e => f("quantity", e.target.value)} /></div>
                <div><label className="lbl">単位</label><select className="sel" value={form.unit} onChange={e => f("unit", e.target.value)}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
              </div>
              <div><label className="lbl">カテゴリ</label><select className="sel" value={form.category} onChange={e => f("category", e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="lbl">購入日</label><input className="inp" type="date" value={form.purchaseDate} onChange={e => f("purchaseDate", e.target.value)} /></div>
              <div><label className="lbl">購入店舗</label><input className="inp" placeholder="例：イトーヨーカドー" value={form.store} onChange={e => f("store", e.target.value)} /></div>
              <div><label className="lbl">購入金額（円）</label><input className="inp" type="number" min="0" inputMode="numeric" placeholder="例：298" value={form.price} onChange={e => f("price", e.target.value)} /></div>
              <div><label className="lbl">メモ</label><input className="inp" placeholder="自由記入..." value={form.memo} onChange={e => f("memo", e.target.value)} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 }}>
                <button className="btn-save" onClick={save}>{editItem ? "保存する" : "追加する"}</button>
                <button className="btn-cancel" onClick={() => setShowForm(false)}>キャンセル</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty Trash Confirm */}
      {showConfirmEmpty && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>ゴミ箱を空にしますか？</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>この操作は取り消せません。</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirmEmpty(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#f2f2f7", fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>キャンセル</button>
              <button onClick={emptyTrash} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#e53935", color: "white", fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

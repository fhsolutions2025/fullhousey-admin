import React, { useEffect, useState } from "react";

type Page = { id: string; slug: string; title: string; status: "draft"|"review"|"published"; author: string; seoTitle: string; seoDesc: string; updatedAt: string };

export default function CMSDashboard() {
  const [pages, setPages] = useState<Page[]>([]);
  const [form, setForm] = useState({ slug: "", title: "", author: "", seoTitle: "", seoDesc: "" });
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const d = await fetch("/api/cms/pages").then(r => r.json());
    setPages(d.pages || []);
  };

  useEffect(() => { load().catch(()=>setErr("Load failed")); }, []);

  const createPage = async () => {
    setErr("");
    const res = await fetch("/api/cms/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { setErr("Create failed"); return; }
    await load();
    setForm({ slug: "", title: "", author: "", seoTitle: "", seoDesc: "" });
  };

  const togglePublish = async (id: string) => {
    setErr("");
    const res = await fetch(`/api/cms/pages/${id}/publish`, { method: "POST" });
    if (!res.ok) { setErr("Publish failed"); return; }
    await load();
  };

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>CMS — Pages</h2>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="tbl" style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><th>ID</th><th>Slug</th><th>Title</th><th>Status</th><th>Author</th><th>SEO Title</th><th>Updated</th><th>Action</th></tr></thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.slug}</td>
                  <td>{p.title}</td>
                  <td>{p.status}</td>
                  <td>{p.author}</td>
                  <td>{p.seoTitle}</td>
                  <td>{new Date(p.updatedAt).toLocaleString()}</td>
                  <td>
                    <button className="btn primary" onClick={() => togglePublish(p.id)}>
                      {p.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {err && <div className="muted" style={{ color:"#ef4444", marginTop:8 }}>{err}</div>}
        </div>
      </div>

      <div className="card">
        <h3>Create Page</h3>
        <div style={{ display:"grid", gap:8, marginTop:8 }}>
          <input placeholder="/slug" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})}/>
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
          <input placeholder="Author" value={form.author} onChange={e=>setForm({...form, author:e.target.value})}/>
          <input placeholder="SEO Title" value={form.seoTitle} onChange={e=>setForm({...form, seoTitle:e.target.value})}/>
          <input placeholder="SEO Description" value={form.seoDesc} onChange={e=>setForm({...form, seoDesc:e.target.value})}/>
          <button className="btn primary" onClick={createPage}>Create</button>
        </div>
      </div>
    </div>
  );
}

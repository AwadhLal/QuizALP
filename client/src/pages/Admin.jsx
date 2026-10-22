import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useFetch } from '../hooks/useAuth.jsx';
import { ErrorBox, Wrap } from '../components/ui.jsx';

const blankQ = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
const Pager = ({ d, page, setPage }) => d?.pages > 1 && <div className="mt-3 flex items-center justify-center gap-4"><button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {d.pages}</span><button className="btn btn-ghost" disabled={page >= d.pages} onClick={() => setPage(page + 1)}>Next</button></div>;
const Table = ({ head, children }) => <div className="overflow-x-auto rounded-xl border border-line bg-white"><table className="w-full min-w-[520px] text-left"><thead><tr className="border-b border-line">{head.map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;

function Overview() {
  const { data: s, error } = useFetch('/admin/stats');
  if (error) return <ErrorBox msg={error} />;
  return <div><div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[['Users', s?.users], ['Quizzes', s?.quizzes], ['Published', s?.published], ['Attempts', s?.attempts], ['Avg score', s && s.averageScore + '%']].map(([k, v]) => <div key={k} className="rounded-xl border border-line bg-white p-4"><p className="font-display text-3xl font-extrabold text-brand">{v ?? '–'}</p><p className="text-sm">{k}</p></div>)}</div>
    <h3 className="mt-6 text-lg font-bold">Most attempted</h3><ul className="mt-2 grid gap-2">{s?.top.map(t => <li key={t._id} className="rounded-lg border border-line bg-white p-3">{t.title ?? 'Removed quiz'}: {t.attempts} attempts, {t.average}% average</li>)}</ul></div>;
}
function Users() {
  const [page, setPage] = useState(1); const { data, error } = useFetch(`/admin/users?page=${page}`);
  if (error) return <ErrorBox msg={error} />;
  return <><Table head={['Name', 'Email', 'Role', 'Joined']}>{data?.items.map(u => <tr key={u._id} className="border-b border-line last:border-0"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3">{u.role}</td><td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</Table><Pager d={data} page={page} setPage={setPage} /></>;
}
function Categories() {
  const [n, bump] = useState(0); const { data, error } = useFetch('/categories', [n]);
  const [f, setF] = useState({ name: '', description: '' }); const [err, setErr] = useState('');
  const run = async fn => { setErr(''); try { await fn(); bump(n + 1); } catch (e) { setErr(e.message); } };
  return <div>{(error || err) && <ErrorBox msg={error || err} />}
    <form className="my-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]" onSubmit={e => { e.preventDefault(); run(async () => { await api('/admin/categories', { method: 'POST', body: f }); setF({ name: '', description: '' }); }); }}>
      <input className="input" aria-label="Category name" placeholder="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
      <input className="input" aria-label="Description" placeholder="Description" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <button className="btn btn-primary"><Plus size={16} aria-hidden />Add</button></form>
    <Table head={['Name', 'Quizzes', '']}>{data?.map(c => <tr key={c._id} className="border-b border-line last:border-0"><td className="p-3">{c.name}</td><td className="p-3">{c.quizCount}</td><td className="p-3 text-right"><button className="btn btn-ghost" aria-label={`Delete ${c.name}`} onClick={() => confirm(`Delete category "${c.name}"?`) && run(() => api('/admin/categories/' + c._id, { method: 'DELETE' }))}><Trash2 size={16} aria-hidden /></button></td></tr>)}</Table></div>;
}
function Editor({ id, onDone }) {
  const cats = useFetch('/categories'); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [f, setF] = useState(id ? null : { title: '', description: '', category: '', difficulty: 'Easy', durationMinutes: 10, published: false, featured: false, questions: [blankQ()] });
  const load = useFetch(id ? '/admin/quizzes/' + id : '/health');
  useEffect(() => { if (id && load.data) setF(load.data); }, [id, load.data]);
  if (!f) return load.error ? <ErrorBox msg={load.error} /> : <p>Loading…</p>;
  const setQ = (i, p) => setF({ ...f, questions: f.questions.map((q, k) => k === i ? { ...q, ...p } : q) });
  const save = async e => { e.preventDefault(); setBusy(true); setErr('');
    try { const { _id, slug, questionCount, createdAt, updatedAt, __v, ...body } = f; body.durationMinutes = +body.durationMinutes;
      body.questions = body.questions.map(({ text, options, correctIndex, explanation }) => ({ text, options, correctIndex: +correctIndex, explanation }));
      await api(id ? '/admin/quizzes/' + id : '/admin/quizzes', { method: id ? 'PUT' : 'POST', body }); onDone(); } catch (x) { setErr(x.message); setBusy(false); } };
  return <form onSubmit={save} className="grid gap-4">
    {err && <ErrorBox msg={err} />}
    <div className="grid gap-3 sm:grid-cols-2">
      <label>Title<input className="input" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required minLength={3} /></label>
      <label>Category<select className="input" value={f.category?._id || f.category} onChange={e => setF({ ...f, category: e.target.value })} required><option value="">Choose…</option>{cats.data?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
      <label>Difficulty<select className="input" value={f.difficulty} onChange={e => setF({ ...f, difficulty: e.target.value })}>{['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}</select></label>
      <label>Duration (minutes)<input type="number" min="1" max="180" className="input" value={f.durationMinutes} onChange={e => setF({ ...f, durationMinutes: e.target.value })} /></label>
    </div>
    <label>Description<textarea className="input" rows={2} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></label>
    <div className="flex gap-6"><label className="flex items-center gap-2"><input type="checkbox" checked={f.published} onChange={e => setF({ ...f, published: e.target.checked })} />Published</label><label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={e => setF({ ...f, featured: e.target.checked })} />Featured</label></div>
    {f.questions.map((q, i) => <fieldset key={i} className="grid gap-2 rounded-xl border border-line bg-white p-4"><legend className="px-1 font-semibold">Question {i + 1}</legend>
      <input className="input" aria-label="Question text" placeholder="Question" value={q.text} onChange={e => setQ(i, { text: e.target.value })} required />
      {q.options.map((o, k) => <label key={k} className="flex items-center gap-2"><input type="radio" name={`c${i}`} aria-label={`Option ${k + 1} is correct`} checked={q.correctIndex === k} onChange={() => setQ(i, { correctIndex: k })} /><input className="input" aria-label={`Option ${k + 1}`} placeholder={`Option ${k + 1}`} value={o} onChange={e => setQ(i, { options: q.options.map((x, j) => j === k ? e.target.value : x) })} required /></label>)}
      <input className="input" aria-label="Explanation" placeholder="Explanation shown after submission" value={q.explanation} onChange={e => setQ(i, { explanation: e.target.value })} />
      {f.questions.length > 1 && <button type="button" className="btn btn-ghost justify-self-start" onClick={() => setF({ ...f, questions: f.questions.filter((_, k) => k !== i) })}><Trash2 size={16} aria-hidden />Remove question</button>}</fieldset>)}
    <div className="flex flex-wrap gap-3"><button type="button" className="btn btn-ghost" onClick={() => setF({ ...f, questions: [...f.questions, blankQ()] })}><Plus size={16} aria-hidden />Add question</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save quiz'}</button><button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button></div>
  </form>;
}
function Quizzes() {
  const [page, setPage] = useState(1), [n, bump] = useState(0), [edit, setEdit] = useState(null), [err, setErr] = useState('');
  const { data, error } = useFetch(`/admin/quizzes?page=${page}`, [n]);
  const run = async fn => { setErr(''); try { await fn(); bump(n + 1); } catch (e) { setErr(e.message); } };
  if (edit !== null) return <Editor id={edit || undefined} onDone={() => { setEdit(null); bump(n + 1); }} />;
  return <div>{(error || err) && <ErrorBox msg={error || err} />}
    <button className="btn btn-primary mb-3" onClick={() => setEdit('')}><Plus size={16} aria-hidden />New quiz</button>
    <Table head={['Title', 'Category', 'Questions', 'Status', '']}>{data?.items.map(q => <tr key={q._id} className="border-b border-line last:border-0"><td className="p-3 font-semibold">{q.title}</td><td className="p-3">{q.category?.name}</td><td className="p-3">{q.questionCount}</td><td className="p-3">{q.published ? 'Published' : 'Draft'}</td>
      <td className="flex flex-wrap justify-end gap-2 p-3"><button className="btn btn-ghost" onClick={() => setEdit(q._id)}>Edit</button><button className="btn btn-ghost" onClick={() => run(() => api(`/admin/quizzes/${q._id}/publish`, { method: 'PATCH', body: { published: !q.published } }))}>{q.published ? 'Unpublish' : 'Publish'}</button><button className="btn btn-ghost" aria-label={`Delete ${q.title}`} onClick={() => confirm(`Delete "${q.title}" and its attempts?`) && run(() => api('/admin/quizzes/' + q._id, { method: 'DELETE' }))}><Trash2 size={16} aria-hidden /></button></td></tr>)}</Table>
    <Pager d={data} page={page} setPage={setPage} /></div>;
}
export default function Admin() {
  const [tab, setTab] = useState('Overview'); const tabs = { Overview, Quizzes, Categories, Users }; const T = tabs[tab];
  return <Wrap className="py-10"><h1 className="text-3xl font-extrabold">Admin</h1>
    <div role="tablist" className="mt-4 flex flex-wrap gap-2">{Object.keys(tabs).map(t => <button key={t} role="tab" aria-selected={tab === t} className={`rounded-full border px-4 py-1.5 font-semibold ${tab === t ? 'border-brand bg-brand text-white' : 'border-line bg-white'}`} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="mt-6"><T /></div></Wrap>;
}

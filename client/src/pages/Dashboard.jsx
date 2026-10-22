import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth, useFetch } from '../hooks/useAuth.jsx';
import { Empty, ErrorBox, Wrap } from '../components/ui.jsx';

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [page, setPage] = useState(1);
  const stats = useFetch('/me/stats'), hist = useFetch(`/me/attempts?page=${page}`);
  const [name, setName] = useState(user.name), [msg, setMsg] = useState('');
  const save = async e => { e.preventDefault(); setMsg(''); try { const d = await api('/auth/me', { method: 'PATCH', body: { name } }); setUser(d.user); setMsg('Saved.'); } catch (x) { setMsg(x.message); } };
  const s = stats.data;
  return (
    <Wrap className="py-10">
      <h1 className="text-3xl font-extrabold">Hi, {user.name}</h1>
      {stats.error ? <ErrorBox msg={stats.error} /> : <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Quizzes completed', s?.completedQuizzes], ['Attempts', s?.attempts], ['Average score', s && s.average + '%'], ['Best score', s && s.best + '%']].map(([k, v]) => <div key={k} className="rounded-xl border border-line bg-white p-4"><p className="font-display text-3xl font-extrabold text-brand">{v ?? '–'}</p><p className="text-sm">{k}</p></div>)}</div>}
      <h2 className="mt-10 text-xl font-extrabold">Quiz history</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
        {hist.error ? <ErrorBox msg={hist.error} /> : hist.loading ? <div className="h-32 animate-pulse bg-indigo-100/60" /> : !hist.data.items.length ? <Empty title="No attempts yet" hint="Finish a quiz while signed in and it will appear here." /> :
          <table className="w-full min-w-[480px] text-left"><thead><tr className="border-b border-line"><th className="p-3">Quiz</th><th className="p-3">Score</th><th className="p-3">Date</th><th className="p-3"><span className="sr-only">Review</span></th></tr></thead>
            <tbody>{hist.data.items.map(a => <tr key={a._id} className="border-b border-line last:border-0"><td className="p-3 font-semibold">{a.quiz?.title ?? 'Removed quiz'}</td><td className="p-3">{a.score}/{a.total} ({a.percentage}%)</td><td className="p-3">{new Date(a.submittedAt).toLocaleDateString()}</td><td className="p-3"><Link className="font-semibold text-brand underline" to={`/results/${a._id}`}>Review</Link></td></tr>)}</tbody></table>}
      </div>
      {hist.data?.pages > 1 && <div className="mt-4 flex items-center justify-center gap-4"><button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {hist.data.pages}</span><button className="btn btn-ghost" disabled={page >= hist.data.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
      <h2 className="mt-10 text-xl font-extrabold">Profile</h2>
      <form onSubmit={save} className="mt-3 grid max-w-md gap-3 rounded-xl border border-line bg-white p-5">
        <label htmlFor="pn" className="font-semibold">Display name</label><input id="pn" className="input" value={name} onChange={e => setName(e.target.value)} />
        <p className="text-sm">Email: {user.email}</p>
        <div className="flex items-center gap-3"><button className="btn btn-primary">Save changes</button><span role="status">{msg}</span></div>
      </form>
    </Wrap>
  );
}

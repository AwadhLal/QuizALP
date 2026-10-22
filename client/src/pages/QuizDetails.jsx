import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ListChecks } from 'lucide-react';
import { api } from '../services/api';
import { useAuth, useFetch } from '../hooks/useAuth.jsx';
import { Badge, ErrorBox, Wrap } from '../components/ui.jsx';

export default function QuizDetails() {
  const { slug } = useParams(); const nav = useNavigate(); const { user } = useAuth();
  const { data: q, error, loading } = useFetch(`/quizzes/${slug}`);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const start = async () => { setBusy(true); setErr(''); try { const { attemptId } = await api(`/quizzes/${q._id}/start`, { method: 'POST' }); nav(`/play/${attemptId}`); } catch (e) { setErr(e.message); setBusy(false); } };
  if (loading) return <Wrap className="py-10"><div className="h-60 animate-pulse rounded-xl bg-indigo-100/60" /></Wrap>;
  if (error) return <Wrap className="py-10"><ErrorBox msg={error} /></Wrap>;
  return (
    <Wrap className="max-w-3xl py-10">
      <p className="font-semibold text-brand">{q.category?.name}</p>
      <h1 className="mt-1 text-4xl font-extrabold">{q.title}</h1>
      <p className="mt-3 text-lg">{q.description}</p>
      <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
        {[[<ListChecks key="a" className="mx-auto" aria-hidden />, 'Questions', q.questionCount], [<Clock key="b" className="mx-auto" aria-hidden />, 'Duration', `${q.durationMinutes} min`], [null, 'Difficulty', <Badge key="c" level={q.difficulty} />]].map(([i, k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-white p-4">{i}<dt className="text-sm">{k}</dt><dd className="font-display text-xl font-extrabold">{v}</dd></div>))}
      </dl>
      {!user && <p className="mt-5 rounded-lg bg-indigo-50 p-3">You can play without an account, but only signed-in scores are saved to your history.</p>}
      {err && <div className="mt-4"><ErrorBox msg={err} /></div>}
      <button className="btn btn-primary mt-6 px-8 py-3 text-lg" disabled={busy} onClick={start}>{busy ? 'Starting…' : 'Start quiz'}</button>
    </Wrap>
  );
}

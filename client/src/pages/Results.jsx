import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth, useFetch } from '../hooks/useAuth.jsx';
import { AdSlot, ErrorBox, Wrap } from '../components/ui.jsx';

export default function Results() {
  const { id } = useParams(); const nav = useNavigate(); const { user } = useAuth();
  const { data, error, loading } = useFetch('/attempts/' + id);
  const [busy, setBusy] = useState(false);
  if (loading) return <Wrap className="py-10"><div className="h-60 animate-pulse rounded-xl bg-indigo-100/60" /></Wrap>;
  if (error) return <Wrap className="py-10"><ErrorBox msg={error} /></Wrap>;
  if (data.status !== 'submitted') { nav('/play/' + id, { replace: true }); return null; }
  const r = data.result;
  const retry = async () => { setBusy(true); try { const { attemptId } = await api(`/quizzes/${data.quiz._id}/start`, { method: 'POST' }); nav('/play/' + attemptId); } catch { setBusy(false); } };
  return (
    <Wrap className="max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">{data.quiz.title}: results</h1>
      {r.timedOut && <p className="mt-2 rounded-lg bg-amber-50 p-3">Time ran out, so your answers were submitted automatically.</p>}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-line bg-white p-4"><p className="font-display text-4xl font-extrabold text-brand">{r.percentage}%</p><p className="text-sm">Score</p></div>
        <div className="rounded-xl border border-line bg-white p-4"><p className="font-display text-4xl font-extrabold text-emerald-700">{r.score}</p><p className="text-sm">Correct</p></div>
        <div className="rounded-xl border border-line bg-white p-4"><p className="font-display text-4xl font-extrabold text-rose-700">{r.total - r.score}</p><p className="text-sm">Incorrect</p></div>
      </div>
      {!user && <p className="mt-4 rounded-lg bg-indigo-50 p-3">This score isn't saved. <Link className="font-semibold underline" to="/register">Create an account</Link> or <Link className="font-semibold underline" to="/login">sign in</Link> before your next quiz to keep your history.</p>}
      <div className="mt-5 flex flex-wrap gap-3"><button className="btn btn-primary" disabled={busy} onClick={retry}>Retry quiz</button><Link to="/categories" className="btn btn-ghost">Back to categories</Link></div>
      <AdSlot name="results" />
      <ol className="mt-8 grid gap-4">{r.review.map((q, n) => (
        <li key={q.id} className="rounded-xl border border-line bg-white p-5">
          <p className="flex items-start gap-2 font-bold">{q.isCorrect ? <Check className="mt-0.5 shrink-0 text-emerald-700" aria-label="Correct" /> : <X className="mt-0.5 shrink-0 text-rose-700" aria-label="Incorrect" />}<span>{n + 1}. {q.text}</span></p>
          <ul className="mt-3 grid gap-2">{q.options.map((o, k) => <li key={k} className={`rounded-lg border px-3 py-2 ${k === q.correctIndex ? 'border-emerald-300 bg-emerald-50' : k === q.selected ? 'border-rose-300 bg-rose-50' : 'border-line'}`}>{o}{k === q.correctIndex && <b> (correct answer)</b>}{k === q.selected && k !== q.correctIndex && <b> (your answer)</b>}</li>)}</ul>
          {q.selected === null && <p className="mt-2 text-sm">You didn't answer this question.</p>}
          {q.explanation && <p className="mt-3 border-l-4 border-accent pl-3">{q.explanation}</p>}
        </li>))}</ol>
    </Wrap>
  );
}

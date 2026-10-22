import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { api } from '../services/api';
import { ErrorBox, Wrap } from '../components/ui.jsx';

const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export default function Player() {
  const { id } = useParams(); const nav = useNavigate(); const key = 'qa:' + id;
  const [a, setA] = useState(null), [err, setErr] = useState(''), [i, setI] = useState(0), [left, setLeft] = useState(null);
  const [answers, setAnswers] = useState(() => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } }); // survives refresh
  const [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false);
  const latest = useRef(answers), sending = useRef(false);
  latest.current = answers;

  useEffect(() => { api('/attempts/' + id).then(d => d.status === 'submitted' ? nav('/results/' + id, { replace: true }) : setA(d)).catch(e => setErr(e.message)); }, [id, nav]);
  useEffect(() => { localStorage.setItem(key, JSON.stringify(answers)); }, [answers, key]);

  const submit = useCallback(async () => {
    if (sending.current) return; sending.current = true; setBusy(true);
    try { await api(`/attempts/${id}/submit`, { method: 'POST', body: { answers: latest.current } }); localStorage.removeItem(key); nav('/results/' + id, { replace: true }); }
    catch (e) { if (e.status === 409) nav('/results/' + id, { replace: true }); else { setErr(e.message); setConfirm(false); setBusy(false); sending.current = false; } }
  }, [id, key, nav]);

  useEffect(() => {
    if (!a) return;
    const tick = () => { const s = Math.max(0, Math.round((new Date(a.expiresAt) - Date.now()) / 1000)); setLeft(s); if (s === 0) submit(); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [a, submit]);

  if (err && !a) return <Wrap className="py-10"><ErrorBox msg={err} /></Wrap>;
  if (!a) return <Wrap className="py-10"><div className="h-72 animate-pulse rounded-xl bg-indigo-100/60" /></Wrap>;
  const qs = a.questions, q = qs[i], done = Object.keys(answers).filter(k => qs.some(x => x.id === k)).length;
  return (
    <Wrap className="max-w-3xl py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="truncate text-xl font-extrabold">{a.quiz.title}</h1>
        <p role="timer" className={`flex items-center gap-1 rounded-full px-3 py-1 font-display font-bold ${left <= 30 ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-brand'}`}><Timer size={16} aria-hidden /><span aria-label="Time remaining">{left === null ? '–' : fmt(left)}</span></p>
      </div>
      <div className="mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={done} aria-label="Questions answered"><div className="h-2 rounded-full bg-indigo-100"><div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${(done / qs.length) * 100}%` }} /></div><p className="mt-1 text-sm">{done} of {qs.length} answered</p></div>
      {err && <div className="mt-3"><ErrorBox msg={err} /></div>}
      <fieldset className="mt-5 rounded-xl border border-line bg-white p-5 sm:p-6">
        <legend className="px-1 text-sm font-semibold">Question {i + 1} of {qs.length}</legend>
        <p className="text-xl font-bold">{q.text}</p>
        <div className="mt-4 grid gap-3">{q.options.map((o, n) => (
          <label key={n} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition-colors has-[:checked]:border-brand has-[:checked]:bg-indigo-50 ${answers[q.id] === n ? 'border-brand' : 'border-line hover:bg-indigo-50/60'}`}>
            <input type="radio" name={q.id} className="h-4 w-4 accent-indigo-700" checked={answers[q.id] === n} onChange={() => setAnswers(p => ({ ...p, [q.id]: n }))} /><span>{o}</span></label>))}</div>
        {answers[q.id] !== undefined && <button className="mt-3 text-sm font-semibold text-brand underline" onClick={() => setAnswers(({ [q.id]: _, ...r }) => r)}>Clear answer</button>}
      </fieldset>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button className="btn btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft size={18} aria-hidden />Previous</button>
        {i < qs.length - 1 ? <button className="btn btn-primary" onClick={() => setI(i + 1)}>Next<ChevronRight size={18} aria-hidden /></button> : <button className="btn btn-primary" onClick={() => setConfirm(true)}>Submit quiz</button>}
      </div>
      <nav aria-label="Question navigator" className="mt-6 flex flex-wrap gap-2">{qs.map((x, n) => <button key={x.id} aria-label={`Question ${n + 1}${answers[x.id] !== undefined ? ', answered' : ''}`} aria-current={n === i} onClick={() => setI(n)} className={`h-10 w-10 rounded-lg border font-semibold ${n === i ? 'border-brand ring-2 ring-accent' : 'border-line'} ${answers[x.id] !== undefined ? 'bg-brand text-white' : 'bg-white'}`}>{n + 1}</button>)}</nav>
      <button className="mt-4 text-sm font-semibold text-brand underline" onClick={() => setConfirm(true)}>Submit now</button>
      {confirm && <div className="fixed inset-0 z-30 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-labelledby="c-t">
        <div className="w-full max-w-sm rounded-xl bg-white p-6"><h2 id="c-t" className="text-xl font-extrabold">Submit your answers?</h2>
          <p className="mt-2">{qs.length - done > 0 ? `${qs.length - done} question${qs.length - done > 1 ? 's are' : ' is'} unanswered and will be marked incorrect.` : 'All questions are answered.'} You can't change answers after submitting.</p>
          <div className="mt-5 flex justify-end gap-2"><button className="btn btn-ghost" autoFocus onClick={() => setConfirm(false)}>Keep working</button><button className="btn btn-primary" disabled={busy} onClick={submit}>{busy ? 'Submitting…' : 'Submit'}</button></div></div></div>}
    </Wrap>
  );
}

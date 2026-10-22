import { Link } from 'react-router-dom';
import { BookOpen, Calculator, Clock, Code2, Cpu, FlaskConical, Globe, ListChecks, Newspaper } from 'lucide-react';
export const icons = { BookOpen, Calculator, Code2, Cpu, FlaskConical, Globe, Newspaper };
const tone = { Easy: 'bg-emerald-100 text-emerald-800', Medium: 'bg-amber-100 text-amber-900', Hard: 'bg-rose-100 text-rose-800' };
export const Badge = ({ level }) => <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${tone[level]}`}>{level}</span>;
export const Skeleton = ({ n = 3 }) => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{Array.from({ length: n }, (_, i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-indigo-100/60" />)}</div>;
export const ErrorBox = ({ msg }) => <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800">{msg}</p>;
export const Empty = ({ title, hint }) => <div className="rounded-xl border border-dashed border-line p-10 text-center"><p className="font-display text-lg font-semibold">{title}</p><p>{hint}</p></div>;
export const Wrap = ({ children, className = '' }) => <div className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</div>;
export function QuizCard({ q }) {
  return (
    <Link to={`/quiz/${q.slug}`} className="group flex flex-col gap-3 rounded-xl border border-line bg-white p-5 transition hover:border-accent hover:shadow-md">
      <div className="flex items-center justify-between"><span className="text-sm font-semibold text-brand">{q.category?.name}</span><Badge level={q.difficulty} /></div>
      <h3 className="text-lg font-bold group-hover:text-brand">{q.title}</h3>
      <p className="line-clamp-2 flex-1">{q.description}</p>
      <p className="flex gap-4 text-sm"><span className="flex items-center gap-1"><ListChecks size={16} aria-hidden />{q.questionCount} questions</span><span className="flex items-center gap-1"><Clock size={16} aria-hidden />{q.durationMinutes} min</span></p>
    </Link>
  );
}
// Future ad placement. Renders nothing unless placeholders are switched on for layout work; it never serves or fakes ads.
export function AdSlot({ name }) {
  if (import.meta.env.VITE_SHOW_AD_PLACEHOLDERS !== 'true') return null;
  return <aside aria-label="Advertisement placeholder" className="my-8 rounded-lg border border-dashed border-line p-6 text-center text-sm">Advertisement slot ({name}). No ad is loaded.</aside>;
}

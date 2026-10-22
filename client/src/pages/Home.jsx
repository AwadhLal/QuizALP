import { Link } from 'react-router-dom';
import { ArrowRight, Clock, ListChecks } from 'lucide-react';
import { useFetch } from '../hooks/useAuth.jsx';
import { AdSlot, Badge, Empty, ErrorBox, QuizCard, Skeleton, Wrap, icons } from '../components/ui.jsx';

function List({ path }) {
  const { data, error, loading } = useFetch(path);
  if (loading) return <Skeleton />;
  if (error) return <ErrorBox msg={error} />;
  if (!data.items.length) return <Empty title="No quizzes yet" hint="Check back soon." />;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.map(q => <QuizCard key={q.slug} q={q} />)}</div>;
}
const Section = ({ title, to, children }) => (
  <section className="mt-14"><Wrap>
    <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-extrabold">{title}</h2>{to && <Link to={to} className="flex items-center gap-1 font-semibold text-brand">View all <ArrowRight size={16} aria-hidden /></Link>}</div>
    {children}
  </Wrap></section>
);
export default function Home() {
  const daily = useFetch('/quizzes/daily');
  const cats = useFetch('/categories');
  const d = daily.data;
  return (
    <>
      <section className="border-b border-line bg-white"><Wrap className="grid items-center gap-10 py-14 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">Quizzes that show you what to study next.</h1>
          <p className="mt-4 max-w-xl text-lg">Timed multiple-choice practice across six subjects, with an explanation for every answer and a history that keeps your progress.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link to="/categories" className="btn btn-primary">Start a quiz</Link><a href="#categories" className="btn btn-ghost">Explore categories</a></div>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-6">
          <p className="font-display text-sm font-extrabold text-accent">Daily challenge</p>
          {daily.loading ? <div className="mt-3 h-28 animate-pulse rounded-lg bg-indigo-100/60" /> : d ? <>
            <h2 className="mt-2 text-2xl font-extrabold">{d.title}</h2><p className="mt-1">{d.description}</p>
            <p className="mt-3 flex flex-wrap items-center gap-4 text-sm"><Badge level={d.difficulty} /><span className="flex items-center gap-1"><ListChecks size={16} aria-hidden />{d.questionCount} questions</span><span className="flex items-center gap-1"><Clock size={16} aria-hidden />{d.durationMinutes} min</span></p>
            <Link to={`/quiz/${d.slug}`} className="btn btn-primary mt-5">Take today's challenge</Link></> : <p className="mt-2">No challenge today. Check back soon.</p>}
        </div>
      </Wrap></section>
      <Section title="Featured quizzes" to="/categories"><List path="/quizzes?featured=true&limit=3" /></Section>
      <section id="categories" className="mt-14 scroll-mt-20"><Wrap>
        <h2 className="mb-5 text-2xl font-extrabold">Categories</h2>
        {cats.loading ? <Skeleton n={6} /> : cats.error ? <ErrorBox msg={cats.error} /> :
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cats.data.map(c => { const I = icons[c.icon] || icons.BookOpen; return (
            <Link key={c._id} to={`/categories?category=${c.slug}`} className="flex gap-4 rounded-xl border border-line bg-white p-5 transition hover:border-accent hover:shadow-md">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-indigo-100 text-brand"><I aria-hidden /></span>
              <span><span className="block font-display text-lg font-bold">{c.name}</span><span className="text-sm">{c.quizCount} {c.quizCount === 1 ? 'quiz' : 'quizzes'}</span></span>
            </Link>); })}</div>}
      </Wrap></section>
      <Wrap><AdSlot name="home-mid" /></Wrap>
      <Section title="How it works"><ol className="grid gap-4 sm:grid-cols-3">
        {[['Pick a quiz', 'Browse by subject or difficulty.'], ['Answer against the clock', 'Move freely between questions before you submit.'], ['Review every answer', 'See what was right, why, and track your scores over time.']].map(([t, s], i) => (
          <li key={t} className="rounded-xl border border-line bg-white p-5"><span className="font-display text-2xl font-extrabold text-accent">{i + 1}</span><h3 className="mt-1 font-bold">{t}</h3><p>{s}</p></li>))}
      </ol></Section>
      <Section title="Recently added" to="/categories"><List path="/quizzes?sort=new&limit=6" /></Section>
    </>
  );
}

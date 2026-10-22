import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useFetch } from '../hooks/useAuth.jsx';
import { Empty, ErrorBox, QuizCard, Skeleton, Wrap } from '../components/ui.jsx';

export default function Categories() {
  const [sp, setSp] = useSearchParams();
  const category = sp.get('category') || '', difficulty = sp.get('difficulty') || '';
  const [text, setText] = useState(sp.get('q') || ''), q = sp.get('q') || '', page = +sp.get('page') || 1;
  const cats = useFetch('/categories');
  const { data, error, loading } = useFetch(`/quizzes?${new URLSearchParams({ category, difficulty, q, page, limit: 9 })}`);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n); };
  const chip = on => `rounded-full border px-3.5 py-1.5 font-semibold ${on ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:bg-indigo-50'}`;
  return (
    <Wrap className="py-10">
      <h1 className="text-3xl font-extrabold">Categories and quizzes</h1>
      <form role="search" className="mt-5 flex max-w-xl gap-2" onSubmit={e => { e.preventDefault(); set('q', text.trim()); }}>
        <label className="relative flex-1"><span className="sr-only">Search quizzes</span><Search className="absolute left-3 top-3" size={18} aria-hidden /><input className="input pl-10" value={text} onChange={e => setText(e.target.value)} placeholder="Search quizzes" maxLength={50} /></label>
        <button className="btn btn-primary">Search</button>
      </form>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button className={chip(!category)} onClick={() => set('category', '')}>All</button>
        {cats.data?.map(c => <button key={c._id} className={chip(category === c.slug)} aria-pressed={category === c.slug} onClick={() => set('category', c.slug)}>{c.name}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
        {['Easy', 'Medium', 'Hard'].map(l => <button key={l} className={chip(difficulty === l)} aria-pressed={difficulty === l} onClick={() => set('difficulty', difficulty === l ? '' : l)}>{l}</button>)}
      </div>
      <div className="mt-8">{loading ? <Skeleton n={6} /> : error ? <ErrorBox msg={error} /> : !data.items.length ? <Empty title="No quizzes match" hint="Try a different search or clear a filter." /> :
        <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.map(x => <QuizCard key={x.slug} q={x} />)}</div>
          {data.pages > 1 && <div className="mt-8 flex items-center justify-center gap-4"><button className="btn btn-ghost" disabled={page <= 1} onClick={() => set('page', page - 1)}>Previous</button><span>Page {data.page} of {data.pages}</span><button className="btn btn-ghost" disabled={page >= data.pages} onClick={() => set('page', page + 1)}>Next</button></div>}</>}
      </div>
    </Wrap>
  );
}

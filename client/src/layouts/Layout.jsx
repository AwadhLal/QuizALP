import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const link = ({ isActive }) => `rounded-md px-3 py-2 font-semibold ${isActive ? 'bg-indigo-100 text-brand' : 'hover:bg-indigo-50'}`;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-ink"><Zap className="text-accent" aria-hidden /> QuizALP</Link>
          <button className="rounded-md p-2 md:hidden" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          <div className={`${open ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-1 border-b border-line bg-white p-4 md:static md:flex md:w-auto md:flex-row md:items-center md:border-0 md:p-0`} onClick={() => setOpen(false)}>
            <NavLink to="/categories" className={link}>Categories</NavLink>
            {user && <NavLink to="/dashboard" className={link}>Dashboard</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
            {user ? <button className="btn btn-ghost" onClick={logout}>Sign out</button> : <>
              <NavLink to="/login" className={link}>Sign in</NavLink>
              <Link to="/register" className="btn btn-primary">Create account</Link></>}
          </div>
        </nav>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-16 border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-8 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} QuizALP. Practice, learn, repeat.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">{['about', 'contact', 'privacy', 'terms'].map(p => <li key={p}><Link className="underline-offset-4 hover:underline" to={'/' + p}>{p === 'privacy' ? 'Privacy Policy' : p === 'terms' ? 'Terms' : p[0].toUpperCase() + p.slice(1)}</Link></li>)}</ul>
        </div>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ErrorBox, Wrap } from '../components/ui.jsx';

export default function Auth({ mode }) {
  const reg = mode === 'register'; const { user, authenticate } = useAuth(); const nav = useNavigate(); const loc = useLocation();
  const [f, setF] = useState({ name: '', email: '', password: '' }); const [errs, setErrs] = useState({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const validate = () => { const e = {};
    if (reg && f.name.trim().length < 2) e.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.';
    if (f.password.length < (reg ? 8 : 1)) e.password = reg ? 'Password must be at least 8 characters.' : 'Enter your password.';
    return e; };
  const submit = async e => { e.preventDefault(); const v = validate(); setErrs(v); setErr(''); if (Object.keys(v).length) return;
    setBusy(true); try { await authenticate(mode, reg ? f : { email: f.email, password: f.password }); nav(loc.state?.from || '/dashboard', { replace: true }); } catch (x) { setErr(x.message); setBusy(false); } };
  const field = (k, label, type, auto) => (<div><label htmlFor={k} className="mb-1 block font-semibold">{label}</label>
    <input id={k} type={type} autoComplete={auto} className="input" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errs[k]} aria-describedby={errs[k] ? k + '-e' : undefined} />
    {errs[k] && <p id={k + '-e'} className="mt-1 text-sm text-rose-700">{errs[k]}</p>}</div>);
  return (
    <Wrap className="max-w-md py-12">
      <h1 className="text-3xl font-extrabold">{reg ? 'Create your account' : 'Sign in'}</h1>
      <form onSubmit={submit} noValidate className="mt-6 grid gap-4 rounded-xl border border-line bg-white p-6">
        {err && <ErrorBox msg={err} />}
        {reg && field('name', 'Name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', reg ? 'new-password' : 'current-password')}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="mt-4">{reg ? 'Already registered?' : 'New to QuizALP?'} <Link className="font-semibold text-brand underline" to={reg ? '/login' : '/register'}>{reg ? 'Sign in' : 'Create an account'}</Link></p>
    </Wrap>
  );
}

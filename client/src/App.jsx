import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './layouts/Layout.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import Home from './pages/Home.jsx';
import Categories from './pages/Categories.jsx';
import QuizDetails from './pages/QuizDetails.jsx';
import Player from './pages/Player.jsx';
import Results from './pages/Results.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Admin from './pages/Admin.jsx';
import Info from './pages/Info.jsx';

function Guard({ children, admin }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <p className="p-10 text-center">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />; // the server enforces this too
  return children;
}
export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="quiz/:slug" element={<QuizDetails />} />
        <Route path="play/:id" element={<Player />} />
        <Route path="results/:id" element={<Results />} />
        <Route path="login" element={<Auth mode="login" />} />
        <Route path="register" element={<Auth mode="register" />} />
        <Route path="dashboard" element={<Guard><Dashboard /></Guard>} />
        <Route path="admin" element={<Guard admin><Admin /></Guard>} />
        {['about', 'contact', 'privacy', 'terms'].map(p => <Route key={p} path={p} element={<Info page={p} />} />)}
        <Route path="*" element={<p className="p-16 text-center">Page not found.</p>} />
      </Route>
    </Routes>
  );
}

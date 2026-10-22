import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../services/api";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());
  useEffect(() => {
    let live = true;

    async function loadUser() {
      if (!getToken()) {
        if (live) setLoading(false);
        return;
      }

      try {
        const data = await api("/auth/me");

        if (live) {
          setUser(data.user);
        }
      } catch (error) {
        if (live) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (live) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      live = false;
    };
  }, []);
  const authenticate = async (mode, body) => {
    const d = await api(`/auth/${mode}`, { method: "POST", body });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };
  const logout = () => {
    setToken(null);
    setUser(null);
  };
  return (
    <Ctx.Provider value={{ user, setUser, loading, authenticate, logout }}>
      {children}
    </Ctx.Provider>
  );
}
export function useFetch(path, deps = []) {
  const [s, set] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let live = true;
    set((x) => ({ ...x, loading: true, error: null }));
    api(path)
      .then((data) => live && set({ data, error: null, loading: false }))
      .catch(
        (e) => live && set({ data: null, error: e.message, loading: false }),
      );
    return () => {
      live = false;
    };
  }, [path, ...deps]);
  return s;
}

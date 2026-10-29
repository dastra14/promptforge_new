import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../api/authApi.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("pf_user"));
      return u && u.token ? u : null;
    } catch {
      return null;
    }
  });

  const save = (u) => {
    setUser(u);
    localStorage.setItem("pf_user", JSON.stringify(u));
  };

  const login = async (email, password) => save(await loginUser(email, password));

  const register = async (name, email, password) =>
    save(await registerUser(name, email, password));

  const demoLogin = () => {
    const demoUser = {
      name: "Demo Creator",
      email: "demo@promptforge.ai",
      token: "demo_token_prototype",
      credits: 100,
    };
    save(demoUser);
    return demoUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pf_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
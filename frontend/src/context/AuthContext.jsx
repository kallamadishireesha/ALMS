import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(() => {
    const stored = localStorage.getItem("alms_employee");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("alms_token"));

  useEffect(() => {
    if (token) localStorage.setItem("alms_token", token);
    else localStorage.removeItem("alms_token");
  }, [token]);

  useEffect(() => {
    if (employee) localStorage.setItem("alms_employee", JSON.stringify(employee));
    else localStorage.removeItem("alms_employee");
  }, [employee]);

  async function signin(employee_id, password) {
    const { data } = await client.post("/auth/signin", { employee_id, password });
    setToken(data.token);
    setEmployee(data.employee);
    return data;
  }

  async function signup(payload) {
    const { data } = await client.post("/auth/signup", payload);
    setToken(data.token);
    setEmployee(data.employee);
    return data;
  }

  function signout() {
    setToken(null);
    setEmployee(null);
  }

  return (
    <AuthContext.Provider value={{ employee, token, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signin() {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ employee_id: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.employee_id.trim() || !form.password.trim()) {
      setError("Please fill all the details.");
      return;
    }

    setLoading(true);
    try {
      await signin(form.employee_id, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" autoComplete="off" noValidate onSubmit={handleSubmit}>
        <h1>ALMS Sign In</h1>
        <p className="auth-subtitle">Automated Lead Management System</p>

        {error && <div className="auth-error">{error}</div>}

        <label>
          Employee ID
          <input
            type="text"
            value={form.employee_id}
            onChange={update("employee_id")}
            autoComplete="off"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-switch">
          New support agent? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

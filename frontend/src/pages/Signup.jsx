import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [clusters, setClusters] = useState([]);
  const [form, setForm] = useState({
    name: "",
    cluster_id: "",
    employee_id: "",
    password: "",
    password_confirmation: "",
    role: "support_agent",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clustersError, setClustersError] = useState("");

  useEffect(() => {
    client
      .get("/clusters")
      .then(({ data }) => setClusters(data))
      .catch((err) => {
        console.error("Failed to load clusters:", err);
        setClusters([]);
        setClustersError("Could not load clusters — check that the backend server is running, then refresh.");
      });
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const requiredValues = [form.name, form.cluster_id, form.employee_id, form.password, form.password_confirmation, form.role];
    if (requiredValues.some((v) => !String(v).trim())) {
      setError("Please fill all the details.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(Array.isArray(errors) ? errors.join(", ") : "Sign up failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" autoComplete="off" noValidate onSubmit={handleSubmit}>
        <h1>Create Support Agent Account</h1>
        <p className="auth-subtitle">Automated Lead Management System</p>

        {error && <div className="auth-error">{error}</div>}
        {clustersError && <div className="auth-error">{clustersError}</div>}

        <label>
          Full Name
          <input type="text" value={form.name} onChange={update("name")} />
        </label>

        <label>
          Cluster
          <select value={form.cluster_id} onChange={update("cluster_id")} disabled={clusters.length === 0}>
            <option value="" disabled>{clusters.length === 0 ? "No clusters available" : "Select cluster"}</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
            ))}
          </select>
        </label>

        <label>
          Role
          <select value={form.role} onChange={update("role")}>
            <option value="support_agent">Support Agent</option>
            <option value="manager">Manager</option>
          </select>
        </label>

        <label>
          Employee ID
          <input
            type="text"
            inputMode="numeric"
            pattern="\d+"
            value={form.employee_id}
            onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value.replace(/\D/g, "") }))}
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
            minLength={6}
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            value={form.password_confirmation}
            onChange={update("password_confirmation")}
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/signin">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

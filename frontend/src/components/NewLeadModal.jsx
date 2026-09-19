import { useState } from "react";
import client from "../api/client";

const LEAD_SOURCES = [
  { value: "online_call", label: "Online Call" },
  { value: "customer_referral", label: "Customer Referral" },
  { value: "walk_in", label: "Walk-in / Direct" },
];

const LEAD_TYPES = [
  { value: "new_lead", label: "New Lead" },
  { value: "follow_up", label: "Follow-up" },
  { value: "take_over", label: "Take Over" },
];

export default function NewLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    gold_quantity: "",
    amount: "",
    lead_source: "online_call",
    lead_type: "new_lead",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = await client.post("/leads", form);
      onCreated(data);
      onClose();
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(Array.isArray(errors) ? errors.join(", ") : "Could not save lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>Add New Lead</h2>
        {error && <div className="auth-error">{error}</div>}

        <label>
          Customer Name
          <input type="text" value={form.customer_name} onChange={update("customer_name")} required />
        </label>

        <label>
          Mobile Number
          <input type="tel" value={form.phone_number} onChange={update("phone_number")} pattern="\d{10}" required />
        </label>

        <div className="modal-row">
          <label>
            Gold Quantity (g)
            <input type="number" step="0.01" min="0" value={form.gold_quantity} onChange={update("gold_quantity")} required />
          </label>
          <label>
            Amount (₹)
            <input type="number" step="0.01" min="0" value={form.amount} onChange={update("amount")} required />
          </label>
        </div>

        <div className="modal-row">
          <label>
            Lead Source
            <select value={form.lead_source} onChange={update("lead_source")}>
              {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label>
            Lead Type
            <select value={form.lead_type} onChange={update("lead_type")}>
              {LEAD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Lead"}</button>
        </div>
      </form>
    </div>
  );
}

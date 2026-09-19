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

const INITIAL_ROWS = 1;

function emptyRow() {
  return {
    customer_name: "",
    phone_number: "",
    gold_quantity: "",
    amount: "",
    lead_source: "online_call",
    lead_type: "new_lead",
  };
}

function isBlank(row) {
  return !row.customer_name.trim() && !row.phone_number.trim();
}

// Excel-sheet-style bulk lead entry. Agents can add batches of blank rows
// (10 / 50 / 70 at a time) and fill in only as many as they have data for —
// empty rows are ignored on save rather than rejected.
export default function BulkLeadSheet({ onClose, onCreated }) {
  const [rows, setRows] = useState(() => Array.from({ length: INITIAL_ROWS }, emptyRow));
  const [rowErrors, setRowErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [summary, setSummary] = useState(null);
  const [saving, setSaving] = useState(false);

  function addRows(count) {
    setRows((r) => [...r, ...Array.from({ length: count }, emptyRow)]);
    setSummary(null);
  }

  function updateCell(index, field, value) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index) {
    setRows((r) => r.filter((_, i) => i !== index));
    setRowErrors((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  }

  const filledCount = rows.filter((r) => !isBlank(r)).length;

  async function handleSave() {
    setSaving(true);
    setFormError("");
    try {
      const { data } = await client.post("/leads/bulk_create", { leads: rows });

      const errMap = {};
      (data.errors || []).forEach((e) => {
        errMap[e.row - 1] = e.errors.join(", ");
      });
      setRowErrors(errMap);
      setSummary({
        created: data.created_count,
        skipped: data.skipped_blank_count,
        failed: (data.errors || []).length,
      });

      if (data.created_count > 0) onCreated();

      // Drop rows that saved successfully; keep blank rows (still editable)
      // and failed rows (so the agent can fix and re-save just those).
      setRows((prev) => prev.filter((row, i) => errMap[i] !== undefined || isBlank(row)));

      // Everything filled in saved cleanly — close the sheet. If any row
      // failed, keep it open so the agent can fix and resubmit.
      if (Object.keys(errMap).length === 0) {
        onClose();
      }
    } catch (err) {
      setFormError(err.response?.data?.error || "Could not save leads. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet-card" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h2>Add Leads — Bulk Entry</h2>
          <div className="sheet-actions">
            <button type="button" className="btn-secondary" onClick={() => addRows(10)}>+ Add 10 rows</button>
            <button type="button" className="btn-secondary" onClick={() => addRows(50)}>+ Add 50 rows</button>
            <button type="button" className="btn-secondary" onClick={() => addRows(70)}>+ Add 70 rows</button>
          </div>
        </div>

        {formError && <div className="auth-error">{formError}</div>}
        {summary && (
          <div className="sheet-summary">
            Saved {summary.created} lead{summary.created === 1 ? "" : "s"}.
            {summary.skipped > 0 && ` ${summary.skipped} blank row${summary.skipped === 1 ? "" : "s"} skipped.`}
            {summary.failed > 0 && ` ${summary.failed} row${summary.failed === 1 ? "" : "s"} had errors — fix and save again.`}
          </div>
        )}

        <div className="sheet-scroll">
          <table className="sheet-table">
            <thead>
              <tr>
                <th className="sheet-rownum">#</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Gold Qty (g)</th>
                <th>Amount (₹)</th>
                <th>Lead Source</th>
                <th>Lead Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={rowErrors[i] ? "sheet-row-error" : ""} title={rowErrors[i] || undefined}>
                  <td className="sheet-rownum">{i + 1}</td>
                  <td>
                    <input value={row.customer_name} onChange={(e) => updateCell(i, "customer_name", e.target.value)} placeholder="Customer name" />
                  </td>
                  <td>
                    <input value={row.phone_number} onChange={(e) => updateCell(i, "phone_number", e.target.value)} placeholder="10-digit mobile" />
                  </td>
                  <td>
                    <input type="number" step="0.01" min="0" value={row.gold_quantity} onChange={(e) => updateCell(i, "gold_quantity", e.target.value)} />
                  </td>
                  <td>
                    <input type="number" step="0.01" min="0" value={row.amount} onChange={(e) => updateCell(i, "amount", e.target.value)} />
                  </td>
                  <td>
                    <select value={row.lead_source} onChange={(e) => updateCell(i, "lead_source", e.target.value)}>
                      {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <select value={row.lead_type} onChange={(e) => updateCell(i, "lead_type", e.target.value)}>
                      {LEAD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <button type="button" className="sheet-remove" onClick={() => removeRow(i)} title="Remove row">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sheet-footer">
          <span className="sheet-hint">
            {filledCount} of {rows.length} rows filled — blank rows are skipped automatically.
          </span>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            <button type="button" onClick={handleSave} disabled={saving || filledCount === 0}>
              {saving ? "Saving..." : `Save ${filledCount || ""} Lead${filledCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

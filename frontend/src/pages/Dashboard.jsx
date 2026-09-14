import { useCallback, useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import BulkLeadSheet from "../components/BulkLeadSheet";

const NAV_TABS = [
  { key: "new_lead", label: "New Lead" },
  { key: "follow_up", label: "Follow-up" },
  { key: "take_over", label: "Take Over" },
  { key: "gl", label: "GL" },
  { key: "my_leads", label: "My Leads" },
  { key: "performance", label: "Lead Performance" },
];

const STATUS_LABEL = {
  new_status: "New Lead",
  follow_up_status: "Follow-up",
  pending_verification: "Pending Verification",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_CLASS = {
  new_status: "badge-blue",
  follow_up_status: "badge-blue",
  pending_verification: "badge-amber",
  accepted: "badge-green",
  rejected: "badge-red",
};

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function Dashboard() {
  const { employee, signout } = useAuth();
  const isManager = employee?.role === "manager";
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("my_leads");
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(() => {
    client.get("/dashboard").then(({ data }) => setStats(data));
  }, []);

  const loadLeads = useCallback((tab) => {
    if (tab === "my_leads" || tab === "performance") {
      client.get("/leads").then(({ data }) => setLeads(data));
    } else {
      client.get("/leads", { params: { lead_type: tab } }).then(({ data }) => setLeads(data));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadDashboard()]).finally(() => setLoading(false));
  }, [loadDashboard]);

  useEffect(() => {
    loadLeads(activeTab);
  }, [activeTab, loadLeads]);

  function handleTabClick(tab) {
    if (tab === "new_lead") {
      setShowModal(true);
      return;
    }
    setActiveTab(tab);
  }

  function handleLeadCreated() {
    loadDashboard();
    loadLeads(activeTab);
  }

  function handleDelete(lead) {
    if (!window.confirm(`Delete lead ${lead.lead_code} (${lead.customer_name})? This can't be undone.`)) return;
    client.delete(`/leads/${lead.id}`).then(() => {
      loadDashboard();
      loadLeads(activeTab);
    });
  }

  function handleStatusChange(lead, status) {
    client.patch(`/leads/${lead.id}`, { status }).then(() => {
      loadDashboard();
      loadLeads(activeTab);
    });
  }

  if (loading || !stats) {
    return <div className="page-loading">Loading dashboard…</div>;
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>Dashboard</h1>
        <div className="topbar-user">
          <div className="avatar">{employee?.name?.slice(0, 2).toUpperCase()}</div>
          <div className="user-meta">
            <strong>{employee?.name}</strong>
            <span>Employee · {employee?.employee_id}</span>
          </div>
          <button className="btn-secondary" onClick={signout}>Sign out</button>
        </div>
      </header>

      <nav className="tabbar">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === "new_lead" ? "btn-primary" : activeTab === tab.key ? "tab active" : "tab"}
            onClick={() => handleTabClick(tab.key)}
          >
            {tab.key === "new_lead" ? "+ New Lead" : tab.label}
          </button>
        ))}
      </nav>

      <section className="stat-grid">
        <StatCard label="Today's New Leads" value={stats.today_new_leads} />
        <StatCard label="Follow-ups" value={stats.follow_ups} />
        <StatCard label="Pending Verification" value={stats.pending_verification} />
        <StatCard label="Accepted Leads" value={stats.accepted_leads} />
        <StatCard label="Rejected Leads" value={stats.rejected_leads} />
        <StatCard label="Total Lead Value" value={formatCurrency(stats.total_lead_value)} />
        <StatCard label="Genuine Lead %" value={`${stats.genuine_lead_percent}%`} />
        <StatCard label="Lead Quality Score" value={`${stats.lead_quality_score}/100`} highlight />
      </section>

      <section className="activity-card">
        <h2>Recent Activity — {isManager ? "All Leads" : "Your Leads"}</h2>
        <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>LEAD ID</th>
              <th>CUSTOMER</th>
              <th>MOBILE</th>
              <th>TYPE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>UPDATED</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={8} className="empty-row">No leads yet — add your first lead.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.lead_code}</td>
                <td>{lead.customer_name}</td>
                <td className="mono">{lead.phone_number}</td>
                <td>{lead.lead_type.replace("_", " ")}</td>
                <td>{formatCurrency(lead.amount)}</td>
                <td>
                  {isManager ? (
                    <select
                      className={`status-select ${STATUS_CLASS[lead.status]}`}
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value)}
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge ${STATUS_CLASS[lead.status]}`}>{STATUS_LABEL[lead.status]}</span>
                  )}
                </td>
                <td>{new Date(lead.updated_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td>
                  <button type="button" className="row-delete" title="Delete lead" onClick={() => handleDelete(lead)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      {showModal && (
        <BulkLeadSheet onClose={() => setShowModal(false)} onCreated={handleLeadCreated} />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={highlight ? "stat-card highlight" : "stat-card"}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

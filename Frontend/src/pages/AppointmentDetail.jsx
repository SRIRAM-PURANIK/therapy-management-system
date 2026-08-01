import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [notes, setNotes] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [reports, setReports] = useState([]);

  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const loadAll = async () => {
    try {
      const [a, n, s, r] = await Promise.all([
        api.get(`/appointments/${id}`),
        api.get(`/notes/appointment/${id}`),
        api.get(`/summaries/appointment/${id}`),
        api.get(`/reports/appointment/${id}`),
      ]);
      setAppointment(a.data);
      setNotes(n.data);
      setSummaries(s.data);
      setReports(r.data);
    } catch (err) {
      setError("Could not load data");
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const addNote = async () => {
    if (content.trim().length < 20) {
      setError("Note must be at least 20 characters");
      return;
    }
    setError("");
    setBusy("note");
    try {
      await api.post("/notes", { appointmentId: id, content });
      setContent("");
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save note");
    }
    setBusy("");
  };

  const generateSummary = async () => {
    setError("");
    setBusy("summary");
    try {
      await api.post("/summaries/generate", { appointmentId: id });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate summary");
    }
    setBusy("");
  };

  const approveSummary = async (summaryId) => {
    setError("");
    setBusy("approve" + summaryId);
    try {
      await api.patch(`/summaries/${summaryId}/approve`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not approve");
    }
    setBusy("");
  };

  const generateReport = async () => {
    setError("");
    setBusy("report");
    try {
      await api.post("/reports/generate", { appointmentId: id });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate report");
    }
    setBusy("");
  };

  const toggleStatus = async () => {
    setError("");
    setBusy("status");
    try {
      await api.patch(`/appointments/${id}/status`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update status");
    }
    setBusy("");
  };

  if (!appointment) {
    return (
      <div className="page">
        <p className="muted">Loading...</p>
      </div>
    );
  }

  const pendingNotes = notes.filter((n) => !n.isSummarized).length;

  return (
    <div className="page">
      <div className="row">
        <div>
          <h1>{appointment.name}</h1>
          <p className="muted">{appointment.status}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="secondary"
            onClick={toggleStatus}
            disabled={busy === "status"}
          >
            {appointment.status === "Active" ? "Close Session" : "Reopen"}
          </button>
          <button
            className="secondary"
            onClick={() => navigate("/appointments")}
          >
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="card">
          <p className="error" style={{ marginBottom: 0 }}>
            {error}
          </p>
        </div>
      )}

      <div className="card">
        <h2>Write a session note</h2>
        <textarea
          placeholder="What happened in this session..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={addNote} disabled={busy === "note"}>
          {busy === "note" ? "Saving..." : "Save note"}
        </button>
      </div>

      <div className="card">
        <h2>Session notes ({notes.length})</h2>

        {notes.length === 0 && <p className="muted">No notes yet.</p>}

        {notes.map((n) => (
          <div key={n._id} className="note">
            <p>{n.content}</p>
            <p className="muted" style={{ marginTop: 6 }}>
              {new Date(n.sessionDate).toDateString()} —{" "}
              {n.isSummarized ? "Summarised" : "Not yet summarised"}
            </p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2> Combined session summary</h2>
        <p className="muted" style={{ marginBottom: 14 }}>
          {pendingNotes} note{pendingNotes === 1 ? "" : "s"} waiting to be
          summarised
        </p>

        <button
          onClick={generateSummary}
          disabled={busy === "summary" || pendingNotes === 0}
        >
          {busy === "summary" ? "Generating..." : "Generate summary"}
        </button>

        {summaries.map((s) => (
          <div key={s._id} className="note" style={{ marginTop: 18 }}>
            <div className="row" style={{ marginBottom: 10 }}>
              <span className={`badge ${s.status.toLowerCase()}`}>
                {s.status}
              </span>
              <span className="muted">Mood rating: {s.moodRating}/10</span>
            </div>

            <p>{s.summaryText}</p>

            <p className="muted" style={{ marginTop: 12 }}>
              Themes
            </p>
            <div>
              {s.themes.map((t, i) => (
                <span key={i} className="tag">
                  {t}
                </span>
              ))}
            </div>

            <p className="muted" style={{ marginTop: 8 }}>
              Goals discussed
            </p>
            <ul className="plain">
              {s.goalsDiscussed.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>

            <p className="muted">Follow-up points</p>
            <ul className="plain">
              {s.followUpPoints.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <p className="muted" style={{ marginBottom: 10 }}>
              Built from {s.sessionNotes.length} session note
              {s.sessionNotes.length === 1 ? "" : "s"}
            </p>

            {s.status === "Pending" && (
              <button
                onClick={() => approveSummary(s._id)}
                disabled={busy === "approve" + s._id}
              >
                {busy === "approve" + s._id ? "Approving..." : "Approve"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2> Progress report</h2>
        <p className="muted" style={{ marginBottom: 14 }}>
          Built from approved summaries only
        </p>

        <button onClick={generateReport} disabled={busy === "report"}>
          {busy === "report" ? "Generating..." : "Generate progress report"}
        </button>

        {reports.map((r) => (
          <div key={r._id} className="note" style={{ marginTop: 18 }}>
            <p className="muted">
              {new Date(r.createdAt).toDateString()} — built from{" "}
              {r.summaries.length} approved summar
              {r.summaries.length === 1 ? "y" : "ies"}
            </p>

            <p style={{ marginTop: 10 }}>
              <strong>Overall progress</strong>
            </p>
            <p>{r.overallProgress}</p>

            <p style={{ marginTop: 12 }}>
              <strong>Report</strong>
            </p>
            <p>{r.reportText}</p>

            <p className="muted" style={{ marginTop: 12 }}>
              Recurring themes
            </p>
            <div>
              {r.recurringThemes.map((t, i) => (
                <span key={i} className="tag">
                  {t}
                </span>
              ))}
            </div>

            <p className="muted" style={{ marginTop: 8 }}>
              Goal progress
            </p>
            <ul className="plain">
              {r.goalProgress.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>

            <p className="muted">Recommendations</p>
            <ul className="plain">
              {r.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppointmentDetail;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const navigate = useNavigate();

  const therapistName = localStorage.getItem("name");

  const loadAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      setError("Could not load appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await api.post("/appointments", { name });
      setName("");
      loadAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create appointment");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const visible = showActiveOnly
    ? appointments.filter((a) => a.status === "Active")
    : appointments;

  return (
    <div className="page">
      <div className="row">
        <div>
          <h1>Appointments</h1>
          <p className="muted">Welcome {therapistName}</p>
        </div>
        <button className="secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="card">
        <h2>Add a new person</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button onClick={handleCreate} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: 16 }}>
          <h2 style={{ marginBottom: 0, paddingBottom: 0, border: "none" }}>
            {showActiveOnly ? "Active" : "All"} appointments ({visible.length})
          </h2>
          <button
            className="secondary"
            onClick={() => setShowActiveOnly(!showActiveOnly)}
          >
            {showActiveOnly ? "Show all" : "Show active only"}
          </button>
        </div>

        {visible.length === 0 && (
          <p className="muted">
            {showActiveOnly ? "No active appointments." : "No appointments yet."}
          </p>
        )}

        {visible.map((a) => (
          <div
            key={a._id}
            className="list-item"
            onClick={() => navigate(`/appointments/${a._id}`)}
          >
            <strong>{a.name}</strong>
            <span className="muted"> — {a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Appointments;
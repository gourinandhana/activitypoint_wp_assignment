import React, { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import students from "./data/students.json";
import categories from "./data/categories.json";
import activitiesData from "./data/activities.json";

const STORAGE_KEY = "apms_current_user";
const ACTIVITY_KEY = "apms_activities";

function getInitialActivities() {
  try {
    const saved = localStorage.getItem(ACTIVITY_KEY);
    return saved ? JSON.parse(saved) : activitiesData;
  } catch {
    return activitiesData;
  }
}

function getCurrentUser() {
  const uid = localStorage.getItem(STORAGE_KEY);
  return students.find((student) => student.uid === uid) || null;
}

function App() {
  const [user, setUser] = useState(getCurrentUser);
  const [activities, setActivities] = useState(getInitialActivities);

  useEffect(() => {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  }, [activities]);

  const login = (uid, password) => {
    const found = students.find((student) => student.uid === uid && student.password === password);
    if (!found) return false;
    localStorage.setItem(STORAGE_KEY, found.uid);
    setUser(found);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const addActivity = (activity) => {
    const newActivity = {
      ...activity,
      id: `custom-${Date.now()}`,
      uid: user.uid,
      pointsApproved: 0,
      status: "Pending"
    };
    setActivities((current) => [newActivity, ...current]);
  };

  const userActivities = activities.filter((activity) => activity.uid === user?.uid);

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={login} />}
      />
      <Route
        path="/*"
        element={
          user ? (
            <AppShell user={user} onLogout={logout} activities={userActivities}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard user={user} activities={userActivities} />} />
                <Route path="/activities" element={<ActivityList activities={userActivities} />} />
                <Route path="/add-activity" element={<AddActivity onAdd={addActivity} />} />
                <Route path="/profile" element={<Profile user={user} activities={userActivities} />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const success = onLogin(uid.trim().toLowerCase(), password);
    if (success) navigate("/dashboard");
    else setError("Invalid UID or password. Please check your details.");
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
  <div>
    <span className="eyebrow">STUDENT PORTAL</span>
    <h1>Activity Points</h1>
  </div>
</div>

        <div className="login-copy">
          <h2>Welcome back</h2>
          <p>Sign in to view and manage your activity points.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            UID
            <input
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="e.g. u2408001"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-btn full" type="submit">Sign in</button>
        </form>

        
      </section>
    </main>
  );
}

function AppShell({ user, onLogout, children }) {
  const location = useLocation();
  const pageTitle = {
    "/dashboard": "Dashboard",
    "/activities": "Activities",
    "/add-activity": "Add Activity",
    "/profile": "Student Profile"
  }[location.pathname] || "Activity Points";

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
  <div>
    <strong>Activity Points</strong>
    <span>Student Portal</span>
  </div>
</div>

        <nav className="nav">
          <NavItem to="/dashboard" icon="⌂" label="Dashboard" />
          <NavItem to="/activities" icon="✓" label="Activities" />
          <NavItem to="/add-activity" icon="＋" label="Add Activity" />
          <NavItem to="/profile" icon="○" label="Profile" />
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.uid}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>↪ <span>Logout</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">STUDENT PORTAL</span>
            <h1>{pageTitle}</h1>
          </div>
          <div className="top-user">
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.department}</span>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} to={to}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function Dashboard({ user, activities }) {
  const approved = activities.reduce((sum, item) => sum + Number(item.pointsApproved || 0), 0);
  const target = user.targetPoints;
  const remaining = Math.max(target - approved, 0);
  const progress = Math.min((approved / target) * 100, 100);

  const pending = activities.filter((a) => a.status === "Pending").length;
  const approvedCount = activities.filter((a) => a.status === "Approved").length;

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="muted">Good to see you again</p>
          <h2>Hello, {user.name.split(" ")[0]} 👋</h2>
          <p className="muted">Keep building your activity profile one achievement at a time.</p>
        </div>
        <div className="semester-pill">{user.semester} • {user.department}</div>
      </section>

      <section className="stats-grid">
        <StatCard label="Points Earned" value={approved} suffix="pts" icon="★" />
        <StatCard label="Target Points" value={target} suffix="pts" icon="◎" />
        <StatCard label="Points Remaining" value={remaining} suffix="pts" icon="↗" />
        <StatCard label="Activities" value={activities.length} suffix="total" icon="✓" />
      </section>

      <section className="dashboard-grid">
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">YOUR PROGRESS</span>
              <h3>Activity points target</h3>
            </div>
            <strong className="progress-number">{approved}/{target}</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-meta">
            <span>{Math.round(progress)}% completed</span>
            <span>{remaining} points to go</span>
          </div>

          <div className="quick-summary">
            <div><span className="dot approved-dot" />{approvedCount} approved</div>
            <div><span className="dot pending-dot" />{pending} pending</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CATEGORIES</span>
              <h3>Activity areas</h3>
            </div>
          </div>
          <div className="category-mini-grid">
            {categories.map((category) => (
              <div className="category-mini" key={category.id}>
                <span className="category-icon">{category.icon}</span>
                <div>
                  <strong>{category.name}</strong>
                  <span>{activities.filter((a) => a.category === category.name).length} activities</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">RECENT</span>
            <h3>Recent activities</h3>
          </div>
          <NavLink className="text-link" to="/activities">View all →</NavLink>
        </div>
        <ActivityTable activities={activities.slice(0, 5)} compact />
      </section>
    </>
  );
}

function StatCard({ label, value, suffix, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <div className="stat-value">{value} <small>{suffix}</small></div>
      </div>
    </div>
  );
}

function ActivityList({ activities }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      const matchesFilter = filter === "All" || activity.category === filter || activity.status === filter;
      const query = search.toLowerCase();
      const matchesSearch =
        activity.title.toLowerCase().includes(query) ||
        activity.category.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [activities, filter, search]);

  const filters = ["All", "Approved", "Pending", ...categories.map((c) => c.name)];

  return (
    <>
      <section className="page-intro">
        <div>
          <h2>My Activities</h2>
          <p className="muted">Track activities, claimed points and approval status.</p>
        </div>
        <NavLink className="primary-btn" to="/add-activity">＋ Add activity</NavLink>
      </section>

      <div className="toolbar">
        <div className="search">
          <span>⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search activities..." />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {filters.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <section className="panel table-panel">
        <ActivityTable activities={filtered} />
        {filtered.length === 0 && <div className="empty">No activities match your search.</div>}
      </section>
    </>
  );
}

function ActivityTable({ activities, compact = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Category</th>
            <th>Date</th>
            <th>Claimed</th>
            <th>Approved</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>
                <strong>{activity.title}</strong>
                {!compact && <small className="description">{activity.description}</small>}
              </td>
              <td><span className="category-badge">{activity.category}</span></td>
              <td>{formatDate(activity.date)}</td>
              <td>{activity.pointsClaimed}</td>
              <td><strong>{activity.pointsApproved}</strong></td>
              <td><Status status={activity.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Status({ status }) {
  return <span className={`status ${status.toLowerCase()}`}><span />{status}</span>;
}

function AddActivity({ onAdd }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: categories[0].name,
    date: new Date().toISOString().slice(0, 10),
    description: "",
    pointsClaimed: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onAdd({ ...form, pointsClaimed: Number(form.pointsClaimed) });
    setSubmitted(true);
    setTimeout(() => navigate("/activities"), 700);
  };

  return (
    <section className="form-page">
      <div className="page-intro">
        <div>
          <h2>Submit an activity</h2>
          <p className="muted">Add a new achievement for approval.</p>
        </div>
      </div>

      <div className="panel form-panel">
        {submitted ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h3>Activity submitted!</h3>
            <p>Your activity has been added with <strong>Pending</strong> status.</p>
          </div>
        ) : (
          <form className="form activity-form" onSubmit={submit}>
            <div className="form-grid">
              <label className="span-2">
                Activity title
                <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Web Development Workshop" required />
              </label>

              <label>
                Category
                <select value={form.category} onChange={(e) => update("category", e.target.value)}>
                  {categories.map((category) => <option key={category.id}>{category.name}</option>)}
                </select>
              </label>

              <label>
                Date
                <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
              </label>

              <label>
                Points claimed
                <input type="number" min="1" max="100" value={form.pointsClaimed} onChange={(e) => update("pointsClaimed", e.target.value)} placeholder="e.g. 5" required />
              </label>

              <label className="span-2">
                Description
                <textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Briefly describe the activity and your participation..." rows="5" required />
              </label>
            </div>

            <div className="form-footer">
              <p><strong>What happens next?</strong> Your submission will appear as Pending until reviewed.</p>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={() => navigate("/activities")}>Cancel</button>
                <button type="submit" className="primary-btn">Submit activity</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Profile({ user, activities }) {
  const approved = activities.reduce((sum, item) => sum + Number(item.pointsApproved || 0), 0);
  const claimed = activities.reduce((sum, item) => sum + Number(item.pointsClaimed || 0), 0);
  const target = user.targetPoints;

  return (
    <>
      <section className="profile-hero panel">
        <div className="profile-avatar">{initials(user.name)}</div>
        <div className="profile-main">
          <span className="eyebrow">STUDENT PROFILE</span>
          <h2>{user.name}</h2>
          <p className="muted">{user.uid} • {user.department}</p>
        </div>
        <div className="profile-semester">
          <span>Current semester</span>
          <strong>{user.semester}</strong>
        </div>
      </section>

      <section className="profile-grid">
        <div className="panel">
          <div className="panel-heading"><h3>Student information</h3></div>
          <div className="details">
            <Detail label="Full name" value={user.name} />
            <Detail label="UID" value={user.uid} />
            <Detail label="Department" value={user.department} />
            <Detail label="Semester" value={user.semester} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading"><h3>Points summary</h3></div>
          <div className="summary-list">
            <SummaryRow label="Points claimed" value={`${claimed} pts`} />
            <SummaryRow label="Points approved" value={`${approved} pts`} strong />
            <SummaryRow label="Target points" value={`${target} pts`} />
            <SummaryRow label="Remaining" value={`${Math.max(target - approved, 0)} pts`} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><h3>Activity overview</h3></div>
        <ActivityTable activities={activities} />
      </section>
    </>
  );
}

function Detail({ label, value }) {
  return <div className="detail"><span>{label}</span><strong>{value}</strong></div>;
}

function SummaryRow({ label, value, strong }) {
  return <div className="summary-row"><span>{label}</span><strong className={strong ? "green-text" : ""}>{value}</strong></div>;
}

function initials(name) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default App;
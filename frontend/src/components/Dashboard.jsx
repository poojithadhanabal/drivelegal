export default function Dashboard() {
  const stats = [
    { label: 'Supported States',   value: '4',   sub: '+ UK & UAE', icon: '🗺️', color: 'teal'   },
    { label: 'Total Violations',   value: '48+', sub: 'Indexed',    icon: '⚠️', color: 'amber'  },
    { label: 'High Risk Offences', value: '18',  sub: 'Flagged',    icon: '🔥', color: 'red'    },
    { label: 'Countries Covered',  value: '3',   sub: 'India+',     icon: '🌍', color: 'blue'   },
  ]

  const riskData = [
    { label: 'Severe', count: 6,  pct: 12, color: '#e24b4a' },
    { label: 'High',   count: 18, pct: 37, color: '#ef9f27' },
    { label: 'Medium', count: 20, pct: 41, color: '#378add' },
    { label: 'Low',    count: 4,  pct: 8,  color: '#639922' },
  ]

  const topViolations = [
    { name: 'Helmet Violation',     count: 2840, pct: 88 },
    { name: 'Mobile While Driving', count: 1920, pct: 60 },
    { name: 'Overspeeding',         count: 1540, pct: 48 },
    { name: 'Drunk Driving',        count: 980,  pct: 30 },
    { name: 'No Insurance',         count: 760,  pct: 24 },
    { name: 'Red Light Jump',       count: 620,  pct: 19 },
  ]

  const stateData = [
    { name: 'Tamil Nadu',  violations: 48, states: 12 },
    { name: 'Delhi',       violations: 42, states: 10 },
    { name: 'Karnataka',   violations: 38, states: 9  },
    { name: 'Maharashtra', violations: 35, states: 8  },
  ]

  return (
    <div className="dash-root">

      {/* ── HEADER ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Analytics</h1>
          <p className="dash-subtitle">DriveLegal coverage and violation statistics</p>
        </div>
        <div className="dash-updated">Updated · May 2026</div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="dash-stats">
        {stats.map((s, i) => (
          <div key={i} className={`dash-stat-card ${s.color}`}>
            <div className="dash-stat-icon">{s.icon}</div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TWO COLUMN ── */}
      <div className="dash-two-col">

        {/* Risk Distribution */}
        <div className="dash-card">
          <div className="dash-card-title">Risk Distribution</div>
          <div className="dash-risk-list">
            {riskData.map((r, i) => (
              <div key={i} className="dash-risk-row">
                <span className="dash-risk-label">{r.label}</span>
                <div className="dash-risk-bar-wrap">
                  <div
                    className="dash-risk-bar-fill"
                    style={{ width: `${r.pct}%`, background: r.color }}
                  />
                </div>
                <span className="dash-risk-count">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Violations */}
        <div className="dash-card">
          <div className="dash-card-title">Top Violations</div>
          <div className="dash-viol-list">
            {topViolations.map((v, i) => (
              <div key={i} className="dash-viol-row">
                <div className="dash-viol-info">
                  <span className="dash-viol-rank">{i + 1}</span>
                  <span className="dash-viol-name">{v.name}</span>
                </div>
                <div className="dash-viol-bar-wrap">
                  <div
                    className="dash-viol-bar-fill"
                    style={{ width: `${v.pct}%` }}
                  />
                </div>
                <span className="dash-viol-count">{v.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── STATE TABLE ── */}
      <div className="dash-card">
        <div className="dash-card-title">Coverage by State</div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>State</th>
              <th>Violations Indexed</th>
              <th>Law Sections</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stateData.map((s, i) => (
              <tr key={i}>
                <td className="dash-table-state">{s.name}</td>
                <td>{s.violations}</td>
                <td>{s.states}</td>
                <td><span className="dash-badge active">Active</span></td>
              </tr>
            ))}
            <tr>
              <td className="dash-table-state">UK</td>
              <td>12</td>
              <td>5</td>
              <td><span className="dash-badge active">Active</span></td>
            </tr>
            <tr>
              <td className="dash-table-state">UAE</td>
              <td>10</td>
              <td>4</td>
              <td><span className="dash-badge active">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

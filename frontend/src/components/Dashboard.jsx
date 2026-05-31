export default function Dashboard() {
  const stats = [
    {
      label: 'Supported States',
      value: '4',
      sub: '+ UK & UAE',
      icon: '🗺️',
      color: 'teal',
    },
    {
      label: 'Total Violations',
      value: '48+',
      sub: 'Indexed',
      icon: '⚠️',
      color: 'amber',
    },
    {
      label: 'High Risk Offences',
      value: '18',
      sub: 'Flagged',
      icon: '🔥',
      color: 'red',
    },
    {
      label: 'Countries Covered',
      value: '2',
      sub: 'India+',
      icon: '🌍',
      color: 'blue',
    },
  ]

  const riskData = [
    { label: 'Severe', count: 6,  pct: 12, color: '#f05252' },
    { label: 'High',   count: 18, pct: 37, color: '#f5a623' },
    { label: 'Medium', count: 20, pct: 41, color: '#4a9eff' },
    { label: 'Low',    count: 4,  pct: 8,  color: '#22b86e' },
  ]

  const topViolations = [
    { name: 'Helmet Violation',       count: 2840, pct: 88 },
    { name: 'Mobile While Driving',   count: 1920, pct: 60 },
    { name: 'Overspeeding',           count: 1540, pct: 48 },
    { name: 'Drunk Driving',          count: 980,  pct: 30 },
    { name: 'No Insurance',           count: 760,  pct: 24 },
    { name: 'Red Light Jump',         count: 620,  pct: 19 },
  ]

  const stateData = [
    { name: 'Tamil Nadu',  violations: 48, sections: 12 },
    { name: 'Delhi',       violations: 42, sections: 10 },
    { name: 'Karnataka',   violations: 38, sections: 9  },
    { name: 'Maharashtra', violations: 35, sections: 8  },
    { name: 'UK',          violations: 12, sections: 5  },
    { name: 'UAE',         violations: 10, sections: 4  },
  ]

  return (
    <div className="dash-root">

      {/* ── HEADER ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Safety Intelligence</h1>
          <p className="dash-subtitle">
            AI-powered traffic risk and violation insights
          </p>
        </div>
        <div className="dash-updated">Updated · May 2026</div>
      </div>

      {/* ── STATS ── */}
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

        {/* Risk distribution */}
        <div className="dash-card">
          <div className="dash-card-title">🚨 Risk Distribution</div>
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

        {/* Top violations */}
        <div className="dash-card">
          <div className="dash-card-title">📈 Top Violations</div>
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
                <span className="dash-viol-count">
                  {v.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATE TABLE ── */}
      <div className="dash-card">
        <div className="dash-card-title">🌍 Coverage by State</div>
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
                <td>{s.sections}</td>
                <td>
                  <span className="dash-badge active">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── AI INSIGHTS ── */}
      <div className="dash-card">
        <div className="dash-card-title">🤖 AI Safety Insights</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>

          <div className="dash-insight red">
            <div className="dash-insight-heading">High Risk Alert</div>
            <p>
              Drunk driving and mobile phone usage while driving show the
              highest accident risk levels across the indexed legal database.
            </p>
          </div>

          <div className="dash-insight amber">
            <div className="dash-insight-heading">Repeat Offence Impact</div>
            <p>
              Repeat offenders may face significantly higher fines, license
              suspension, and stricter legal actions depending on jurisdiction.
            </p>
          </div>

          <div className="dash-insight green">
            <div className="dash-insight-heading">Road Safety Observation</div>
            <p>
              Helmet violations and mobile phone usage remain the most commonly
              queried offences across supported states and countries.
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
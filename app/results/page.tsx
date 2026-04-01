'use client';

import { useState, useEffect } from 'react';
import { fetchAllResponses, SurveyResponse } from '@/lib/supabase';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';

const PASSWORD = 'cmprssn2026';

export default function ResultsDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterQuadrant, setFilterQuadrant] = useState<string>('all');
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === PASSWORD) {
      setAuthed(true);
      loadData();
    } else {
      setPwError('Incorrect password.');
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchAllResponses();
      setResponses(data);
    } catch (e) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fade-in-up" style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span className="tag-pill">Research Dashboard</span>
          </div>
          <h1 style={{ fontFamily: 'Audiowide', fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>
            CMPRSSN Results
          </h1>
          <p style={{ color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Restricted access. Researchers only.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                background: 'rgba(14, 26, 46, 0.8)',
                border: '1px solid rgba(74, 126, 191, 0.3)',
                color: '#E2EEF4',
                fontFamily: 'Rajdhani',
                fontSize: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '4px',
                outline: 'none',
                marginBottom: '0.75rem',
              }}
            />
            {pwError && <div style={{ color: '#FF4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{pwError}</div>}
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Process data
  const scatterData = responses.map(r => {
    try {
      const ans = r.answers as Record<string, string | string[]>;
      const q2Opts = ["I do the work, AI assists","AI does the work, I review","AI does the work, I direct strategy","Agents run autonomously, I handle exceptions","I'm not sure where I end and agents begin"];
      const q3Opts = ["Agents need approval for everything","Most things need approval, some are automated","Roughly 50/50","Most runs autonomously, I handle edge cases","Almost everything runs without me"];
      const q4Opts = ["No explicit governance","Mental rules I haven't written down","Written docs/guidelines","Config files (AGENTS.md, SOUL.md, etc.)","Programmatic policy with enforcement and monitoring"];
      const q5Opts = ["None","I check outputs manually","Git history / logs","Structured logging with review","Real-time monitoring and alerts"];

      const auto = (Math.max(0, q2Opts.indexOf(ans.q2 as string)) + Math.max(0, q3Opts.indexOf(ans.q3 as string))) / 2;
      const gov = (Math.max(0, q4Opts.indexOf(ans.q4 as string)) + Math.max(0, q5Opts.indexOf(ans.q5 as string))) / 2;

      return { x: auto, y: gov, quadrant: r.quadrant, id: r.id };
    } catch { return null; }
  }).filter(Boolean) as { x: number; y: number; quadrant: string; id: string }[];

  const spendLabels = ['Under $20', '$20–100', '$100–500', '$500–2000', 'Over $2000'];
  const spendData = spendLabels.map(label => ({
    label,
    count: responses.filter(r => (r.answers as Record<string, string | string[]>).q8 === label).length,
  }));

  const protocols = ['They don\'t communicate', 'Shared filesystem', 'MCP', 'A2A', 'Custom protocols', 'Message queues', 'Direct API calls'];
  const protocolData = protocols.map(p => ({
    name: p.length > 20 ? p.slice(0, 18) + '…' : p,
    fullName: p,
    count: responses.filter(r => {
      const q10 = (r.answers as Record<string, string | string[]>).q10;
      return Array.isArray(q10) && q10.includes(p);
    }).length,
  }));

  // Compute word frequencies from Q6 + Q11
  const allText = responses.flatMap(r => {
    const ans = r.answers as Record<string, string | string[]>;
    return [ans.q6, ans.q11].filter(Boolean) as string[];
  }).join(' ');
  const words = allText.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const stopWords = new Set(['their','there','these','about','which','would','could','have','been','when','with','that','from','this','were','they','also']);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length > 4 && !stopWords.has(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 30);

  const quadrantColors: Record<string, string> = {
    'Manual Craft': '#4A7EBF',
    'Supervised Fleet': '#0088FF',
    'Cowboy Ops': '#FF6B35',
    'Composed System': '#00CC88',
  };

  const filtered = filterQuadrant === 'all' ? responses : responses.filter(r => r.quadrant === filterQuadrant);

  function exportCSV() {
    const headers = ['id', 'quadrant', 'profile', 'created_at', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'];
    const rows = responses.map(r => {
      const ans = r.answers as Record<string, string | string[]>;
      return [
        r.id, r.quadrant, r.profile, r.created_at,
        ...['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12'].map(k => {
          const v = ans[k];
          return Array.isArray(v) ? v.join('; ') : (v || '');
        })
      ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cmprssn-responses-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <span className="tag-pill" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Research Dashboard</span>
          <h1 style={{ fontFamily: 'Audiowide', fontSize: '1.75rem', color: 'white' }}>CMPRSSN Results</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '0.9rem' }}>
            {responses.length} responses
          </span>
          <button className="btn-ghost" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#4A7EBF', fontFamily: 'Rajdhani', textAlign: 'center', padding: '3rem' }}>
          Loading data...
        </div>
      )}

      {error && (
        <div style={{ color: '#FF4444', fontFamily: 'Rajdhani', marginBottom: '1rem' }}>{error}</div>
      )}

      {!loading && responses.length === 0 && (
        <div style={{
          background: 'rgba(14, 26, 46, 0.6)',
          border: '1px solid rgba(74, 126, 191, 0.2)',
          borderRadius: '6px',
          padding: '3rem',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <p style={{ color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '1.1rem' }}>
            No survey responses yet.
          </p>
          <p style={{ color: '#3A5070', fontFamily: 'Rajdhani', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Share the survey link to start collecting data.
          </p>
        </div>
      )}

      {responses.length > 0 && (
        <>
          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Scatter Plot */}
            <div className="chart-container">
              <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.8rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                Autonomy × Governance Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,126,191,0.1)" />
                  <XAxis
                    type="number" dataKey="x" name="Autonomy" domain={[0, 4]}
                    tick={{ fill: '#4A7EBF', fontSize: 11, fontFamily: 'Rajdhani' }}
                    label={{ value: 'Autonomy', position: 'insideBottom', offset: -10, fill: '#3A5070', fontFamily: 'Rajdhani', fontSize: 11 }}
                  />
                  <YAxis
                    type="number" dataKey="y" name="Governance" domain={[0, 4]}
                    tick={{ fill: '#4A7EBF', fontSize: 11, fontFamily: 'Rajdhani' }}
                    label={{ value: 'Governance', angle: -90, position: 'insideLeft', fill: '#3A5070', fontFamily: 'Rajdhani', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ background: '#0E1A2E', border: '1px solid rgba(74,126,191,0.3)', fontFamily: 'Rajdhani', color: '#E2EEF4' }}
                    formatter={(val, name) => [val, name]}
                  />
                  <Scatter
                    data={scatterData}
                    fill="#0088FF"
                  >
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={quadrantColors[entry.quadrant] || '#0088FF'} fillOpacity={0.8} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Compute Spend */}
            <div className="chart-container">
              <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.8rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                Monthly Compute Spend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,126,191,0.1)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#4A7EBF', fontSize: 10, fontFamily: 'Rajdhani' }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#4A7EBF', fontSize: 11, fontFamily: 'Rajdhani' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0E1A2E', border: '1px solid rgba(74,126,191,0.3)', fontFamily: 'Rajdhani', color: '#E2EEF4' }}
                  />
                  <Bar dataKey="count" name="Responses" fill="#0088FF" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Protocol Adoption */}
            <div className="chart-container" style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.8rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                Agent Communication Protocols (Q10)
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={protocolData} margin={{ top: 10, right: 10, bottom: 40, left: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,126,191,0.1)" />
                  <XAxis type="number" tick={{ fill: '#4A7EBF', fontSize: 11, fontFamily: 'Rajdhani' }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#4A7EBF', fontSize: 10, fontFamily: 'Rajdhani' }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#0E1A2E', border: '1px solid rgba(74,126,191,0.3)', fontFamily: 'Rajdhani', color: '#E2EEF4' }}
                    formatter={(val, name, props) => [val, props.payload.fullName]}
                  />
                  <Bar dataKey="count" fill="#4A7EBF" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Word Cloud (simple frequency display) */}
          <div className="chart-container" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.8rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              Open Text Themes (Q6 + Q11)
            </h2>
            {topWords.length === 0 ? (
              <p style={{ color: '#3A5070', fontFamily: 'Rajdhani' }}>No open text responses yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                {topWords.map(([word, count]) => (
                  <span
                    key={word}
                    style={{
                      fontFamily: 'Rajdhani',
                      fontWeight: 600,
                      fontSize: `${Math.max(0.8, Math.min(2.5, 0.7 + count * 0.3))}rem`,
                      color: `rgba(0, 136, 255, ${Math.max(0.4, Math.min(1, 0.3 + count * 0.15))})`,
                      lineHeight: 1.2,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Response table */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.8rem', color: '#4A7EBF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Responses ({filtered.length})
              </h2>
              <select
                value={filterQuadrant}
                onChange={e => setFilterQuadrant(e.target.value)}
                style={{
                  background: 'rgba(14, 26, 46, 0.8)',
                  border: '1px solid rgba(74, 126, 191, 0.3)',
                  color: '#E2EEF4',
                  fontFamily: 'Rajdhani',
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Quadrants</option>
                <option value="Manual Craft">Manual Craft</option>
                <option value="Supervised Fleet">Supervised Fleet</option>
                <option value="Cowboy Ops">Cowboy Ops</option>
                <option value="Composed System">Composed System</option>
              </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(74, 126, 191, 0.2)' }}>
                    {['Date', 'Quadrant', 'Setup', 'Spend', 'Attribution'].map(h => (
                      <th key={h} style={{
                        fontFamily: 'Audiowide',
                        fontSize: '0.65rem',
                        color: '#4A7EBF',
                        letterSpacing: '0.1em',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        textTransform: 'uppercase',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const ans = r.answers as Record<string, string | string[]>;
                    return (
                      <tr key={r.id || i} style={{
                        borderBottom: '1px solid rgba(74, 126, 191, 0.08)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14, 26, 46, 0.6)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '0.75rem 1rem', color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '0.85rem' }}>
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            fontFamily: 'Rajdhani',
                            fontSize: '0.8rem',
                            color: quadrantColors[r.quadrant] || '#4A7EBF',
                            fontWeight: 600,
                          }}>
                            {r.quadrant}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#E2EEF4', fontFamily: 'Rajdhani', fontSize: '0.85rem', maxWidth: '200px' }}>
                          {shortText(ans.q1 as string, 40)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#E2EEF4', fontFamily: 'Rajdhani', fontSize: '0.85rem' }}>
                          {ans.q8 || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '0.85rem' }}>
                          {shortText(ans.q12 as string, 30)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function shortText(val: string | undefined, max: number): string {
  if (!val) return '—';
  return val.length > max ? val.slice(0, max - 3) + '...' : val;
}

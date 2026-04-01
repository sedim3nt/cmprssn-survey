'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { scoreAnswers, getReadings, QUESTIONS } from '@/lib/survey';

interface Results {
  autonomy: number;
  governance: number;
  quadrant: string;
  profile: string;
  answers: Record<string, string | string[]>;
}

// Mock cohort data points [autonomy, governance, quadrant]
const MOCK_COHORT: [number, number, string][] = [
  [0, 1, 'Manual Craft'], [1, 0, 'Manual Craft'], [0, 0, 'Manual Craft'], [1, 1, 'Manual Craft'],
  [0, 3, 'Supervised Fleet'], [1, 2, 'Supervised Fleet'], [1, 4, 'Supervised Fleet'], [0, 4, 'Supervised Fleet'],
  [3, 0, 'Cowboy Ops'], [4, 1, 'Cowboy Ops'], [3, 1, 'Cowboy Ops'], [4, 0, 'Cowboy Ops'],
  [3, 3, 'Composed System'], [4, 4, 'Composed System'], [3, 4, 'Composed System'], [4, 3, 'Composed System'], [2, 3, 'Composed System'],
];

const QUADRANT_COLORS: Record<string, string> = {
  'Manual Craft': '#4A7EBF',
  'Supervised Fleet': '#0088FF',
  'Cowboy Ops': '#FF6B35',
  'Composed System': '#00CC88',
};

export default function SurveyResultsPage() {
  const [results, setResults] = useState<Results | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('cmprssn_results');
    if (stored) {
      setResults(JSON.parse(stored));
      setTimeout(() => setAnimate(true), 100);
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#4A7EBF', fontFamily: 'Rajdhani' }}>No results found.</p>
          <Link href="/" style={{ color: '#0088FF', fontFamily: 'Rajdhani', marginTop: '1rem', display: 'block' }}>
            Take the survey →
          </Link>
        </div>
      </div>
    );
  }

  const { autonomy, governance, quadrant, profile, answers } = results;
  const readings = getReadings(quadrant);
  const quadrantColor = QUADRANT_COLORS[quadrant];

  // Determine which quadrant cell is active
  const isActive = (qName: string) => qName === quadrant;

  return (
    <div className="min-h-screen" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <span className="tag-pill" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          Composition Profile
        </span>
        <h1 style={{
          fontFamily: 'Audiowide',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          color: 'white',
          marginBottom: '0.5rem',
        }}>
          You are{' '}
          <span style={{ color: quadrantColor }}>{quadrant}</span>
        </h1>
        <p style={{ color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '1rem', letterSpacing: '0.05em' }}>
          AUTONOMY: {autonomy}/4 · GOVERNANCE: {governance}/4
        </p>
      </div>

      {/* 2x2 Matrix */}
      <div className="fade-in-up" style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.9rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          Autonomy × Governance Matrix
        </h2>

        <div style={{ position: 'relative' }}>
          {/* Y-axis label */}
          <div style={{
            position: 'absolute',
            left: '-2.5rem',
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            color: '#3A5070',
            fontFamily: 'Rajdhani',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}>
            Governance →
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(74,126,191,0.15)' }}>
            {/* Top-left: Supervised Fleet (low auto, high gov) */}
            <QuadrantCell
              name="Supervised Fleet"
              desc="Low autonomy, high governance"
              active={isActive('Supervised Fleet')}
              color={QUADRANT_COLORS['Supervised Fleet']}
              dotPosition="bottom-right"
              userDot={isActive('Supervised Fleet')}
              cohortDots={MOCK_COHORT.filter(d => d[2] === 'Supervised Fleet').length}
            />
            {/* Top-right: Composed System (high auto, high gov) */}
            <QuadrantCell
              name="Composed System"
              desc="High autonomy, high governance"
              active={isActive('Composed System')}
              color={QUADRANT_COLORS['Composed System']}
              dotPosition="bottom-left"
              userDot={isActive('Composed System')}
              cohortDots={MOCK_COHORT.filter(d => d[2] === 'Composed System').length}
            />
            {/* Bottom-left: Manual Craft (low auto, low gov) */}
            <QuadrantCell
              name="Manual Craft"
              desc="Low autonomy, low governance"
              active={isActive('Manual Craft')}
              color={QUADRANT_COLORS['Manual Craft']}
              dotPosition="top-right"
              userDot={isActive('Manual Craft')}
              cohortDots={MOCK_COHORT.filter(d => d[2] === 'Manual Craft').length}
            />
            {/* Bottom-right: Cowboy Ops (high auto, low gov) */}
            <QuadrantCell
              name="Cowboy Ops"
              desc="High autonomy, low governance"
              active={isActive('Cowboy Ops')}
              color={QUADRANT_COLORS['Cowboy Ops']}
              dotPosition="top-left"
              userDot={isActive('Cowboy Ops')}
              cohortDots={MOCK_COHORT.filter(d => d[2] === 'Cowboy Ops').length}
            />
          </div>

          {/* X-axis label */}
          <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#3A5070', fontFamily: 'Rajdhani', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Autonomy →
          </div>
        </div>
      </div>

      {/* Profile insight */}
      <div className="chart-container fade-in-up" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.85rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Key Insight
        </h2>
        <p style={{ color: '#E2EEF4', fontFamily: 'Rajdhani', fontSize: '1.1rem', lineHeight: 1.7 }}>
          {profile}
        </p>

        {/* Quick stats from answers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <StatCard label="Setup" value={shortLabel(answers.q1 as string)} />
          <StatCard label="Compute Spend" value={answers.q8 as string || 'N/A'} />
          <StatCard label="Failure Mode" value={shortLabel(answers.q7 as string)} />
        </div>
      </div>

      {/* Recommended reading */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'Audiowide', fontSize: '0.85rem', color: '#4A7EBF', letterSpacing: '0.15em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          Recommended Reading
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {readings.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: 'rgba(14, 26, 46, 0.6)',
                border: '1px solid rgba(74, 126, 191, 0.2)',
                borderRadius: '4px',
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0088FF')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(74, 126, 191, 0.2)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.25rem' }}>
                    {r.title}
                  </div>
                  <div style={{ color: '#4A7EBF', fontSize: '0.8rem', fontFamily: 'Rajdhani', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    {r.author}
                  </div>
                  <div style={{ color: '#E2EEF4', fontSize: '0.9rem', fontFamily: 'Rajdhani', opacity: 0.8 }}>
                    {r.why}
                  </div>
                </div>
                <span style={{ color: '#0088FF', fontSize: '1.2rem', flexShrink: 0 }}>↗</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'rgba(0, 136, 255, 0.05)',
        border: '1px solid rgba(0, 136, 255, 0.2)',
        borderRadius: '6px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '3rem',
      }}>
        <h2 style={{ fontFamily: 'Audiowide', fontSize: '1.1rem', color: 'white', marginBottom: '0.75rem' }}>
          Go deeper on your composition
        </h2>
        <p style={{ color: '#4A7EBF', fontFamily: 'Rajdhani', fontSize: '1rem', marginBottom: '1.5rem' }}>
          30-minute research conversation about your specific setup, failures, and patterns.
        </p>
        <a
          href="https://reclaim.ai/r/spirittree/research-call"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          Book a Research Conversation →
        </a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(74, 126, 191, 0.15)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#3A5070', fontSize: '0.75rem', fontFamily: 'Rajdhani' }}>CMPRSSN · SPIRITTREE RESEARCH</span>
        <Link href="/" style={{ color: '#3A5070', fontSize: '0.75rem', fontFamily: 'Rajdhani', textDecoration: 'none' }}>
          Retake Survey
        </Link>
      </div>
    </div>
  );
}

function shortLabel(val: string | undefined): string {
  if (!val) return 'N/A';
  return val.length > 28 ? val.slice(0, 25) + '...' : val;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'rgba(0, 136, 255, 0.05)',
      border: '1px solid rgba(0, 136, 255, 0.15)',
      borderRadius: '4px',
      padding: '0.875rem',
    }}>
      <div style={{ color: '#4A7EBF', fontSize: '0.7rem', fontFamily: 'Rajdhani', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ color: '#E2EEF4', fontFamily: 'Rajdhani', fontSize: '0.95rem', fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

function QuadrantCell({
  name, desc, active, color, dotPosition, userDot, cohortDots
}: {
  name: string;
  desc: string;
  active: boolean;
  color: string;
  dotPosition: string;
  userDot: boolean;
  cohortDots: number;
}) {
  return (
    <div
      className={`quadrant-cell ${active ? 'active' : ''}`}
      style={{
        padding: '1.25rem',
        minHeight: '100px',
        position: 'relative',
        borderColor: active ? color : undefined,
        background: active ? `${color}10` : undefined,
      }}
    >
      <div style={{
        fontFamily: 'Audiowide',
        fontSize: '0.75rem',
        color: active ? color : '#3A5070',
        letterSpacing: '0.05em',
        marginBottom: '0.25rem',
      }}>
        {name}
      </div>
      <div style={{ color: '#3A5070', fontSize: '0.7rem', fontFamily: 'Rajdhani' }}>
        {cohortDots} in cohort
      </div>
      {userDot && (
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '0.75rem',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 10px ${color}`,
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: 0,
            color,
            fontSize: '0.65rem',
            fontFamily: 'Rajdhani',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
          }}>
            YOU
          </div>
        </div>
      )}
    </div>
  );
}

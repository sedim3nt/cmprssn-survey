'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS, scoreAnswers } from '@/lib/survey';
import { submitSurvey } from '@/lib/supabase';

type Answers = Record<string, string | string[]>;

export default function SurveyPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'landing' | 'survey' | 'submitting'>('landing');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const totalQ = QUESTIONS.length;

  function handleStart() {
    setPhase('survey');
  }

  function handleSingleSelect(value: string) {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  }

  function handleMultiSelect(value: string) {
    const current = (answers[question.id] as string[]) || [];
    if (current.includes(value)) {
      setAnswers(prev => ({ ...prev, [question.id]: current.filter(v => v !== value) }));
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: [...current, value] }));
    }
  }

  function handleTextChange(value: string) {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  }

  function canAdvance() {
    const val = answers[question.id];
    if (question.type === 'text') return true; // optional text
    if (question.type === 'multi') return (val as string[] || []).length > 0;
    return !!val;
  }

  async function handleNext() {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      // Submit
      setPhase('submitting');
      try {
        const { autonomy, governance, quadrant, profile } = scoreAnswers(answers);
        await submitSurvey({ answers, profile, quadrant });
        // Store results in sessionStorage for results page
        sessionStorage.setItem('cmprssn_results', JSON.stringify({ autonomy, governance, quadrant, profile, answers }));
        router.push('/results/survey');
      } catch (e) {
        setError('Failed to submit. Please try again.');
        setPhase('survey');
      }
    }
  }

  function handleBack() {
    if (currentQ > 0) setCurrentQ(q => q - 1);
    else setPhase('landing');
  }

  if (phase === 'landing') {
    return <LandingPage onStart={handleStart} />;
  }

  if (phase === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <span style={{ fontFamily: 'Audiowide', color: '#0088FF', fontSize: '0.85rem', letterSpacing: '0.2em' }}>
              PROCESSING
            </span>
          </div>
          <div className="flex gap-2 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full" style={{
                background: '#0088FF',
                animation: `pulse 1s ease-in-out ${i * 0.3}s infinite`
              }} />
            ))}
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div style={{ height: '2px', background: 'var(--elevated)', position: 'relative' }}>
        <div className="progress-bar" style={{ width: `${progress}%`, position: 'absolute', top: 0, left: 0 }} />
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Audiowide', fontSize: '0.85rem', color: '#0088FF', letterSpacing: '0.1em' }}>
          CMPRSSN
        </span>
        <span style={{ color: '#4A7EBF', fontSize: '0.85rem', fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}>
          {currentQ + 1} / {totalQ}
        </span>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl fade-in-up" key={currentQ}>
          {/* Section label */}
          <div className="mb-3">
            <span className="tag-pill">{question.section}</span>
          </div>

          {/* Question */}
          <h2 style={{
            fontFamily: 'Audiowide',
            fontSize: 'clamp(1.2rem, 3vw, 1.75rem)',
            color: 'white',
            lineHeight: 1.3,
            marginBottom: '2rem',
          }}>
            {question.text}
          </h2>

          {/* Options */}
          {question.type === 'single' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {question.options?.map(opt => (
                <button
                  key={opt}
                  className={`option-btn ${answers[question.id] === opt ? 'selected' : ''}`}
                  onClick={() => handleSingleSelect(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === 'multi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ color: '#4A7EBF', fontSize: '0.85rem', marginBottom: '0.5rem', fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}>
                SELECT ALL THAT APPLY
              </p>
              {question.options?.map(opt => {
                const selected = ((answers[question.id] as string[]) || []).includes(opt);
                return (
                  <button
                    key={opt}
                    className={`checkbox-btn ${selected ? 'selected' : ''}`}
                    onClick={() => handleMultiSelect(opt)}
                  >
                    <div className="checkbox-indicator">
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'text' && (
            <div>
              <textarea
                className="survey-textarea"
                placeholder={question.placeholder}
                value={(answers[question.id] as string) || ''}
                onChange={e => handleTextChange(e.target.value)}
                maxLength={question.maxChars}
              />
              <div style={{ textAlign: 'right', color: '#4A7EBF', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {((answers[question.id] as string) || '').length} / {question.maxChars}
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: '#FF4444', fontSize: '0.9rem', marginTop: '1rem' }}>{error}</div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'space-between' }}>
            <button className="btn-ghost" onClick={handleBack}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!canAdvance() && question.type !== 'text'}
            >
              {currentQ < QUESTIONS.length - 1 ? 'Continue →' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem' }}>
        <span style={{ fontFamily: 'Audiowide', fontSize: '0.85rem', color: '#0088FF', letterSpacing: '0.1em' }}>
          CMPRSSN
        </span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-3xl fade-in-up">
          {/* Tag */}
          <div className="mb-8">
            <span className="tag-pill">Research Survey · 2026</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Audiowide',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            How do you compose<br />
            <span style={{ color: '#0088FF' }} className="text-glow">your agents?</span>
          </h1>

          <p style={{
            color: '#E2EEF4',
            fontSize: '1.15rem',
            lineHeight: 1.7,
            maxWidth: '600px',
            marginBottom: '1rem',
            fontFamily: 'Rajdhani',
            fontWeight: 400,
          }}>
            CMPRSSN is mapping the emerging landscape of autonomous agent operations. 
            12 questions on how practitioners compose, govern, and scale their agent systems.
          </p>

          <p style={{
            color: '#4A7EBF',
            fontSize: '1rem',
            lineHeight: 1.7,
            maxWidth: '580px',
            marginBottom: '3rem',
            fontFamily: 'Rajdhani',
          }}>
            Takes ~5 minutes. You'll receive a <strong style={{ color: '#E2EEF4' }}>Composition Profile</strong> — 
            your position on the Autonomy × Governance matrix relative to the cohort.
            Responses inform open research on agent coordination patterns.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '3rem', marginBottom: '3rem' }}>
            {[
              { label: 'Questions', value: '12' },
              { label: 'Minutes', value: '~5' },
              { label: 'Profile Output', value: '1' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontFamily: 'Audiowide', fontSize: '1.75rem', color: '#0088FF' }}>{stat.value}</div>
                <div style={{ color: '#4A7EBF', fontSize: '0.8rem', letterSpacing: '0.1em', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <button className="btn-primary glow-blue" onClick={onStart} style={{ fontSize: '0.9rem' }}>
            Begin Survey →
          </button>

          <p style={{ color: '#3A5070', fontSize: '0.8rem', marginTop: '1.5rem', fontFamily: 'Rajdhani' }}>
            Anonymous by default. No account required.
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div style={{ 
        borderTop: '1px solid rgba(74, 126, 191, 0.15)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#3A5070', fontSize: '0.75rem', fontFamily: 'Rajdhani', letterSpacing: '0.05em' }}>
          A SPIRITTREE RESEARCH INITIATIVE
        </span>
        <span style={{ color: '#3A5070', fontSize: '0.75rem', fontFamily: 'Rajdhani' }}>
          2026
        </span>
      </div>
    </div>
  );
}

const AIRTABLE_BASE = 'app5N0hqqzLb6iDoG';
const AIRTABLE_PAT = process.env.NEXT_PUBLIC_AIRTABLE_PAT || '';

export async function saveSurveyToAirtable(answers: Record<string, string | string[]>, profile: string, quadrant: string) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Surveys`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Setup Type': answers.q1 || '',
            'Labor Division': answers.q2 || '',
            'Autonomy Level': answers.q3 || '',
            'Governance Method': answers.q4 || '',
            'Audit Trail': answers.q5 || '',
            'Worst Failure': answers.q6 || '',
            'Failure Handling': answers.q7 || '',
            'Monthly Spend': answers.q8 || '',
            'Unit of Value': answers.q9 || '',
            'Protocols Used': Array.isArray(answers.q10) ? answers.q10.join(', ') : (answers.q10 || ''),
            'Biggest Problem': answers.q11 || '',
            'Attribution': answers.q12 || '',
            'Profile': profile,
            'Quadrant': quadrant,
            'Submitted At': new Date().toISOString(),
          },
        }),
      }
    );
    if (!res.ok) {
      console.error('Airtable survey error:', await res.json());
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('Airtable fetch failed:', e);
    return null;
  }
}

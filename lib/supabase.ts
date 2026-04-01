import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SurveyResponse {
  id?: string;
  answers: Record<string, string | string[]>;
  profile: string;
  quadrant: string;
  created_at?: string;
}

export async function submitSurvey(response: Omit<SurveyResponse, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('cmprssn_surveys')
    .insert([response])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function fetchAllResponses(): Promise<SurveyResponse[]> {
  const { data, error } = await supabase
    .from('cmprssn_surveys')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

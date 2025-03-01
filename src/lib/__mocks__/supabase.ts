import { createClient } from '@supabase/supabase-js';

export const supabase = createClient('https://mock-supabase-url.com', 'mock-anon-key');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// CAUTION: Use this client only for public read operations. For mutations, use the appropriate server/authenticated client.
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
    throw new Error('adminSupabase must not be imported in client-side code');
}

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
}

// WARNING: SERVICE ROLE KEY - SERVER SIDE ONLY
export const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

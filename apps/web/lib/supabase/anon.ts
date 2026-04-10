import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

// CAUTION: Use this client only for public read operations. For mutations, use the appropriate server/authenticated client.
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}


// TODO: 향후 RLS 도입 시 @supabase/ssr의 createServerClient로 전환 필요.
// 현재 anon key만 사용하므로 싱글톤이 문제없지만, 쿠키 기반 인증 시 요청별 클라이언트가 필요함.
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

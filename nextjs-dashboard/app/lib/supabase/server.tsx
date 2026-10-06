import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@/auth';

export function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
  });
}

export async function getCurrentSupabaseUserId() {
  const session = await auth();
  const nextAuthUserId = session?.user?.id;

  if (nextAuthUserId) {
    return nextAuthUserId as string;
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('You must be signed in to manage patients.');
  }

  return data.user.id;
}

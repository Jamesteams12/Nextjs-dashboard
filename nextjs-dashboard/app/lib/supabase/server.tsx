import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { auth } from '@/auth';
import type { UserRole } from '@/app/lib/definitions';

export function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
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

export type PatientAccess = {
  role: UserRole;
  userId: string;
};

export function getPatientAccess(
  role: UserRole | undefined,
  userId: string | undefined,
): PatientAccess {
  if (!userId || (role !== 'owner' && role !== 'front_desk')) {
    throw new Error('You must be signed in with a clinic staff account.');
  }

  return { role, userId };
}

export async function getCurrentPatientAccess() {
  const session = await auth();
  return getPatientAccess(
    session?.user?.role,
    typeof session?.user?.id === 'string' ? session.user.id : undefined,
  );
}

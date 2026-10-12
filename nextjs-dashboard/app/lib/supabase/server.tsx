import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import postgres from 'postgres';
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

export async function getPatientOwnerId(
  role: UserRole | undefined,
  userId: string | undefined,
) {
  if (!userId || (role !== 'owner' && role !== 'front_desk')) {
    throw new Error('You must be signed in with a clinic staff account.');
  }

  if (role === 'owner') {
    return userId;
  }

  const databaseUrl = process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('Missing POSTGRES_URL while resolving clinic ownership.');
  }

  const sql = postgres(databaseUrl, { ssl: 'require', prepare: false });
  try {
    const owners = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE role = 'owner' LIMIT 2
    `;

    if (owners.length !== 1) {
      throw new Error(
        `Expected exactly one clinic owner, found ${owners.length > 1 ? 'multiple' : 'none'}.`,
      );
    }

    return owners[0].id;
  } catch (error) {
    console.error('Failed to resolve clinic owner for patient access:', error);
    throw new Error('Failed to resolve clinic owner for patient access.');
  } finally {
    await sql.end();
  }
}

export async function getCurrentPatientOwnerId() {
  const session = await auth();
  return getPatientOwnerId(
    session?.user?.role,
    typeof session?.user?.id === 'string' ? session.user.id : undefined,
  );
}

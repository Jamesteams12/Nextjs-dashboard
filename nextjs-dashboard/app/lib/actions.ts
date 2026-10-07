'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { AuthError } from 'next-auth';
import { auth, signIn } from '@/auth';
import { createClient } from '@/app/lib/supabase/server';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  prepare: false,
});

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true,date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try{
        await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        console.error(error);
        return {
            message: 'Database Error: Failed to Create Invoice',
        };
    }
    

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
    };
}

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
} catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
}

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    await sql`
        DELETE FROM invoices
        WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    const redirectTo = formData.get('redirectTo')?.toString() ?? '/dashboard';

    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const PatientSchema = z.object({
  full_name: z.string().min(1, { message: 'Please enter the patient\'s full name.' }),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
});

export type PatientState = {
  errors?: {
    full_name?: string[];
    phone?: string[];
    date_of_birth?: string[];
  };
  message?: string | null;
};

async function requirePatientEditor() {
  const session = await auth();
  const role = session?.user?.role;
  const userId = session?.user?.id;

  if (!userId || (role !== 'owner' && role !== 'front_desk')) {
    throw new Error('You must be signed in with a clinic staff account.');
  }

  return { role, userId };
}

export async function createPatient(prevState: PatientState, formData: FormData) {
  const { userId } = await requirePatientEditor();
  const validated = PatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    date_of_birth: formData.get('date_of_birth'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create patient.',
    };
  }
  const { full_name, phone, date_of_birth } = validated.data;
  const supabase = createClient();

  const { error } = await supabase.from('patients').insert({
    user_id: userId,
    full_name,
    phone: phone || null,
    date_of_birth: date_of_birth || null,
  });

  if (error) {
    console.error('Supabase error:', error);
    return { message: `Database error ${error.code}: failed to create patient.` };
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients');
}

export async function updatePatient(
  id: string,
  prevState: PatientState,
  formData: FormData,
) {
  const { userId } = await requirePatientEditor();
  const validated = PatientSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    date_of_birth: formData.get('date_of_birth'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update patient.',
    };
  }
  const { full_name, phone, date_of_birth } = validated.data;
  const supabase = createClient();

  const { error } = await supabase
    .from('patients')
    .update({
      full_name,
      phone: phone || null,
      date_of_birth: date_of_birth || null,
      user_id: userId,
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase error:', error);
    return { message: `Database error ${error.code}: failed to update patient.` };
  }

  revalidatePath('/dashboard/patients');
  redirect('/dashboard/patients');
}

export async function deletePatient(id: string) {
  const { role, userId } = await requirePatientEditor();
  if (role !== 'owner') {
    throw new Error('Only the clinic owner can delete patients.');
  }

  const supabase = createClient();

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Database error ${error.code}: failed to delete patient.`);
  }

  revalidatePath('/dashboard/patients');
}
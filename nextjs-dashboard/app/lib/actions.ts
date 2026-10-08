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

const CustomerSchema = z.object({
  name: z.string().trim().min(1, { message: 'Please enter the customer name.' }),
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }),
});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
};

async function requireInvoiceEditor() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || session.user?.role !== 'owner') {
    throw new Error('You must be signed in as an owner to manage invoices.');
  }

  return userId;
}

export async function createInvoice(prevState: State, formData: FormData) {
    const userId = await requireInvoiceEditor();
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
    const customer = await sql`
        SELECT id FROM customers
        WHERE id = ${customerId} AND user_id = ${userId}
        LIMIT 1
    `;
    if (customer.length === 0) {
        return {
            errors: { customerId: ['Please select one of your customers.'] },
            message: 'Failed to create invoice.',
        };
    }
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
        INSERT INTO invoices (customer_id, user_id, amount, status, date)
        VALUES (${customerId}, ${userId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        console.error('Database error:', error);
        return {
            message: 'Database Error: Failed to Create Invoice',
        };
    }

    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const userId = await requireInvoiceEditor();
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
    const customer = await sql`
        SELECT id FROM customers
        WHERE id = ${customerId} AND user_id = ${userId}
        LIMIT 1
    `;
    if (customer.length === 0) {
        return {
            errors: { customerId: ['Please select one of your customers.'] },
            message: 'Failed to update invoice.',
        };
    }
    const amountInCents = amount * 100;

    try {
        const updated = await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id} AND user_id = ${userId}
            RETURNING id
        `;
        if (updated.length === 0) {
            return { message: 'Invoice not found or access denied.' };
        }
    } catch (error) {
        console.error('Database error:', error);
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    const userId = await requireInvoiceEditor();
    await sql`
        DELETE FROM invoices
        WHERE id = ${id} AND user_id = ${userId}
    `;
    revalidatePath('/dashboard/invoices');
    revalidatePath('/dashboard');
}

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
) {
  const userId = await requireInvoiceEditor();
  const validated = CustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create customer.',
    };
  }

  try {
    await sql`
      INSERT INTO customers (user_id, name, email, image_url)
      VALUES (${userId}, ${validated.data.name}, ${validated.data.email}, '/customers/default-avatar.svg')
    `;
  } catch (error) {
    console.error('Database error:', error);
    return { message: 'Database Error: Failed to Create Customer.' };
  }

  revalidatePath('/dashboard/customers');
  revalidatePath('/dashboard/invoices/create');
  redirect('/dashboard/customers');
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
import postgres from 'postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import {
  createClient,
  getCurrentPatientOwnerId,
} from '@/app/lib/supabase/server';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  prepare: false,
});

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    const data = await sql<Revenue[]>`SELECT * FROM revenue`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    console.log(invoice);
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType[]>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export type Patient = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
};

export async function fetchPatients(): Promise<Patient[]> {
  const supabase = createClient();
  const patientOwnerId = await getCurrentPatientOwnerId();
  const pageSize = 1000;
  const patients: Patient[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('patients')
      .select('id, user_id, full_name, phone, date_of_birth, created_at')
      .eq('user_id', patientOwnerId)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch patients.');
    }

    patients.push(...((data ?? []) as Patient[]));
    if (!data || data.length < pageSize) break;
  }

  return patients;
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
  const supabase = createClient();
  const patientOwnerId = await getCurrentPatientOwnerId();

  const { data, error } = await supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, created_at')
    .eq('id', id)
    .eq('user_id', patientOwnerId)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patient.');
  }
  return (data as Patient | null) ?? null;
}

export type AppointmentStatus = 'booked' | 'done' | 'no_show';

export type PatientOption = Pick<Patient, 'id' | 'full_name'>;

export type Appointment = {
  id: string;
  user_id: string;
  patient_id: string;
  starts_at: string;
  status: AppointmentStatus;
  patient_name: string;
  patient_phone: string | null;
};

export type AppointmentStatusCount = {
  status: AppointmentStatus;
  count: number;
};

export type ClinicMetrics = {
  patients: number;
  appointmentsThisWeek: number;
  noShowRateThisMonth: number;
  appointmentsTomorrow: number;
};

function clinicLocalDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

function clinicLocalDateTimeToIso(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day) - 2 * 60 * 60 * 1000).toISOString();
}

export async function fetchClinicMetrics(): Promise<ClinicMetrics> {
  const supabase = createClient();
  const patientOwnerId = await getCurrentPatientOwnerId();
  const { year, month, day } = clinicLocalDateParts(new Date());
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const weekStart = clinicLocalDateTimeToIso(
    monday.getUTCFullYear(),
    monday.getUTCMonth() + 1,
    monday.getUTCDate(),
  );
  const nextWeek = new Date(monday);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const weekEnd = clinicLocalDateTimeToIso(
    nextWeek.getUTCFullYear(),
    nextWeek.getUTCMonth() + 1,
    nextWeek.getUTCDate(),
  );
  const tomorrowStart = clinicLocalDateTimeToIso(year, month, day + 1);
  const dayAfterTomorrow = clinicLocalDateTimeToIso(year, month, day + 2);
  const monthStart = clinicLocalDateTimeToIso(year, month, 1);
  const nextMonthStart = clinicLocalDateTimeToIso(year, month + 1, 1);

  const [patientResult, weekResult, tomorrowResult, monthResult] = await Promise.all([
    supabase
      .from('patients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', patientOwnerId),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', patientOwnerId)
      .gte('starts_at', weekStart)
      .lt('starts_at', weekEnd),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', patientOwnerId)
      .eq('status', 'booked')
      .gte('starts_at', tomorrowStart)
      .lt('starts_at', dayAfterTomorrow),
    Promise.all(
      (['booked', 'done', 'no_show'] as const).map((status) =>
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', patientOwnerId)
          .eq('status', status)
          .gte('starts_at', monthStart)
          .lt('starts_at', nextMonthStart),
      ),
    ),
  ]);

  const monthCounts = monthResult.map((result) => result.count ?? 0);
  const failedQuery = [patientResult, weekResult, tomorrowResult, ...monthResult].find(
    (result) => result.error,
  );
  if (failedQuery?.error) {
    console.error('Supabase error fetching clinic dashboard metrics:', failedQuery.error);
    throw new Error('Failed to fetch clinic dashboard metrics.');
  }

  const appointmentsThisMonth = monthCounts.reduce((sum, count) => sum + count, 0);
  const noShowsThisMonth = monthCounts[2];

  return {
    patients: patientResult.count ?? 0,
    appointmentsThisWeek: weekResult.count ?? 0,
    noShowRateThisMonth:
      appointmentsThisMonth === 0
        ? 0
        : Math.round((noShowsThisMonth / appointmentsThisMonth) * 100),
    appointmentsTomorrow: tomorrowResult.count ?? 0,
  };
}

export async function fetchPatientOptions(): Promise<PatientOption[]> {
  const supabase = createClient();
  const patientOwnerId = await getCurrentPatientOwnerId();
  const pageSize = 1000;
  const patients: PatientOption[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('user_id', patientOwnerId)
      .order('full_name', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch patients for appointment booking.');
    }

    patients.push(...((data ?? []) as PatientOption[]));
    if (!data || data.length < pageSize) break;
  }

  return patients;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const supabase = createClient();
  const patientOwnerId = await getCurrentPatientOwnerId();
  const pageSize = 1000;
  const rows: Omit<Appointment, 'patient_name' | 'patient_phone'>[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, user_id, patient_id, starts_at, status')
      .eq('user_id', patientOwnerId)
      .order('starts_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Supabase error fetching appointments:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error('Failed to fetch appointments.');
    }

    rows.push(
      ...((data ?? []) as Omit<Appointment, 'patient_name' | 'patient_phone'>[]),
    );
    if (!data || data.length < pageSize) break;
  }

  if (rows.length === 0) return [];

  const uniquePatientIds = [...new Set(rows.map((appointment) => appointment.patient_id))];
  const patientPageSize = 500;
  const patients: Pick<Patient, 'id' | 'full_name' | 'phone'>[] = [];

  for (let from = 0; from < uniquePatientIds.length; from += patientPageSize) {
    const patientIds = uniquePatientIds.slice(from, from + patientPageSize);
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, phone')
      .eq('user_id', patientOwnerId)
      .in('id', patientIds);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch appointment patients.');
    }

    patients.push(...((data ?? []) as Pick<Patient, 'id' | 'full_name' | 'phone'>[]));
  }

  const patientsById = new Map(
    patients.map((patient) => [patient.id, patient]),
  );

  return rows.map((appointment) => {
    const patient = patientsById.get(appointment.patient_id);
    if (!patient) {
      throw new Error(
        `Appointment ${appointment.id} references a patient that is unavailable to this clinic.`,
      );
    }
    return {
      ...appointment,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
    };
  });
}

export async function fetchAppointmentStatusCounts(): Promise<AppointmentStatusCount[]> {
  const supabase = createClient();
  const patientOwnerId = await getCurrentPatientOwnerId();
  const { year, month } = clinicLocalDateParts(new Date());
  const monthStart = clinicLocalDateTimeToIso(year, month, 1);
  const nextMonthStart = clinicLocalDateTimeToIso(year, month + 1, 1);

  const statuses: AppointmentStatus[] = ['booked', 'done', 'no_show'];
  const results = await Promise.all(
    statuses.map((status) =>
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', patientOwnerId)
        .eq('status', status)
        .gte('starts_at', monthStart)
        .lt('starts_at', nextMonthStart),
    ),
  );
  const failedResult = results.find((result) => result.error);
  if (failedResult?.error) {
    console.error('Supabase error:', failedResult.error);
    throw new Error('Failed to fetch appointment status counts.');
  }

  return statuses.map((status, index) => ({
    status,
    count: results[index].count ?? 0,
  }));
}
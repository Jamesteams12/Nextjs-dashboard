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
  getCurrentPatientAccess,
} from '@/app/lib/supabase/server';

async function getCurrentOwnerId() {
  const access = await getCurrentPatientAccess();
  if (access.role !== 'owner') {
    throw new Error('Only the clinic owner can access financial records.');
  }
  return access.userId;
}

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
  const userId = await getCurrentOwnerId();
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.user_id = ${userId}
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
  const userId = await getCurrentOwnerId();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices WHERE user_id = ${userId}`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers WHERE user_id = ${userId}`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices WHERE user_id = ${userId}`;

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
  const userId = await getCurrentOwnerId();
  const offset = (Math.max(1, currentPage) - 1) * ITEMS_PER_PAGE;

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
      WHERE invoices.user_id = ${userId} AND (
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`})
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
  const userId = await getCurrentOwnerId();
  try {
    const data = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.user_id = ${userId} AND (
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`})
  `;

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  const userId = await getCurrentOwnerId();
  try {
    const data = await sql<InvoiceForm[]>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id} AND invoices.user_id = ${userId};
    `;

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  const userId = await getCurrentOwnerId();
  try {
    const customers = await sql<CustomerField[]>`
      SELECT
        id,
        name,
        email
      FROM customers
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `;

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  const userId = await getCurrentOwnerId();
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
		  AND invoices.user_id = ${userId}
		WHERE customers.user_id = ${userId} AND (
		  customers.name ILIKE ${`%${query}%`} OR
		  customers.email ILIKE ${`%${query}%`})
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

export type PatientGrowth = {
  month: string;
  count: number;
};

export type Appointment = {
  id: string;
  patient_id: string;
  doctor_id: string;
  starts_at: string;
  status: string;
  patient_name: string;
  patient_phone: string | null;
  doctor_name: string;
};

export type AppointmentStatusSummary = {
  booked: number;
  done: number;
  noShow: number;
  other: number;
};

export type PatientOption = Pick<Patient, 'id' | 'full_name'>;

export type DoctorOption = {
  id: string;
  full_name: string;
};

export type ClinicMetrics = {
  newPatients: number;
  bookedThisWeek: number;
  noShowsThisMonth: number;
  tomorrow: number;
};

function getUtcMonthStart(monthOffset = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1));
}

function getUtcDayStart(dayOffset = 0) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset));
}

function normalizeAppointmentStatus(status: string) {
  return status.toLowerCase().replace(/[\s-]/g, '_');
}

export async function fetchPatientGrowth(): Promise<PatientGrowth[]> {
  const supabase = createClient();
  const access = await getCurrentPatientAccess();
  const firstMonth = getUtcMonthStart(-5);
  const nextMonth = getUtcMonthStart(1);
  let query = supabase
    .from('patients')
    .select('created_at')
    .gte('created_at', firstMonth.toISOString())
    .lt('created_at', nextMonth.toISOString());
  if (access.role === 'front_desk') {
    query = query.eq('user_id', access.userId);
  }
  const { data, error } = await query;

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patient growth.');
  }

  const counts = new Map<string, number>();
  for (let offset = -5; offset <= 0; offset += 1) {
    const month = getUtcMonthStart(offset);
    counts.set(month.toISOString().slice(0, 7), 0);
  }
  for (const patient of data ?? []) {
    const month = patient.created_at.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [...counts.entries()].map(([month, count]) => ({
    month: new Date(`${month}-01T00:00:00.000Z`).toLocaleString('en', {
      month: 'short',
      timeZone: 'UTC',
    }),
    count,
  }));
}

export async function fetchAppointmentStatusSummary(): Promise<AppointmentStatusSummary> {
  const supabase = createClient();
  const access = await getCurrentPatientAccess();
  const monthStart = getUtcMonthStart();
  const nextMonth = getUtcMonthStart(1);
  let query = supabase
    .from('appointments')
    .select('status')
    .gte('starts_at', monthStart.toISOString())
    .lt('starts_at', nextMonth.toISOString());
  if (access.role === 'front_desk') {
    query = query.eq('user_id', access.userId);
  }
  const { data, error } = await query;

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch appointment status summary.');
  }

  return (data ?? []).reduce<AppointmentStatusSummary>(
    (summary, appointment) => {
      const status = normalizeAppointmentStatus(appointment.status);
      if (status === 'booked' || status === 'scheduled') summary.booked += 1;
      else if (status === 'done' || status === 'completed') summary.done += 1;
      else if (status === 'no_show' || status === 'noshow') summary.noShow += 1;
      else summary.other += 1;
      return summary;
    },
    { booked: 0, done: 0, noShow: 0, other: 0 },
  );
}

export async function fetchAppointments(
  start: Date,
  end: Date,
): Promise<Appointment[]> {
  const supabase = createClient();
  const access = await getCurrentPatientAccess();
  let query = supabase
    .from('appointments')
    .select('id, patient_id, doctor_id, starts_at, status')
    .gte('starts_at', start.toISOString())
    .lt('starts_at', end.toISOString())
    .order('starts_at', { ascending: true });
  if (access.role === 'front_desk') {
    query = query.eq('user_id', access.userId);
  }
  const { data, error } = await query;

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch appointments.');
  }

  const appointments = data ?? [];
  const patientIds = [...new Set(appointments.map(({ patient_id }) => patient_id))];
  const doctorIds = [...new Set(appointments.map(({ doctor_id }) => doctor_id))];
  const patientsById = new Map<
    string,
    { full_name: string; phone: string | null }
  >();
  const doctorsById = new Map<string, string>();

  if (patientIds.length > 0) {
    let patientQuery = supabase
      .from('patients')
      .select('id, full_name, phone')
      .in('id', patientIds);
    if (access.role === 'front_desk') {
      patientQuery = patientQuery.eq('user_id', access.userId);
    }
    const { data: patients, error: patientError } = await patientQuery;

    if (patientError) {
      console.error('Supabase error:', patientError);
      throw new Error('Failed to fetch appointment patients.');
    }
    for (const patient of patients ?? []) patientsById.set(patient.id, patient);
  }

  if (doctorIds.length > 0) {
    const { data: doctors, error: doctorError } = await supabase
      .from('doctors')
      .select('id, full_name')
      .in('id', doctorIds);

    if (doctorError) {
      console.error('Supabase error:', doctorError);
      throw new Error('Failed to fetch appointment doctors.');
    }
    for (const doctor of doctors ?? []) doctorsById.set(doctor.id, doctor.full_name);
  }

  return appointments.map((appointment) => {
    const patient = patientsById.get(appointment.patient_id);
    return {
      ...appointment,
      patient_name: patient?.full_name ?? 'Patient unavailable',
      patient_phone: patient?.phone ?? null,
      doctor_name: doctorsById.get(appointment.doctor_id) ?? 'Doctor unavailable',
    };
  });
}

export async function fetchClinicMetrics(): Promise<ClinicMetrics> {
  const supabase = createClient();
  const access = await getCurrentPatientAccess();
  const monthStart = getUtcMonthStart();
  const nextMonthStart = getUtcMonthStart(1);
  const weekStart = getUtcDayStart(-((new Date().getUTCDay() + 6) % 7));
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const tomorrowStart = getUtcDayStart(1);
  const dayAfterTomorrow = getUtcDayStart(2);
  let patientsQuery = supabase
    .from('patients')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', nextMonthStart.toISOString());
  let weekQuery = supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .in('status', ['booked', 'scheduled'])
    .gte('starts_at', weekStart.toISOString())
    .lt('starts_at', weekEnd.toISOString());
  let tomorrowQuery = supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'booked')
    .gte('starts_at', tomorrowStart.toISOString())
    .lt('starts_at', dayAfterTomorrow.toISOString());
  let monthQuery = supabase
    .from('appointments')
    .select('status')
    .gte('starts_at', monthStart.toISOString())
    .lt('starts_at', nextMonthStart.toISOString());
  if (access.role === 'front_desk') {
    patientsQuery = patientsQuery.eq('user_id', access.userId);
    weekQuery = weekQuery.eq('user_id', access.userId);
    tomorrowQuery = tomorrowQuery.eq('user_id', access.userId);
    monthQuery = monthQuery.eq('user_id', access.userId);
  }
  const [patientsResult, weekResult, tomorrowResult, monthResult] = await Promise.all([
    patientsQuery,
    weekQuery,
    tomorrowQuery,
    monthQuery,
  ]);

  if (patientsResult.error) {
    console.error('Supabase error:', patientsResult.error);
    throw new Error('Failed to fetch clinic patient metrics.');
  }
  const failedAppointmentResult = [weekResult, tomorrowResult, monthResult].find(
    (result) => result.error,
  );
  if (failedAppointmentResult?.error) {
    console.error('Supabase error:', failedAppointmentResult.error);
    throw new Error('Failed to fetch clinic appointment metrics.');
  }

  const noShowsThisMonth = (monthResult.data ?? []).filter((appointment) => {
    const status = normalizeAppointmentStatus(appointment.status);
    return status === 'no_show' || status === 'noshow';
  }).length;

  return {
    newPatients: patientsResult.count ?? 0,
    bookedThisWeek: weekResult.count ?? 0,
    noShowsThisMonth,
    tomorrow: tomorrowResult.count ?? 0,
  };
}

export async function fetchPatients(): Promise<Patient[]> {
  const supabase = createClient();
  const access = await getCurrentPatientAccess();
  const pageSize = 1000;
  const patients: Patient[] = [];

  for (let from = 0; ; from += pageSize) {
    let query = supabase
      .from('patients')
      .select('id, user_id, full_name, phone, date_of_birth, created_at')
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (access.role === 'front_desk') {
      query = query.eq('user_id', access.userId);
    }
    const { data, error } = await query;

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
  const access = await getCurrentPatientAccess();

  let query = supabase
    .from('patients')
    .select('id, user_id, full_name, phone, date_of_birth, created_at')
    .eq('id', id);
  if (access.role === 'front_desk') {
    query = query.eq('user_id', access.userId);
  }
  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch patient.');
  }
  return (data as Patient | null) ?? null;
}

export async function fetchPatientOptions(): Promise<PatientOption[]> {
  const supabase = createClient();
  const access = await getCurrentPatientAccess();
  const pageSize = 1000;
  const patients: PatientOption[] = [];

  for (let from = 0; ; from += pageSize) {
    let query = supabase
      .from('patients')
      .select('id, full_name')
      .order('full_name', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (access.role === 'front_desk') {
      query = query.eq('user_id', access.userId);
    }
    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to fetch patients for appointment booking.');
    }

    patients.push(...((data ?? []) as PatientOption[]));
    if (!data || data.length < pageSize) break;
  }

  return patients;
}

export async function fetchDoctorOptions(): Promise<DoctorOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to fetch doctors for appointment booking.');
  }

  return data ?? [];
}

'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createAppointment, type AppointmentState } from '@/app/lib/actions';
import type { PatientOption } from '@/app/lib/data';
import { Button } from '@/app/ui/button';

export default function CreateAppointmentForm({
  patients,
}: {
  patients: PatientOption[];
}) {
  const initialState: AppointmentState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createAppointment, initialState);

  return (
    <form action={formAction} className="rounded-xl bg-gray-50 p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="patient_id" className="mb-2 block text-sm font-medium">
            Patient
          </label>
          <select
            id="patient_id"
            name="patient_id"
            required
            defaultValue=""
            className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            aria-describedby="create-patient-error"
          >
            <option value="" disabled>Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.full_name}</option>
            ))}
          </select>
          <div id="create-patient-error" aria-live="polite">
            {state.errors?.patient_id?.map((error) => (
              <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="starts_at" className="mb-2 block text-sm font-medium">
            Date and time
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            aria-describedby="create-date-error"
          />
          <div id="create-date-error" aria-live="polite">
            {state.errors?.starts_at?.map((error) => (
              <p className="mt-1 text-sm text-red-600" key={error}>{error}</p>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="booked"
            className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="booked">Booked</option>
            <option value="done">Done</option>
            <option value="no_show">No-show</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={patients.length === 0}>Add appointment</Button>
        </div>
      </div>
      {!patients.length && (
        <p className="mt-3 text-sm text-gray-600">
          Add a patient before booking an appointment.{' '}
          <Link href="/dashboard/patients/create" className="text-blue-700 underline">
            Add patient
          </Link>
        </p>
      )}
      <div aria-live="polite" aria-atomic="true">
        {state.message && <p className="mt-2 text-sm text-red-600">{state.message}</p>}
      </div>
    </form>
  );
}

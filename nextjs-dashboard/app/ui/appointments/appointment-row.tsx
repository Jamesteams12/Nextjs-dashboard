'use client';

import { useActionState } from 'react';
import { deleteAppointment, updateAppointment, type AppointmentState } from '@/app/lib/actions';
import type { Appointment, PatientOption } from '@/app/lib/data';

export default function AppointmentRow({
  appointment,
  patients,
}: {
  appointment: Appointment;
  patients: PatientOption[];
}) {
  const initialState: AppointmentState = { message: null, errors: {} };
  const updateWithId = updateAppointment.bind(null, appointment.id);
  const [state, formAction] = useActionState(updateWithId, initialState);
  const deleteWithId = deleteAppointment.bind(null, appointment.id);
  const localDateTime = new Date(
    new Date(appointment.starts_at).getTime() + 2 * 60 * 60 * 1000,
  ).toISOString().slice(0, 16);
  const displayDateTime = new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(appointment.starts_at));
  const formId = `appointment-${appointment.id}`;

  return (
    <tr className="border-t border-gray-200 align-top">
      <td className="px-4 py-3">
        <p className="mb-2 font-medium text-gray-900">{displayDateTime}</p>
        <form action={formAction} id={formId}>
          <label className="sr-only" htmlFor={`starts_at-${appointment.id}`}>
            Appointment date and time
          </label>
          <input
            id={`starts_at-${appointment.id}`}
            name="starts_at"
            form={formId}
            type="datetime-local"
            required
            defaultValue={localDateTime}
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm"
          />
        </form>
      </td>
      <td className="px-4 py-3">
        <label className="sr-only" htmlFor={`patient-${appointment.id}`}>Patient</label>
        <select
          id={`patient-${appointment.id}`}
          name="patient_id"
          form={formId}
          defaultValue={appointment.patient_id}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
        >
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>{patient.full_name}</option>
          ))}
        </select>
        {appointment.patient_phone && (
          <p className="mt-1 text-xs text-gray-500">{appointment.patient_phone}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <label className="sr-only" htmlFor={`status-${appointment.id}`}>Status</label>
        <select
          id={`status-${appointment.id}`}
          name="status"
          form={formId}
          defaultValue={appointment.status}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
        >
          <option value="booked">Booked</option>
          <option value="done">Done</option>
          <option value="no_show">No-show</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <button
          type="submit"
          form={formId}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Save
        </button>
        <form action={deleteWithId} className="mt-2">
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </form>
        <div aria-live="polite" className="mt-1 text-xs text-red-600">
          {state.message}
          {state.errors?.starts_at?.join(' ')}
          {state.errors?.patient_id?.join(' ')}
          {state.errors?.status?.join(' ')}
        </div>
      </td>
    </tr>
  );
}

<<<<<<< HEAD
'use client';

import { useState, type FormEvent } from 'react';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { Button } from '@/app/ui/button';

type Appointment = {
  id: number;
  date: string;
  time: string;
  patient: string;
  status: 'Booked' | 'Done' | 'No-show';
  doctor: string;
};

const initialAppointments: Appointment[] = [
  { id: 1, date: '2026-10-12', time: '08:30', patient: 'Ava Thompson', status: 'Booked', doctor: 'Dr. James' },
  { id: 2, date: '2026-10-12', time: '09:15', patient: 'Noah Lee', status: 'Booked', doctor: 'Dr. James' },
  { id: 3, date: '2026-10-12', time: '10:45', patient: 'Sofia Carter', status: 'Done', doctor: 'Dr. James' },
  { id: 4, date: '2026-10-12', time: '13:00', patient: 'Liam Patel', status: 'Booked', doctor: 'Dr. James' },
  { id: 5, date: '2026-10-12', time: '14:30', patient: 'Emma Singh', status: 'Booked', doctor: 'Dr. James' },
];

export default function Page() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  function saveAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAppointment) return;

    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === editingAppointment.id ? editingAppointment : appointment,
      ),
    );
    setEditingAppointment(null);
  }

=======
import { fetchAppointments, fetchPatientOptions } from '@/app/lib/data';
import AppointmentRow from '@/app/ui/appointments/appointment-row';
import CreateAppointmentForm from '@/app/ui/appointments/create-form';
import { lusitana } from '@/app/ui/fonts';
import { fetchAppointments } from '@/app/lib/data';

function formatStatus(status: string) {
  return status
    .split(/[_\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default async function Page() {
  const appointments = await fetchAppointments(new Date(), new Date('9999-12-31'));

>>>>>>> 5f0a600cb0d29de299f94c20b94caf6af4a2a2d6
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-4 text-2xl`}>Appointments</h1>
      <CreateAppointmentForm patients={patients} />

<<<<<<< HEAD
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-gray-200">
                <td className="whitespace-nowrap px-4 py-3">{appointment.date}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{appointment.time}</td>
                <td className="whitespace-nowrap px-4 py-3">{appointment.patient}</td>
                <td className="whitespace-nowrap px-4 py-3">{appointment.doctor}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      appointment.status === 'Booked'
                        ? 'bg-emerald-100 text-emerald-700'
                        : appointment.status === 'Done'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditingAppointment({ ...appointment })}
                    aria-label={`Edit appointment for ${appointment.patient}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-appointment-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 id="edit-appointment-title" className="text-xl font-semibold text-gray-900">
                Edit appointment
              </h2>
              <button
                type="button"
                onClick={() => setEditingAppointment(null)}
                aria-label="Close edit appointment form"
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveAppointment}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="appointment-date" className="mb-2 block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    id="appointment-date"
                    type="date"
                    required
                    value={editingAppointment.date}
                    onChange={(event) =>
                      setEditingAppointment({ ...editingAppointment, date: event.target.value })
                    }
                    className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-time" className="mb-2 block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <input
                    id="appointment-time"
                    type="time"
                    required
                    value={editingAppointment.time}
                    onChange={(event) =>
                      setEditingAppointment({ ...editingAppointment, time: event.target.value })
                    }
                    className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-patient" className="mb-2 block text-sm font-medium text-gray-700">
                    Patient name
                  </label>
                  <input
                    id="appointment-patient"
                    type="text"
                    required
                    value={editingAppointment.patient}
                    onChange={(event) =>
                      setEditingAppointment({ ...editingAppointment, patient: event.target.value })
                    }
                    className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-doctor" className="mb-2 block text-sm font-medium text-gray-700">
                    Doctor
                  </label>
                  <input
                    id="appointment-doctor"
                    type="text"
                    required
                    value={editingAppointment.doctor}
                    onChange={(event) =>
                      setEditingAppointment({ ...editingAppointment, doctor: event.target.value })
                    }
                    className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="appointment-status" className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="appointment-status"
                    value={editingAppointment.status}
                    onChange={(event) => {
                      const status = event.target.value;
                      if (status === 'Booked' || status === 'Done' || status === 'No-show') {
                        setEditingAppointment({ ...editingAppointment, status });
                      }
                    }}
                    className="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="Booked">Booked</option>
                    <option value="Done">Done</option>
                    <option value="No-show">No-show</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="h-10 rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </section>
=======
      {appointments.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-sm text-gray-500 shadow-sm ring-1 ring-gray-200">
          No upcoming appointments.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Date and time</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-t border-gray-200">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                    {new Date(appointment.starts_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{appointment.patient_name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {formatStatus(appointment.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
>>>>>>> 5f0a600cb0d29de299f94c20b94caf6af4a2a2d6
        </div>
      )}
    </div>
  );
}

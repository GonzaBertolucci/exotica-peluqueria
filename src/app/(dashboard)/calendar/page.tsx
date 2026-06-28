'use client'

import { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Appointment, Client, Barber, Service } from '@/types'
import { format } from 'date-fns'
import { X } from 'lucide-react'

type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    status: string
    client_phone?: string
    notes: string | null
  }
}

const statusColors: Record<string, string> = {
  scheduled: '#f59e0b',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedBarber, setSelectedBarber] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    client_id: 0,
    barber_id: 0,
    service_id: 0,
    date_time: '',
    duration: 30,
    notes: '',
  })

  const loadAppointments = useCallback(async () => {
    const params = new URLSearchParams()
    if (selectedBarber) params.set('barber_id', selectedBarber)
    const res = await fetch(`/api/appointments?${params}`)
    const data = await res.json()
    setAppointments(data)
  }, [selectedBarber])

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then((r) => r.json()),
      fetch('/api/barbers').then((r) => r.json()),
      fetch('/api/services').then((r) => r.json()),
      loadAppointments(),
    ]).then(([c, b, s]) => {
      setClients(c)
      setBarbers(b)
      setServices(s)
      setLoading(false)
    })
  }, [loadAppointments])

  function openCreateModal(dateStr: string) {
    setEditingAppointment(null)
    setSelectedDate(dateStr)
    setForm({
      client_id: 0,
      barber_id: Number(selectedBarber) || 0,
      service_id: 0,
      date_time: dateStr,
      duration: 30,
      notes: '',
    })
    setShowModal(true)
  }

  function openEditModal(appt: Appointment) {
    setEditingAppointment(appt)
    setSelectedDate(appt.date_time)
    setForm({
      client_id: appt.client_id,
      barber_id: appt.barber_id,
      service_id: appt.service_id,
      date_time: appt.date_time,
      duration: appt.duration,
      notes: appt.notes || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    const payload = {
      ...form,
      date_time: form.date_time || selectedDate,
    }

    const url = editingAppointment
      ? `/api/appointments/${editingAppointment.id}`
      : '/api/appointments'

    const method = editingAppointment ? 'PUT' : 'POST'

    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setShowModal(false)
    loadAppointments()
  }

  async function handleStatusChange(id: number, status: string) {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadAppointments()
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este turno?')) return
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    setShowModal(false)
    loadAppointments()
  }

  const events: CalendarEvent[] = appointments.map((a) => {
    const start = new Date(a.date_time)
    const end = new Date(start.getTime() + a.duration * 60000)
    return {
      id: a.id.toString(),
      title: `${a.client?.name || '?'} — ${a.service?.name || '?'}`,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor: statusColors[a.status] || '#6b7280',
      borderColor: statusColors[a.status] || '#6b7280',
      extendedProps: {
        status: a.status,
        client_phone: a.client?.phone,
        notes: a.notes,
      },
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Calendario</h1>
          <p className="text-zinc-500 text-sm mt-1">Gestioná los turnos</p>
        </div>
        <select
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value)}
          className="bg-white border border-zinc-300 rounded-lg px-4 py-2 text-sm"
        >
          <option value="">Todos los peluqueros</option>
          {barbers.filter((b) => b.is_active).map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          locale="es"
          events={events}
          dateClick={(info) => openCreateModal(info.dateStr)}
          eventClick={(info) => {
            const appt = appointments.find((a) => a.id === Number(info.event.id))
            if (appt) openEditModal(appt)
          }}
          editable={false}
          slotMinTime="08:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                {editingAppointment ? 'Editar turno' : 'Nuevo turno'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Cliente</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: Number(e.target.value) })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={0}>Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Peluquero</label>
                <select
                  value={form.barber_id}
                  onChange={(e) => setForm({ ...form, barber_id: Number(e.target.value) })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={0}>Seleccionar peluquero</option>
                  {barbers.filter((b) => b.is_active).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Servicio</label>
                <select
                  value={form.service_id}
                  onChange={(e) => {
                    const service = services.find((s) => s.id === Number(e.target.value))
                    setForm({ ...form, service_id: Number(e.target.value), duration: service?.duration || 30 })
                  }}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={0}>Seleccionar servicio</option>
                  {services.filter((s) => s.is_active).map((s) => (
                    <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={form.date_time ? format(new Date(form.date_time), "yyyy-MM-dd'T'HH:mm") : ''}
                  onChange={(e) => setForm({ ...form, date_time: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  min={15}
                  step={15}
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              {editingAppointment && editingAppointment.status === 'scheduled' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(editingAppointment.id, 'completed')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 text-sm"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => handleStatusChange(editingAppointment.id, 'cancelled')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {editingAppointment && editingAppointment.status !== 'scheduled' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(editingAppointment.id, 'scheduled')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm"
                  >
                    Volver a programado
                  </button>
                </div>
              )}

              {editingAppointment && (
                <button
                  onClick={() => handleDelete(editingAppointment.id)}
                  className="w-full border border-red-300 text-red-600 hover:bg-red-50 rounded-lg py-2 text-sm"
                >
                  Eliminar turno
                </button>
              )}

              <button onClick={handleSave} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg py-2.5 text-sm">
                {editingAppointment ? 'Guardar cambios' : 'Crear turno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

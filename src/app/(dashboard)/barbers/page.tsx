'use client'

import { useEffect, useState } from 'react'
import type { Barber } from '@/types'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

const dayNames: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Barber | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })

  function loadBarbers() {
    fetch('/api/barbers')
      .then((r) => r.json())
      .then(setBarbers)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBarbers() }, [])

  function openNew() {
    setEditing(null)
    setForm({ name: '', email: '', password: '', phone: '' })
    setShowForm(true)
  }

  async function handleSave() {
    if (editing) {
      await fetch(`/api/barbers/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
      })
    } else {
      await fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setShowForm(false)
    loadBarbers()
  }

  async function toggleActive(b: Barber) {
    await fetch(`/api/barbers/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !b.is_active }),
    })
    loadBarbers()
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este peluquero y todos sus turnos?')) return
    await fetch(`/api/barbers/${id}`, { method: 'DELETE' })
    loadBarbers()
  }

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
          <h1 className="text-2xl font-bold text-zinc-900">Peluqueros</h1>
          <p className="text-zinc-500 text-sm mt-1">{barbers.length} registrados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo peluquero
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barbers.map((b) => (
          <div key={b.id} className={`bg-white rounded-xl border p-5 ${b.is_active ? 'border-zinc-200' : 'border-zinc-200 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-zinc-900">{b.name}</h3>
                <p className="text-sm text-zinc-500">{b.email}</p>
                {b.phone && <p className="text-sm text-zinc-500">{b.phone}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(b)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded">
                  {b.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {b.working_hours && Object.keys(b.working_hours as Record<string, { start: string; end: string }>).length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-100">
                <p className="text-xs text-zinc-400 mb-1">Horarios:</p>
                {Object.entries(b.working_hours as Record<string, { start: string; end: string }>).map(([day, hours]) => (
                  hours ? (
                    <p key={day} className="text-xs text-zinc-600">
                      {dayNames[day] || day}: {hours.start} - {hours.end}
                    </p>
                  ) : null
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">
              {editing ? 'Editar peluquero' : 'Nuevo peluquero'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm text-zinc-600 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-zinc-300 text-zinc-700 rounded-lg py-2 text-sm">
                  Cancelar
                </button>
                <button onClick={handleSave} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-medium">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

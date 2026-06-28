'use client'

import { useEffect, useState } from 'react'
import type { Service } from '@/types'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState({ name: '', duration: 30, price: 0 })

  function loadServices() {
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadServices() }, [])

  function openNew() {
    setEditing(null)
    setForm({ name: '', duration: 30, price: 0 })
    setShowForm(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({ name: s.name, duration: s.duration, price: s.price })
    setShowForm(true)
  }

  async function handleSave() {
    if (editing) {
      await fetch(`/api/services/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, is_active: true }),
      })
    }
    setShowForm(false)
    loadServices()
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este servicio?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    loadServices()
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/services/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !s.is_active }),
    })
    loadServices()
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
          <h1 className="text-2xl font-bold text-zinc-900">Servicios</h1>
          <p className="text-zinc-500 text-sm mt-1">{services.length} servicios</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className={`bg-white rounded-xl border p-5 ${s.is_active ? 'border-zinc-200' : 'border-zinc-200 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-zinc-900">{s.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">{s.duration} min</p>
                <p className="text-lg font-bold text-zinc-900 mt-2">${s.price}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(s)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded">
                  {s.is_active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-6">
              {editing ? 'Editar servicio' : 'Nuevo servicio'}
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
                <label className="block text-sm text-zinc-600 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  min={5}
                  step={5}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 mb-1">Precio ($)</label>
                <input
                  type="number"
                  value={form.price || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : 0 })}
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm"
                  min={0}
                  placeholder="0"
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

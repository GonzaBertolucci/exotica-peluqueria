'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Client } from '@/types'
import { Plus, Search, Trash2 } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  function loadClients(query?: string) {
    const params = query ? `?search=${encodeURIComponent(query)}` : ''
    fetch(`/api/clients${params}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => loadClients(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este cliente?')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    loadClients(search)
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
          <h1 className="text-2xl font-bold text-zinc-900">Clientes</h1>
          <p className="text-zinc-500 text-sm mt-1">{clients.length} registrados</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Teléfono</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Cumpleaños</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Última visita</th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/clients/${c.id}`} className="text-sm font-medium text-zinc-900 hover:text-red-600">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">{c.phone}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{c.email || '—'}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {c.birthday ? new Date(c.birthday).toLocaleDateString('es-AR') : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600">
                  {c.last_visit_date
                    ? new Date(c.last_visit_date).toLocaleDateString('es-AR')
                    : 'Nunca'}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 text-sm">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

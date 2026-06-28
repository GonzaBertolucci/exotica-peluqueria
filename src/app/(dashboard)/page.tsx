'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Users, Gift, Clock, ScissorsIcon } from 'lucide-react'
import type { DashboardStats, Client } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    )
  }

  const cards = [
    {
      label: 'Turnos Hoy',
      value: stats?.todayAppointments ?? 0,
      icon: CalendarDays,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Próximos Turnos',
      value: stats?.upcomingAppointments ?? 0,
      icon: Clock,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      label: 'Clientes Registrados',
      value: '—',
      icon: Users,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: 'Cumpleaños Hoy',
      value: stats?.birthdayClients?.length ?? 0,
      icon: Gift,
      color: 'bg-pink-500/10 text-pink-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Resumen del día</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl p-6 border border-zinc-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{card.label}</p>
                  <p className="text-3xl font-bold text-zinc-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Gift className="w-4 h-4 text-pink-500" />
            Cumpleaños del día
          </h2>
          {stats?.birthdayClients && stats.birthdayClients.length > 0 ? (
            <ul className="space-y-2">
              {(stats.birthdayClients as Client[]).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-900">{c.name}</span>
                  <span className="text-zinc-400">{c.phone}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">No hay cumpleaños hoy</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            +30 días sin venir
          </h2>
          {stats?.overdueClients && stats.overdueClients.length > 0 ? (
            <ul className="space-y-2">
              {(stats.overdueClients as Client[]).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-900">{c.name}</span>
                  <span className="text-zinc-400">{c.phone}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">Todos vinieron hace menos de 30 días</p>
          )}
        </div>
      </div>

      {stats?.appointmentsByBarber && stats.appointmentsByBarber.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h2 className="font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <ScissorsIcon className="w-4 h-4 text-red-500" />
            Turnos de hoy por peluquero
          </h2>
          <div className="space-y-2">
            {stats.appointmentsByBarber.map((b) => (
              <div key={b.barber} className="flex items-center justify-between text-sm">
                <span className="text-zinc-900">{b.barber}</span>
                <span className="text-zinc-900 font-medium">{b.count} turnos</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

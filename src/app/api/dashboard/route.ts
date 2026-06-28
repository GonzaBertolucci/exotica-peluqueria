import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { startOfDay, endOfDay, addDays } from 'date-fns'

export async function GET() {
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()
  const monthAgo = addDays(new Date(), -30).toISOString()

  const [todayCount, upcomingCount, allClients, allAppointments] = await Promise.all([
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('date_time', todayStart)
      .lte('date_time', todayEnd)
      .eq('status', 'scheduled'),

    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gt('date_time', todayEnd)
      .eq('status', 'scheduled'),

    supabase
      .from('clients')
      .select('id, name, phone, birthday, last_visit_date'),

    supabase
      .from('appointments')
      .select('barber:barbers(name)')
      .gte('date_time', todayStart)
      .lte('date_time', todayEnd)
      .eq('status', 'scheduled'),
  ])

  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  const birthdayClients = (allClients.data || []).filter((c) => {
    if (!c.birthday) return false
    const b = new Date(c.birthday)
    return b.getMonth() + 1 === todayMonth && b.getDate() === todayDay
  })

  const overdueClients = (allClients.data || []).filter((c) => {
    if (!c.last_visit_date) return false
    return new Date(c.last_visit_date) < new Date(monthAgo)
  })

  const barberCounts: Record<string, number> = {}
  ;(allAppointments.data || []).forEach((a: { barber: { name: string } | { name: string }[] }) => {
    const barberData = Array.isArray(a.barber) ? a.barber[0] : a.barber
    const name = barberData?.name || 'Unknown'
    barberCounts[name] = (barberCounts[name] || 0) + 1
  })

  return NextResponse.json({
    todayAppointments: todayCount.count || 0,
    upcomingAppointments: upcomingCount.count || 0,
    birthdayClients,
    overdueClients,
    appointmentsByBarber: Object.entries(barberCounts).map(([barber, count]) => ({ barber, count })),
  })
}

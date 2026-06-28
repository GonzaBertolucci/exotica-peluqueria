import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const barberId = searchParams.get('barber_id')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')

  let query = supabase
    .from('appointments')
    .select(`
      *,
      client:clients(id, name, phone),
      barber:barbers(id, name),
      service:services(id, name, price)
    `)
    .order('date_time', { ascending: true })

  if (barberId) query = query.eq('barber_id', barberId)
  if (dateFrom) query = query.gte('date_time', dateFrom)
  if (dateTo) query = query.lte('date_time', dateTo)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const appointment = {
    client_id: body.client_id,
    barber_id: body.barber_id,
    service_id: body.service_id,
    date_time: new Date(body.date_time).toISOString(),
    duration: body.duration,
    notes: body.notes || null,
    status: 'scheduled',
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select(`
      *,
      client:clients(id, name, phone),
      barber:barbers(id, name),
      service:services(id, name, price)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase
    .from('clients')
    .update({ last_visit_date: appointment.date_time })
    .eq('id', body.client_id)

  return NextResponse.json(data, { status: 201 })
}

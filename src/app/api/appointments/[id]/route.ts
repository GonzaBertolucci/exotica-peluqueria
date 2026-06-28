import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const updateData: Record<string, unknown> = {}
  if (body.status !== undefined) updateData.status = body.status
  if (body.client_id !== undefined) updateData.client_id = body.client_id
  if (body.barber_id !== undefined) updateData.barber_id = body.barber_id
  if (body.service_id !== undefined) updateData.service_id = body.service_id
  if (body.date_time !== undefined) updateData.date_time = new Date(body.date_time).toISOString()
  if (body.duration !== undefined) updateData.duration = body.duration
  if (body.notes !== undefined) updateData.notes = body.notes

  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      client:clients(id, name, phone),
      barber:barbers(id, name),
      service:services(id, name, price)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.status === 'completed') {
    const appointment = data as { client_id: number; date_time: string }
    await supabase
      .from('clients')
      .update({ last_visit_date: appointment.date_time })
      .eq('id', appointment.client_id)
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabase.from('appointments').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}

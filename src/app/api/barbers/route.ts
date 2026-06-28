import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('barbers').select('id, name, phone, email, is_active, working_hours').order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { name, email, password, phone } = await request.json()

  const { data, error } = await supabase.rpc('create_barber', {
    p_name: name,
    p_email: email,
    p_password: password,
    p_phone: phone || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

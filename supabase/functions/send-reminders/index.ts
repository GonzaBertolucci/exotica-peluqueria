import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { addHours, startOfHour, endOfHour } from 'https://esm.sh/date-fns@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const metaToken = Deno.env.get('META_ACCESS_TOKEN')
const metaPhoneId = Deno.env.get('META_PHONE_NUMBER_ID')

const supabase = createClient(supabaseUrl, supabaseKey)

async function sendWhatsApp(to: string, message: string) {
  if (!metaToken || !metaPhoneId) {
    console.log(`[Mock] WhatsApp to ${to}: ${message}`)
    return { success: true }
  }

  const res = await fetch(
    `https://graph.facebook.com/v22.0/${metaPhoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${metaToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/[^0-9]/g, ''),
        type: 'template',
        template: {
          name: 'appointment_reminder',
          language: { code: 'es' },
          components: [{
            type: 'body',
            parameters: [{ type: 'text', text: message }],
          }],
        },
      }),
    }
  )
  return res.json()
}

Deno.serve(async () => {
  const now = new Date()
  const windowStart = addHours(now, 1).toISOString()
  const windowEnd = addHours(now, 3).toISOString()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, date_time, client:clients(name, phone)')
    .gte('date_time', windowStart)
    .lte('date_time', windowEnd)
    .eq('status', 'scheduled')
    .eq('reminded', false)

  if (!appointments || appointments.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }))
  }

  let sent = 0
  for (const appt of appointments) {
    const client = appt.client as { name: string; phone: string }
    if (!client?.phone) continue

    const date = new Date(appt.date_time)
    const message = `Hola ${client.name}, te recordamos tu turno el ${date.toLocaleDateString('es-AR')} a las ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`

    await sendWhatsApp(client.phone, message)

    await supabase
      .from('appointments')
      .update({ reminded: true })
      .eq('id', appt.id)

    sent++
  }

  return new Response(JSON.stringify({ sent }))
})

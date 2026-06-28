import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { subDays } from 'https://esm.sh/date-fns@3'

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
          name: 'follow_up',
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
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, phone, last_visit_date')
    .lt('last_visit_date', thirtyDaysAgo)

  if (!clients || clients.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }))
  }

  let sent = 0
  for (const client of clients) {
    if (!client.phone) continue
    const daysSince = Math.floor(
      (Date.now() - new Date(client.last_visit_date as string).getTime()) / (1000 * 60 * 60 * 24)
    )
    const message = `Hola ${client.name}, ya pasaron ${daysSince} días desde tu último corte en Exótica Peluquería. ¡Pasá a reservar tu turno!`
    await sendWhatsApp(client.phone, message)
    sent++
  }

  return new Response(JSON.stringify({ sent }))
})

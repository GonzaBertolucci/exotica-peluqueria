import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
          name: 'birthday_greeting',
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
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, phone')
    .filter('birthday', 'neq', null)

  if (!clients) return new Response(JSON.stringify({ sent: 0 }))

  const birthdayClients = clients.filter((c) => {
    const bday = new Date(c.birthday as string)
    return bday.getMonth() + 1 === month && bday.getDate() === day
  })

  let sent = 0
  for (const client of birthdayClients) {
    if (!client.phone) continue
    const message = `¡Feliz cumpleaños ${client.name}! Te deseamos un excelente día desde Exótica Peluquería 🎂`
    await sendWhatsApp(client.phone, message)
    sent++
  }

  return new Response(JSON.stringify({ sent }))
})

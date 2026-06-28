const META_API_VERSION = 'v22.0'

function getBaseUrl() {
  const token = process.env.META_ACCESS_TOKEN
  const phoneId = process.env.META_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    console.warn('WhatsApp credentials not configured')
    return null
  }
  return { token, phoneId }
}

export async function sendWhatsAppMessage(to: string, templateName: string, parameters: Record<string, string>) {
  const config = getBaseUrl()
  if (!config) {
    console.log('[WhatsApp Mock] Would send:', { to, templateName, parameters })
    return { success: true, mock: true }
  }

  const body = {
    messaging_product: 'whatsapp',
    to: to.replace(/[^0-9]/g, ''),
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'es' },
      components: [{
        type: 'body',
        parameters: Object.entries(parameters).map(([_, value]) => ({
          type: 'text',
          text: value,
        })),
      }],
    },
  }

  const res = await fetch(
    `https://graph.facebook.com/${META_API_VERSION}/${config.phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  return res.json()
}

export async function sendAppointmentReminder(phone: string, clientName: string, date: string, time: string) {
  return sendWhatsAppMessage(phone, 'appointment_reminder', {
    client_name: clientName,
    date,
    time,
  })
}

export async function sendBirthdayGreeting(phone: string, clientName: string) {
  return sendWhatsAppMessage(phone, 'birthday_greeting', {
    client_name: clientName,
  })
}

export async function sendFollowUp(phone: string, clientName: string, daysSince: number) {
  return sendWhatsAppMessage(phone, 'follow_up', {
    client_name: clientName,
    days_since: daysSince.toString(),
  })
}

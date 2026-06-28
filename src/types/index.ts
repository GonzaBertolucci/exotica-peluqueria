export interface Barber {
  id: number
  name: string
  phone: string | null
  email: string | null
  is_active: boolean
  working_hours: WorkingHours | null
  created_at: string
}

export interface WorkingHours {
  [day: string]: { start: string; end: string } | null
}

export interface Client {
  id: number
  name: string
  phone: string
  email: string | null
  birthday: string | null
  last_visit_date: string | null
  preferred_barber_id: number | null
  notes: string | null
  created_at: string
}

export interface Service {
  id: number
  name: string
  duration: number
  price: number
  is_active: boolean
}

export interface Appointment {
  id: number
  client_id: number
  barber_id: number
  service_id: number
  date_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  duration: number
  notes: string | null
  reminded: boolean
  created_at: string
  client?: Client
  barber?: Barber
  service?: Service
}

export interface DashboardStats {
  todayAppointments: number
  upcomingAppointments: number
  birthdayClients: Client[]
  overdueClients: Client[]
  appointmentsByBarber: { barber: string; count: number }[]
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

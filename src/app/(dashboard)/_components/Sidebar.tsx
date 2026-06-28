'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Calendar,
  LayoutDashboard,
  Users,
  Scissors,
  UserCog,
  LogOut,
} from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendario', icon: Calendar },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/services', label: 'Servicios', icon: Scissors },
  { href: '/barbers', label: 'Peluqueros', icon: UserCog },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-zinc-700">
        <div className="flex items-center gap-3">
          <img src="data:image/jpeg;base64,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" alt="Exótica" style={{ width: 48, height: 48 }} className="rounded-lg" />
          <div>
            <h2 className="font-bold text-white text-lg leading-tight">Exótica</h2>
            <p className="text-xs text-zinc-400 leading-tight">Gestión de Turnos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-red-500/10 text-red-400 font-medium'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-700">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, FileText, Users, FileBarChart, Settings } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: FileText, label: 'Atendimentos', href: '/atendimentos' },
    { icon: Users, label: 'Contatos', href: '/contatos' },
    { icon: FileBarChart, label: 'Relatórios', href: '/relatorios' },
    { icon: Settings, label: 'Config', href: '/configuracoes' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href
          
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors active-scale ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 active:text-primary-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

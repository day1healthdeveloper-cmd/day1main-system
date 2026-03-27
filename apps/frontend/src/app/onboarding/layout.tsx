'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [newApplicationsCount, setNewApplicationsCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/login')
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchNewApplicationsCount = async () => {
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted')

      setNewApplicationsCount(count || 0)
    }

    fetchNewApplicationsCount()
    const interval = setInterval(fetchNewApplicationsCount, 30000)

    const channel = supabase
      .channel('applications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        fetchNewApplicationsCount()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [user, router])

  const navigation = [
    {
      name: 'Overall Stats',
      href: '/onboarding/stats',
      badge: 0,
      glowColor: '#3b82f6', // Blue
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'New Applications',
      href: '/onboarding/applications',
      badge: newApplicationsCount,
      glowColor: '#22c55e', // Green
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'Call Management',
      href: '/onboarding/calls',
      badge: 0,
      glowColor: '#a855f7', // Purple
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
  ]

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    let hexValue = hex.replace("#", "");
    if (hexValue.length === 3) {
      hexValue = hexValue.split("").map((char) => char + char).join("");
    }
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          bg-white border-r border-gray-200
          ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <Link href="/onboarding" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D1</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Day1Main</span>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link href="/onboarding" className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D1</span>
                </div>
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block p-1.5 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const glowColorRgba = hexToRgba(item.glowColor);
              const glowColorVia = hexToRgba(item.glowColor, 0.075);
              const glowColorTo = hexToRgba(item.glowColor, 0.2);
              
              // Get color-specific classes based on glowColor
              const getColorClasses = (color: string) => {
                if (color === '#3b82f6') return 'from-blue-50 to-blue-100 text-blue-900 border-blue-200'; // Blue
                if (color === '#22c55e') return 'from-green-50 to-green-100 text-green-900 border-green-200'; // Green
                if (color === '#a855f7') return 'from-purple-50 to-purple-100 text-purple-900 border-purple-200'; // Purple
                return 'from-green-50 to-green-100 text-green-900 border-green-200'; // Default green
              };
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block"
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <div className="relative">
                    <div
                      style={{
                        "--glow-color": glowColorRgba,
                        "--glow-color-via": glowColorVia,
                        "--glow-color-to": glowColorTo,
                      } as React.CSSProperties}
                      className={`
                        w-full h-10 px-3 text-sm rounded-md border flex items-center gap-3 relative transition-colors overflow-hidden bg-gradient-to-t border-r-0 duration-200
                        ${isActive 
                          ? `${getColorClasses(item.glowColor)} font-semibold` 
                          : 'from-background to-muted text-foreground hover:text-muted-foreground border-border'
                        }
                        after:inset-0 after:absolute after:rounded-[inherit] after:bg-gradient-to-r after:from-transparent after:from-40% after:via-[var(--glow-color-via)] after:to-[var(--glow-color-to)] after:via-70% after:shadow-[hsl(var(--foreground)/0.15)_0px_1px_0px_inset] z-20
                        before:absolute before:w-[5px] before:transition-all before:duration-200 before:h-[60%] before:bg-[var(--glow-color)] before:right-0 before:rounded-l before:shadow-[-2px_0_10px_var(--glow-color)] z-10
                        ${sidebarCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      <span className="relative z-30">{item.icon}</span>
                      {!sidebarCollapsed && <span className="flex-1 relative z-30">{item.name}</span>}
                      {!sidebarCollapsed && item.badge && item.badge > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full relative z-30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {sidebarCollapsed && item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full z-40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="px-3 pb-3 border-t border-gray-200 pt-3">
            <button 
              onClick={handleLogout}
              className="block w-full"
              title={sidebarCollapsed ? "Log out" : undefined}
            >
              <div className="relative">
                <div
                  style={{
                    "--glow-color": "rgba(220, 38, 38, 0.6)",
                    "--glow-color-via": "rgba(220, 38, 38, 0.075)",
                    "--glow-color-to": "rgba(220, 38, 38, 0.2)",
                  } as React.CSSProperties}
                  className={`
                    w-full h-10 px-3 text-sm rounded-md border flex items-center gap-3 relative transition-colors overflow-hidden bg-gradient-to-t border-r-0 duration-200
                    from-background to-muted text-red-600 hover:text-red-700 border-border
                    after:inset-0 after:absolute after:rounded-[inherit] after:bg-gradient-to-r after:from-transparent after:from-40% after:via-[var(--glow-color-via)] after:to-[var(--glow-color-to)] after:via-70% after:shadow-[hsl(var(--foreground)/0.15)_0px_1px_0px_inset] z-20
                    before:absolute before:w-[5px] hover:before:translate-x-full before:transition-all before:duration-200 before:h-[60%] before:bg-[var(--glow-color)] before:right-0 before:rounded-l before:shadow-[-2px_0_10px_var(--glow-color)] z-10
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="relative z-30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  {!sidebarCollapsed && <span className="flex-1 relative z-30">Log out</span>}
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

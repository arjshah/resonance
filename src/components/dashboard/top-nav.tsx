'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, UserCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface UserProfile {
  name: string
  email: string
  image: string | null
}

const menuItemVariants = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 4 },
  hover: { backgroundColor: "var(--stone-50)" }
}

export function TopNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user')
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.error)
        
        setUser(data.user)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) throw new Error('Logout failed')
      
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const MenuLink = ({ href, icon: Icon, children }: { 
    href: string; 
    icon: React.ElementType; 
    children: React.ReactNode 
  }) => {
    const isActive = pathname === href
    
    return (
      <DropdownMenuItem asChild>
        <Link 
          href={href}
          className={cn(
            "flex items-center w-full px-2 py-1.5 text-sm transition-all duration-200",
            "hover:bg-stone-50 dark:hover:bg-stone-800",
            "active:bg-stone-100 dark:active:bg-stone-700",
            "outline-none focus:bg-stone-50 dark:focus:bg-stone-800",
            isActive && "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100",
            !isActive && "text-stone-600 dark:text-stone-400"
          )}
        >
          <motion.div
            className="flex items-center w-full"
            variants={menuItemVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
          >
            <Icon className={cn(
              "mr-2 h-4 w-4 transition-colors duration-200",
              isActive ? "text-stone-900 dark:text-stone-100" : "text-stone-500 dark:text-stone-400"
            )} />
            <span>{children}</span>
            {isActive && (
              <motion.div
                className="absolute left-0 w-1 h-full bg-stone-900 dark:bg-stone-100 rounded-r"
                layoutId="activeIndicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </motion.div>
        </Link>
      </DropdownMenuItem>
    )
  }

  return (
    <motion.div 
      className="border-b bg-white dark:bg-gray-950"
      animate={{ opacity: isLoggingOut ? 0 : 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-16 items-center justify-between px-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center space-x-2"
        >
          <Link href="/dashboard" className="flex items-center space-x-2">
            <motion.span 
              className="text-2xl font-light bg-gradient-to-r from-stone-950 to-stone-700 bg-clip-text text-transparent dark:from-stone-100 dark:to-stone-400"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Resonance
            </motion.span>
          </Link>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex items-center space-x-2 transition-all duration-200",
                "hover:bg-stone-50 dark:hover:bg-stone-800",
                "active:bg-stone-100 dark:active:bg-stone-700"
              )}
              disabled={isLoggingOut}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {user?.image ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <User className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                  </div>
                )}
              </motion.div>
              <span className="text-sm font-medium">
                {isLoggingOut ? 'Signing out...' : user?.name || 'Loading...'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <AnimatePresence>
            {!isLoggingOut && (
              <DropdownMenuContent 
                className="w-56" 
                align="end"
                sideOffset={8}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <MenuLink href="/dashboard/profile" icon={UserCircle}>
                    Profile
                  </MenuLink>
                  <MenuLink href="/dashboard/settings" icon={Settings}>
                    Settings
                  </MenuLink>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center cursor-pointer",
                      "text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400",
                      "hover:bg-red-50 dark:hover:bg-red-950/50",
                      "transition-all duration-200"
                    )}
                  >
                    <motion.div
                      className="flex items-center w-full"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </motion.div>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            )}
          </AnimatePresence>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
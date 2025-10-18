'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    getUser()

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex space-x-4">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/evals">Evaluations</Link>
        <Link href="/settings">Settings</Link>
      </div>
      {user && (
        <button onClick={handleLogout} className="bg-red-500 px-2 py-1 rounded">
          Logout
        </button>
      )}
    </nav>
  )
}

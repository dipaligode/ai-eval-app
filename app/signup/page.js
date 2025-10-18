'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')

  async function handleSignup(e) {
    e.preventDefault()
    setError(null)

    const { data, error } = await supabase.auth.signUp(
      { email, password },
      { redirectTo: `${window.location.origin}/login` }
    )

    if (error) {
      setError(error.message)
      return
    }

    // ✅ Create profile row
    await supabase.from('profiles').insert([{
      id: data.user.id,
      email: data.user.email,
      full_name: fullName
    }])

    setMessage('✅ Account created! Please check your email to confirm before logging in.')
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSignup} className="flex flex-col gap-3 w-64">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Create Account
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-blue-600 text-sm">{message}</p>}
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-500 underline">Login here</Link>
      </p>
    </main>
  )
}

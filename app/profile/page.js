'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ProtectedRoute from '../components/protectedRoute'

export default function ProfilePage() {
  const [profile, setProfile] = useState({ full_name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const userId = session.user.id

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single()

      if (error) console.error('Error fetching profile:', error)
      else setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [])

  async function handleSave() {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name })
      .eq('id', (await supabase.auth.getSession()).data.session.user.id)

    if (error) setMessage('Error saving profile')
    else setMessage('Profile updated successfully!')
  }

  if (loading) return <p className="p-6">Loading profile...</p>

  return (
    <ProtectedRoute>
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="flex flex-col gap-3 w-64">
          <label>Full Name</label>
          <input
            type="text"
            value={profile.full_name}
            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
            className="border p-2 rounded"
          />

          <label>Email (cannot edit)</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="border p-2 rounded bg-gray-100"
          />

          <button
            onClick={handleSave}
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            Save Changes
          </button>

          {message && <p className="text-green-600">{message}</p>}
        </div>
      </main>
    </ProtectedRoute>
  )
}

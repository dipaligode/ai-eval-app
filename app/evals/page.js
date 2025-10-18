'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function EvalsList() {
  const [evals, setEvals] = useState([])
  const [flagMap, setFlagMap] = useState({})
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1️⃣ Get the logged-in user AND session
  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setUserId(session.user.id)
    }
    fetchUser()
  }, [])

  // 2️⃣ Fetch all flags and create a mapping id → name
  useEffect(() => {
    async function fetchFlags() {
      const { data } = await supabase.from('flags').select('id, name')
      if (data) {
        const map = {}
        data.forEach(f => { map[f.id] = f.name })
        setFlagMap(map)
      }
    }
    fetchFlags()
  }, [])

  // 3️⃣ Fetch user's evaluations after userId AND flagMap are ready
  useEffect(() => {
    if (!userId || Object.keys(flagMap).length === 0) return

    async function fetchEvals() {
      const { data } = await supabase
        .from('evals')
        .select('id, interaction_id, score, latency_ms, flags, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setEvals(data || [])
      setLoading(false)
    }

    fetchEvals()
  }, [userId, flagMap])

  if (loading) return <p className="p-8 text-center">Loading evaluations...</p>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Evaluations</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-gray-800">
            <th className="p-2">Interaction ID</th>
            <th className="p-2">Score</th>
            <th className="p-2">Latency (ms)</th>
            <th className="p-2">Flags</th>
            <th className="p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {evals.map(e => {
            // Map flag IDs in e.flags to flag names
            let flagNames = '-'
            if (Array.isArray(e.flags) && e.flags.length > 0) {
              flagNames = e.flags
                .map(fId => {
                  if (typeof fId === 'object' && fId.id) return flagMap[fId.id] || 'Unknown'
                  if (typeof fId === 'number') return flagMap[fId] || 'Unknown'
                  return null
                })
                .filter(Boolean)
                .join(', ')
            }

            return (
              <tr key={e.id} className="border-t text-center">
                <td className="p-2">{e.interaction_id}</td>
                <td>{e.score}</td>
                <td>{e.latency_ms}</td>
                <td>{flagNames}</td>
                <td>{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </main>
  )
}

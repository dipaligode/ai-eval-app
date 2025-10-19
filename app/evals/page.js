'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function EvalsList() {
  const [evals, setEvals] = useState([])
  const [flagMap, setFlagMap] = useState({})
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedEval, setSelectedEval] = useState(null) // for prompt modal
  const [deleteEvalId, setDeleteEvalId] = useState(null) // for delete confirmation

  // 1️⃣ Get logged-in user
  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setUserId(session.user.id)
    }
    fetchUser()
  }, [])

  // 2️⃣ Fetch flag mappings
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

  // 3️⃣ Fetch evaluations for user
  useEffect(() => {
    if (!userId || Object.keys(flagMap).length === 0) return

    async function fetchEvals() {
      const { data } = await supabase
        .from('evals')
        .select('id, interaction_id, score, latency_ms, flags, created_at, prompt, response')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setEvals(data || [])
      setLoading(false)
    }

    fetchEvals()
  }, [userId, flagMap])

  // 4️⃣ Handle delete
  async function handleDelete(evalId) {
    const { error } = await supabase.from('evals').delete().eq('id', evalId)
    if (error) alert('Error deleting evaluation: ' + error.message)
    else {
      setEvals(prev => prev.filter(e => e.id !== evalId))
      setDeleteEvalId(null)
    }
  }

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
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {evals.map(e => {
            // Map flags
            let flagNames = 'safe'
            if (e.flags && e.flags.length > 0) {
              let flagsArray = []
              if (typeof e.flags === 'string') {
                try { flagsArray = JSON.parse(e.flags) } 
                catch { flagsArray = [] }
              } else if (Array.isArray(e.flags)) {
                flagsArray = e.flags
              }

              flagNames = flagsArray
                .map(f => {
                  if (typeof f === 'object' && f.id) return flagMap[f.id] || 'Unknown'
                  if (typeof f === 'number') return flagMap[f] || 'Unknown'
                  return null
                })
                .filter(Boolean)
                .join(', ') || 'safe'
            }

            return (
              <tr key={e.id} className="border-t text-center">
                <td className="p-2">{e.interaction_id}</td>
                <td>{e.score}</td>
                <td>{e.latency_ms}</td>
                <td>{flagNames}</td>
                <td>{new Date(e.created_at).toLocaleString()}</td>
                <td className="flex justify-center gap-2">
                  <button
                    onClick={() => setSelectedEval(e)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    See Prompt
                  </button>
                  <button
                    onClick={() => setDeleteEvalId(e.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Prompt Modal */}
      {selectedEval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Prompt & Response</h2>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">Prompt:</h3>
              <p className="text-gray-900 bg-gray-100 p-3 rounded whitespace-pre-wrap">{selectedEval.prompt || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-1">Response:</h3>
              <p className="text-gray-900 bg-gray-100 p-3 rounded whitespace-pre-wrap">{selectedEval.response || 'N/A'}</p>
            </div>
            <button
              onClick={() => setSelectedEval(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteEvalId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative text-center">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="mb-6 text-gray-800">Are you sure you want to delete this evaluation? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDelete(deleteEvalId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteEvalId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

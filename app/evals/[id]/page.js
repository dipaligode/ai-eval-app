'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useParams } from 'next/navigation'

export default function EvalDetailPage() {
  const { id } = useParams()
  const [evalData, setEvalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchEval() {
      const { data, error } = await supabase
        .from('evals')
        .select('*, flags(name)')
        .eq('id', id)
        .single()

      if (error) setError(error.message)
      else setEvalData(data)
      setLoading(false)
    }
    fetchEval()
  }, [id])

  if (loading) return <p className="mt-20 text-center">Loading...</p>
  if (error) return <p className="mt-20 text-center text-red-500">{error}</p>
  if (!evalData) return <p className="mt-20 text-center">Evaluation not found</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Evaluation Detail</h1>
      <p><strong>Prompt:</strong> {evalData.prompt}</p>
      <p><strong>Response:</strong> {evalData.response}</p>
      <p><strong>Score:</strong> {evalData.score}</p>
      <p><strong>Latency (ms):</strong> {evalData.latency_ms}</p>
      <p><strong>PII Redacted:</strong> {evalData.pii_tokens_redacted}</p>
      <p><strong>Flags:</strong> {evalData.flags?.map(f => f.name).join(', ')}</p>
      <p><strong>Created At:</strong> {new Date(evalData.created_at).toLocaleString()}</p>
    </div>
  )
}

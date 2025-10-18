'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SubmitEvalForm({ userId }) {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [score, setScore] = useState('')
  const [latency, setLatency] = useState('')
  const [flagsOptions, setFlagsOptions] = useState([])
  const [selectedFlags, setSelectedFlags] = useState([])
  const [message, setMessage] = useState('')
  const [evalSettings, setEvalSettings] = useState(null)

  // 1️⃣ Fetch user’s eval settings
  useEffect(() => {
    if (!userId) return
    async function fetchSettings() {
      const { data } = await supabase
        .from('eval_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      setEvalSettings(data)
    }
    fetchSettings()
  }, [userId])

  // 2️⃣ Fetch flags options
  useEffect(() => {
    async function fetchFlags() {
      const { data } = await supabase
        .from('flags')
        .select('*')
      setFlagsOptions(data)
    }
    fetchFlags()
  }, [])

  // 3️⃣ Handle submit
  async function handleSubmit(e) {
    e.preventDefault()

    if (!userId) return setMessage('❌ User not logged in')

    // Check eval_settings rules (sample rate)
    if (evalSettings?.run_policy === 'sampled') {
      const sampleRate = evalSettings?.sample_rate_pct || 100
      const random = Math.random() * 100
      if (random > sampleRate) {
        return setMessage('⚠️ Evaluation skipped due to sample rate')
      }
    }

    // Apply PII masking if enabled
    let maskedResponse = response
    if (evalSettings?.obfuscate_pii) {
      maskedResponse = maskedResponse.replace(/\S+@\S+\.\S+/g, '[REDACTED]')
    }

    // Insert into evals table
    const { data, error } = await supabase.from('evals').insert([
      {
        user_id: userId,
        interaction_id: crypto.randomUUID(),
        prompt,
        response: maskedResponse,
        score: parseFloat(score),
        latency_ms: parseInt(latency),
        flags: selectedFlags.map(f => ({ id: f })),
        pii_tokens_redacted: (response.match(/\S+@\S+\.\S+/g) || []).length
      }
    ])

    if (error) setMessage('❌ Error: ' + error.message)
    else setMessage('✅ Evaluation submitted!')

    // Clear form
    setPrompt('')
    setResponse('')
    setScore('')
    setLatency('')
    setSelectedFlags([])
  }

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded space-y-3">
      <h2 className="font-semibold text-lg mb-2">Submit Evaluation</h2>
      {message && <p className="text-sm text-green-600">{message}</p>}

      <input
        type="text"
        placeholder="Prompt"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Response"
        value={response}
        onChange={e => setResponse(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Score (0–1)"
        value={score}
        onChange={e => setScore(e.target.value)}
        className="w-full border p-2 rounded"
        step="0.01"
        min="0"
        max="1"
        required
      />
      <input
        type="number"
        placeholder="Latency (ms)"
        value={latency}
        onChange={e => setLatency(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <label className="block text-sm font-medium">Flags:</label>
      <select
        multiple
        value={selectedFlags}
        onChange={e => setSelectedFlags(Array.from(e.target.selectedOptions, option => option.value))}
        className="w-full border p-2 rounded"
      >
        {flagsOptions.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  )
}

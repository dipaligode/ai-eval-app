'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SubmitEvalForm({ userId }) {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [score, setScore] = useState('')
  const [latency, setLatency] = useState('')
  const [flagsOptions, setFlagsOptions] = useState([])
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

  // 2️⃣ Fetch all flags
  useEffect(() => {
    async function fetchFlags() {
      const { data } = await supabase
        .from('flags')
        .select('*')
      setFlagsOptions(data)
    }
    fetchFlags()
  }, [])

  // 3️⃣ Auto-flagging function
  function autoFlag(prompt, response, latencyMs, scoreVal) {
    const flags = []

    const lowerPrompt = prompt.toLowerCase()
    const lowerResp = response.toLowerCase()

    // Offensive / inappropriate content
    const offensiveWords = ['hate', 'kill', 'inferior', 'stupid', 'dumb']
    if (offensiveWords.some(word => lowerPrompt.includes(word) || lowerResp.includes(word))) {
      flags.push(flagsOptions.find(f => f.name === 'offensive')?.id)
    }

    // Response too slow
    if (latencyMs > 2000) { // example threshold: 2s
      flags.push(flagsOptions.find(f => f.name === 'slow')?.id)
    }

    // Low quality
    if (scoreVal < 0.5) { // example threshold
      flags.push(flagsOptions.find(f => f.name === 'low_quality')?.id)
    }

    // Irrelevant: if response doesn’t include any words from prompt
    const promptWords = prompt.split(/\s+/).filter(Boolean)
    const containsPromptWords = promptWords.some(word => lowerResp.includes(word.toLowerCase()))
    if (!containsPromptWords) {
      flags.push(flagsOptions.find(f => f.name === 'irrelevant')?.id)
    }

    // Incomplete: response is too short
    if (response.trim().length < 10) {
      flags.push(flagsOptions.find(f => f.name === 'incomplete')?.id)
    }

    // Format error: response missing punctuation (example)
    if (!response.trim().endsWith('.') && !response.trim().endsWith('?') && !response.trim().endsWith('!')) {
      flags.push(flagsOptions.find(f => f.name === 'format_error')?.id)
    }

    // Plagiarized: (mock rule) if response contains "copied from" text
    if (response.toLowerCase().includes('copied from')) {
      flags.push(flagsOptions.find(f => f.name === 'plagiarized')?.id)
    }

    // Sensitive content / PII
    if (/\S+@\S+\.\S+/.test(prompt) || /\S+@\S+\.\S+/.test(response)) {
      flags.push(flagsOptions.find(f => f.name === 'contains_sensitive')?.id)
    }

    // Default safe if nothing else
    if (flags.length === 0) {
      flags.push(flagsOptions.find(f => f.name === 'safe')?.id)
    }

    return flags.filter(Boolean)
  }

  // 4️⃣ Handle submit
  async function handleSubmit(e) {
    e.preventDefault()
    if (!userId) return setMessage('❌ User not logged in')

    // Check sample rate
    if (evalSettings?.run_policy === 'sampled') {
      const sampleRate = evalSettings?.sample_rate_pct || 100
      if (Math.random() * 100 > sampleRate) {
        return setMessage('⚠️ Evaluation skipped due to sample rate')
      }
    }

    // Mask PII
    let maskedResponse = response
    let piiCount = 0
    if (evalSettings?.obfuscate_pii) {
      const matches = maskedResponse.match(/\S+@\S+\.\S+/g) || []
      piiCount = matches.length
      maskedResponse = maskedResponse.replace(/\S+@\S+\.\S+/g, '[REDACTED]')
    }

    // Auto-flag
    const autoFlags = autoFlag(prompt, maskedResponse, parseInt(latency), parseFloat(score))

    // Insert into DB
    const { data, error } = await supabase.from('evals').insert([
      {
        user_id: userId,
        interaction_id: crypto.randomUUID(),
        prompt,
        response: maskedResponse,
        score: parseFloat(score),
        latency_ms: parseInt(latency),
        flags: autoFlags,
        pii_tokens_redacted: piiCount
      }
    ])

    if (error) setMessage('❌ Error: ' + error.message)
    else setMessage('✅ Evaluation submitted!')

    setPrompt('')
    setResponse('')
    setScore('')
    setLatency('')
  }

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded space-y-3">
      <h2 className="font-semibold text-lg mb-2">Submit Evaluation</h2>
      {message && <p className="text-sm text-green-600">{message}</p>}

      <input type="text" placeholder="Prompt" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full border p-2 rounded" required />
      <input type="text" placeholder="Response" value={response} onChange={e => setResponse(e.target.value)} className="w-full border p-2 rounded" required />
      <input type="number" placeholder="Score (0–1)" value={score} onChange={e => setScore(e.target.value)} className="w-full border p-2 rounded" step="0.01" min="0" max="1" required />
      <input type="number" placeholder="Latency (ms)" value={latency} onChange={e => setLatency(e.target.value)} className="w-full border p-2 rounded" required />

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
    </form>
  )
}

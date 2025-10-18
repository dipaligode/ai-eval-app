import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { interaction_id, prompt, response, score, latency_ms, flags=[], pii_tokens_redacted } = req.body

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Not logged in' })

  const userId = session.user.id

  const { data, error } = await supabase.from('evals').insert([{
    user_id: userId,
    interaction_id,
    prompt,
    response,
    score,
    latency_ms,
    flags,
    pii_tokens_redacted,
    created_at: new Date()
  }])

  if (error) return res.status(400).json({ error: error.message })
  res.status(200).json({ success: true, data })
}


// import { supabase } from '../../../../lib/supabaseClient'

// export async function POST(req) {
//   const body = await req.json()
//   const { user_id, interaction_id, prompt, response, score, latency_ms, flags, pii_tokens_redacted } = body

//   const { error } = await supabase.from('evals').insert([
//     {
//       user_id,
//       interaction_id,
//       prompt,
//       response,
//       score,
//       latency_ms,
//       flags,
//       pii_tokens_redacted,
//     },
//   ])

//   if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
//   return new Response(JSON.stringify({ success: true }), { status: 200 })
// }

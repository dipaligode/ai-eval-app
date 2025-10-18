// 'use client'
// import { useEffect, useState } from 'react'
// import { supabase } from '../../lib/supabaseClient'
// import ProtectedRoute from '../components/protectedRoute'

// function SettingsContent() {
//   const [settings, setSettings] = useState({
//     run_policy: 'always',
//     sample_rate_pct: 100,
//     obfuscate_pii: false,
//     max_eval_per_day: 100,
//   })
//   const [userId, setUserId] = useState(null)

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id))
//   }, [])

//   useEffect(() => {
//     if (!userId) return
//     async function fetchSettings() {
//       const { data } = await supabase
//         .from('eval_settings')
//         .select('*')
//         .eq('user_id', userId)
//         .single()
//       if (data) setSettings(data)
//     }
//     fetchSettings()
//   }, [userId])

//   async function saveSettings() {
//     await supabase
//       .from('eval_settings')
//       .upsert({ ...settings, user_id: userId })
//   }

//   return (
//     <main className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Evaluation Settings</h1>

//       <div className="flex flex-col gap-4 max-w-md">
//         <label>
//           Run Policy:
//           <select
//             value={settings.run_policy}
//             onChange={e => setSettings({ ...settings, run_policy: e.target.value })}
//             className="border p-2 rounded w-full"
//           >
//             <option value="always">Always</option>
//             <option value="sampled">Sampled</option>
//           </select>
//         </label>

//         <label>
//           Sample Rate (%):
//           <input
//             type="number"
//             value={settings.sample_rate_pct}
//             onChange={e =>
//               setSettings({ ...settings, sample_rate_pct: parseInt(e.target.value) })
//             }
//             className="border p-2 rounded w-full"
//           />
//         </label>

//         <label className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             checked={settings.obfuscate_pii}
//             onChange={e =>
//               setSettings({ ...settings, obfuscate_pii: e.target.checked })
//             }
//           />
//           Obfuscate PII
//         </label>

//         <label>
//           Max Evaluations Per Day:
//           <input
//             type="number"
//             value={settings.max_eval_per_day}
//             onChange={e =>
//               setSettings({ ...settings, max_eval_per_day: parseInt(e.target.value) })
//             }
//             className="border p-2 rounded w-full"
//           />
//         </label>

//         <button
//           onClick={saveSettings}
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Save Settings
//         </button>
//       </div>
//     </main>
//   )
// }

// export default function SettingsPage() {
//   return (
//     <ProtectedRoute>
//       <SettingsContent />
//     </ProtectedRoute>
//   )
// }


'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ProtectedRoute from '../components/protectedRoute'

export default function SettingsPage() {
  const [userId, setUserId] = useState(null)
  const [settings, setSettings] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setUserId(session.user.id)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!userId) return
    async function fetchSettings() {
      const { data } = await supabase
        .from('eval_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      setSettings(data || {})
    }
    fetchSettings()
  }, [userId])

  async function handleSave() {
    const { error } = await supabase
      .from('eval_settings')
      .upsert({ user_id: userId, ...settings })
    if (error) setMessage('❌ ' + error.message)
    else setMessage('✅ Saved!')
  }

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Evaluation Settings</h1>
        {message && <p>{message}</p>}
        <div>
          <label>Run Policy:</label>
          <select value={settings.run_policy || 'always'} onChange={e=>setSettings({...settings, run_policy:e.target.value})} className="border p-2 rounded w-full">
            <option value="always">Always</option>
            <option value="sampled">Sampled</option>
          </select>
        </div>
        <div>
          <label>Sample Rate (%):</label>
          <input type="number" value={settings.sample_rate_pct || 100} onChange={e=>setSettings({...settings, sample_rate_pct:parseInt(e.target.value)})} className="border p-2 rounded w-full"/>
        </div>
        <div>
          <label>Obfuscate PII:</label>
          <input type="checkbox" checked={settings.obfuscate_pii || false} onChange={e=>setSettings({...settings, obfuscate_pii:e.target.checked})}/>
        </div>
        <div>
          <label>Max Eval Per Day:</label>
          <input type="number" value={settings.max_eval_per_day || 100} onChange={e=>setSettings({...settings, max_eval_per_day:parseInt(e.target.value)})} className="border p-2 rounded w-full"/>
        </div>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
      </div>
    </ProtectedRoute>
  )
}

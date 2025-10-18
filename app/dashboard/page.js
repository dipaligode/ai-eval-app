'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import SubmitEvalForm from '../components/submitEvalForm'
import DashboardCharts from './DashboardCharts'
import ProtectedRoute from '../components/protectedRoute'

export default function DashboardPage() {
  const [userId, setUserId] = useState(null)
  const [evals, setEvals] = useState([])

  // Fetch logged-in user ID
  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setUserId(session.user.id)
    }
    fetchUser()
  }, [])

  // Fetch user-specific evaluations
  useEffect(() => {
    if (!userId) return
    async function fetchEvals() {
      const { data } = await supabase
        .from('evals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setEvals(data || [])
    }
    fetchEvals()
  }, [userId])

  if (!userId) return <p>Loading user info...</p>

  return (
    <ProtectedRoute>
      <section className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Submit Evaluation */}
        <SubmitEvalForm userId={userId} />

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
  <div className="bg-blue-100 p-4 rounded text-gray-800">
    Total Evaluations: {evals.length}
  </div>
  <div className="bg-green-100 p-4 rounded text-gray-800">
    Average Score: {evals.length > 0 ? (evals.reduce((a,e) => a+e.score,0)/evals.length).toFixed(2) : 0}
  </div>
  <div className="bg-yellow-100 p-4 rounded text-gray-800">
    Average Latency: {evals.length > 0 ? Math.round(evals.reduce((a,e)=>a+e.latency_ms,0)/evals.length) : 0}
  </div>
  <div className="bg-red-100 p-4 rounded text-gray-800">
    Total PII Redacted: {evals.reduce((a,e)=>a+e.pii_tokens_redacted,0)}
  </div>
</div>


        {/* Charts */}
        <DashboardCharts evals={evals} />

      </section>
    </ProtectedRoute>
  )
}




// 'use client'
// import { useEffect, useState } from 'react'
// import { supabase } from '../../lib/supabaseClient'

// export default function DashboardPage() {
//   const [evals, setEvals] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     async function fetchEvals() {
//       setLoading(true)
//       const user = supabase.auth.getUser()
//       const { data, error } = await supabase
//         .from('evals')
//         .select('*')
//         .limit(20)
//         .order('created_at', { ascending: false })

//       if (error) setError(error.message)
//       else setEvals(data)
//       setLoading(false)
//     }
//     fetchEvals()
//   }, [])

//   if (loading) return <p className="text-center mt-20">Loading...</p>
//   if (error) return <p className="text-center mt-20 text-red-500">{error}</p>

//   return (
//     <main className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

//       <div className="grid grid-cols-4 gap-4 mb-6">
//         <div className="bg-blue-100 p-4 rounded text-gray-800">
//             <p className="text-sm">Total Evaluations</p>
//             <p className="text-xl font-bold">{evals.length}</p>
//         </div>
//         <div className="bg-green-100 p-4 rounded text-gray-800">
//             <p className="text-sm">Average Score</p>
//             <p className="text-xl font-bold">
//             {evals.length > 0
//                 ? (evals.reduce((a, e) => a + e.score, 0) / evals.length).toFixed(2)
//                 : 0}
//             </p>
//         </div>
//         <div className="bg-yellow-100 p-4 rounded text-gray-800">
//             <p className="text-sm">Average Latency (ms)</p>
//             <p className="text-xl font-bold">
//             {evals.length > 0
//                 ? Math.round(evals.reduce((a, e) => a + e.latency_ms, 0) / evals.length)
//                 : 0}
//             </p>
//         </div>
//         <div className="bg-red-100 p-4 rounded text-gray-800">
//             <p className="text-sm">Total PII Redacted</p>
//             <p className="text-xl font-bold">
//             {evals.reduce((a, e) => a + e.pii_tokens_redacted, 0)}
//             </p>
//         </div>
//         </div>


//       <h2 className="text-xl font-semibold mb-2">Recent Evaluations</h2>
//       <table className="w-full border">
//         <thead>
//             <tr className="bg-gray-200 text-gray-800">
//                 <th className="p-2">Ition ID</th>
//                 <th className="p-2">Score</th>
//                 <th className="p-2">Latency (ms)</th>
//                 <th className="p-2">PII Redacted</th>
//                 <th className="p-2">Created At</th>
//             </tr>
//         </thead>

//         <tbody>
//           {evals.map((e) => (
//             <tr key={e.id} className="text-center border-t">
//               <td className="p-2">{e.interaction_id}</td>
//               <td className="p-2">{e.score}</td>
//               <td className="p-2">{e.latency_ms}</td>
//               <td className="p-2">{e.pii_tokens_redacted}</td>
//               <td className="p-2">{new Date(e.created_at).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </main>
//   )
// }
// <ProtectedRoute>
//   <DashboardContent userId={user.id} />
// </ProtectedRoute>




// import SubmitEvalForm from "../components/submitEvalForm"

// export default function DashboardPage() {
//   const userId = "user_001"; // You can replace with real user session data later

//   return (
//     <section>
//       <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
//       <p className="mb-6 text-gray-600">
//         Submit new evaluations to test AI responses and track their performance.
//       </p>
//       <SubmitEvalForm userId={userId} />
//     </section>
//   );
// }

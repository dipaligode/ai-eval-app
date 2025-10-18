

// 'use client'
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabaseClient'

// export default function ProtectedRoute({ children }) {
//   const router = useRouter()
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (!session) router.push('/login')
//       else setLoading(false)
//     })
//   }, [])

//   if (loading) return <p className="text-center mt-20">Loading...</p>
//   return children
// }


'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else setUser(data.session.user)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-center mt-20">Loading...</p>

  return <>{user && children}</>
}

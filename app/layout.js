// import { Geist, Geist_Mono } from "next/font/google";
// import Link from "next/link";
// import "./globals.css";

// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// export const metadata = {
//   title: "AI Evaluation Dashboard",
//   description: "Monitor and analyze AI performance",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         <nav className="bg-gray-900 text-white flex justify-between items-center px-6 py-3">
//           <div className="text-lg font-semibold">🤖 AI Eval</div>
//           <div className="space-x-6">
//             <Link href="/dashboard" className="hover:underline">Dashboard</Link>
//             <Link href="/settings" className="hover:underline">Settings</Link>
//             <Link href="/evaluations" className="hover:underline">Evaluations</Link>
//           </div>
//         </nav>
//         <main className="p-6">{children}</main>
//       </body>
//     </html>
//   );
// }


'use client'
import './globals.css'
import { usePathname } from 'next/navigation'
import Navbar from './components/navbar'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  // Don't show navbar on login/signup
  const hideNavbar = pathname === '/login' || pathname === '/signup'

  return (
    <html lang="en">
      <body>
        {!hideNavbar && <Navbar />}
        {children}
      </body>
    </html>
  )
}

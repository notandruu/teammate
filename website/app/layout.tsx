import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'

import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-sans'
})
const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif'
})

export const metadata: Metadata = {
  title: 'teammate — bet with your group chat',
  description: 'Bring sports betting into your iMessage group chat. Pool money, propose bets, vote, and auto-execute on Polymarket — all over text.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

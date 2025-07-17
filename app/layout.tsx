import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyHelper - Análise de Documentos com IA',
  description: 'Extraia e resuma conteúdo de seus documentos com análise alimentada por IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <head>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='28' rx='4' fill='%2310B981'/><rect x='6' y='8' width='6' height='16' rx='1' fill='black'/><rect x='20' y='8' width='6' height='16' rx='1' fill='black'/><rect x='12' y='8' width='8' height='16' fill='black'/><rect x='7' y='9' width='4' height='14' fill='white'/><rect x='21' y='9' width='4' height='14' fill='white'/><rect x='13' y='9' width='6' height='14' fill='white'/></svg>" />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
} 
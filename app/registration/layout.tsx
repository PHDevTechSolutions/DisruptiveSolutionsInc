import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create an Account | Disruptive Solutions Inc',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import './globals.css'

export const metadata = {
  title: 'Phone Book App by Bilal',
  description: 'Phone Book Test Assignment created by Bilal Abdurrahman',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

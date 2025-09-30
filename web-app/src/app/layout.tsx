// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/app/layout.tsx
// Description: Root layout placeholder for Next.js app directory structure
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

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
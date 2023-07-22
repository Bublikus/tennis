import dynamic from 'next/dynamic'

const AblyChatComponent = dynamic(
  () => import('@/components/AblyChatComponent'),
  { ssr: false },
)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <AblyChatComponent />
    </main>
  )
}

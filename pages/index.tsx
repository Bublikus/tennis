import dynamic from 'next/dynamic'

const Playground = dynamic(() => import('@/components/Playground'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Playground />
    </main>
  )
}

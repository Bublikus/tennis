import dynamic from 'next/dynamic'

const Playground = dynamic(() => import('@/components/Playground'), {
  ssr: false,
})

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Playground />
    </div>
  )
}

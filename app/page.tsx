import dynamic from 'next/dynamic'

const Playground = dynamic(() => import('@/components/Playground'), {
  ssr: false,
})

export default function Home() {
  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      <Playground />
    </div>
  )
}

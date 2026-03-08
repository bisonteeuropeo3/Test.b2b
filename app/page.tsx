import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          🚀 OnboardFlow B2B
        </p>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold text-center">
          Semplifica il tuo
          <span className="text-blue-600"> onboarding</span>
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">Checklist ✓</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Crea checklist personalizzate per ogni tipo di onboarding.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">Progress 📊</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Traccia i progressi in tempo reale con dashboard intuitive.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h2 className="mb-3 text-2xl font-semibold">Automazioni ⚡</h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Automatizza reminder e notifiche per non perdere mai un passaggio.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-8 py-4 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Accedi alla Dashboard
        </Link>
      </div>
    </main>
  )
}

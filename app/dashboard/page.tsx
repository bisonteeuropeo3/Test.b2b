export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard OnboardFlow</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Onboarding Attivi</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Completati</h3>
          <p className="text-3xl font-bold text-green-600">48</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">In Attesa</h3>
          <p className="text-3xl font-bold text-yellow-600">5</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Prossimi Onboarding</h2>
        <p className="text-gray-500">Nessun onboarding programmato per oggi.</p>
      </div>
    </main>
  )
}

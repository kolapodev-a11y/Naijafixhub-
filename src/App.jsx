function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <header className="bg-primary text-white p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            NaijaFixHub
          </h1>
          <p className="text-xl md:text-2xl mb-6">
            Find trusted local artisans & home service providers in Nigeria – fast & safe
          </p>
          <button className="btn-primary text-lg">
            Post Your Need Now
          </button>
        </div>
      </header>

      {/* Placeholder for next features */}
      <main className="flex-grow p-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Coming Soon: Browse Artisans Near You
          </h2>
          <p className="text-gray-600">
            Plumbers • Electricians • Tailors • Cleaners • And More
          </p>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="bg-gray-800 text-white text-center p-4">
        <p>© 2026 NaijaFixHub | Built by PeezuTech</p>
        <p className="text-sm mt-1">peezutech.name.ng</p>
      </footer>
    </div>
  )
}

export default App

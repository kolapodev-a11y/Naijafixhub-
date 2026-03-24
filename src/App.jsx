import Navbar from './components/layout/Navbar';
import StateFilterChips from './components/home/StateFilterChips';
import CategoryGrid from './components/home/CategoryGrid';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="bg-primary text-white px-6 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            NaijaFixHub
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Find trusted local artisans & home service providers in Nigeria – fast & safe
          </p>
          
          <button className="bg-white text-primary font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-gray-100 transition shadow-lg">
            Post Your Need Now
          </button>
        </div>
      </header>

      {/* Smart Match Quick Request Box */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Need a fix today?</h2>
          <p className="text-gray-600 mb-4">Tell us what you need and get matched instantly</p>
          <input 
            type="text" 
            placeholder="e.g. Plumber in Akure urgently" 
            className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary text-base"
          />
        </div>
      </div>

      {/* State Filters */}
      <div className="pt-10 pb-6">
        <StateFilterChips />
      </div>

      {/* Categories */}
      <div className="pb-12 px-6">
        <CategoryGrid />
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8 px-6">
        <p className="text-lg">© 2026 NaijaFixHub | Built by PeezuTech</p>
        <p className="text-sm mt-2 opacity-75">peezutech.name.ng</p>
      </footer>
    </div>
  );
}

export default App;

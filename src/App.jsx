import Navbar from './components/layout/Navbar';
import StateFilterChips from './components/home/StateFilterChips';
import CategoryGrid from './components/home/CategoryGrid';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <header className="bg-primary text-white px-6 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">NaijaFixHub</h1>
          <p className="text-xl mb-8">
            Find trusted local artisans & home service providers in Nigeria – fast & safe
          </p>
          <button className="bg-white text-primary font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-gray-100">
            Post Your Need Now
          </button>
        </div>
      </header>

      {/* Quick Request */}
      <div className="px-6 -mt-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Need a fix today?</h2>
          <p className="text-gray-600 mb-4">Tell us what you need and get matched instantly</p>
          <input 
            type="text" 
            placeholder="e.g. Plumber in Akure urgently" 
            className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <StateFilterChips />

      <div className="px-6 pt-8">
        <CategoryGrid />
      </div>

      <footer className="bg-gray-800 text-white text-center py-8 mt-12">
        <p>© 2026 NaijaFixHub | Built by PeezuTech</p>
        <p className="text-sm mt-1">peezutech.name.ng</p>
      </footer>
    </div>
  );
}

export default App;

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl">
            N
          </div>
          <h1 className="text-2xl font-bold text-primary">NaijaFixHub</h1>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-primary transition">Home</a>
          <a href="#" className="hover:text-primary transition">Browse</a>
          <a href="#" className="hover:text-primary transition">Post a Job</a>
          <a href="#" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function CategoryGrid() {
  const categories = [
    { name: "Plumbers", count: "124", icon: "🔧" },
    { name: "Electricians", count: "89", icon: "⚡" },
    { name: "AC & Fridge Repair", count: "67", icon: "❄️" },
    { name: "Tailors & Fashion", count: "156", icon: "🧵" },
    { name: "Carpenters", count: "43", icon: "🪚" },
    { name: "House Cleaning", count: "98", icon: "🧹" },
    { name: "Painters", count: "52", icon: "🎨" },
    { name: "Generator Repair", count: "71", icon: "🔌" },
  ];

  return (
    <div className="px-6">
      <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((cat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition cursor-pointer">
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h3 className="font-semibold text-lg">{cat.name}</h3>
            <p className="text-primary text-sm mt-1">{cat.count} artisans</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StateFilterChips() {
  const states = ["All States", "Lagos", "Abuja FCT", "Rivers", "Kano", "Ondo", "Oyo", "Akure"];

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 px-6 -mx-6 scrollbar-hide">
      {states.map((state, i) => (
        <button
          key={i}
          className={`px-5 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition ${
            state === "All States" 
              ? "bg-primary text-white" 
              : "bg-white border border-gray-300 hover:border-primary hover:text-primary"
          }`}
        >
          {state}
        </button>
      ))}
    </div>
  );
}

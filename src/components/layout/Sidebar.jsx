import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "Tasks", path: "/tasks" },
    { name: "Goals", path: "/goals" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <div className="w-64 h-screen bg-white/70 backdrop-blur-xl border-r shadow-soft p-6">
      <h2 className="text-xl font-bold mb-10 text-primary">🚀 Planner</h2>

      <div className="flex flex-col gap-3">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded-xl transition-all ${
              location.pathname === item.path
                ? "bg-primary text-white shadow"
                : "hover:bg-gray-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
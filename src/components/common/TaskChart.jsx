import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TaskChart({ tasks }) {
  const data = [
    { name: "Total", value: tasks.length },
    { name: "Completed", value: tasks.filter(t => t.completed).length },
    { name: "Pending", value: tasks.filter(t => !t.completed).length },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-soft">
      <h3 className="mb-4 font-semibold">Task Analytics</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
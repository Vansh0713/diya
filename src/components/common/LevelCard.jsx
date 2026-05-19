export default function LevelCard({ xp, level, progress }) {
  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-soft">
      <h3 className="mb-2 font-semibold">Your Level</h3>

      <p className="text-xl font-bold">Level {level}</p>
      <p className="text-sm text-gray-500 mb-3">XP: {xp}</p>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary h-3 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
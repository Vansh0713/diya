import useTasks from "../hooks/useTasks";

export default function Profile() {
  const { xp } = useTasks();

  const level = Math.floor(xp / 100);

  return (
    <div>
      <h2>👤 Profile</h2>

      <p>XP: {xp}</p>
      <p>Level: {level}</p>
    </div>
  );
}
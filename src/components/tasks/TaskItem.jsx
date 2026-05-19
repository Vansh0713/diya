export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div
      style={{
        padding: "10px",
        marginBottom: "10px",
        background: "#1e1e1e",
        color: "#fff",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span
        onClick={() => onToggle(task.id)}
        style={{
          cursor: "pointer",
          textDecoration: task.completed ? "line-through" : "none",
        }}
      >
        {task.text}
      </span>

      <button onClick={() => onDelete(task.id)}>❌</button>
    </div>
  );
}

export default function ComplexityPanel({ lineComplexity }) {
  return (
    <div style={{ width: "300px", border: "1px solid #ccc", padding: "10px" }}>
      <h3>Line-by-Line Complexity</h3>
      {lineComplexity.length === 0 && <p>No blocks yet.</p>}
      <ul>
        {lineComplexity.map((line, idx) => (
          <li key={idx} style={{ color: line.color }}>
            {line.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

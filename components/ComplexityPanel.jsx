// src/Algoblocks/components/ComplexityPanel.jsx
export default function ComplexityPanel({ lineComplexity }) {
  const tableHeaderStyle = {
    borderBottom: "2px solid #ddd",
    padding: "12px",
    textAlign: "left",
    backgroundColor: "#f8f9fa",
    fontWeight: "bold"
  };

  const tableCellStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
    fontSize: "14px"
  };

  return (
    <div style={{ width: "100%", marginTop: "10px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Type</th>
            <th style={tableHeaderStyle}>Line of Code</th>
            <th style={tableHeaderStyle}>Time Complexity</th>
            <th style={tableHeaderStyle}>Space Complexity</th>
          </tr>
        </thead>
        <tbody>
          {lineComplexity.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                No blocks in workspace.
              </td>
            </tr>
          ) : (
            lineComplexity.map((line, idx) => (
              <tr key={idx} style={{ color: line.color }}>
                <td style={tableCellStyle}><strong>{line.type}</strong></td>
                <td style={{ ...tableCellStyle, fontFamily: "monospace" }}>{line.lineOfCode}</td>
                <td style={tableCellStyle}>{line.timeComplexity}</td>
                <td style={tableCellStyle}>{line.spaceComplexity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
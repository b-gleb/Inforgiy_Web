export default function LineChartSkeleton ({ width = 400, height = 200, pointCount = 6 }) {
  const padding = 20;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Generate random Y positions for the line path
  const points = Array.from({ length: pointCount }).map((_, i) => {
    const x = padding + (i * chartWidth) / (pointCount - 1);
    const y = padding + Math.random() * (chartHeight * 0.7); // Randomized height
    return { x, y };
  });

  // Convert points into a smooth path
  const pathD = `M ${points[0].x} ${points[0].y} ` + points.map((p) => `L ${p.x} ${p.y}`).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* X and Y Axis */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ddd" strokeWidth="2" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ddd" strokeWidth="2" />

      {/* Fading Line */}
      <path d={pathD} className="stroke-gray-300 [stroke-dasharray:6] animate-pulse" strokeWidth="3" fill="none" />

      {/* Circles for data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" className="fill-gray-300 animate-pulse" />
      ))}
    </svg>
  );
};
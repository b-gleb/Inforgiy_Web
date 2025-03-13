export default function BarChartSkeleton ({ width = 400, height = 200, barCount = 4 }) {
  const barWidth = width / (barCount * 2); // Space bars evenly
  const barSpacing = barWidth * 1.5; // Adjust spacing
  const maxHeight = height * 0.6; // Max bar height (60% of total height)
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* X-Axis */}
      <rect x="10" y={height - 20} width={width - 20} height="10" fill="#ddd" />

      {/* Bars with Animation */}
      {Array.from({ length: barCount }).map((_, i) => {
        const barHeight = Math.random() * maxHeight + 20; // Randomized bar heights
        return (
          <rect
            key={i}
            x={20 + i * barSpacing}
            y={height - 20 - barHeight}
            width={barWidth}
            height={barHeight}
            className="fill-gray-200 animate-pulse"
          />
        );
      })}
    </svg>
  );
};
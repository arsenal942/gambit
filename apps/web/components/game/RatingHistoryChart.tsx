"use client";

interface DataPoint {
  rating: number;
}

interface RatingHistoryChartProps {
  data: DataPoint[];
}

export function RatingHistoryChart({ data }: RatingHistoryChartProps) {
  if (data.length < 2) return null;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const ratings = data.map((d) => d.rating);
  const minRating = Math.floor(Math.min(...ratings) / 50) * 50;
  const maxRating = Math.ceil(Math.max(...ratings) / 50) * 50;
  const range = maxRating - minRating || 50;

  const xScale = (i: number) =>
    padding.left + (i / (data.length - 1)) * chartW;
  const yScale = (r: number) =>
    height - padding.bottom - ((r - minRating) / range) * chartH;

  const points = data
    .map((d, i) => `${xScale(i)},${yScale(d.rating)}`)
    .join(" ");

  // Grid lines at 50-point intervals
  const gridLines: number[] = [];
  for (let r = minRating; r <= maxRating; r += 50) {
    gridLines.push(r);
  }

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-200">
        Rating History
      </h2>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full rounded-lg bg-gray-800"
      >
        {/* Grid lines */}
        {gridLines.map((r) => (
          <g key={r}>
            <line
              x1={padding.left}
              y1={yScale(r)}
              x2={width - padding.right}
              y2={yScale(r)}
              stroke="#374151"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={yScale(r) + 4}
              textAnchor="end"
              fill="#6b7280"
              fontSize="10"
            >
              {r}
            </text>
          </g>
        ))}

        {/* Rating line */}
        <polyline
          fill="none"
          stroke="#d97706"
          strokeWidth="2"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.rating)}
            r="3"
            fill="#d97706"
          />
        ))}

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fill="#6b7280"
          fontSize="10"
        >
          Last {data.length} rated games
        </text>
      </svg>
    </div>
  );
}

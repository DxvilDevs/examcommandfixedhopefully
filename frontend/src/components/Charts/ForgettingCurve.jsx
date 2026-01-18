import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function ForgettingCurve({ model }) {
  const data = useMemo(() => {
    const labels = model.curve.map((p) => `${p.x}d`);
    return {
      labels,
      datasets: [
        {
          label: `Retention (${model.topic})`,
          data: model.curve.map((p) => p.y),
          borderColor: "rgba(251,191,36,0.9)", // amber
          backgroundColor: "rgba(251,191,36,0.15)",
          tension: 0.35,
          pointRadius: 0,
          fill: true
        }
      ]
    };
  }, [model]);

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Retention: ${(ctx.parsed.y * 100).toFixed(1)}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: { callback: (v) => `${Math.round(v * 100)}%` },
          grid: { color: "rgba(255,255,255,0.07)" }
        },
        x: { grid: { color: "rgba(255,255,255,0.05)" } }
      }
    }),
    []
  );

  return <Line data={data} options={options} />;
}

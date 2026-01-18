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

export default function MomentumLine({ events }) {
  const data = useMemo(() => {
    const labels = events.map((e) => new Date(e.created_at).toLocaleDateString());
    return {
      labels,
      datasets: [
        {
          label: "Momentum",
          data: events.map((e) => e.score_after),
          borderColor: "rgba(251,191,36,0.85)", // amber
          backgroundColor: "rgba(251,191,36,0.12)",
          tension: 0.35,
          pointRadius: 2,
          fill: true
        }
      ]
    };
  }, [events]);

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.05)" } },
        y: { grid: { color: "rgba(255,255,255,0.07)" } }
      }
    }),
    []
  );

  return <Line data={data} options={options} />;
}

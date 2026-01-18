import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function DailyMinutes({ daily }) {
  const data = useMemo(() => {
    const labels = daily.map((d) => String(d.day).slice(5)); // MM-DD
    return {
      labels,
      datasets: [
        {
          label: "Minutes studied",
          data: daily.map((d) => d.minutes),
          backgroundColor: "rgba(99,102,241,0.35)", // indigo wash
          borderColor: "rgba(99,102,241,0.8)",
          borderWidth: 1
        }
      ]
    };
  }, [daily]);

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

  return <Bar data={data} options={options} />;
}

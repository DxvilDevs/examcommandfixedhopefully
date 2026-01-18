import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TopicsDonut({ byTopic }) {
  const top = useMemo(() => byTopic.slice(0, 8), [byTopic]);
  const otherCount = useMemo(() => byTopic.slice(8).reduce((s, t) => s + (t.count || 0), 0), [byTopic]);

  const labels = [...top.map((t) => t.topic), ...(otherCount ? ["Other"] : [])];
  const values = [...top.map((t) => t.count), ...(otherCount ? [otherCount] : [])];

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values,
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1
        }
      ]
    }),
    [labels, values]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "rgba(226,232,240,0.9)" }
        }
      }
    }),
    []
  );

  return <Doughnut data={data} options={options} />;
}

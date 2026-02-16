import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

// orders: array of orders with createdAt and totalAmount
export default function OrdersChart({ orders = [] }) {
  const { labels, salesData, revenueData } = useMemo(() => {
    // build last 7 days labels
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const labels = days.map((d) => d.toLocaleDateString());
    const salesData = new Array(7).fill(0);
    const revenueData = new Array(7).fill(0);

    orders.forEach((o) => {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (!created) return;
      created.setHours(0, 0, 0, 0);
      const idx = days.findIndex((d) => d.getTime() === created.getTime());
      if (idx >= 0) {
        salesData[idx] += 1;
        revenueData[idx] += Number(o.totalAmount || 0);
      }
    });

    return { labels, salesData, revenueData };
  }, [orders]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Orders',
        data: salesData,
        borderColor: '#fb923c',
        backgroundColor: 'rgba(251,146,60,0.12)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.08)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#334155' },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#334155' },
      },
      x: {
        ticks: { color: '#475569' },
      },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <h3 className="text-sm font-medium text-slate-700 mb-3">Daily Orders & Revenue (last 7 days)</h3>
      <Line data={data} options={options} />
    </div>
  );
}


import { useEffect, useState } from "react";
import { useTimer } from "../../context/TimerContext";
import {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
} from "../../api/analytics.api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  Filler,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  Filler,
  PointElement,
  LineElement
);

function Overview() {
const { productiveSeconds } = useTimer();
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [activeView, setActiveView] = useState("daily");

  const format = (s) => {
    if (!s && s !== 0) return "0h 0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatHours = (seconds) => {
    if (!seconds && seconds !== 0) return 0;
    return (seconds / 3600).toFixed(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, w, m] = await Promise.all([
          getDailyAnalytics(),
          getWeeklyAnalytics(),
          getMonthlyAnalytics(),
        ]);
        setDaily(d?.data);
        setWeekly(w?.data);
        setMonthly(m?.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const getCurrentData = () => {
    switch (activeView) {
      case "daily":
        return daily;
      case "weekly":
        return weekly;
      case "monthly":
        return monthly;
      default:
        return daily;
    }
  };

  const currentData = getCurrentData();
  const chartLabel = activeView.charAt(0).toUpperCase() + activeView.slice(1);
  const isDark = document.documentElement.classList.contains("dark");
  const axisColor = isDark ? "#a1a1aa" : "#4b5563";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";

  const chartData = {
    labels: ["Pomodoro Time", "Video Time"],
    datasets: [
      {
        data: currentData
          ? [currentData.pomodoroTime || 0, currentData.videoTime || 0]
          : [0, 0],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(168, 85, 247, 0.8)"],
        borderColor: ["rgba(59, 130, 246, 1)", "rgba(168, 85, 247, 1)"],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const totalTimeData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        label: "Total Study Time",
        data: [
          formatHours(daily?.totalTime || 0),
          formatHours(weekly?.totalTime || 0),
          formatHours(monthly?.totalTime || 0),
        ],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const pomodoroTimeData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        label: "Pomodoro Time",
        data: [
          formatHours(daily?.pomodoroTime || 0),
          formatHours(weekly?.pomodoroTime || 0),
          formatHours(monthly?.pomodoroTime || 0),
        ],
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.12)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: "rgba(59, 130, 246, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const videoTimeData = {
    labels: ["Daily", "Weekly", "Monthly"],
    datasets: [
      {
        label: "Video Time",
        data: [
          formatHours(daily?.videoTime || 0),
          formatHours(weekly?.videoTime || 0),
          formatHours(monthly?.videoTime || 0),
        ],
        borderColor: "rgba(168, 85, 247, 1)",
        backgroundColor: "rgba(168, 85, 247, 0.12)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: "rgba(168, 85, 247, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: axisColor,
          font: {
            size: 12,
            weight: "bold",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        callbacks: {
          label(context) {
            return `${context.dataset.label}: ${context.raw} hours`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours",
          color: axisColor,
          font: {
            weight: "bold",
          },
        },
        ticks: {
          color: axisColor,
          stepSize: 2,
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        title: {
          display: true,
          text: "Time Period",
          color: axisColor,
          font: {
            weight: "bold",
          },
        },
        ticks: {
          color: axisColor,
          font: {
            weight: "bold",
          },
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: axisColor,
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const label = context.label || "";
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            const hours = (value / 3600).toFixed(1);
            return `${label}: ${hours}h (${percentage}%)`;
          },
        },
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  const cardClass =
    "rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all";

  return (
    <div className="space-y-6 bg-white dark:bg-black transition-colors duration-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Study Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Productive time tracked: {format(productiveSeconds || 0)}
          </p>
        </div>

        <div className="flex gap-2 bg-gray-50 dark:bg-zinc-950 p-1 rounded-xl border border-gray-200 dark:border-zinc-800">
          {["daily", "weekly", "monthly"].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                activeView === view
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Pomodoro Time" value={format(currentData?.pomodoroTime || 0)} />
        <StatCard title="Video Time" value={format(currentData?.videoTime || 0)} />
        <StatCard title="Total Time" value={format(currentData?.totalTime || 0)} />
      </div>

      <div className={`${cardClass} p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          Time Distribution ({chartLabel})
        </h3>
        <div className="h-80">
          <Doughnut data={chartData} options={doughnutOptions} />
        </div>
        <div className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
          Total: {format(currentData?.totalTime || 0)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Total Time Trend" subtitle="Total study time across periods">
          <Line data={totalTimeData} options={lineOptions} />
        </ChartCard>
        <ChartCard title="Pomodoro Time Trend" subtitle="Pomodoro study time across periods">
          <Line data={pomodoroTimeData} options={lineOptions} />
        </ChartCard>
        <ChartCard title="Video Time Trend" subtitle="Video study time across periods">
          <Line data={videoTimeData} options={lineOptions} />
        </ChartCard>
      </div>

      <div className={`${cardClass} p-6`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Peak Activity"
            value={
              currentData?.pomodoroTime > currentData?.videoTime
                ? "Pomodoro"
                : "Video"
            }
            description={`${Math.abs(
              ((currentData?.pomodoroTime || 0) - (currentData?.videoTime || 0)) /
                3600
            ).toFixed(1)}h more`}
          />
          <InsightCard
            title="Efficiency Ratio"
            value={`${(
              ((currentData?.pomodoroTime || 0) / (currentData?.totalTime || 1)) *
              100
            ).toFixed(1)}%`}
            description="Pomodoro vs Total"
          />
          <InsightCard
            title="Daily Average"
            value={format(
              (currentData?.totalTime || 0) /
                (activeView === "daily" ? 1 : activeView === "weekly" ? 7 : 30)
            )}
            description="Average time per day"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all p-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {title}
      </p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
        {value}
      </p>
    </div>
  );
}

function InsightCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 p-5 transition-all">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
        {value}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
        {title}
      </h3>
      <div className="h-64">{children}</div>
      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {subtitle}
      </div>
    </div>
  );
}

export { Overview };

import { useEffect, useState } from "react"
import { useStudyTime } from "../../context/StudyTimeContext"
import {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics
} from "../../api/analytics.api"
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
  LineElement
} from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

// Register ChartJS components
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
)

function Overview() {
  const { productiveSeconds } = useStudyTime()
  const [daily, setDaily] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [activeView, setActiveView] = useState('daily') // daily, weekly, monthly

  const format = (s) => {
    if (!s && s !== 0) return "0h 0m"
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}h ${m}m`
  }

  const formatHours = (seconds) => {
    if (!seconds && seconds !== 0) return 0
    return (seconds / 3600).toFixed(1)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, w, m] = await Promise.all([
          getDailyAnalytics(),
          getWeeklyAnalytics(),
          getMonthlyAnalytics()
        ])
        setDaily(d?.data)
        setWeekly(w?.data)
        setMonthly(m?.data)
      } catch (err) {
        console.error("Analytics fetch error:", err)
      }
    }
    fetchData()
  }, [])

  const getCurrentData = () => {
    switch(activeView) {
      case 'daily': return daily
      case 'weekly': return weekly
      case 'monthly': return monthly
      default: return daily
    }
  }

  const currentData = getCurrentData()

  // Data for pie/doughnut chart
  const chartData = {
    labels: ['Pomodoro Time', 'Video Time'],
    datasets: [
      {
        data: currentData ? [currentData.pomodoroTime || 0, currentData.videoTime || 0] : [0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  }

  // Data for Total Time Line Chart
  const totalTimeData = {
    labels: ['Daily', 'Weekly', 'Monthly'],
    datasets: [
      {
        label: 'Total Study Time',
        data: [
          formatHours(daily?.totalTime || 0),
          formatHours(weekly?.totalTime || 0),
          formatHours(monthly?.totalTime || 0)
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  }

  // Data for Pomodoro Time Line Chart
  const pomodoroTimeData = {
    labels: ['Daily', 'Weekly', 'Monthly'],
    datasets: [
      {
        label: 'Pomodoro Time',
        data: [
          formatHours(daily?.pomodoroTime || 0),
          formatHours(weekly?.pomodoroTime || 0),
          formatHours(monthly?.pomodoroTime || 0)
        ],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  }

  // Data for Video Time Line Chart
  const videoTimeData = {
    labels: ['Daily', 'Weekly', 'Monthly'],
    datasets: [
      {
        label: 'Video Time',
        data: [
          formatHours(daily?.videoTime || 0),
          formatHours(weekly?.videoTime || 0),
          formatHours(monthly?.videoTime || 0)
        ],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f5f5f5',
          font: {
            size: 12,
            weight: 'bold',
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} hours`
          }
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
          color: '#f5f5f5',
          font: {
            weight: 'bold',
          },
        },
        ticks: {
          color: '#f5f5f5',
          stepSize: 2,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: true,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time Period',
          color: '#f5f5f5',
          font: {
            weight: 'bold',
          },
        },
        ticks: {
          color: '#f5f5f5',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f5f5f5',
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.raw
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            const hours = (value / 3600).toFixed(1)
            return `${label}: ${hours}h (${percentage}%)`
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-50">Study Analytics Dashboard</h1>
        <div className="flex gap-2 bg-black/50 p-1 rounded-lg border border-gray-700">
          {['daily', 'weekly', 'monthly'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                activeView === view
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Pomodoro Time"
          value={format(currentData?.pomodoroTime || 0)}
          icon="🍅"
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Video Time"
          value={format(currentData?.videoTime || 0)}
          icon="🎥"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Time"
          value={format(currentData?.totalTime || 0)}
          icon="📊"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Time Distribution Chart */}
      <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 shadow-2xl">
        <h3 className="text-lg font-semibold text-amber-50 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Time Distribution ({activeView.charAt(0).toUpperCase() + activeView.slice(1)})
        </h3>
        <div className="h-80">
          <Doughnut data={chartData} options={doughnutOptions} />
        </div>
        <div className="mt-4 text-center text-sm text-gray-400">
          Total: {format(currentData?.totalTime || 0)}
        </div>
      </div>

      {/* Three Separate Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Time Line Chart */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 shadow-2xl transition-all duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-amber-50 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Total Time Trend
          </h3>
          <div className="h-64">
            <Line data={totalTimeData} options={lineOptions} />
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            Total study time across periods
          </div>
        </div>

        {/* Pomodoro Time Line Chart */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 shadow-2xl transition-all duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-amber-50 mb-4 flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            Pomodoro Time Trend
          </h3>
          <div className="h-64">
            <Line data={pomodoroTimeData} options={lineOptions} />
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            Pomodoro study time across periods
          </div>
        </div>

        {/* Video Time Line Chart */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 shadow-2xl transition-all duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold text-amber-50 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎥</span>
            Video Time Trend
          </h3>
          <div className="h-64">
            <Line data={videoTimeData} options={lineOptions} />
          </div>
          <div className="mt-4 text-center text-sm text-gray-400">
            Video study time across periods
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 shadow-2xl">
        <h3 className="text-lg font-semibold text-amber-50 mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            title="Peak Activity"
            value={currentData?.pomodoroTime > currentData?.videoTime ? 'Pomodoro' : 'Video'}
            description={`${Math.abs(((currentData?.pomodoroTime || 0) - (currentData?.videoTime || 0)) / 3600).toFixed(1)}h more`}
            icon="⚡"
          />
          <InsightCard
            title="Efficiency Ratio"
            value={`${((currentData?.pomodoroTime || 0) / (currentData?.totalTime || 1) * 100).toFixed(1)}%`}
            description="Pomodoro vs Total"
            icon="🎯"
          />
          <InsightCard
            title="Daily Average"
            value={format((currentData?.totalTime || 0) / (activeView === 'daily' ? 1 : activeView === 'weekly' ? 7 : 30))}
            description={`per ${activeView === 'daily' ? 'day' : activeView === 'weekly' ? 'day' : 'day'}`}
            icon="📅"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-3xl`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <span className="text-3xl">{icon}</span>
        </div>
        <p className="text-3xl text-amber-50 font-bold">{value}</p>
      </div>
    </div>
  )
}

function InsightCard({ title, value, description, icon }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 transition-all duration-300 hover:bg-gray-800/50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
      <p className="text-2xl text-amber-50 font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}

export { Overview }
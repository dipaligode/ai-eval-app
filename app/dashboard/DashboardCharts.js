'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function DashboardCharts({ evals }) {
  // Group by day
  const dailyScores = evals.reduce((acc, e) => {
    const day = new Date(e.created_at).toLocaleDateString()
    if (!acc[day]) acc[day] = { day, scoreSum: 0, count: 0 }
    acc[day].scoreSum += e.score
    acc[day].count += 1
    return acc
  }, {})

  const chartData = Object.values(dailyScores).map(d => ({
    day: d.day,
    avgScore: parseFloat((d.scoreSum / d.count).toFixed(2))
  }))

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Score Trend (7/30 days)</h2>
      <LineChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis domain={[0,1]} />
        <Tooltip />
        <Line type="monotone" dataKey="avgScore" stroke="#8884d8" />
      </LineChart>
    </div>
  )
}

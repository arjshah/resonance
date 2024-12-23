"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { name: "Jan", reviews: 234, positive: 200 },
  { name: "Feb", reviews: 345, positive: 290 },
  { name: "Mar", reviews: 289, positive: 240 },
  { name: "Apr", reviews: 403, positive: 360 },
  { name: "May", reviews: 356, positive: 310 },
  { name: "Jun", reviews: 410, positive: 370 },
  { name: "Jul", reviews: 321, positive: 280 },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false} 
          stroke="#f0f0f0"
        />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          dx={-10}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "12px",
          }}
          cursor={{ fill: "#f5f5f5" }}
        />
        <Bar
          dataKey="reviews"
          radius={[4, 4, 0, 0]}
          fill="#e2e8f0"
          barSize={30}
        />
        <Bar
          dataKey="positive"
          radius={[4, 4, 0, 0]}
          fill="#3b82f6"
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
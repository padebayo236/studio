"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import { demoData } from "@/lib/demo-data"

const chartConfig = {
  output: {
    label: "Output (kg)",
    color: "hsl(var(--primary))",
  },
}

const laborChartConfig = {
  Maize: { label: "Maize", color: "hsl(var(--chart-1))" },
  Rice: { label: "Rice", color: "hsl(var(--chart-2))" },
  Tomato: { label: "Tomato", color: "hsl(var(--chart-3))" },
  Cassava: { label: "Cassava", color: "hsl(var(--chart-4))" },
};

export function OverviewTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Productivity Trend</CardTitle>
          <CardDescription>Weekly farm output over the last month.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={demoData.productivityTrend}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="output" fill="var(--color-output)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Labor Distribution</CardTitle>
          <CardDescription>Number of workers assigned per crop type.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
            <ChartContainer
                config={laborChartConfig}
                className="mx-auto aspect-square h-[250px]"
            >
                <PieChart>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={demoData.laborDistribution}
                    dataKey="workers"
                    nameKey="crop"
                    innerRadius={60}
                    strokeWidth={5}
                >
                    {demoData.laborDistribution.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={laborChartConfig[entry.crop as keyof typeof laborChartConfig].color}
                    />
                    ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="crop" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
                </PieChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAnalyticsDashboard, useFilterOptions, useExportAnalytics } from '@/hooks/useAnalytics'
import { formatNumber } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Briefcase,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react'
import type { AnalyticsFilters } from '@/types'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const DATE_PRESETS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
  { label: 'All', days: 0 },
]

export function AnalyticsPage() {
  const [datePreset, setDatePreset] = useState<number>(30)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRegions, _setSelectedRegions] = useState<string[]>([])
  void _setSelectedRegions // Suppress unused warning - will be used for region filter chips

  const filters: AnalyticsFilters = useMemo(() => {
    const f: AnalyticsFilters = {}
    if (datePreset > 0) {
      const from = new Date()
      from.setDate(from.getDate() - datePreset)
      f.date_from = from.toISOString().split('T')[0]
      f.date_to = new Date().toISOString().split('T')[0]
    }
    if (selectedCategories.length) f.categories = selectedCategories
    if (selectedRegions.length) f.regions = selectedRegions
    return f
  }, [datePreset, selectedCategories, selectedRegions])

  const { data: analytics, isLoading } = useAnalyticsDashboard(filters)
  const { data: filterOptions } = useFilterOptions()
  const { exportAnalytics } = useExportAnalytics()

  const summaryCards = [
    { title: 'Total Jobs', value: analytics?.summary?.total_jobs ?? 0, icon: Briefcase, color: 'text-blue-500' },
    { title: 'Active Jobs', value: analytics?.summary?.active_jobs ?? 0, icon: CheckCircle, color: 'text-green-500' },
    { title: 'With Salary', value: analytics?.summary?.with_salary ?? 0, icon: DollarSign, color: 'text-yellow-500' },
    { title: 'Avg Salary', value: analytics?.summary?.avg_salary_max ?? 0, icon: TrendingUp, color: 'text-purple-500', isCurrency: true },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Analytics" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Filters */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Date Presets */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.label}
                      variant={datePreset === preset.days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDatePreset(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex-1" />

              {/* Export Button */}
              <Button
                variant="outline"
                onClick={() => exportAnalytics(filters)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Category/Region Chips */}
            {(filterOptions?.categories?.length || filterOptions?.regions?.length) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filterOptions?.categories?.slice(0, 6).map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(cat.value)
                          ? prev.filter((c) => c !== cat.value)
                          : [...prev, cat.value]
                      )
                    }}
                  >
                    {cat.label} ({cat.count})
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">
                      {isLoading ? '...' : card.isCurrency ? `${formatNumber(card.value)} GEL` : formatNumber(card.value)}
                    </p>
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analytics?.time_series?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.time_series}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analytics?.by_category?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.by_category.slice(0, 8)}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {analytics.by_category.slice(0, 8).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regions */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analytics?.by_region?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.by_region.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={120} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Salary Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {analytics?.salary_histogram?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.salary_histogram}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="range" stroke="#9ca3af" fontSize={10} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No salary data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

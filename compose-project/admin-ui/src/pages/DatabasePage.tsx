import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTables, useExecuteQuery } from '@/hooks/useDatabase'
import { Database, RefreshCw, Play, AlertTriangle } from 'lucide-react'

export function DatabasePage() {
  const [query, setQuery] = useState('')
  const { data: tablesData, isLoading, refetch } = useTables()
  const executeQueryMutation = useExecuteQuery()

  const handleRunQuery = () => {
    if (query.trim()) {
      executeQueryMutation.mutate({ query })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Database" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Table Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Table Statistics
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead className="text-right">Row Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !tablesData?.tables?.length ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                      No tables found
                    </TableCell>
                  </TableRow>
                ) : (
                  tablesData.tables.map((table) => (
                    <TableRow key={table.name}>
                      <TableCell className="font-medium font-mono">{table.name}</TableCell>
                      <TableCell className="text-right">{table.row_count.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Query Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Query Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-500">Read-Only Queries</p>
                <p className="text-xs text-muted-foreground">
                  Only SELECT statements are allowed. Modifying queries will be rejected.
                </p>
              </div>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM jobs LIMIT 10)"
              className="w-full h-32 p-3 font-mono text-sm bg-muted border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="flex justify-between items-center">
              <Button
                onClick={handleRunQuery}
                disabled={!query.trim() || executeQueryMutation.isPending}
              >
                {executeQueryMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Query
              </Button>

              {executeQueryMutation.data && (
                <span className="text-sm text-muted-foreground">
                  {executeQueryMutation.data.row_count} rows returned
                </span>
              )}
            </div>

            {/* Query Results */}
            {executeQueryMutation.data && executeQueryMutation.data.rows.length > 0 && (
              <div className="border rounded-lg overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {executeQueryMutation.data.columns.map((col) => (
                        <TableHead key={col} className="font-mono text-xs whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executeQueryMutation.data.rows.map((row, i) => (
                      <TableRow key={i}>
                        {executeQueryMutation.data!.columns.map((col) => (
                          <TableCell key={col} className="font-mono text-xs whitespace-nowrap">
                            {String(row[col] ?? 'NULL')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {executeQueryMutation.error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  {(executeQueryMutation.error as Error).message || 'Query execution failed'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

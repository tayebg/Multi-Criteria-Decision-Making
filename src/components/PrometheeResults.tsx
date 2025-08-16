import { useEffect } from "react";
import { Download, BarChart3, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface PrometheeResultsProps {
  results: any;
  alternatives: string[];
  criteria: any[];
}

export function PrometheeResults({ results, alternatives, criteria }: PrometheeResultsProps) {
  const { ranking, flows } = results;

  const chartData = ranking.map((item: any) => ({
    name: item.alternative,
    positive: item.positiveFlow,
    negative: item.negativeFlow,
    net: item.netFlow
  }));

  const exportResults = () => {
    const data = {
      ranking: ranking,
      flows: flows,
      criteria: criteria,
      alternatives: alternatives,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promethee_results_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleExportEvent = () => {
      exportResults();
    };

    window.addEventListener('exportResults', handleExportEvent);
    
    return () => {
      window.removeEventListener('exportResults', handleExportEvent);
    };
  }, [results, alternatives, criteria]);

  return (
    <div className="space-y-6">
      {/* Final Ranking */}
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Final Ranking (PROMETHEE II)
              </CardTitle>
              <CardDescription>Complete ranking based on net outranking flows</CardDescription>
            </div>
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center sticky left-0 bg-background z-10">Rank</TableHead>
                  <TableHead className="sticky left-12 bg-background z-10 min-w-[120px]">Alternative</TableHead>
                  <TableHead className="text-center min-w-[120px]">Positive Flow (φ⁺)</TableHead>
                  <TableHead className="text-center min-w-[120px]">Negative Flow (φ⁻)</TableHead>
                  <TableHead className="text-center min-w-[100px]">Net Flow (φ)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((item: any, index: number) => (
                  <TableRow key={index} className={index === 0 ? "bg-success/10" : ""}>
                    <TableCell className="text-center font-bold sticky left-0 bg-background z-10">
                      {index === 0 && <Award className="h-4 w-4 inline text-success mr-1" />}
                      {item.rank}
                    </TableCell>
                    <TableCell className="font-medium sticky left-12 bg-background z-10">
                      <div className="truncate max-w-[100px]" title={item.alternative}>
                        {item.alternative}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm">
                      {item.positiveFlow.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs sm:text-sm">
                      {item.negativeFlow.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-xs sm:text-sm">
                      {item.netFlow.toFixed(4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Outranking Flows
            </CardTitle>
            <CardDescription>Positive, negative, and net flows comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={10}
                  interval={0}
                />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="positive" fill="hsl(var(--success))" name="Positive Flow" />
                <Bar dataKey="negative" fill="hsl(var(--destructive))" name="Negative Flow" />
                <Bar dataKey="net" fill="hsl(var(--primary))" name="Net Flow" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Net Flow Ranking
            </CardTitle>
            <CardDescription>Net outranking flows (higher is better)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={10}
                  interval={0}
                />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Flow Analysis */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Flow Analysis</CardTitle>
          <CardDescription>Detailed interpretation of outranking flows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success/10 p-4 rounded-lg">
              <h4 className="font-medium text-success mb-2">Best Alternative</h4>
              <p className="text-sm">
                <strong>{ranking[0].alternative}</strong> ranks first with the highest net flow of{" "}
                <span className="font-mono">{ranking[0].netFlow.toFixed(4)}</span>
              </p>
            </div>
            
            <div className="bg-warning/10 p-4 rounded-lg">
              <h4 className="font-medium text-warning mb-2">Average Performance</h4>
              <p className="text-sm">
                Average net flow:{" "}
                <span className="font-mono">
                  {(flows.net.reduce((a: number, b: number) => a + b, 0) / flows.net.length).toFixed(4)}
                </span>
              </p>
            </div>
            
            <div className="bg-destructive/10 p-4 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Worst Alternative</h4>
              <p className="text-sm">
                <strong>{ranking[ranking.length - 1].alternative}</strong> ranks last with net flow of{" "}
                <span className="font-mono">{ranking[ranking.length - 1].netFlow.toFixed(4)}</span>
              </p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Interpretation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Positive Flow (φ⁺):</strong> Measures how much an alternative outranks all others.
                Higher values indicate stronger outranking power.
              </li>
              <li>
                <strong>Negative Flow (φ⁻):</strong> Measures how much an alternative is outranked by others.
                Lower values indicate better resistance to being outranked.
              </li>
              <li>
                <strong>Net Flow (φ):</strong> The difference between positive and negative flows.
                Higher values indicate better overall performance and higher ranking.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
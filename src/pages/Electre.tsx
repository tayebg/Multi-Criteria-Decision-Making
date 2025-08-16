import { useState } from "react";
import { Plus, Minus, Calculator, Download, Info, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";

export default function Electre() {
  const [alternatives, setAlternatives] = useState(["Project A", "Project B", "Project C", "Project D"]);
  const [criteria, setCriteria] = useState([
    { name: "Cost", weight: 0.3, type: "cost", vetoThreshold: 5000 },
    { name: "Quality", weight: 0.4, type: "benefit", vetoThreshold: 3 },
    { name: "Risk", weight: 0.3, type: "cost", vetoThreshold: 2 }
  ]);
  const [performanceMatrix, setPerformanceMatrix] = useState([
    [15000, 8, 4],
    [12000, 9, 6],
    [18000, 7, 3],
    [14000, 8, 5]
  ]);
  const [concordanceThreshold, setConcordanceThreshold] = useState(0.7);
  const [discordanceThreshold, setDiscordanceThreshold] = useState(0.3);
  const [results, setResults] = useState(null);

  const addAlternative = () => {
    const newIndex = alternatives.length + 1;
    setAlternatives([...alternatives, `Alternative ${String.fromCharCode(64 + newIndex)}`]);
    setPerformanceMatrix(prev => [...prev, new Array(criteria.length).fill(0)]);
  };

  const removeAlternative = (index: number) => {
    if (alternatives.length > 2) {
      setAlternatives(prev => prev.filter((_, i) => i !== index));
      setPerformanceMatrix(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addCriterion = () => {
    const newIndex = criteria.length + 1;
    setCriteria([...criteria, { 
      name: `Criterion ${newIndex}`, 
      weight: 0.1, 
      type: "benefit",
      vetoThreshold: 1
    }]);
    setPerformanceMatrix(prev => prev.map(row => [...row, 0]));
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 2) {
      setCriteria(prev => prev.filter((_, i) => i !== index));
      setPerformanceMatrix(prev => prev.map(row => row.filter((_, i) => i !== index)));
    }
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    setCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: value } : criterion
    ));
  };

  const updatePerformance = (altIndex: number, critIndex: number, value: number) => {
    setPerformanceMatrix(prev => prev.map((row, i) => 
      i === altIndex ? row.map((cell, j) => j === critIndex ? value : cell) : row
    ));
  };

  const updateAlternativeName = (index: number, name: string) => {
    setAlternatives(prev => prev.map((alt, i) => i === index ? name : alt));
  };

  const calculateElectre = () => {
    try {
      const n = alternatives.length;
      const m = criteria.length;
      
      // Validate weights
      const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
      if (Math.abs(totalWeight - 1) > 0.01) {
        throw new Error(`Weights must sum to 1.0 (current sum: ${totalWeight.toFixed(3)})`);
      }

      // Calculate normalized performance matrix
      const normalizedMatrix = performanceMatrix.map(row => [...row]);
      
      // Calculate concordance matrix
      const concordanceMatrix: number[][] = [];
      for (let a = 0; a < n; a++) {
        concordanceMatrix[a] = [];
        for (let b = 0; b < n; b++) {
          if (a === b) {
            concordanceMatrix[a][b] = 1;
          } else {
            let concordanceSum = 0;
            for (let j = 0; j < m; j++) {
              const valueA = performanceMatrix[a][j];
              const valueB = performanceMatrix[b][j];
              
              // Check if criterion j supports a outranking b
              let supports = false;
              if (criteria[j].type === 'benefit') {
                supports = valueA >= valueB;
              } else {
                supports = valueA <= valueB;
              }
              
              if (supports) {
                concordanceSum += criteria[j].weight;
              }
            }
            concordanceMatrix[a][b] = concordanceSum;
          }
        }
      }

      // Calculate discordance matrix
      const discordanceMatrix: number[][] = [];
      for (let a = 0; a < n; a++) {
        discordanceMatrix[a] = [];
        for (let b = 0; b < n; b++) {
          if (a === b) {
            discordanceMatrix[a][b] = 0;
          } else {
            let maxDiscordance = 0;
            for (let j = 0; j < m; j++) {
              const valueA = performanceMatrix[a][j];
              const valueB = performanceMatrix[b][j];
              const veto = criteria[j].vetoThreshold;
              
              let discordance = 0;
              if (criteria[j].type === 'benefit') {
                if (valueB > valueA) {
                  discordance = Math.min(1, (valueB - valueA) / veto);
                }
              } else {
                if (valueA > valueB) {
                  discordance = Math.min(1, (valueA - valueB) / veto);
                }
              }
              maxDiscordance = Math.max(maxDiscordance, discordance);
            }
            discordanceMatrix[a][b] = maxDiscordance;
          }
        }
      }

      // Calculate outranking matrix
      const outrankingMatrix: boolean[][] = [];
      for (let a = 0; a < n; a++) {
        outrankingMatrix[a] = [];
        for (let b = 0; b < n; b++) {
          if (a === b) {
            outrankingMatrix[a][b] = false;
          } else {
            const concordance = concordanceMatrix[a][b] >= concordanceThreshold;
            const discordance = discordanceMatrix[a][b] <= discordanceThreshold;
            outrankingMatrix[a][b] = concordance && discordance;
          }
        }
      }

      // Calculate dominance scores
      const dominanceScores = alternatives.map((_, altIndex) => {
        const outranks = outrankingMatrix[altIndex].filter(Boolean).length;
        const outrankedBy = outrankingMatrix.map(row => row[altIndex]).filter(Boolean).length;
        return {
          alternative: alternatives[altIndex],
          index: altIndex,
          outranks,
          outrankedBy,
          netDominance: outranks - outrankedBy
        };
      });

      // Sort by net dominance (descending)
      const ranking = dominanceScores
        .sort((a, b) => b.netDominance - a.netDominance)
        .map((item, rank) => ({ ...item, rank: rank + 1 }));

      // Identify kernel (non-dominated alternatives)
      const kernel = alternatives.filter((_, altIndex) => {
        return !outrankingMatrix.some(row => row[altIndex]);
      });

      setResults({
        ranking,
        concordanceMatrix,
        discordanceMatrix,
        outrankingMatrix,
        dominanceScores,
        kernel,
        thresholds: {
          concordance: concordanceThreshold,
          discordance: discordanceThreshold
        }
      });

    } catch (error) {
      console.error("ELECTRE calculation error:", error);
      alert(error instanceof Error ? error.message : "An error occurred during calculation");
    }
  };

  const isValidInput = () => {
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    return Math.abs(totalWeight - 1) < 0.01 && 
           alternatives.length >= 2 && 
           criteria.length >= 2 &&
           performanceMatrix.every(row => row.every(cell => !isNaN(cell)));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">ELECTRE I Method</h1>
        <p className="text-lg text-muted-foreground">
          Elimination Et Choix Traduisant la Realité - Outranking method with concordance and discordance analysis
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="setup" className="text-xs sm:text-sm">Setup</TabsTrigger>
          <TabsTrigger value="theory" className="text-xs sm:text-sm">Theory</TabsTrigger>
          <TabsTrigger value="calculate" className="text-xs sm:text-sm">Calculate</TabsTrigger>
          <TabsTrigger value="results" className="text-xs sm:text-sm">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {/* Alternatives Setup */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Alternatives</CardTitle>
              <CardDescription>Define the decision alternatives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alternatives.map((alt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Label className="w-24">Alt {index + 1}:</Label>
                  <Input
                    value={alt}
                    onChange={(e) => updateAlternativeName(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAlternative(index)}
                    disabled={alternatives.length <= 2}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addAlternative} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Alternative
              </Button>
            </CardContent>
          </Card>

          {/* Criteria Setup */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Criteria Configuration</CardTitle>
              <CardDescription>Define criteria with weights and veto thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {criteria.map((criterion, index) => (
                <div key={index} className="bg-muted/30 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Criterion {index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCriterion(index)}
                      disabled={criteria.length <= 2}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={criterion.name}
                        onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label>Weight</Label>
                      <Input
                        type="number"
                        value={criterion.weight}
                        onChange={(e) => updateCriterion(index, 'weight', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="1"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <Select
                        value={criterion.type}
                        onValueChange={(value) => updateCriterion(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="benefit">Benefit (↑)</SelectItem>
                          <SelectItem value="cost">Cost (↓)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Veto Threshold</Label>
                      <Input
                        type="number"
                        value={criterion.vetoThreshold}
                        onChange={(e) => updateCriterion(index, 'vetoThreshold', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" onClick={addCriterion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
              </Button>
            </CardContent>
          </Card>

          {/* Performance Matrix */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Performance Matrix</CardTitle>
              <CardDescription>Enter performance values for each alternative-criterion pair</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alternative</TableHead>
                      {criteria.map((criterion, index) => (
                        <TableHead key={index} className="text-center">
                          {criterion.name}
                          <div className="text-xs text-muted-foreground">
                            {criterion.type === 'benefit' ? '(↑)' : '(↓)'} • w={criterion.weight}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alternatives.map((alt, altIndex) => (
                      <TableRow key={altIndex}>
                        <TableCell className="font-medium">{alt}</TableCell>
                        {criteria.map((_, critIndex) => (
                          <TableCell key={critIndex}>
                            <Input
                              type="number"
                              value={performanceMatrix[altIndex][critIndex]}
                              onChange={(e) => updatePerformance(altIndex, critIndex, parseFloat(e.target.value) || 0)}
                              className="text-center"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Thresholds */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Outranking Thresholds</CardTitle>
              <CardDescription>Set concordance and discordance thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Concordance Threshold: {concordanceThreshold}</Label>
                <Slider
                  value={[concordanceThreshold]}
                  onValueChange={([value]) => setConcordanceThreshold(value)}
                  min={0.5}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum required concordance for outranking (typically 0.6-0.8)
                </p>
              </div>
              
              <div>
                <Label>Discordance Threshold: {discordanceThreshold}</Label>
                <Slider
                  value={[discordanceThreshold]}
                  onValueChange={([value]) => setDiscordanceThreshold(value)}
                  min={0}
                  max={0.5}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum allowed discordance for outranking (typically 0.2-0.4)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                ELECTRE I Theory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mathematical Foundation</h3>
                <p className="text-muted-foreground">
                  ELECTRE I uses concordance and discordance analysis to establish outranking relations between alternatives.
                </p>
                
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Key Formulas:</h4>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="formula">
                      C(a,b) = Σ wⱼ where gⱼ(a) ≥ gⱼ(b)
                    </div>
                    <div className="formula">
                      D(a,b) = max [|gⱼ(b) - gⱼ(a)| / vⱼ] where gⱼ(a) &lt; gⱼ(b)
                    </div>
                    <div className="formula">
                      a S b ⟺ C(a,b) ≥ c* AND D(a,b) ≤ d*
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Where: C = concordance, D = discordance, S = outranking, c*, d* = thresholds</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Concepts</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-medium text-success">Concordance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Measures the proportion of criteria weights supporting the outranking relation
                    </p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-medium text-destructive">Discordance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Measures the opposition to outranking based on veto thresholds
                    </p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-medium text-primary">Outranking</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Alternative a outranks b if concordance is high and discordance is low
                    </p>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <h4 className="font-medium text-accent">Kernel</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set of non-dominated alternatives that are not outranked by any other
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  ELECTRE I provides partial ranking through outranking relations. Some alternatives may be incomparable.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculate" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                ELECTRE I Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium">Input Validation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${alternatives.length >= 2 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Alternatives: {alternatives.length} ≥ 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${criteria.length >= 2 ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="text-sm">Criteria: {criteria.length} ≥ 2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${Math.abs(criteria.reduce((sum, c) => sum + c.weight, 0) - 1) < 0.01 ? 'text-success' : 'text-destructive'}`} />
                    <span className="text-sm">
                      Weights sum: {criteria.reduce((sum, c) => sum + c.weight, 0).toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Analysis Parameters</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Concordance Threshold:</span>
                    <span className="ml-2 font-medium">{concordanceThreshold}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discordance Threshold:</span>
                    <span className="ml-2 font-medium">{discordanceThreshold}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Alternatives:</span>
                    <span className="ml-2 font-medium">{alternatives.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Criteria:</span>
                    <span className="ml-2 font-medium">{criteria.length}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={calculateElectre}
                disabled={!isValidInput()}
                className="w-full btn-hero"
              >
                <Download className="h-4 w-4 mr-2" />
                Run ELECTRE I Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Outranking Relations */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Outranking Relations Matrix</CardTitle>
                  <CardDescription>Shows which alternatives outrank others</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Alternative</TableHead>
                          {alternatives.map((alt, index) => (
                            <TableHead key={index} className="text-center">{alt}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alternatives.map((alt, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{alt}</TableCell>
                            {alternatives.map((_, j) => (
                              <TableCell key={j} className="text-center">
                                {i === j ? (
                                  <span className="text-muted-foreground">-</span>
                                ) : results.outrankingMatrix[i][j] ? (
                                  <CheckCircle className="h-5 w-5 text-success mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Dominance Analysis */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Dominance Analysis</CardTitle>
                  <CardDescription>Ranking based on outranking relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Alternative</TableHead>
                        <TableHead className="text-center">Outranks</TableHead>
                        <TableHead className="text-center">Outranked By</TableHead>
                        <TableHead className="text-center">Net Dominance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.ranking.map((item: any, index: number) => (
                        <TableRow key={index} className={index === 0 ? "bg-success/10" : ""}>
                          <TableCell className="font-bold">{item.rank}</TableCell>
                          <TableCell className="font-medium">{item.alternative}</TableCell>
                          <TableCell className="text-center">{item.outranks}</TableCell>
                          <TableCell className="text-center">{item.outrankedBy}</TableCell>
                          <TableCell className="text-center font-mono font-bold">
                            {item.netDominance > 0 ? '+' : ''}{item.netDominance}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Kernel Analysis */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Kernel (Non-dominated Set)</CardTitle>
                  <CardDescription>Alternatives that are not outranked by any other</CardDescription>
                </CardHeader>
                <CardContent>
                  {results.kernel.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {results.kernel.map((alt: string, index: number) => (
                          <div key={index} className="bg-success/10 text-success px-3 py-2 rounded-lg font-medium">
                            {alt}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {results.kernel.length === 1 
                          ? "Single best alternative identified."
                          : `${results.kernel.length} alternatives are in the kernel (incomparable with each other).`
                        }
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No alternatives in the kernel (all are dominated).</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Complete the problem setup and run the calculation to see results.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
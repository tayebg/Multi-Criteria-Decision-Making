import { useState } from "react";
import { Plus, Minus, Calculator, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const saaty_scale = [
  { value: 1, label: "Equal importance", description: "Two activities contribute equally" },
  { value: 3, label: "Moderate importance", description: "Experience favors one activity over another" },
  { value: 5, label: "Strong importance", description: "Experience strongly favors one activity" },
  { value: 7, label: "Very strong importance", description: "Activity is favored very strongly" },
  { value: 9, label: "Extreme importance", description: "Evidence favoring one activity is highest" },
  { value: 2, label: "Intermediate value", description: "Between equal and moderate" },
  { value: 4, label: "Intermediate value", description: "Between moderate and strong" },
  { value: 6, label: "Intermediate value", description: "Between strong and very strong" },
  { value: 8, label: "Intermediate value", description: "Between very strong and extreme" }
];

export default function AHP() {
  const [criteria, setCriteria] = useState(["Cost", "Quality", "Delivery Time"]);
  const [alternatives, setAlternatives] = useState(["Supplier A", "Supplier B", "Supplier C"]);
  const [criteriaMatrix, setCriteriaMatrix] = useState([
    [1, 3, 5],
    [1/3, 1, 2],
    [1/5, 1/2, 1]
  ]);
  const [alternativeMatrices, setAlternativeMatrices] = useState([
    [[1, 2, 4], [1/2, 1, 3], [1/4, 1/3, 1]], // Cost matrix
    [[1, 1/3, 2], [3, 1, 4], [1/2, 1/4, 1]], // Quality matrix
    [[1, 4, 2], [1/4, 1, 1/2], [1/2, 2, 1]]  // Delivery Time matrix
  ]);
  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [activeMatrix, setActiveMatrix] = useState(0);

  const addCriterion = () => {
    const newCriteria = [...criteria, `Criterion ${criteria.length + 1}`];
    setCriteria(newCriteria);
    
    // Expand criteria matrix
    const newMatrix = criteriaMatrix.map(row => [...row, 1/3]);
    newMatrix.push(new Array(newCriteria.length).fill(3));
    newMatrix[newMatrix.length - 1][newMatrix.length - 1] = 1;
    setCriteriaMatrix(newMatrix);
    
    // Add new alternative matrix
    const newAltMatrix = alternatives.map(() => new Array(alternatives.length).fill(1));
    for (let i = 0; i < alternatives.length; i++) {
      newAltMatrix[i][i] = 1;
    }
    setAlternativeMatrices([...alternativeMatrices, newAltMatrix]);
  };

  const addAlternative = () => {
    const newAlts = [...alternatives, `Alternative ${String.fromCharCode(65 + alternatives.length)}`];
    setAlternatives(newAlts);
    
    // Expand all alternative matrices
    const newMatrices = alternativeMatrices.map(matrix => {
      const expanded = matrix.map(row => [...row, 1/3]);
      expanded.push(new Array(newAlts.length).fill(3));
      expanded[expanded.length - 1][expanded.length - 1] = 1;
      return expanded;
    });
    setAlternativeMatrices(newMatrices);
  };

  const updateCriteriaMatrix = (i: number, j: number, value: number) => {
    const newMatrix = [...criteriaMatrix];
    newMatrix[i][j] = value;
    newMatrix[j][i] = 1 / value;
    setCriteriaMatrix(newMatrix);
  };

  const updateAlternativeMatrix = (matrixIndex: number, i: number, j: number, value: number) => {
    const newMatrices = [...alternativeMatrices];
    newMatrices[matrixIndex][i][j] = value;
    newMatrices[matrixIndex][j][i] = 1 / value;
    setAlternativeMatrices(newMatrices);
  };

  const calculateEigenVector = (matrix: number[][]) => {
    const n = matrix.length;
    const sums = matrix[0].map((_, j) => 
      matrix.reduce((sum, row) => sum + row[j], 0)
    );
    
    const normalized = matrix.map(row => 
      row.map((value, j) => value / sums[j])
    );
    
    const eigenVector = normalized.map(row => 
      row.reduce((sum, value) => sum + value, 0) / n
    );
    
    return eigenVector;
  };

  const calculateConsistencyRatio = (matrix: number[][], eigenVector: number[]) => {
    const n = matrix.length;
    const weightedSum = matrix.map((row, i) => 
      row.reduce((sum, value, j) => sum + value * eigenVector[j], 0)
    );
    
    const consistencyVector = weightedSum.map((sum, i) => sum / eigenVector[i]);
    const lambdaMax = consistencyVector.reduce((sum, value) => sum + value, 0) / n;
    
    const ci = (lambdaMax - n) / (n - 1);
    const ri = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49][n] || 1.49;
    const cr = ci / ri;
    
    return { cr, ci, lambdaMax };
  };

  const calculateAHP = async () => {
    setCalculating(true);
    
    try {
      // Calculate criteria weights
      const criteriaWeights = calculateEigenVector(criteriaMatrix);
      const criteriaConsistency = calculateConsistencyRatio(criteriaMatrix, criteriaWeights);
      
      // Calculate alternative scores for each criterion
      const alternativeScores = alternativeMatrices.map(matrix => 
        calculateEigenVector(matrix)
      );
      
      // Calculate overall scores
      const overallScores = alternatives.map((_, altIndex) => 
        criteriaWeights.reduce((sum, weight, critIndex) => 
          sum + weight * alternativeScores[critIndex][altIndex], 0
        )
      );
      
      // Create ranking
      const ranking = alternatives.map((alt, index) => ({
        alternative: alt,
        score: overallScores[index],
        rank: 1
      }))
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));
      
      setResults({
        ranking,
        criteriaWeights,
        alternativeScores,
        overallScores,
        consistency: {
          criteria: criteriaConsistency,
          alternatives: alternativeMatrices.map((matrix, index) => 
            calculateConsistencyRatio(matrix, alternativeScores[index])
          )
        }
      });
      
    } catch (error) {
      console.error("AHP calculation error:", error);
      alert("An error occurred during calculation");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">AHP Method</h1>
        <p className="text-lg text-muted-foreground">
          Analytic Hierarchy Process - Pairwise comparison method for multi-criteria decision making
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
          {/* Criteria Setup */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Criteria</CardTitle>
              <CardDescription>Define the decision criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Label className="w-24">C{index + 1}:</Label>
                  <Input
                    value={criterion}
                    onChange={(e) => {
                      const newCriteria = [...criteria];
                      newCriteria[index] = e.target.value;
                      setCriteria(newCriteria);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (criteria.length > 2) {
                        const newCriteria = criteria.filter((_, i) => i !== index);
                        setCriteria(newCriteria);
                      }
                    }}
                    disabled={criteria.length <= 2}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addCriterion} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Criterion
              </Button>
            </CardContent>
          </Card>

          {/* Alternatives Setup */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Alternatives</CardTitle>
              <CardDescription>Define the decision alternatives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alternatives.map((alt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Label className="w-24">A{index + 1}:</Label>
                  <Input
                    value={alt}
                    onChange={(e) => {
                      const newAlts = [...alternatives];
                      newAlts[index] = e.target.value;
                      setAlternatives(newAlts);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (alternatives.length > 2) {
                        const newAlts = alternatives.filter((_, i) => i !== index);
                        setAlternatives(newAlts);
                      }
                    }}
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

          {/* Pairwise Comparison Matrices */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Pairwise Comparison Matrices</CardTitle>
              <CardDescription>Compare criteria and alternatives using Saaty's 1-9 scale</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Matrix Selector */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={activeMatrix === 0 ? "default" : "outline"}
                  onClick={() => setActiveMatrix(0)}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Criteria Matrix
                </Button>
                {criteria.map((criterion, index) => (
                  <Button
                    key={index}
                    variant={activeMatrix === index + 1 ? "default" : "outline"}
                    onClick={() => setActiveMatrix(index + 1)}
                    size="sm"
                    className="text-xs sm:text-sm max-w-[100px] truncate"
                  >
                    {criterion}
                  </Button>
                ))}
              </div>

              {/* Active Matrix */}
              <div className="overflow-x-auto">
                {activeMatrix === 0 ? (
                  // Criteria comparison matrix
                  <div>
                    <h4 className="font-medium mb-3">Criteria Comparison Matrix</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Criteria</TableHead>
                          {criteria.map((criterion, index) => (
                            <TableHead key={index} className="text-center min-w-24">
                              {criterion}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {criteria.map((criterion, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{criterion}</TableCell>
                            {criteria.map((_, j) => (
                              <TableCell key={j} className="text-center">
                                {i === j ? (
                                  <span className="font-bold">1</span>
                                ) : i < j ? (
                                  <Input
                                    type="number"
                                    value={criteriaMatrix[i][j]}
                                    onChange={(e) => updateCriteriaMatrix(i, j, parseFloat(e.target.value) || 1)}
                                    className="w-20 text-center"
                                    min="1"
                                    max="9"
                                    step="0.5"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">
                                    {(1 / criteriaMatrix[j][i]).toFixed(2)}
                                  </span>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  // Alternative comparison matrix for selected criterion
                  <div>
                    <h4 className="font-medium mb-3">
                      Alternative Comparison Matrix - {criteria[activeMatrix - 1]}
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Alternative</TableHead>
                          {alternatives.map((alt, index) => (
                            <TableHead key={index} className="text-center min-w-24">
                              {alt}
                            </TableHead>
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
                                  <span className="font-bold">1</span>
                                ) : i < j ? (
                                  <Input
                                    type="number"
                                    value={alternativeMatrices[activeMatrix - 1][i][j]}
                                    onChange={(e) => updateAlternativeMatrix(activeMatrix - 1, i, j, parseFloat(e.target.value) || 1)}
                                    className="w-20 text-center"
                                    min="1"
                                    max="9"
                                    step="0.5"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">
                                    {(1 / alternativeMatrices[activeMatrix - 1][j][i]).toFixed(2)}
                                  </span>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                AHP Theory & Saaty Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Saaty's 1-9 Scale</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {saaty_scale.map((item, index) => (
                    <div key={index} className="bg-muted/20 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg w-8">{item.value}</span>
                        <div>
                          <h4 className="font-medium">{item.label}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mathematical Foundation</h3>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Key Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Construct pairwise comparison matrices</li>
                    <li>Calculate priority vectors (eigenvectors)</li>
                    <li>Check consistency ratios (CR &lt; 0.1)</li>
                    <li>Synthesize priorities to get final ranking</li>
                  </ol>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Consistency Ratio (CR) should be less than 0.1 for reliable results. Higher CR indicates inconsistent judgments.
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
                AHP Calculation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {calculating && (
                <div className="space-y-3">
                  <Progress value={50} className="w-full" />
                  <p className="text-sm text-muted-foreground">Calculating eigenvalues and consistency ratios...</p>
                </div>
              )}

              <Button 
                onClick={calculateAHP}
                disabled={calculating}
                className="w-full btn-hero"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Run AHP Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Final Ranking */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>AHP Results & Ranking</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Alternative</TableHead>
                        <TableHead>Overall Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.ranking.map((item: any, index: number) => (
                        <TableRow key={index} className={index === 0 ? "bg-success/10" : ""}>
                          <TableCell className="font-bold">{item.rank}</TableCell>
                          <TableCell className="font-medium">{item.alternative}</TableCell>
                          <TableCell className="font-mono">{item.score.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Criteria Weights */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Criteria Weights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {criteria.map((criterion, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                        <span className="font-medium">{criterion}</span>
                        <span className="font-mono">{(results.criteriaWeights[index] * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Consistency Analysis */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Consistency Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${results.consistency.criteria.cr < 0.1 ? 'bg-success/10' : 'bg-warning/10'}`}>
                      <h4 className="font-medium">Criteria Matrix</h4>
                      <p className="text-sm">
                        Consistency Ratio: <span className="font-mono">{results.consistency.criteria.cr.toFixed(4)}</span>
                        {results.consistency.criteria.cr < 0.1 ? " ✓ Acceptable" : " ⚠ Needs review"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Complete the pairwise comparisons and run the calculation to see results.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
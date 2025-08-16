import { useState } from "react";
import { Plus, Minus, Calculator, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrometheeCalculator } from "@/components/PrometheeCalculator";
import { PrometheeResults } from "@/components/PrometheeResults";

const preferenceTypes = [
  { value: "usual", label: "Usual Criterion (Type I)", description: "No preference threshold" },
  { value: "quasi", label: "Quasi Criterion (Type II)", description: "With indifference threshold" },
  { value: "linear", label: "Linear Criterion (Type III)", description: "With preference threshold" },
  { value: "level", label: "Level Criterion (Type IV)", description: "With indifference and preference thresholds" },
  { value: "v-shape", label: "V-shape Criterion (Type V)", description: "With preference threshold only" },
  { value: "gaussian", label: "Gaussian Criterion (Type VI)", description: "With Gaussian parameter" }
];

export default function Promethee() {
  const [alternatives, setAlternatives] = useState(["Alternative A", "Alternative B", "Alternative C"]);
  const [criteria, setCriteria] = useState([
    { name: "Cost", weight: 0.3, type: "cost", preferenceType: "linear", threshold: 1000 },
    { name: "Quality", weight: 0.4, type: "benefit", preferenceType: "v-shape", threshold: 2 },
    { name: "Time", weight: 0.3, type: "cost", preferenceType: "quasi", threshold: 5 }
  ]);
  const [performanceMatrix, setPerformanceMatrix] = useState([
    [15000, 8, 25],
    [12000, 9, 30],
    [18000, 7, 20]
  ]);
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
      preferenceType: "linear", 
      threshold: 1 
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">PROMETHEE II Method</h1>
        <p className="text-lg text-muted-foreground">
          Preference Ranking Organization Method for Enrichment Evaluation - Complete ranking with net outranking flows
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
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Alternatives
              </CardTitle>
              <CardDescription>Define the decision alternatives to be evaluated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alternatives.map((alt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Label className="w-24">Alt {index + 1}:</Label>
                  <Input
                    value={alt}
                    onChange={(e) => updateAlternativeName(index, e.target.value)}
                    className="flex-1"
                    placeholder={`Alternative ${String.fromCharCode(65 + index)}`}
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
              <Button
                variant="outline"
                onClick={addAlternative}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Alternative
              </Button>
            </CardContent>
          </Card>

          {/* Criteria Setup */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Criteria Configuration</CardTitle>
              <CardDescription>Define criteria with weights and preference functions</CardDescription>
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
                        placeholder="Criterion name"
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
                      <Label>Threshold</Label>
                      <Input
                        type="number"
                        value={criterion.threshold}
                        onChange={(e) => updateCriterion(index, 'threshold', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Preference Function</Label>
                    <Select
                      value={criterion.preferenceType}
                      onValueChange={(value) => updateCriterion(index, 'preferenceType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {preferenceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {preferenceTypes.find(t => t.value === criterion.preferenceType)?.description}
                    </p>
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
              <CardDescription>Enter the performance values for each alternative-criterion pair</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="border border-border p-2 sm:p-3 bg-muted/50 text-left font-medium sticky left-0 bg-muted/50 z-10">Alternative</th>
                      {criteria.map((criterion, index) => (
                        <th key={index} className="border border-border p-2 sm:p-3 bg-muted/50 text-center font-medium min-w-[120px]">
                          <div className="truncate">{criterion.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {criterion.type === 'benefit' ? '(↑)' : '(↓)'} • w={criterion.weight}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alternatives.map((alt, altIndex) => (
                      <tr key={altIndex}>
                        <td className="border border-border p-2 sm:p-3 font-medium bg-muted/20 sticky left-0 bg-muted/20 z-10">
                          <div className="truncate max-w-[120px]">{alt}</div>
                        </td>
                        {criteria.map((_, critIndex) => (
                          <td key={critIndex} className="border border-border p-1 sm:p-2">
                            <Input
                              type="number"
                              value={performanceMatrix[altIndex][critIndex]}
                              onChange={(e) => updatePerformance(altIndex, critIndex, parseFloat(e.target.value) || 0)}
                              className="text-center text-xs sm:text-sm"
                              step="0.01"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theory" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                PROMETHEE II Theory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mathematical Foundation</h3>
                <p className="text-muted-foreground">
                  PROMETHEE II is based on outranking relations and provides a complete ranking of alternatives using net outranking flows.
                </p>
                
                <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Key Formulas:</h4>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="formula">
                      π(a,b) = Σ wⱼ × Pⱼ(a,b) for j = 1 to n
                    </div>
                    <div className="formula">
                      φ⁺(a) = 1/(m-1) × Σ π(a,x) for all x ≠ a
                    </div>
                    <div className="formula">
                      φ⁻(a) = 1/(m-1) × Σ π(x,a) for all x ≠ a
                    </div>
                    <div className="formula">
                      φ(a) = φ⁺(a) - φ⁻(a)
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Where: π(a,b) = preference index, φ⁺ = positive flow, φ⁻ = negative flow, φ = net flow</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preference Functions</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {preferenceTypes.slice(0, 4).map((type, index) => (
                    <div key={index} className="bg-muted/20 p-4 rounded-lg">
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The choice of preference function significantly impacts the final ranking. Linear and V-shape functions are most commonly used in practice.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculate" className="space-y-6">
          <PrometheeCalculator
            alternatives={alternatives}
            criteria={criteria}
            performanceMatrix={performanceMatrix}
            onResults={setResults}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results ? (
            <PrometheeResults
              results={results}
              alternatives={alternatives}
              criteria={criteria}
            />
          ) : (
            <Card className="card-elegant">
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Complete the problem setup and run the calculation to see results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
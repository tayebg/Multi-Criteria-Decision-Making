import { useState } from "react";
import { Calculator, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface Criterion {
  name: string;
  weight: number;
  type: string;
  preferenceType: string;
  threshold: number;
}

interface PrometheeCalculatorProps {
  alternatives: string[];
  criteria: Criterion[];
  performanceMatrix: number[][];
  onResults: (results: any) => void;
}

export function PrometheeCalculator({ alternatives, criteria, performanceMatrix, onResults }: PrometheeCalculatorProps) {
  const [calculating, setCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const preferenceFunction = (a: number, b: number, type: string, threshold: number, isMaximize: boolean) => {
    const diff = isMaximize ? a - b : b - a;
    
    switch (type) {
      case "usual":
        return diff > 0 ? 1 : 0;
      case "quasi":
        return diff > threshold ? 1 : 0;
      case "linear":
        if (diff <= 0) return 0;
        if (diff >= threshold) return 1;
        return diff / threshold;
      case "level":
        if (diff <= threshold / 2) return 0;
        if (diff >= threshold) return 1;
        return 0.5;
      case "v-shape":
        if (diff <= 0) return 0;
        if (diff >= threshold) return 1;
        return diff / threshold;
      case "gaussian":
        if (diff <= 0) return 0;
        return 1 - Math.exp(-(diff * diff) / (2 * threshold * threshold));
      default:
        return diff > 0 ? 1 : 0;
    }
  };

  const calculatePromethee = async () => {
    setCalculating(true);
    setProgress(0);
    
    try {
      const n = alternatives.length;
      const m = criteria.length;
      
      // Validate inputs
      const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
      if (Math.abs(totalWeight - 1) > 0.01) {
        throw new Error(`Weights must sum to 1.0 (current sum: ${totalWeight.toFixed(3)})`);
      }

      setCurrentStep("Calculating preference functions...");
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate preference matrices for each criterion
      const preferenceMatrices: number[][][] = [];
      
      for (let j = 0; j < m; j++) {
        const matrix: number[][] = [];
        for (let i = 0; i < n; i++) {
          matrix[i] = [];
          for (let k = 0; k < n; k++) {
            if (i === k) {
              matrix[i][k] = 0;
            } else {
              matrix[i][k] = preferenceFunction(
                performanceMatrix[i][j],
                performanceMatrix[k][j],
                criteria[j].preferenceType,
                criteria[j].threshold,
                criteria[j].type === 'benefit'
              );
            }
          }
        }
        preferenceMatrices.push(matrix);
      }

      setCurrentStep("Computing aggregated preferences...");
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate aggregated preference matrix
      const aggregatedMatrix: number[][] = [];
      for (let i = 0; i < n; i++) {
        aggregatedMatrix[i] = [];
        for (let k = 0; k < n; k++) {
          let sum = 0;
          for (let j = 0; j < m; j++) {
            sum += criteria[j].weight * preferenceMatrices[j][i][k];
          }
          aggregatedMatrix[i][k] = sum;
        }
      }

      setCurrentStep("Calculating outranking flows...");
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate positive and negative flows
      const positiveFlows: number[] = [];
      const negativeFlows: number[] = [];
      const netFlows: number[] = [];

      for (let i = 0; i < n; i++) {
        // Positive flow (leaving flow)
        let positiveSum = 0;
        for (let k = 0; k < n; k++) {
          if (i !== k) {
            positiveSum += aggregatedMatrix[i][k];
          }
        }
        positiveFlows[i] = positiveSum / (n - 1);

        // Negative flow (entering flow)
        let negativeSum = 0;
        for (let k = 0; k < n; k++) {
          if (i !== k) {
            negativeSum += aggregatedMatrix[k][i];
          }
        }
        negativeFlows[i] = negativeSum / (n - 1);

        // Net flow
        netFlows[i] = positiveFlows[i] - negativeFlows[i];
      }

      setCurrentStep("Finalizing results...");
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create ranking
      const ranking = alternatives
        .map((alt, index) => ({
          alternative: alt,
          index,
          positiveFlow: positiveFlows[index],
          negativeFlow: negativeFlows[index],
          netFlow: netFlows[index]
        }))
        .sort((a, b) => b.netFlow - a.netFlow)
        .map((item, rank) => ({ ...item, rank: rank + 1 }));

      const results = {
        ranking,
        aggregatedMatrix,
        preferenceMatrices,
        flows: {
          positive: positiveFlows,
          negative: negativeFlows,
          net: netFlows
        }
      };

      onResults(results);
      
    } catch (error) {
      console.error("Calculation error:", error);
      alert(error instanceof Error ? error.message : "An error occurred during calculation");
    } finally {
      setCalculating(false);
      setProgress(0);
      setCurrentStep("");
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
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          PROMETHEE II Calculation
        </CardTitle>
        <CardDescription>
          Run the complete PROMETHEE II analysis with your configured parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation */}
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

        {/* Calculation Status */}
        {calculating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calculation Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            {currentStep && (
              <p className="text-sm text-muted-foreground">{currentStep}</p>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <h4 className="font-medium">Analysis Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Alternatives:</span>
              <span className="ml-2 font-medium">{alternatives.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Criteria:</span>
              <span className="ml-2 font-medium">{criteria.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Comparisons:</span>
              <span className="ml-2 font-medium">{alternatives.length * (alternatives.length - 1)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Method:</span>
              <span className="ml-2 font-medium">PROMETHEE II</span>
            </div>
          </div>
        </div>

        {!isValidInput() && (
          <Alert>
            <AlertDescription>
              Please ensure all inputs are valid: weights must sum to 1.0, and all performance values must be numeric.
            </AlertDescription>
          </Alert>
        )}

        {/* Calculate Button */}
        <Button 
          onClick={calculatePromethee}
          disabled={!isValidInput() || calculating}
          className="w-full btn-hero"
        >
          {calculating ? (
            <>
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run PROMETHEE II Analysis
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
import { Link } from "react-router-dom";
import { Calculator, BookOpen, BarChart3, Download, ArrowRight, CheckCircle, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const methods = [
  {
    id: "promethee",
    name: "PROMETHEE II",
    description: "Preference Ranking Organization Method for Enrichment Evaluation",
    href: "/promethee",
    icon: Calculator,
    features: ["Outranking method", "Complete ranking", "Visual preference analysis"],
    applications: ["Supplier selection", "Investment decisions", "Technology assessment"]
  },
  {
    id: "ahp",
    name: "AHP",
    description: "Analytic Hierarchy Process",
    href: "/ahp",
    icon: BarChart3,
    features: ["Pairwise comparisons", "Consistency checking", "Hierarchical structure"],
    applications: ["Strategic planning", "Resource allocation", "Risk assessment"]
  },
  {
    id: "electre",
    name: "ELECTRE I",
    description: "Elimination Et Choix Traduisant la Realité",
    href: "/electre",
    icon: Download,
    features: ["Concordance analysis", "Discordance analysis", "Outranking relations"],
    applications: ["Project selection", "Portfolio management", "Policy making"]
  }
];

const features = [
  {
    icon: Calculator,
    title: "Interactive Calculators",
    description: "Complete implementations with step-by-step calculations"
  },
  {
    icon: BookOpen,
    title: "Educational Content",
    description: "Mathematical explanations and practical examples"
  },
  {
    icon: BarChart3,
    title: "Visual Results",
    description: "Charts and graphs for better understanding"
  },
  {
    icon: Download,
    title: "Export Capabilities",
    description: "Save results in PDF or Excel format"
  }
];

export default function Overview() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Multi-Criteria Decision Making
            <span className="block text-primary">Toolkit</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive web application for learning and applying advanced MCDM methods. 
            Designed for students, researchers, and professionals in decision analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/promethee" className="w-full sm:w-auto">
            <Button className="btn-hero w-full sm:w-auto">
              <span className="truncate">Get Started with PROMETHEE</span>
              <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="btn-outline-primary w-full sm:w-auto"
            onClick={() => {
              const aboutSection = document.getElementById('about-mcdm');
              aboutSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn About MCDM
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="card-feature">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Methods Overview */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Available Methods</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from three powerful MCDM methods, each with complete implementations and interactive tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {methods.map((method) => (
            <Card key={method.id} className="card-method">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{method.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base">
                  {method.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">Applications</h4>
                  <ul className="space-y-2">
                    {method.applications.map((application, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4 text-accent" />
                        {application}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to={method.href} className="block">
                  <Button className="w-full btn-academic min-w-0 px-4 sm:px-6">
                    <span className="truncate">Explore {method.name}</span>
                    <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* About MCDM */}
      <Card className="card-elegant" id="about-mcdm">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            About Multi-Criteria Decision Making
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Multi-Criteria Decision Making (MCDM) is a field of operations research that deals with finding optimal results in complex scenarios including various indicators, conflicting objectives and criteria.
          </p>
          <p>
            MCDM methods help decision-makers evaluate alternatives based on multiple criteria simultaneously, providing structured approaches to complex decision problems in business, engineering, environmental management, and public policy.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Why Use MCDM Methods?</h4>
            <ul className="space-y-1 text-sm">
              <li>• Handle conflicting criteria systematically</li>
              <li>• Provide transparent decision processes</li>
              <li>• Support group decision making</li>
              <li>• Enable sensitivity analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
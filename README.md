# Multi-Criteria Decision Making (MCDM) Toolkit

A comprehensive web application for learning and applying advanced multi-criteria decision-making methods. Designed for students, researchers, and professionals in decision analysis.

## 🎯 Features

### Available Methods
- **PROMETHEE II** - Preference Ranking Organization Method for Enrichment Evaluation
- **AHP** - Analytic Hierarchy Process  
- **ELECTRE I** - Elimination Et Choix Traduisant la Realité

### Key Capabilities
- ✅ Interactive calculators with step-by-step calculations
- ✅ Visual results with charts and graphs
- ✅ Export capabilities (PDF and Excel formats)
- ✅ Educational content with mathematical explanations
- ✅ Practical examples integrated into each method
- ✅ Fully responsive design for desktop, tablet, and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <tayebg/Multi-Criteria-Decision-Making>
cd mcdm-toolkit

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 📸 Screenshots

   ![Screenshots 1](screenshots/1.png)

## 📊 MCDM Methods Overview

### PROMETHEE II
- Complete ranking method using outranking relations
- Visual preference analysis and sensitivity testing
- Applications: Supplier selection, investment decisions, technology assessment

### AHP (Analytic Hierarchy Process)
- Hierarchical decision-making with pairwise comparisons
- Consistency checking and weight calculation
- Applications: Strategic planning, resource allocation, risk assessment

### ELECTRE I
- Outranking method using concordance and discordance analysis
- Binary relations for alternative comparison
- Applications: Project selection, portfolio management, policy making

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Export**: jsPDF, html2canvas, xlsx
- **Routing**: React Router DOM

## 📱 Usage

1. Navigate to the method you want to use (PROMETHEE II, AHP, or ELECTRE I)
2. Input your decision criteria and alternatives
3. Set weights and preferences according to the method requirements
4. View interactive results with rankings and visualizations
5. Export results in PDF or Excel format

## 🎨 Design System

The application uses a modern, academic-focused design with:
- Semantic color tokens for consistent theming
- Responsive grid layouts
- Accessible UI components
- Dark/light mode support
- Professional typography optimized for academic content

## 📚 Educational Content

Each method includes:
- Mathematical explanations simplified for beginners
- Step-by-step calculation processes
- Practical examples with real-world scenarios
- Interactive tutorials and guided workflows

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
src/
├── components/      # Reusable UI components
├── pages/           # Main application pages
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── assets/          # Static assets
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

---

**Built for the academic and research community** - Making complex decision-making methods accessible and practical for real-world applications.

import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Calculator, BookOpen, BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: BookOpen,
    description: "Introduction to MCDM"
  },
  {
    name: "PROMETHEE II",
    href: "/promethee",
    icon: Calculator,
    description: "Preference Ranking Organization Method"
  },
  {
    name: "AHP",
    href: "/ahp",
    icon: BarChart3,
    description: "Analytic Hierarchy Process"
  },
  {
    name: "ELECTRE I",
    href: "/electre",
    icon: Download,
    description: "Elimination Et Choix Traduisant la Realité"
  }
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-72 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h1 className="text-xl font-bold text-foreground">MCDM Toolkit</h1>
              <p className="text-sm text-muted-foreground">Multi-Criteria Decision Making</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      <div>
                        <div>{item.name}</div>
                        <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Academic MCDM Tool</p>
              <p>For students and researchers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden sm:block lg:block">
                <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  {navigation.find(item => item.href === location.pathname)?.name || 'MCDM Toolkit'}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                {(location.pathname === '/promethee' || location.pathname === '/ahp' || location.pathname === '/electre') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                    onClick={() => {
                      // Trigger export from the active results component
                      const exportEvent = new CustomEvent('exportResults');
                      window.dispatchEvent(exportEvent);
                    }}
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export Results</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
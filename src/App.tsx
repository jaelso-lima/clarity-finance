import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Bills from "./pages/Bills";
import Investments from "./pages/Investments";
import Plans from "./pages/Plans";
import FinancialScore from "./pages/FinancialScore";
import Challenges from "./pages/Challenges";
import Projections from "./pages/Projections";
import Comparison from "./pages/Comparison";
import Diagnosis from "./pages/Diagnosis";
import Calculators from "./pages/Calculators";
import Referrals from "./pages/Referrals";
import NotFound from "./pages/NotFound";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminReports from "./pages/admin/AdminReports";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/diagnostico" element={<Diagnosis />} />
            <Route path="/calculadoras" element={<Calculators />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/despesas" element={<Expenses />} />
                <Route path="/receitas" element={<Income />} />
                <Route path="/contas" element={<Bills />} />
                <Route path="/investimentos" element={<Investments />} />
                <Route path="/planos" element={<Plans />} />
                <Route path="/score" element={<FinancialScore />} />
                <Route path="/desafios" element={<Challenges />} />
                <Route path="/projecoes" element={<Projections />} />
                <Route path="/comparacao" element={<Comparison />} />
                <Route path="/indicacoes" element={<Referrals />} />
              </Route>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/usuarios" element={<AdminUsers />} />
                <Route path="/admin/planos" element={<AdminPlans />} />
                <Route path="/admin/indicacoes" element={<AdminReferrals />} />
                <Route path="/admin/relatorios" element={<AdminReports />} />
                <Route path="/admin/socios" element={<AdminPartners />} />
                <Route path="/admin/seguranca" element={<AdminSecurity />} />
                <Route path="/admin/configuracoes" element={<AdminSettings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

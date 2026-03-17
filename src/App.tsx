import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AiChat } from "@/components/AiChat";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Movimentacoes from "./pages/Movimentacoes";
import Bills from "./pages/Bills";
import Investments from "./pages/Investments";
import Plans from "./pages/Plans";
import FinancialScore from "./pages/FinancialScore";
import Challenges from "./pages/Challenges";
import Projections from "./pages/Projections";
import Comparison from "./pages/Comparison";
import Diagnosis from "./pages/Diagnosis";
import Calculators from "./pages/Calculators";
import Simulator from "./pages/Simulator";
import Arena from "./pages/Arena";
import WalletPage from "./pages/WalletPage";
import Referrals from "./pages/Referrals";
import Profile from "./pages/Profile";
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
import AdminGames from "./pages/admin/AdminGames";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
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
                <Route path="/movimentacoes" element={<Movimentacoes />} />
                <Route path="/despesas" element={<Movimentacoes />} />
                <Route path="/receitas" element={<Movimentacoes />} />
                <Route path="/contas" element={<Bills />} />
                <Route path="/investimentos" element={<Investments />} />
                <Route path="/simulador" element={<Simulator />} />
                <Route path="/planos" element={<Plans />} />
                <Route path="/score" element={<FinancialScore />} />
                <Route path="/desafios" element={<Challenges />} />
                <Route path="/arena" element={<Arena />} />
                <Route path="/carteira" element={<WalletPage />} />
                <Route path="/projecoes" element={<Projections />} />
                <Route path="/comparacao" element={<Comparison />} />
                <Route path="/indicacoes" element={<Referrals />} />
                <Route path="/perfil" element={<Profile />} />
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
          <AiChat />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

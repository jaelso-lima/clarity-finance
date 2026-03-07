import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/diagnostico" element={<Diagnosis />} />
          <Route path="/calculadoras" element={<Calculators />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

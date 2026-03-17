// Types and store prepared for database migration
// When migrating to Lovable Cloud/Supabase, replace the store with real queries

export interface PartnerPermissions {
  dashboard: boolean;
  usuarios: boolean;
  planos: boolean;
  indicacoes: boolean;
  relatorios: boolean;
  socios: boolean;
  seguranca: boolean;
  configuracoes: boolean;
  jogos: boolean;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  share: number; // percentage
  role: "admin" | "socio" | "socio_limitado";
  permissions: PartnerPermissions;
  status: "ativo" | "inativo" | "pendente";
  totalReceived: number;
  joinedAt: string;
}

export interface PartnerPayment {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  date: string;
  method: string;
  status: "pago" | "pendente";
  description: string;
}

export interface PartnerContract {
  id: string;
  title: string;
  date: string;
  signers: string[];
  status: "assinado" | "pendente" | "expirado";
  fileUrl?: string;
}

export const ALL_PERMISSIONS: { key: keyof PartnerPermissions; label: string; description: string }[] = [
  { key: "dashboard", label: "Dashboard", description: "Ver métricas e gráficos da plataforma" },
  { key: "usuarios", label: "Usuários", description: "Visualizar e gerenciar usuários" },
  { key: "planos", label: "Planos", description: "Liberar e gerenciar planos PRO" },
  { key: "indicacoes", label: "Indicações", description: "Visualizar e validar indicações" },
  { key: "relatorios", label: "Relatórios", description: "Gerar e exportar relatórios" },
  { key: "socios", label: "Sócios", description: "Gerenciar sócios e pagamentos" },
  { key: "seguranca", label: "Segurança", description: "Acessar logs e anti-fraude" },
  { key: "configuracoes", label: "Configurações", description: "Alterar configurações do sistema" },
  { key: "jogos", label: "Jogos & Coins", description: "Gerenciar partidas, saldos e saques" },
];

export const DEFAULT_FULL_PERMISSIONS: PartnerPermissions = {
  dashboard: true, usuarios: true, planos: true, indicacoes: true,
  relatorios: true, socios: true, seguranca: true, configuracoes: true, jogos: true,
};

export const DEFAULT_LIMITED_PERMISSIONS: PartnerPermissions = {
  dashboard: true, usuarios: false, planos: false, indicacoes: false,
  relatorios: true, socios: false, seguranca: false, configuracoes: false, jogos: false,
};

// In-memory store — ready to swap for Supabase queries
let partnersData: Partner[] = [
  {
    id: "p1", name: "Carlos Almeida", email: "carlos@email.com", phone: "(11) 99999-0001",
    share: 50, role: "admin", permissions: { ...DEFAULT_FULL_PERMISSIONS },
    status: "ativo", totalReceived: 9375, joinedAt: "2025-01-01",
  },
  {
    id: "p2", name: "Roberto Lima", email: "roberto@email.com", phone: "(11) 99999-0002",
    share: 50, role: "socio", permissions: { ...DEFAULT_FULL_PERMISSIONS, configuracoes: false, seguranca: false },
    status: "ativo", totalReceived: 9375, joinedAt: "2025-01-01",
  },
];

let paymentsData: PartnerPayment[] = [
  { id: "pay1", partnerId: "p1", partnerName: "Carlos Almeida", amount: 2650, date: "2025-06-01", method: "PIX", status: "pago", description: "Repasse junho" },
  { id: "pay2", partnerId: "p2", partnerName: "Roberto Lima", amount: 2650, date: "2025-06-01", method: "PIX", status: "pago", description: "Repasse junho" },
  { id: "pay3", partnerId: "p1", partnerName: "Carlos Almeida", amount: 1700, date: "2025-07-01", method: "PIX", status: "pendente", description: "Repasse julho" },
  { id: "pay4", partnerId: "p2", partnerName: "Roberto Lima", amount: 1700, date: "2025-07-01", method: "PIX", status: "pendente", description: "Repasse julho" },
];

let contractsData: PartnerContract[] = [
  { id: "c1", title: "Contrato Social - FinanceFlow", date: "2025-01-01", signers: ["Carlos Almeida", "Roberto Lima"], status: "assinado" },
];

// CRUD functions — replace with Supabase calls when migrating
export const partnerStore = {
  getPartners: () => [...partnersData],
  getPayments: () => [...paymentsData],
  getContracts: () => [...contractsData],

  addPartner: (partner: Omit<Partner, "id" | "totalReceived" | "joinedAt">) => {
    const newPartner: Partner = {
      ...partner,
      id: `p${Date.now()}`,
      totalReceived: 0,
      joinedAt: new Date().toISOString().split("T")[0],
    };
    partnersData = [newPartner, ...partnersData];
    return newPartner;
  },

  updatePartner: (id: string, updates: Partial<Partner>) => {
    partnersData = partnersData.map((p) => (p.id === id ? { ...p, ...updates } : p));
  },

  removePartner: (id: string) => {
    partnersData = partnersData.filter((p) => p.id !== id);
  },

  updatePermissions: (id: string, permissions: PartnerPermissions) => {
    partnersData = partnersData.map((p) => (p.id === id ? { ...p, permissions } : p));
  },

  addPayment: (payment: Omit<PartnerPayment, "id">) => {
    const newPayment: PartnerPayment = { ...payment, id: `pay${Date.now()}` };
    paymentsData = [newPayment, ...paymentsData];
    return newPayment;
  },

  addContract: (contract: Omit<PartnerContract, "id">) => {
    const newContract: PartnerContract = { ...contract, id: `c${Date.now()}` };
    contractsData = [newContract, ...contractsData];
    return newContract;
  },
};

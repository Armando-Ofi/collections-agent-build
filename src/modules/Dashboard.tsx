import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { RoleProvider } from "@/shared/store/roleContext";
import DashboardSidebar from "@/shared/components/common/DashboardSidebar";
import NotFound from "@/shared/components/common/NotFound";
import { useRole } from "@/shared/store/roleContext";

// Importaciones existentes (Rol 1 - Collections Agent)
import LeadsPage from "./leads/pages/LeadPage";
import PrePaymentRiskPage from "./payment-risk/pages/PrePaymentRiskPage";
import CollectionsOverview from "./overview/page/CollectionsOverview";
import PaymentPlansPage from "./payment-plan/pages/PaymentPlanPage";
import RecoveryRiskPage from "./recovery-risk/pages/RecoveryRiskPage";

// Placeholder components para Rol 2 - Manager (por crear)
const TeamPerformancePage = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Team Performance</h2>
      <p className="text-muted-foreground">Manager view - Coming soon</p>
    </div>
  </div>
);

const ReportsPage = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <p className="text-muted-foreground">Management reports - Coming soon</p>
    </div>
  </div>
);

const AnalyticsPage = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <p className="text-muted-foreground">Advanced analytics - Coming soon</p>
    </div>
  </div>
);

const DashboardRoutes = () => {
  const { role } = useRole();

  return (
    <Routes>
      {/* Ruta común para ambos roles */}
      <Route path="/" element={<CollectionsOverview />} />
      <Route path="/overview" element={<CollectionsOverview />} />

      {/* Rutas específicas para Collections Agent (Rol 1) */}
      {role === 1 && (
        <>
          <Route path="/payment-plan" element={<PaymentPlansPage />} />
          <Route path="/payment-risk" element={<PrePaymentRiskPage />} />
        </>
      )}

      {/* Rutas específicas para Manager (Rol 2) */}
      {role === 2 && (
        <>
          <Route path="/recovery-risk" element={<RecoveryRiskPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </>
      )}

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const Dashboard = () => {
  return (
    <RoleProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-background/95 to-background/90">
            <DashboardRoutes />
          </main>
          {/*<FloatingAIButton />*/}
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
};

export default Dashboard;
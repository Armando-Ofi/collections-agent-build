import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import DashboardSidebar from "@/shared/components/common/DashboardSidebar";
//import FloatingAIButton from "@/shared/components/common/FloatingAIButton";
//import Overview from "./Overview";
import NotFound from "@/shared/components/common/NotFound";
import LeadsPage from "./leads/pages/LeadPage";
import PrePaymentRiskPage from "./payment-risk/pages/PrePaymentRiskPage";
import CollectionsOverview from "./overview/page/CollectionsOverview";
import PaymentPlansPage from "./payment-plan/pages/PaymentPlanPage";

const Dashboard = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gradient-to-br from-background via-background/95 to-background/90">
          <Routes>
            <Route path="/" element={<CollectionsOverview />} />
            <Route path="/overview" element={<CollectionsOverview />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/payment-plan" element={<PaymentPlansPage />} />
            <Route path="/payment-risk" element={<PrePaymentRiskPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {/*<FloatingAIButton />*/}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

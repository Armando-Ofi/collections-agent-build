import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import DashboardSidebar from "@/shared/components/common/DashboardSidebar";
import FloatingAIButton from "@/shared/components/common/FloatingAIButton";
import Overview from "./Overview";
import Contacts from "./Contacts";
import NotFound from "@/shared/components/common/NotFound";
import LeadsPage from "./leads/pages/LeadPage";
import ProductsPage from "./products/pages/ProductsPage";
import CompaniesPage from "./companies/pages/CompaniesPage";
import PrePaymentRiskPage from "./payment-risk/pages/PrePaymentRiskPage";

const Dashboard = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gradient-to-br from-background via-background/95 to-background/90">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/payment-risk" element={<PrePaymentRiskPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <FloatingAIButton />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

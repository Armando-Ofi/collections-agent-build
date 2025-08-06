import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatbotProvider } from "@/shared/components/common/ChatbotProvider";
import Dashboard from "./modules/Dashboard";
import NotFound from "@/shared/components/common/NotFound"
import { Provider } from "react-redux";
import { store } from "./core/store/store";
import PaymentPage from "./modules/payment/pages/PaymentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChatbotProvider>
        <Toaster />
        <Sonner />
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              {/*<Route path="/*" element={<Dashboard />} />*/}
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/*" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Provider>
      </ChatbotProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import TransactionsPage from "./pages/Transactions.tsx";
import WalletPage from "./pages/Wallet.tsx";
import InvoicesPage from "./pages/Invoices.tsx";
import BeneficiariesPage from "./pages/Beneficiaries.tsx";
import { WalletProvider } from "./store/wallet";
import { AuthProvider } from "./store/auth";
import { ProfileProvider } from "./store/profile";
import LoginPage from "./pages/Login.tsx";
import SettingsPage from "./pages/Settings.tsx";
import SupportPage from "./pages/Support.tsx";
import AdminPage from "./pages/Admin.tsx";
import ProfilePage from "./pages/Profile.tsx";
import TuitionPage from "./pages/Tuition.tsx";
import CardsPage from "./pages/Cards.tsx";
import SavingsPage from "./pages/Savings.tsx";
import QRPayPage from "./pages/QRPay.tsx";
import StatementsPage from "./pages/Statements.tsx";
import NotificationsPage from "./pages/Notifications.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { ThemeProvider } from "./hooks/use-theme";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              <WalletProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                  <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                  <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                  <Route path="/beneficiaries" element={<ProtectedRoute><BeneficiariesPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/tuition" element={<ProtectedRoute><TuitionPage /></ProtectedRoute>} />
                  <Route path="/cards" element={<ProtectedRoute><CardsPage /></ProtectedRoute>} />
                  <Route path="/savings" element={<ProtectedRoute><SavingsPage /></ProtectedRoute>} />
                  <Route path="/qr-pay" element={<ProtectedRoute><QRPayPage /></ProtectedRoute>} />
                  <Route path="/statements" element={<ProtectedRoute><StatementsPage /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><RoleRoute allow="admin"><AdminPage /></RoleRoute></ProtectedRoute>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </WalletProvider>
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

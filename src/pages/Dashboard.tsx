// TODO: THIS IS THE DEFAULT DASHBOARD PAGE THAT THE USER WILL SEE AFTER AUTHENTICATION. ADD MAIN FUNCTIONALITY HERE.
// This is the entry point for users who have just signed in

import { useAuth } from "@/hooks/use-auth";
import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import VendorDashboard from "@/components/dashboard/VendorDashboard";
import WholesalerDashboard from "@/components/dashboard/WholesalerDashboard";
import InvestorDashboard from "@/components/dashboard/InvestorDashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompleteProfileForm } from "@/components/auth/CompleteProfileForm";
import SimpleVendorDashboard from "@/components/dashboard/SimpleVendorDashboard";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Protected>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin mr-4" />
          Loading...
        </div>
      </Protected>
    );
  }

  // Simple marketplace - show wholesaler dashboard by default
  // Users can switch between wholesaler and vendor views
  return (
    <Protected>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <nav className="flex items-center space-x-4 lg:space-x-6">
              <a
                href="#wholesaler"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => window.location.reload()}
              >
                Sell Products (Wholesaler)
              </a>
              <a
                href="#vendor"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  // Switch to vendor view
                  const dashboard = document.getElementById('dashboard-content');
                  if (dashboard) {
                    dashboard.innerHTML = '';
                    // This is a simple way to switch views
                  }
                }}
              >
                Buy Products (Vendor)
              </a>
            </nav>
          </div>
        </div>
        <div id="dashboard-content">
          <WholesalerDashboard />
        </div>
      </motion.div>
    </Protected>
  );
}
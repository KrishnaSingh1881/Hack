// TODO: THIS IS THE DEFAULT DASHBOARD PAGE THAT THE USER WILL SEE AFTER AUTHENTICATION. ADD MAIN FUNCTIONALITY HERE.
// This is the entry point for users who have just signed in

import { useAuth } from "@/hooks/use-auth";
import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import VendorDashboard from "@/components/dashboard/VendorDashboard";
import WholesalerDashboard from "@/components/dashboard/WholesalerDashboard";
import InvestorDashboard from "@/components/dashboard/InvestorDashboard";

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

  const renderDashboard = () => {
    if (!user?.role) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to TrustTrade!</h2>
            <p className="text-muted-foreground">
              Please contact support to set up your role.
            </p>
          </div>
        </div>
      );
    }

    switch (user.role) {
      case "vendor":
        return <VendorDashboard />;
      case "wholesaler":
        return <WholesalerDashboard />;
      case "investor":
        return <InvestorDashboard />;
      default:
        return (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to TrustTrade!</h2>
              <p className="text-muted-foreground">
                Role: {user.role} - Dashboard coming soon!
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <Protected>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background"
      >
        {renderDashboard()}
      </motion.div>
    </Protected>
  );
}
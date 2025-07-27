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

  const needsProfileCompletion = user && (!user.name || !user.role);

  const renderDashboard = () => {
    if (!user?.role) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to TrustTrade!</h2>
            <p className="text-muted-foreground">
              Please complete your profile to continue.
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
      <Dialog open={!!needsProfileCompletion} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Welcome to TrustTrade! Please tell us a bit more about yourself to
              get started.
            </DialogDescription>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => window.location.reload()} />
        </DialogContent>
      </Dialog>
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
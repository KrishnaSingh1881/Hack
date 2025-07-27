import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "../ThemeToggle";
import { formatCurrency } from "@/lib/i18n";
import MapComponent from "./Map";

function LoanOpportunities() {
  const loanRequests = useQuery(api.loanRequests.getAllForInvestors);
  const fundLoan = useMutation(api.loanRequests.fund);

  const handleFundLoan = async (loanRequestId: string) => {
    try {
      await fundLoan({ loanRequestId: loanRequestId as any });
      toast.success("Loan funded successfully!");
    } catch (error) {
      toast.error("Failed to fund loan.");
      console.error(error);
    }
  };

  if (loanRequests === undefined) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor</TableHead>
          <TableHead>Trust Score</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loanRequests.length > 0 ? (
          loanRequests.map((request) => (
            <TableRow key={request._id}>
              <TableCell>{request.vendorName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span>{request.vendorTrustScore}</span>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(request.amount)}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => handleFundLoan(request._id)}>
                  Fund Loan
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center h-24">
              No loan opportunities available at the moment.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function MyPortfolio() {
  const fundedLoans = useQuery(api.loanRequests.getByInvestor);

  if (fundedLoans === undefined) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fundedLoans.length > 0 ? (
          fundedLoans.map((loan) => (
            <TableRow key={loan._id}>
              <TableCell>{loan.vendorName}</TableCell>
              <TableCell>{formatCurrency(loan.amount)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    loan.repaymentStatus === "paid" ? "default" : "secondary"
                  }
                >
                  {loan.repaymentStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center h-24">
              You haven't funded any loans yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function InvestorDashboard() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Investor Dashboard</h1>
        <ThemeToggle />
      </div>
      <Tabs defaultValue="opportunities">
        <TabsList className="mb-4">
          <TabsTrigger value="opportunities">Loan Opportunities</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="map">Market Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Available Loan Requests</CardTitle>
              <CardDescription>
                Browse and fund loan requests from vendors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoanOpportunities />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Your Investments</CardTitle>
              <CardDescription>
                Track the status of your funded loans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyPortfolio />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Market Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Investment Analytics</CardTitle>
              <CardDescription>
                Review your investment performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Charts and stats about your investments will be here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { ThemeToggle } from "../ThemeToggle";
import AiChat from "./AiChat";
import CommunityExchange from "./CommunityExchange";
import GroupBuys from "./GroupBuys";
import MapComponent from "./Map";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

const loanRequestSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
});

function RequestLoanForm({ onSuccess }: { onSuccess: () => void }) {
  const requestLoan = useMutation(api.loanRequests.create);
  const form = useForm<z.infer<typeof loanRequestSchema>>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      amount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof loanRequestSchema>) {
    try {
      await requestLoan({ amount: values.amount });
      toast.success("Loan request submitted successfully!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to submit loan request.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="500.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </form>
    </Form>
  );
}

function AllProductsList() {
  const products = useQuery(api.products.getAll);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.bulkPrice - b.bulkPrice;
          case "price-desc":
            return b.bulkPrice - a.bulkPrice;
          case "stock-desc":
            return b.stock - a.stock;
          default:
            return 0;
        }
      });
  }, [products, searchTerm, sortBy]);

  if (products === undefined) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4">
        <Input
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="stock-desc">Stock: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product: Doc<"products">) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.bulkPrice.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Button size="sm">View Details</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function VendorDashboard() {
  const [isLoanRequestOpen, setLoanRequestOpen] = useState(false);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <div className="flex items-center gap-4">
          <Dialog open={isLoanRequestOpen} onOpenChange={setLoanRequestOpen}>
            <DialogTrigger asChild>
              <Button>Request a Loan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a New Loan</DialogTitle>
              </DialogHeader>
              <RequestLoanForm onSuccess={() => setLoanRequestOpen(false)} />
            </DialogContent>
          </Dialog>
          <ThemeToggle />
        </div>
      </div>
      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers">Browse Suppliers</TabsTrigger>
          <TabsTrigger value="products">Browse Products</TabsTrigger>
          <TabsTrigger value="groupbuys">Group Buys</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers">
          <MapComponent />
        </TabsContent>
        <TabsContent value="products">
          <AllProductsList />
        </TabsContent>
        <TabsContent value="groupbuys">
          <GroupBuys />
        </TabsContent>
        <TabsContent value="community">
          <CommunityExchange />
        </TabsContent>
        <TabsContent value="chat">
          <AiChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}
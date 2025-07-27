import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2, ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/i18n";
import { ThemeToggle } from "../ThemeToggle";

export default function SimpleVendorDashboard() {
  const products = useQuery(api.products.getAll);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Browse Products</h1>
        <ThemeToggle />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Products from Wholesalers</CardTitle>
        </CardHeader>
        <CardContent>
          {products === undefined && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          
          {products && products.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>
          )}
          
          {products && products.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price per Unit</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Stock Available</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.bulkPrice)}</TableCell>
                    <TableCell>{product.discount || 0}%</TableCell>
                    <TableCell>{product.stock} units</TableCell>
                    <TableCell>
                      <Button size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import MapComponent from "./Map";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import GroupBuys from "./GroupBuys";

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
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
      <Tabs defaultValue="suppliers">
        <TabsList className="mb-4">
          <TabsTrigger value="suppliers">Browse Suppliers</TabsTrigger>
          <TabsTrigger value="products">Browse Products</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="group-buys">Group Buys</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers Near You</CardTitle>
            </CardHeader>
            <CardContent>
              <MapComponent />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>
              <AllProductsList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Order history and tracking will be here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="group-buys">
          <Card>
            <CardHeader>
              <CardTitle>Group Buying</CardTitle>
            </CardHeader>
            <CardContent>
              <GroupBuys />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Community Exchange</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Community features will be here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Multilingual chat with suppliers will be here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
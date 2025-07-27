import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ProductListings from "./ProductListings";

export default function WholesalerDashboard() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Wholesaler Dashboard</h1>
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Product Listings</TabsTrigger>
          <TabsTrigger value="orders">Incoming Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductListings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View and manage orders from vendors.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Insights into your sales performance.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
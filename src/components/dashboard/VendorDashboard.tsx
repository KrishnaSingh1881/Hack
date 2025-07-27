import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function VendorDashboard() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
      <Tabs defaultValue="suppliers">
        <TabsList className="mb-4">
          <TabsTrigger value="suppliers">Browse Suppliers</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="group-buys">Group Buys</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Supplier browsing and filtering will be here.</p>
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
              <CardTitle>Active Group Buys</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Group buying functionality will be here.</p>
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
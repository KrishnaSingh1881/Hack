import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, PlusCircle, Clock, MapPin, Leaf, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const createListingSchema = z.object({
  itemName: z.string().min(1, { message: "Item name is required." }),
  quantity: z.coerce.number().positive({ message: "Quantity must be positive." }),
  unit: z.enum(["kg", "pieces", "liters", "grams"], { message: "Please select a unit." }),
  expiryDate: z.string().optional(),
  desiredSwap: z.string().min(1, { message: "Please specify what you want in return." }),
  category: z.string().optional(),
});

function CreateListingForm({ onSuccess }: { onSuccess: () => void }) {
  const createListing = useMutation(api.wasteExchange.createListing);
  const form = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      itemName: "",
      quantity: 0,
      unit: "kg",
      expiryDate: "",
      desiredSwap: "",
      category: "",
    },
  });

  async function onSubmit(values: z.infer<typeof createListingSchema>) {
    try {
      await createListing({
        itemName: values.itemName,
        quantity: values.quantity,
        unit: values.unit,
        expiryDate: values.expiryDate || undefined,
        desiredSwap: values.desiredSwap,
        category: values.category || undefined,
      });
      toast.success("Waste listing created successfully! 🌱");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to create listing.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>📦 Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Extra Paneer, Unused Plates" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>🧮 Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="grams">Grams (g)</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="liters">Liters (L)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>📅 Expiry Date (Optional)</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="desiredSwap"
          render={({ field }) => (
            <FormItem>
              <FormLabel>🔄 Desired Swap</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cash, Coconut Chutney, Barter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Dairy, Vegetables, Utensils" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Leaf className="mr-2 h-4 w-4" /> List Item
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

function UrgencyBadge({ urgency }: { urgency: "low" | "medium" | "high" }) {
  const variants = {
    low: "default",
    medium: "secondary",
    high: "destructive",
  } as const;

  const icons = {
    low: <Clock className="h-3 w-3" />,
    medium: <Clock className="h-3 w-3" />,
    high: <AlertTriangle className="h-3 w-3" />,
  };

  return (
    <Badge variant={variants[urgency]} className="flex items-center gap-1">
      {icons[urgency]}
      {urgency}
    </Badge>
  );
}

export default function ZeroWasteCommunity() {
  const { user } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const availableListings = useQuery(api.wasteExchange.getAvailableListings);
  const myListings = useQuery(api.wasteExchange.getMyListings);
  const greenPoints = useQuery(api.wasteExchange.getGreenPoints);
  const expressInterest = useMutation(api.wasteExchange.expressInterest);

  const handleExpressInterest = async (listingId: string) => {
    try {
      await expressInterest({ listingId: listingId as any });
      toast.success("Interest expressed! The vendor will be notified. 💚");
    } catch (error) {
      toast.error("Failed to express interest.");
      console.error(error);
    }
  };

  if (!user) {
    return <div>Please log in to access the Zero-Waste Community.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Green Points */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            Zero-Waste Community
          </h2>
          <p className="text-muted-foreground">Reduce waste, help neighbors, earn green points!</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Green Points</p>
                <p className="text-lg font-bold">{greenPoints || 0}</p>
              </div>
            </div>
          </Card>
          <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                List Waste Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>🥕 List Your Leftover Item</DialogTitle>
              </DialogHeader>
              <CreateListingForm onSuccess={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Available Listings */}
      <Card>
        <CardHeader>
          <CardTitle>🛒 Available Items from Community</CardTitle>
        </CardHeader>
        <CardContent>
          {availableListings === undefined && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {availableListings && availableListings.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No waste items available yet.</p>
              <p className="text-sm text-muted-foreground">Be the first to list something!</p>
            </div>
          )}

          {availableListings && availableListings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Wants</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableListings.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell className="font-medium">{listing.itemName}</TableCell>
                    <TableCell>
                      {listing.quantity} {listing.unit}
                    </TableCell>
                    <TableCell>{listing.vendorName}</TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={listing.urgency} />
                    </TableCell>
                    <TableCell>{listing.desiredSwap}</TableCell>
                    <TableCell>
                      {listing.vendorId !== user._id && (
                        <Button
                          size="sm"
                          onClick={() => handleExpressInterest(listing._id)}
                        >
                          💚 Interested
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* My Listings */}
      <Card>
        <CardHeader>
          <CardTitle>📦 My Listed Items</CardTitle>
        </CardHeader>
        <CardContent>
          {myListings === undefined && (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {myListings && myListings.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">You haven't listed any items yet.</p>
            </div>
          )}

          {myListings && myListings.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Wants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myListings.map((listing) => (
                  <TableRow key={listing._id}>
                    <TableCell className="font-medium">{listing.itemName}</TableCell>
                    <TableCell>
                      {listing.quantity} {listing.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant={listing.status === "available" ? "default" : "secondary"}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={listing.urgency} />
                    </TableCell>
                    <TableCell>{listing.desiredSwap}</TableCell>
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

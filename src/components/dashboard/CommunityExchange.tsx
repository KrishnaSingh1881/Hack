import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, PlusCircle } from "lucide-react";
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

const createItemSchema = z.object({
  itemName: z.string().min(1, { message: "Item name is required." }),
  quantity: z.coerce.number().positive({ message: "Quantity must be positive." }),
  type: z.enum(["exchange", "request"], { message: "Please select a type." }),
});

function CreateItemForm({ onSuccess }: { onSuccess: () => void }) {
  const createItem = useMutation(api.communityItems.create);
  const form = useForm<z.infer<typeof createItemSchema>>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      itemName: "",
      quantity: 0,
      type: "exchange",
    },
  });

  async function onSubmit(values: z.infer<typeof createItemSchema>) {
    try {
      await createItem({
        itemName: values.itemName,
        quantity: values.quantity,
        type: values.type,
      });
      toast.success("Community item created successfully!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to create community item.");
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
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Cotton fabric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="exchange">Exchange</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                </SelectContent>
              </Select>
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
            "Create Item"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function CommunityExchange() {
  const { user } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "exchange" | "request">("all");
  const communityItems = useQuery(api.communityItems.getAll);

  if (!user) {
    return <div>Please log in to view community exchange.</div>;
  }

  const filteredItems = communityItems?.filter((item) => 
    filterType === "all" || item.type === filterType
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Community Exchange</h2>
        <div className="flex items-center gap-4">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="request">Request</SelectItem>
            </SelectContent>
          </Select>
          {user.role === "vendor" && (
            <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Community Item</DialogTitle>
                </DialogHeader>
                <CreateItemForm onSuccess={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {communityItems === undefined && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {filteredItems && filteredItems.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No community items available yet.</p>
          <p className="text-sm text-muted-foreground">Add one to get started!</p>
        </div>
      )}

      {filteredItems && filteredItems.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Posted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Badge variant={item.type === "exchange" ? "default" : "secondary"}>
                    {item.type}
                  </Badge>
                </TableCell>
                <TableCell>{item.vendorName}</TableCell>
                <TableCell>
                  {new Date(item._creationTime).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

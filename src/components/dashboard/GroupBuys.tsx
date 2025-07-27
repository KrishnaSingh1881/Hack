import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, PlusCircle, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const createGroupBuySchema = z.object({
  productId: z.string().min(1, { message: "Please select a product." }),
  targetQuantity: z.coerce.number().positive({ message: "Target quantity must be positive." }),
  pricePerUnit: z.coerce.number().positive({ message: "Price must be positive." }),
});

const joinGroupBuySchema = z.object({
  quantity: z.coerce.number().positive({ message: "Quantity must be positive." }),
});

function CreateGroupBuyForm({ onSuccess }: { onSuccess: () => void }) {
  const products = useQuery(api.products.getAll);
  const createGroupBuy = useMutation(api.groupBuys.create);
  const form = useForm<z.infer<typeof createGroupBuySchema>>({
    resolver: zodResolver(createGroupBuySchema),
    defaultValues: {
      productId: "",
      targetQuantity: 0,
      pricePerUnit: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof createGroupBuySchema>) {
    try {
      await createGroupBuy({
        productId: values.productId as any,
        targetQuantity: values.targetQuantity,
        pricePerUnit: values.pricePerUnit,
      });
      toast.success("Group buy created successfully!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to create group buy.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} - ${product.bulkPrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pricePerUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Per Unit</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="10.00" {...field} />
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
            "Create Group Buy"
          )}
        </Button>
      </form>
    </Form>
  );
}

function JoinGroupBuyForm({ 
  groupBuyId, 
  onSuccess 
}: { 
  groupBuyId: string; 
  onSuccess: () => void; 
}) {
  const joinGroupBuy = useMutation(api.groupBuys.join);
  const form = useForm<z.infer<typeof joinGroupBuySchema>>({
    resolver: zodResolver(joinGroupBuySchema),
    defaultValues: {
      quantity: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof joinGroupBuySchema>) {
    try {
      await joinGroupBuy({
        groupBuyId: groupBuyId as any,
        quantity: values.quantity,
      });
      toast.success("Successfully joined group buy!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to join group buy.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity to Purchase</FormLabel>
              <FormControl>
                <Input type="number" placeholder="10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
            </>
          ) : (
            "Join Group Buy"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function GroupBuys() {
  const { user } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState<string | null>(null);
  const groupBuys = useQuery(api.groupBuys.getByUser);

  if (!user) {
    return <div>Please log in to view group buys.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Group Buys</h2>
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Group Buy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group Buy</DialogTitle>
            </DialogHeader>
            <CreateGroupBuyForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {groupBuys === undefined && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {groupBuys && groupBuys.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No group buys available yet.</p>
          <p className="text-sm text-muted-foreground">Create one to get started!</p>
        </div>
      )}

      {groupBuys && groupBuys.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price/Unit</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupBuys.map((groupBuy) => {
              const progress = (groupBuy.currentQuantity / groupBuy.targetQuantity) * 100;
              const isParticipant = groupBuy.participants.includes(user._id);
              
              return (
                <TableRow key={groupBuy._id}>
                  <TableCell>{groupBuy.productName}</TableCell>
                  <TableCell>${groupBuy.pricePerUnit.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={progress} className="w-20" />
                      <div className="text-xs text-muted-foreground">
                        {groupBuy.currentQuantity}/{groupBuy.targetQuantity}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {groupBuy.participantCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={groupBuy.status === "open" ? "default" : "secondary"}>
                      {groupBuy.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!isParticipant && groupBuy.status === "open" ? (
                      <Dialog 
                        open={joinDialogOpen === groupBuy._id} 
                        onOpenChange={(open) => setJoinDialogOpen(open ? groupBuy._id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm">Join</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join Group Buy</DialogTitle>
                          </DialogHeader>
                          <JoinGroupBuyForm 
                            groupBuyId={groupBuy._id} 
                            onSuccess={() => setJoinDialogOpen(null)} 
                          />
                        </DialogContent>
                      </Dialog>
                    ) : isParticipant ? (
                      <Badge variant="outline">Joined</Badge>
                    ) : (
                      <Badge variant="secondary">Closed</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
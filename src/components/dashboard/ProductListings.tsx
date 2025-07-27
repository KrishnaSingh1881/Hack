"use client";

import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Loader2, PlusCircle } from "lucide-react";
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
import { Doc } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/i18n";

const formSchema = z.object({
  name: z.string().min(2, { message: "Product name is required." }),
  bulkPrice: z.coerce.number().positive({ message: "Price must be positive." }),
  discount: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, { message: "Stock can't be negative." }),
  unit: z.enum(["kg", "pieces", "liters", "grams"], { message: "Please select a unit." }),
});

function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const createProduct = useMutation(api.products.createDirect);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bulkPrice: 0,
      discount: 0,
      stock: 0,
      unit: "kg",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createProduct({
        name: values.name,
        bulkPrice: values.bulkPrice,
        discount: values.discount,
        stock: values.stock,
        unit: values.unit,
      });
      toast.success("Product added successfully!");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Failed to add product.");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Fresh Potatoes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bulkPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Unit (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
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
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
            </>
          ) : (
            "Add Product"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function ProductListings() {
  const { user } = useAuth();
  const [isAddProductOpen, setAddProductOpen] = useState(false);
  const products = useQuery(api.products.getByUser, user ? { userId: user._id } : "skip");

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Products</h2>
        <Dialog open={isAddProductOpen} onOpenChange={setAddProductOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Product</DialogTitle>
            </DialogHeader>
            <AddProductForm onSuccess={() => setAddProductOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      {products === undefined && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      
      {products && products.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">You haven't added any products yet.</p>
          <p className="text-sm text-muted-foreground">Click "Add Product" to get started.</p>
        </div>
      )}
      
      {products && products.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.bulkPrice)}</TableCell>
                <TableCell>{product.unit || "kg"}</TableCell>
                <TableCell>{product.discount || 0}%</TableCell>
                <TableCell>{product.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types";
import { X, Plus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  industries: z.array(z.string()).min(1, "Please select at least one industry"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(1, "Price must be greater than 0"),
  currency: z.string().default("USD"),
  maxLicenses: z.number().min(1, "Max licenses must be at least 1"),
  features: z.array(z.string()).min(1, "Please add at least one feature"),
  aiAgentType: z.enum(["Sales", "Support", "Marketing", "Operations"]),
  status: z.enum(["Active", "Inactive", "Development", "Deprecated"]),
  monthlyRevenue: z.number().min(0, "Monthly revenue cannot be negative"),
});

interface ProductsFormProps {
  onSubmit: (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Partial<Product>;
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Real Estate",
  "Automotive",
  "Energy",
  "Media & Entertainment",
  "Telecommunications",
  "Transportation",
  "Construction",
  "Agriculture",
  "Government",
  "Non-profit",
  "E-commerce",
  "SaaS",
  "Other",
];

const ProductsForm = ({ onSubmit, initialData }: ProductsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      industries: initialData?.industries || [],
      description: initialData?.description || "",
      price: initialData?.price || 0,
      currency: initialData?.currency || "USD",
      maxLicenses: initialData?.maxLicenses || 10,
      features: initialData?.features || [""],
      aiAgentType: initialData?.aiAgentType || "Sales",
      status: initialData?.status || "Active",
      monthlyRevenue: initialData?.monthlyRevenue || 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const watchedIndustries = form.watch("industries");

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const productData: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      ...values,
      activeLicenses: 0, // New products start with 0 active licenses
      features: values.features.filter((feature) => feature.trim() !== ""),
    };
    onSubmit(productData);
  };

  const addIndustry = (industry: string) => {
    const currentIndustries = form.getValues("industries");
    if (!currentIndustries.includes(industry)) {
      form.setValue("industries", [...currentIndustries, industry]);
    }
  };

  const removeIndustry = (industryToRemove: string) => {
    const currentIndustries = form.getValues("industries");
    form.setValue(
      "industries",
      currentIndustries.filter((industry) => industry !== industryToRemove),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter product name"
                          {...field}
                          className="glass-card border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aiAgentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Agent Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/10">
                            <SelectValue placeholder="Select agent type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/10">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Development">
                            Development
                          </SelectItem>
                          <SelectItem value="Deprecated">Deprecated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Pricing & Licensing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2500"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="glass-card border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxLicenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Licenses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="glass-card border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Est. Monthly Revenue ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="125000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            className="glass-card border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Industries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="industries"
                  render={() => (
                    <FormItem>
                      <FormLabel>Target Industries</FormLabel>
                      <Select onValueChange={addIndustry}>
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/10">
                            <SelectValue placeholder="Add industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/10">
                          {industries
                            .filter(
                              (industry) =>
                                !watchedIndustries.includes(industry),
                            )
                            .map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {watchedIndustries.map((industry, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="glass-card border-white/20 flex items-center gap-1"
                          >
                            {industry}
                            <X
                              className="w-3 h-3 cursor-pointer hover:text-red-400"
                              onClick={() => removeIndustry(industry)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Enter feature"
                              {...field}
                              className="glass-card border-white/10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => remove(index)}
                        className="glass-card border-red-500/50 hover:bg-red-500/20 dark:hover:bg-red-500/20 hover:bg-red-100/50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append("")}
                  className="glass-card border-white/20 dark:border-white/20 border-gray-300/50 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your AI agent product, its capabilities, and use cases..."
                      {...field}
                      className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium"
          >
            Add Product
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductsForm;


import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Company } from "../types";
import { Building, Save, X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  domain: z.string().url().optional().or(z.literal("")),
  size: z.string().min(1, "Please select company size"),
  revenue_size: z.string().min(1, "Please select revenue size"),
  founding_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  industry: z.string().min(1, "Industry is required"),
  keywords: z.string().optional(),
  techs_used: z.string().optional(),
  description: z.string().optional(),
  products_services: z.string().optional(),
  city: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  contact_info: z.string().optional(),
});

interface CompanyEditDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
}

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1,000 employees",
  "1,001-5,000 employees",
  "5,001-10,000 employees",
  "10,001+ employees",
];

const revenueSizes = [
  "Less than $1 million",
  "$1 million - $10 million",
  "$10 million - $50 million",
  "$50 million - $100 million",
  "$100 million - $500 million",
  "$500 million - $1 billion",
  "$1 billion - $10 billion",
  "$10 billion - $40 billion",
  "More than $40 billion",
];

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Ireland",
  "Australia",
  "Singapore",
  "Japan",
  "Other",
];

const CompanyEditDialog = ({
  company,
  isOpen,
  onClose,
  onSave,
}: CompanyEditDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      domain: "",
      size: "",
      revenue_size: "",
      founding_year: undefined,
      industry: "",
      keywords: "",
      techs_used: "",
      description: "",
      products_services: "",
      city: "",
      country: "",
      contact_info: "",
    },
  });

  useEffect(() => {
    if (company && isOpen) {
      form.reset({
        name: company.name !== "N/A" ? company.name : "",
        domain: company.domain !== "N/A" ? company.domain : "",
        size: company.size !== "N/A" ? company.size : "",
        revenue_size:
          company.revenue_size !== "N/A" ? company.revenue_size : "",
        founding_year: company.founding_year || undefined,
        industry: company.industry !== "N/A" ? company.industry : "",
        keywords: company.keywords || "",
        techs_used: company.techs_used || "",
        description: company.description || "",
        products_services: company.products_services || "",
        city: company.city !== "N/A" ? company.city : "",
        country:
          company.country !== "N/A" && company.country !== "not specified"
            ? company.country
            : "",
        contact_info: company.contact_info || "",
      });
    }
  }, [company, isOpen, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (!company) return;

    const updatedCompany: Company = {
      ...company,
      name: values.name || "N/A",
      domain: values.domain || "N/A",
      size: values.size || "N/A",
      revenue_size: values.revenue_size || "N/A",
      founding_year: values.founding_year || 0,
      industry: values.industry || "N/A",
      keywords: values.keywords || "",
      techs_used: values.techs_used || "",
      description: values.description || "",
      products_services: values.products_services || "",
      city: values.city || "N/A",
      country: values.country || "N/A",
      contact_info: values.contact_info || "",
    };

    onSave(updatedCompany);
  };

  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Edit Company - {company.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter company name"
                        {...field}
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain/Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://company.com"
                        {...field}
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
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
                name="revenue_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
                          <SelectValue placeholder="Select revenue size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
                        {revenueSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
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
                name="founding_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founding Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined,
                          )
                        }
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Technology, Finance, etc."
                        {...field}
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="San Francisco"
                        {...field}
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
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
                name="contact_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Info</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email, LinkedIn, etc."
                        {...field}
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="keyword1, keyword2, keyword3"
                        {...field}
                        className="glass-card border-white/10 dark:border-white/10 border-gray-200/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Company description..."
                      {...field}
                      className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="products_services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products & Services</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Products and services offered..."
                      {...field}
                      className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techs_used"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Technologies and tools used by the company..."
                      {...field}
                      className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="glass-card border-white/20 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100/50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyEditDialog;
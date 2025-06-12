import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Company } from "../types";
import { Link, FileText, Plus, Globe } from "lucide-react";

const urlFormSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

const manualFormSchema = z.object({
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

interface AddCompanyDialogProps {
  onSubmit: (company: Omit<Company, "id" | "company_url_id" | "company_url">) => void;
  onSubmitUrl?: (url: string) => void;
  isAnalyzing?: boolean;
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

const AddCompanyDialog = ({ onSubmit, onSubmitUrl, isAnalyzing = false }: AddCompanyDialogProps) => {
  const [activeTab, setActiveTab] = useState("url");

  const urlForm = useForm<z.infer<typeof urlFormSchema>>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      url: "",
    },
  });

  const manualForm = useForm<z.infer<typeof manualFormSchema>>({
    resolver: zodResolver(manualFormSchema),
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

  const handleUrl = async (values: z.infer<typeof urlFormSchema>) => {
    try {
      // Call the URL submission handler
      if (onSubmitUrl) {
        await onSubmitUrl(values.url);
      }
      urlForm.reset();
    } catch (error) {
      console.error('Error submitting URL:', error);
    }
  };

  const handleManualSubmit = (values: z.infer<typeof manualFormSchema>) => {
    const newCompany: Omit<Company, "id" | "company_url_id" | "company_url"> = {
      name: values.name,
      domain: values.domain || "N/A",
      size: values.size,
      revenue_size: values.revenue_size,
      founding_year: values.founding_year || 0,
      industry: values.industry,
      keywords: values.keywords || "",
      techs_used: values.techs_used || "",
      description: values.description || "",
      products_services: values.products_services || "",
      city: values.city || "N/A",
      country: values.country,
      contact_info: values.contact_info || "",
    };

    onSubmit(newCompany);
    manualForm.reset();
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="glass-card w-full justify-start p-1 dark:bg-white/5 bg-gray-50/50">
        <TabsTrigger value="url" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Add by URL
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Manual Entry
        </TabsTrigger>
      </TabsList>

      <TabsContent value="url" className="space-y-6 mt-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              Add Company by URL
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter a company website URL and we'll automatically analyze and
              extract company information.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...urlForm}>
              <form
                onSubmit={urlForm.handleSubmit(handleUrl)}
                className="space-y-4"
              >
                <FormField
                  control={urlForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://company.com"
                          {...field}
                          className="glass-card dark:border-white/10 border-gray-200/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing Website...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Analyze & Add Company
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manual" className="space-y-6 mt-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Manual Company Entry
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter company information manually for complete control over the
              data.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...manualForm}>
              <form
                onSubmit={manualForm.handleSubmit(handleManualSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={manualForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
                            {...field}
                            className="glass-card dark:border-white/10 border-gray-200/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain/Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://company.com"
                            {...field}
                            className="glass-card border-white/10 dark:border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/10 dark:border-white/10">
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10 dark:border-white/10">
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
                    control={manualForm.control}
                    name="revenue_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revenue Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/10 dark:border-white/10">
                              <SelectValue placeholder="Select revenue size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10 dark:border-white/10">
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
                    control={manualForm.control}
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
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                            className="glass-card border-white/10 dark:border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Technology, Finance, etc."
                            {...field}
                            className="glass-card border-white/10 dark:border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="San Francisco"
                            {...field}
                            className="glass-card border-white/10 dark:border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/10 dark:border-white/10">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="glass-card border-white/10 dark:border-white/10">
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
                    control={manualForm.control}
                    name="contact_info"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Info</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Email, LinkedIn, etc."
                            {...field}
                            className="glass-card border-white/10 dark:border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={manualForm.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="keyword1, keyword2, keyword3"
                            {...field}
                            className="glass-card border-white/10 dark:border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={manualForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Company description..."
                          {...field}
                          className="glass-card border-white/10 dark:border-white/10 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={manualForm.control}
                  name="products_services"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Products & Services</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Products and services offered..."
                          {...field}
                          className="glass-card border-white/10 dark:border-white/10 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={manualForm.control}
                  name="techs_used"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies Used</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Technologies and tools used by the company..."
                          {...field}
                          className="glass-card border-white/10 dark:border-white/10 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AddCompanyDialog;
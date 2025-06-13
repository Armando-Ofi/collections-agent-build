import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Shuffle } from "lucide-react";

// Mock products data for demo
const mockProducts = [
  {
    name: "Luna Customer Support",
    developer: "TechFlow Solutions",
    key_features: "24/7 intelligent customer support; multi-channel communication (chat, email, voice); sentiment analysis; automatic ticket routing; knowledge base integration; escalation protocols; performance analytics; multilingual support (12 languages).",
    target_industries: "E-commerce, SaaS platforms, telecommunications, financial services, healthcare",
    product_description: "An advanced AI customer support agent that provides 24/7 assistance across multiple channels, featuring sentiment analysis and intelligent ticket routing to enhance customer satisfaction and reduce response times."
  },
  {
    name: "DataMind Analytics",
    developer: "Insight Dynamics",
    key_features: "Automated data analysis and reporting; predictive modeling; real-time dashboard generation; anomaly detection; natural language query processing; data visualization automation; integration with popular BI tools.",
    target_industries: "Financial services, retail analytics, healthcare data, manufacturing intelligence",
    product_description: "A comprehensive data analytics AI agent that transforms raw data into actionable insights through automated analysis, predictive modeling, and intuitive visualizations for data-driven decision making."
  },
  {
    name: "CodeGenius",
    developer: "DevCraft AI",
    key_features: "Intelligent code generation and review; bug detection and fixing; code optimization suggestions; documentation automation; security vulnerability scanning; multi-language support; integration with popular IDEs and version control.",
    target_industries: "Software development teams, tech startups, enterprise IT departments, code review platforms",
    product_description: "An AI-powered coding assistant that accelerates software development through intelligent code generation, automated reviews, and comprehensive security scanning for development teams."
  },
  {
    name: "FinanceBot Pro",
    developer: "MoneyWise Technologies",
    key_features: "Automated financial reporting; expense categorization; invoice processing; tax compliance assistance; fraud detection; budget forecasting; integration with accounting software; audit trail generation.",
    target_industries: "Accounting firms, small businesses, corporate finance departments, fintech companies",
    product_description: "A sophisticated financial AI agent that streamlines accounting processes, automates reporting, and ensures compliance while providing intelligent insights for better financial management."
  },
  {
    name: "HealthAssist AI",
    developer: "MedTech Innovations",
    key_features: "Patient triage and scheduling; symptom analysis; medical record management; appointment reminders; prescription tracking; telehealth integration; HIPAA-compliant data handling; multilingual patient communication.",
    target_industries: "Healthcare providers, medical clinics, telemedicine platforms, hospital systems",
    product_description: "A comprehensive healthcare AI agent designed to improve patient care coordination, streamline administrative tasks, and enhance communication between healthcare providers and patients."
  },
  {
    name: "EduTutor Smart",
    developer: "LearnTech Solutions",
    key_features: "Personalized learning paths; automated grading and feedback; student progress tracking; content recommendation; interactive Q&A sessions; plagiarism detection; parent-teacher communication; curriculum alignment.",
    target_industries: "Educational institutions, online learning platforms, corporate training, tutoring services",
    product_description: "An intelligent educational AI agent that personalizes learning experiences, automates administrative tasks, and provides comprehensive insights to enhance student outcomes and teacher efficiency."
  },
  {
    name: "LogiFlow Operations",
    developer: "Supply Chain Dynamics",
    key_features: "Supply chain optimization; inventory forecasting; route planning; vendor management; quality control monitoring; real-time tracking; cost analysis; sustainability metrics; demand prediction.",
    target_industries: "Manufacturing, retail supply chain, logistics companies, e-commerce fulfillment",
    product_description: "A powerful operations AI agent that optimizes supply chain management through intelligent forecasting, route optimization, and comprehensive tracking to reduce costs and improve efficiency."
  }
];

// Function to get a random product for demo
const getRandomMockProduct = () => {
  const randomIndex = Math.floor(Math.random() * mockProducts.length);
  return mockProducts[randomIndex];
};

// Nuevo esquema basado en el modelo de datos proporcionado
const formSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  developer: z.string().min(2, "Developer name must be at least 2 characters"),
  key_features: z.string().min(10, "Key features must be at least 10 characters"),
  target_industries: z.string().min(5, "Target industries must be at least 5 characters"),
  product_description: z.string().min(10, "Product description must be at least 10 characters"),
});

// Tipo para el nuevo modelo de producto
type ProductData = z.infer<typeof formSchema>;

interface ProductsFormProps {
  onSubmit: (data: ProductData) => void;
  initialData?: Partial<ProductData>;
  isLoading?: boolean;
}

const ProductsForm = ({ onSubmit, initialData, isLoading = false }: ProductsFormProps) => {
  // Initialize with random demo data if no initial data provided (for demo purposes)
  const demoData = initialData || getRandomMockProduct();

  const form = useForm<ProductData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: demoData?.name || "",
      developer: demoData?.developer || "",
      key_features: demoData?.key_features || "",
      target_industries: demoData?.target_industries || "",
      product_description: demoData?.product_description || "",
    },
  });

  const handleSubmit = (values: ProductData) => {
    onSubmit(values);
  };

  // Load new random demo data
  const loadRandomDemo = () => {
    const newDemoData = getRandomMockProduct();
    form.reset(newDemoData);
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
                          placeholder="e.g., Consuelo"
                          {...field}
                          className="glass-card border-white/10"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="developer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Developer/Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., OFI Services"
                          {...field}
                          className="glass-card border-white/10"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_industries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Industries</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., HR tech, global recruitment firms, enterprise talent acquisition teams"
                          {...field}
                          className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[80px]"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="key_features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Features</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., AI-powered assessment agent; automates psychometric, logic, and technical tests; real-time scoring and insights..."
                          {...field}
                          className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[120px]"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Product Description</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="product_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a comprehensive description of your AI product, its capabilities, use cases, and value proposition..."
                      {...field}
                      className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 min-h-[120px]"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={loadRandomDemo}
            disabled={isLoading}
            className="glass-card border-white/20 dark:border-white/20 border-gray-300/50 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100/50"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Load Demo Data
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium"
          >
            {isLoading ? "Adding Product..." : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductsForm;
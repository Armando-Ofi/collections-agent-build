import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import ProductsForm from "@/components/ProductsForm";
import { Product } from "@/types";
import {
  Plus,
  Package,
  TrendingUp,
  Bot,
  Zap,
  DollarSign,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "SalesBot Pro",
    industries: ["Technology", "Finance", "Healthcare"],
    description:
      "Advanced AI sales agent with natural language processing and lead qualification capabilities. Automates initial contact, follows up with prospects, and schedules meetings.",
    price: 2500,
    currency: "USD",
    activeLicenses: 45,
    maxLicenses: 100,
    features: [
      "Lead Qualification",
      "Email Automation",
      "CRM Integration",
      "Analytics",
    ],
    aiAgentType: "Sales",
    createdAt: new Date("2023-08-15"),
    updatedAt: new Date("2024-01-10"),
    status: "Active",
    monthlyRevenue: 112500,
  },
  {
    id: "2",
    name: "Enterprise AI",
    industries: ["Manufacturing", "Energy", "Government"],
    description:
      "Enterprise-grade AI solution for large-scale operations. Handles complex sales cycles, multiple stakeholders, and custom integrations with existing enterprise systems.",
    price: 15000,
    currency: "USD",
    activeLicenses: 12,
    maxLicenses: 25,
    features: [
      "Multi-stakeholder Management",
      "Custom Integrations",
      "Advanced Analytics",
      "White-label Options",
    ],
    aiAgentType: "Sales",
    createdAt: new Date("2023-06-01"),
    updatedAt: new Date("2024-01-12"),
    status: "Active",
    monthlyRevenue: 180000,
  },
  {
    id: "3",
    name: "Support Assistant",
    industries: ["Retail", "E-commerce", "SaaS"],
    description:
      "AI-powered customer support agent that handles inquiries, resolves common issues, and escalates complex problems to human agents. Available 24/7 with multi-language support.",
    price: 800,
    currency: "USD",
    activeLicenses: 78,
    maxLicenses: 150,
    features: [
      "24/7 Availability",
      "Multi-language",
      "Ticket Management",
      "Knowledge Base Integration",
    ],
    aiAgentType: "Support",
    createdAt: new Date("2023-09-20"),
    updatedAt: new Date("2024-01-08"),
    status: "Active",
    monthlyRevenue: 62400,
  },
  {
    id: "4",
    name: "Marketing Optimizer",
    industries: ["Media & Entertainment", "Education", "Non-profit"],
    description:
      "AI agent specialized in marketing campaign optimization, content creation, and lead nurturing. Analyzes performance metrics and adjusts strategies in real-time.",
    price: 1200,
    currency: "USD",
    activeLicenses: 23,
    maxLicenses: 50,
    features: [
      "Campaign Optimization",
      "Content Generation",
      "A/B Testing",
      "Performance Analytics",
    ],
    aiAgentType: "Marketing",
    createdAt: new Date("2023-11-01"),
    updatedAt: new Date("2024-01-05"),
    status: "Development",
    monthlyRevenue: 27600,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    case "Inactive":
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    case "Development":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    case "Deprecated":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

const getAgentTypeColor = (type: string) => {
  switch (type) {
    case "Sales":
      return "bg-purple-500/20 text-purple-400 border-purple-500/50";
    case "Support":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    case "Marketing":
      return "bg-orange-500/20 text-orange-400 border-orange-500/50";
    case "Operations":
      return "bg-green-500/20 text-green-400 border-green-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
};

const columns = [
  {
    key: "name",
    label: "Product Name",
    sortable: true,
    render: (value: string, row: Product) => (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            getAgentTypeColor(row.aiAgentType),
          )}
        >
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">
            {row.aiAgentType} Agent
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "industries",
    label: "Industries",
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map((industry, index) => (
          <Badge
            key={index}
            variant="outline"
            className="glass-card border-white/20 text-xs"
          >
            {industry}
          </Badge>
        ))}
        {value.length > 2 && (
          <Badge
            variant="outline"
            className="glass-card border-white/20 text-xs"
          >
            +{value.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    key: "price",
    label: "Price",
    sortable: true,
    render: (value: number, row: Product) => (
      <div className="text-foreground font-medium">
        ${value.toLocaleString()}/{row.currency === "USD" ? "mo" : ""}
      </div>
    ),
  },
  {
    key: "activeLicenses",
    label: "License Usage",
    sortable: true,
    render: (value: number, row: Product) => (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>
            {value}/{row.maxLicenses}
          </span>
          <span className="text-muted-foreground">
            {((value / row.maxLicenses) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              value / row.maxLicenses >= 0.8
                ? "bg-red-500"
                : value / row.maxLicenses >= 0.6
                  ? "bg-yellow-500"
                  : "bg-green-500",
            )}
            style={{ width: `${(value / row.maxLicenses) * 100}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "monthlyRevenue",
    label: "Monthly Revenue",
    sortable: true,
    render: (value: number) => (
      <div className="text-foreground font-medium">
        ${value.toLocaleString()}
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value: string) => (
      <Badge className={cn("border", getStatusColor(value))}>{value}</Badge>
    ),
  },
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduct = (
    newProduct: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts([...products, product]);
    setIsDialogOpen(false);
  };

  const handleView = (id: string) => {
    console.log("View product:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit product:", id);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const totalRevenue = products.reduce(
    (sum, product) => sum + product.monthlyRevenue,
    0,
  );
  const totalLicenses = products.reduce(
    (sum, product) => sum + product.activeLicenses,
    0,
  );
  const activeProducts = products.filter((p) => p.status === "Active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            AI Agent Products
          </h1>
          <p className="text-muted-foreground">
            Manage your AI agent portfolio and track performance metrics
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cyber-gradient hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Add New AI Agent Product
              </DialogTitle>
            </DialogHeader>
            <ProductsForm onSubmit={handleAddProduct} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {products.length}
            </div>
            <p className="text-xs text-muted-foreground">AI agents available</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Products
            </CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activeProducts}
            </div>
            <p className="text-xs text-muted-foreground">Currently deployed</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Licenses
            </CardTitle>
            <Zap className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalLicenses}
            </div>
            <p className="text-xs text-muted-foreground">Active deployments</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={products}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search products..."
      />
    </div>
  );
};

export default Products;

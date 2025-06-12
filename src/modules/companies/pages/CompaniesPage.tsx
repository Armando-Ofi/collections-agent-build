import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import DataTable from "@/shared/components/common/DataTable";
import CompanyViewDialog from "../components/CompanyViewDialog";
import CompanyEditDialog from "../components/CompanyEditDialog";
import AddCompanyDialog from "../components/AddCompanyDialog";
import Error from '@/shared/components/common/Error';
import { Company } from "../types";
import { useCompanies } from "../hooks/useCompanies";
import { CompaniesService } from "../services/companiesService";
import {
  Plus,
  Building,
  TrendingUp,
  Users,
  BarChart3,
  MapPin,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const columns = [
  {
    key: "name",
    label: "Company Name",
    sortable: true,
    render: (value: string, row: Company) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
          <Building className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {CompaniesService.formatDomain(row.domain)}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "industry",
    label: "Industry",
    sortable: true,
    render: (value: string) => (
      <div className="max-w-[200px]">
        <Badge
          variant="outline"
          className={cn(
            "glass-card  dark:border-white/20 border-gray-300/50",
            CompaniesService.getIndustryColor(value)
          )}
        >
          {CompaniesService.truncateText(value, 30)}
        </Badge>
      </div>
    ),
  },
  {
    key: "size",
    label: "Company Size",
    sortable: true,
    render: (value: string) => (
      <Badge className={cn("border", CompaniesService.getSizeColor(value))}>
        {CompaniesService.formatCompanySize(value)}
      </Badge>
    ),
  },
  {
    key: "revenue_size",
    label: "Revenue",
    sortable: true,
    render: (value: string) => (
      <div className="text-sm font-medium text-foreground">
        {CompaniesService.formatRevenue(value)}
      </div>
    ),
  },
  {
    key: "country",
    label: "Location",
    sortable: true,
    render: (value: string, row: Company) => (
      <div className="flex items-center gap-2">
        <MapPin className="w-3 h-3 text-muted-foreground" />
        <span className="text-sm">
          {CompaniesService.formatLocation(row.city, value)}
        </span>
      </div>
    ),
  },
  {
    key: "company_url",
    label: "Status",
    render: (value: any, row: Company) => {
      const completeness = CompaniesService.getProfileCompleteness(row);
      return (
        <div className="space-y-1">
          <Badge
            className={cn("border", CompaniesService.getStatusColor(value?.status || "unknown"))}
          >
            {value?.status || "No data"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {completeness}% complete
          </div>
        </div>
      );
    },
  },
];

const CompaniesPage = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Custom hook with all companies logic
  const {
    companies,
    totalCompanies,
    completedProfiles,
    pendingAnalysis,
    industriesDistribution,
    sizeDistribution,
    isLoading,
    isCreating,
    isUpdating,
    //isDeleting,
    error,
    refetch,
    createCompany,
    createCompanyByUrl,
    updateCompany,
    deleteCompany,
  } = useCompanies();

  // Event handlers
  const handleView = (id: string) => {
    const company = companies.find((c) => c.id.toString() === id);
    if (company) {
      setSelectedCompany(company);
      setIsViewDialogOpen(true);
    }
  };

  const handleEdit = (id: string) => {
    const company = companies.find((c) => c.id.toString() === id);
    if (company) {
      setSelectedCompany(company);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCompany(id);
    if (!result.success) {
      console.error('Failed to delete company:', result.error);
      // You could show a toast notification here
    }
  };

  const handleSaveCompany = async (updatedCompany: Company) => {
    const result = await updateCompany({
      id: updatedCompany.id.toString(),
      ...updatedCompany,
    });
    if (result.success) {
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
    } else {
      console.error('Failed to update company:', result.error);
      // You could show a toast notification here
    }
  };

  const handleAddCompany = async (newCompany: Omit<Company, "id" | "company_url_id" | "company_url">) => {
    const result = await createCompany(newCompany);
    if (result.success) {
      setIsAddDialogOpen(false);
    } else {
      console.error('Failed to create company:', result.error);
      // You could show a toast notification here
    }
  };


  const handleAddCompanyUrl = async (newCompany: string) => {
    const result = await createCompanyByUrl(newCompany);
    if (result.success) {
      setIsAddDialogOpen(false);
    } else {
      console.error('Failed to create company:', result.error);
      // You could show a toast notification here
    }
  };
  // Calculate average revenue (simplified)
  const averageRevenue = companies.length > 0 ? "10B+" : "N/A";

  if (error) {
    return <Error title="Error fetching companies" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Company Database
          </h1>
          <p className="text-muted-foreground">
            Manage and analyze your company database with AI-powered insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refetch} variant="secondary" disabled={isLoading}>
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium"
                disabled={isCreating}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreating ? "Processing..." : "Add Company"}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card  dark:border-white/10 border-gray-200/50 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Add New Company
                </DialogTitle>
              </DialogHeader>
              <AddCompanyDialog onSubmit={handleAddCompany} onSubmitUrl={handleAddCompanyUrl} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
            <Building className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalCompanies}
            </div>
            <p className="text-xs text-muted-foreground">
              Companies in database
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Complete Profiles
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {completedProfiles}
            </div>
            <p className="text-xs text-muted-foreground">
              Fully analyzed companies
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Analysis
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pendingAnalysis}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting data processing
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Industry
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {industriesDistribution[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {industriesDistribution[0]?.count || 0} companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Industry Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {industriesDistribution.slice(0, 5).map((industry) => (
                <div key={industry.name} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {CompaniesService.truncateText(industry.name, 25)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${industry.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {industry.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Company Size Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sizeDistribution.slice(0, 5).map((size) => (
                <div key={size.size} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    {CompaniesService.formatCompanySize(size.size)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${size.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {size.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={companies}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search companies..."
        loading={isLoading}
      />

      {/* View Dialog */}
      <CompanyViewDialog
        onSave={() => {}}
        company={selectedCompany}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedCompany(null);
        }}
      />

      {/* Edit Dialog */}
      <CompanyEditDialog
        company={selectedCompany}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedCompany(null);
        }}
        onSave={handleSaveCompany}
      />
    </div>
  );
};

export default CompaniesPage;
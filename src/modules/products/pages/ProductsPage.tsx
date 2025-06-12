import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useChatbotContext } from '@/shared/components/common/ChatbotProvider';
import { ProductsTable } from '@/modules/products/components/ProductsTable';
import ProductsForm from '@/shared/components/common/ProductsForm';
import { useProducts } from '@/modules/products/hooks/useProducts';
import { ProductsService } from '@/modules/products/services/productsService';
import type { CreateProductRequest } from '@/modules/products/types';
import {
  Plus,
  Package,
  TrendingUp,
  Bot,
  Building,
  Target,
  Code,
  RefreshCcw,
  Copy,
  Download,
  Filter,
} from 'lucide-react';
import Error from '@/shared/components/common/Error';

const ProductsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const { openChatbot } = useChatbotContext();
  
  // Custom hook with all products logic
  const {
    products,
    stats,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    cloneProduct,
    error,
    refetch,
    getDeveloperStats,
    getIndustryDistribution,
    searchInProducts,
  } = useProducts();

  // Event handlers
  const handleAddProduct = async (newProduct: CreateProductRequest) => {
    const result = await createProduct(newProduct);
    if (result.success) {
      setIsDialogOpen(false);
    }
  };

  const handleView = (id: number) => {
    console.log('View product:', id);
    // Navigate to product detail view
  };

  const handleEdit = (id: number) => {
    console.log('Edit product:', id);
    // Open edit dialog or navigate to edit page
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleClone = (id: number) => {
    setSelectedProductId(id);
    setIsCloneDialogOpen(true);
  };

  const handleCloneConfirm = async (name: string) => {
    if (selectedProductId) {
      const result = await cloneProduct(selectedProductId, name);
      if (result.success) {
        setIsCloneDialogOpen(false);
        setSelectedProductId(0);
      }
    }
  };

  const handleExportCSV = () => {
    const csvContent = ProductsService.exportToCSV(products);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return <Error title="Error loading Products" />
  }

  const developerStats = getDeveloperStats();
  const industryDistribution = getIndustryDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            AI Products Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage and explore AI products from various developers
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refetch} variant='secondary' title="Refresh data">
            <RefreshCcw className="w-4 h-4" />
          </Button>          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cyber-gradient hover:opacity-90 transition-all duration-300 hover:shadow-lg dark:hover:neon-glow text-white font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Add New AI Product
                </DialogTitle>
              </DialogHeader>
              <ProductsForm onSubmit={handleAddProduct} />
            </DialogContent>
          </Dialog>
        </div>
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
              {stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              AI products available
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Developers
            </CardTitle>
            <Building className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.uniqueDevelopers}
            </div>
            <p className="text-xs text-muted-foreground">
              Top: {stats.topDeveloper || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Industries
            </CardTitle>
            <Target className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.uniqueIndustries}
            </div>
            <p className="text-xs text-muted-foreground">
              Most common: {stats.mostCommonIndustry || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Features
            </CardTitle>
            <Code className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {products.length > 0 ? (
                products.reduce((sum, p) => 
                  sum + ProductsService.parseKeyFeatures(p.key_features).length, 0
                ) / products.length
              ).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              per product
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Developers & Industries Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Developers */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Developers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {developerStats.slice(0, 5).map((stat, index) => (
                <div key={stat.developer} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{stat.developer}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.count} product{stat.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${ProductsService.getDeveloperColor(stat.developer)}`}>
                    {stat.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Top Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {industryDistribution.slice(0, 5).map((item, index) => (
                <div key={item.industry} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.industry}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count} product{item.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${ProductsService.getIndustryColor(item.industry)}`}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <ProductsTable
        products={products}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClone={handleClone}
      />

      {/* Clone Product Dialog */}
      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent className="glass-card border-white/10 dark:border-white/10 border-gray-200/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Clone Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                New Product Name
              </label>
              <input
                type="text"
                id="clone-name"
                className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-foreground"
                placeholder="Enter name for cloned product"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsCloneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.getElementById('clone-name') as HTMLInputElement;
                  if (input?.value.trim()) {
                    handleCloneConfirm(input.value.trim());
                  }
                }}
                className="cyber-gradient"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;
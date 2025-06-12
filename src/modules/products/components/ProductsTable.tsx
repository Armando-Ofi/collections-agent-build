import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import DataTable from '@/shared/components/common/DataTable';
import { ProductsService } from '../services/productsService';
import type { DBProduct } from '../types';
import {
  Building,
  Code,
  Target,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ProductsTableProps {
  products: DBProduct[];
  isLoading: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onClone,
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value: string) => (
        <div className="max-w-48">
          <div className="font-medium text-foreground truncate" title={value}>
            {value}
          </div>
        </div>
      ),
    },
    {
      key: 'developer',
      label: 'Developer',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{value}</span>
        </div>
      ),
    },
    {
      key: 'target_industries',
      label: 'Target Industries',
      render: (value: string) => {
        const industries = ProductsService.parseIndustries(value);
        return (
          <div className="max-w-48">
            <div className="flex flex-wrap gap-1">
              {industries.slice(0, 2).map((industry, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn('text-xs border truncate max-w-24', ProductsService.getIndustryColor(industry))}
                  title={industry}
                >
                  <Target className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{industry}</span>
                </Badge>
              ))}
              {industries.length > 2 && (
                <Badge
                  variant="outline"
                  className="glass-card border-white/20 text-xs flex-shrink-0"
                  title={industries.slice(2).join(', ')}
                >
                  +{industries.length - 2}
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'key_features',
      label: 'Key Features',
      render: (value: string) => {
        const features = ProductsService.parseKeyFeatures(value);
        const displayFeatures = features.slice(0, 2);
        
        return (
          <div className="max-w-56">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Code className="w-3 h-3" />
              {features.length} feature{features.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap gap-1">
              {displayFeatures.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-foreground truncate max-w-20"
                  title={feature}
                >
                  {feature}
                </span>
              ))}
              {features.length > 2 && (
                <span 
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-muted-foreground flex-shrink-0"
                  title={features.slice(2).join(', ')}
                >
                  +{features.length - 2}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'product_description',
      label: 'Description',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-foreground line-clamp-2">
            {value}
          </p>
          {value.length > 100 && (
            <p className="text-xs text-muted-foreground mt-1">
              {value.length} characters
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={products}
        columns={columns}
        loading={isLoading}
        searchPlaceholder="Search products, developers, features..."
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      
      {/* Quick Stats Footer */}
      {!isLoading && products.length > 0 && (
        <div className="flex items-center justify-between p-4 glass-card rounded-lg text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>
              Total: <span className="font-medium text-foreground">{products.length}</span> products
            </span>
            <span>
              Developers: <span className="font-medium text-blue-400">
                {ProductsService.getUniqueDevelopers(products).length}
              </span>
            </span>
            <span>
              Industries: <span className="font-medium text-green-400">
                {new Set(products.flatMap(p => 
                  ProductsService.parseIndustries(p.target_industries)
                )).size}
              </span>
            </span>
            <span>
              Avg Features: <span className="font-medium text-purple-400">
                {(products.reduce((sum, p) => 
                  sum + ProductsService.parseKeyFeatures(p.key_features).length, 0
                ) / products.length).toFixed(1)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Last updated: Recently</span>
          </div>
        </div>
      )}
    </div>
  );
};
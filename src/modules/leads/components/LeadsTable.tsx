import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import DataTable from '@/shared/components/common/DataTable';
import { getPriorityValue, LeadsService } from '../services/leadsService';
import type { Lead } from '../types';
import { cn } from '@/shared/lib/utils';
import {
  Phone,
  Mail,
  MessageSquare,
  Video,
  User,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  isTakingFirstActionById: boolean;
  isTakingFirstActionByIdArgs: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSuggestions: (lead: Lead) => void;
  onFirstAction: (id: string) => void;
}

const getContactMethodIcon = (method: string) => {
  const icons = {
    Email: <Mail className="w-3 h-3" />,
    Phone: <Phone className="w-3 h-3" />,
    LinkedIn: <User className="w-3 h-3" />,
    'Video Call': <Video className="w-3 h-3" />,
    WhatsApp: <MessageCircle className="w-3 h-3" />,
  };
  return icons[method as keyof typeof icons] || <MessageSquare className="w-3 h-3" />;
};

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onSuggestions,
  onFirstAction,
  isTakingFirstActionById,
  isTakingFirstActionByIdArgs
}) => {
  const columns = [
    {
      key: 'name',
      label: 'Company Name',
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
      key: 'product',
      label: 'Product',
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
      key: 'probabilityToLand',
      label: 'P2L',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  value >= 80 ? 'bg-green-500' :
                    value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm font-medium">{value}%</span>
          </div>
        </div>
      ),
    },
    {
      key: 'industry',
      label: 'Industry',
      sortable: true,
      render: (value: string) => (
        <div className="max-w-32">
          <Badge
            variant="outline"
            className="glass-card dark:border-white/20 border-gray-300/50 truncate max-w-full"
            title={value}
          >
            <span className="truncate">{value}</span>
          </Badge>
        </div>
      ),
    },
    {
      key: 'effectivenessPercentage',
      label: 'Opportunity Score',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  value >= 80 ? 'bg-green-500' :
                    value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm font-medium">{value}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value: Lead['priority']) => (
        <Badge className={cn('border', LeadsService.getPriorityColor(value))}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: Lead['status'], record: Lead) => (
        <Badge
          className={cn('border', LeadsService.getStatusColor(value))}
          isLoading={isTakingFirstActionById && (isTakingFirstActionByIdArgs === record.id)} // Comparar con el ID específico
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'lastContact',
      label: 'Last Contact',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">{LeadsService.formatDate(value)}</span>
      ),
    },
    {
      key: 'contactMethod',
      label: 'Contact Method',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getContactMethodIcon(value)}
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        data={leads}
        columns={columns}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onSuggestions={onSuggestions}
        onTakeFirstAction={onFirstAction}
        searchPlaceholder="Search leads..."
        loading={isLoading}
      />

      {/* Quick Stats Footer */}
      {!isLoading && leads.length > 0 && (
        <div className="flex items-center justify-between p-4 glass-card rounded-lg text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <span>
              Total: <span className="font-medium text-foreground">{leads.length}</span> leads
            </span>
            <span>
              Industries: <span className="font-medium text-blue-400">
                {10}
              </span>
            </span>
            <span>
              Avg Effectiveness: <span className="font-medium text-green-400">
                {(leads.reduce((sum, l) => sum + l.effectivenessPercentage, 0) / leads.length).toFixed(1)}%
              </span>
            </span>
            <span>
              High Priority: <span className="font-medium text-red-400">
                {leads.filter(l => l.priority === 'High').length}
              </span>
            </span>
            <span>
              New: <span className="font-medium text-orange-400">
                {leads.filter(l => l.status === 'New').length}
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
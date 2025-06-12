
import type { Lead } from '../types';

export class LeadsService {
  static getPriorityColor(priority: Lead['priority']): string {
    const colors = {
      Critical: 'bg-red-500/20 text-red-400 border-red-500/50',
      High: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      Low: 'bg-green-500/20 text-green-400 border-green-500/50',
    };
    return colors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }

  static getStatusColor(status: Lead['status']): string {
    const colors = {
      New: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      Contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      Qualified: 'bg-green-500/20 text-green-400 border-green-500/50',
      Proposal: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      Negotiation: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      Closed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      Lost: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }

  static calculateConversionRate(leads: Lead[]): number {
    const closedLeads = leads.filter(lead => lead.status === 'Closed').length;
    return leads.length > 0 ? (closedLeads / leads.length) * 100 : 0;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static getEffectivenessColor(percentage: number): string {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
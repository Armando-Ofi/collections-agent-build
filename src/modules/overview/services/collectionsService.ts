// services/collectionsService.ts

import { 
  CollectionsKPIResponse, 
  CollectionsKPIStats, 
  CollectionsAlert,
  CollectionsChartData,
  CollectionsSummaryMetrics,
  CollectionsTrendAnalysis,
  TrendData,
  AgingData,
  RiskFunnelData
} from '../types';

export class CollectionsService {
  // ============================================================================
  // FORMATEO DE VALORES
  // ============================================================================

  // Formatear moneda
  static formatAmount(amount: number): string {
    if (isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Formatear moneda compacta
  static formatMoneyCompact(value: number): string {
    if (isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  }

  // Formatear porcentaje
  static formatPercentage(decimal: number): string {
    if (isNaN(decimal)) return '0.00%';
    return `${(decimal * 100).toFixed(2)}%`;
  }

  // Formatear número
  static formatNumber(value: number): string {
    if (isNaN(value)) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  }

  // Formatear fecha
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // ============================================================================
  // COLORES Y ESTILOS
  // ============================================================================

  // Obtener color para aging buckets
  static getAgingColor(label: string): string {
    const colorMap: Record<string, string> = {
      'Current': '#10B981',
      '1-30 Days Overdue': '#F59E0B',
      '31-60 Days Overdue': '#EF4444',
      '61-90 Days Overdue': '#DC2626',
      '91+ Days Overdue': '#991B1B',
    };
    return colorMap[label] || '#6B7280';
  }

  // Obtener color para risk funnel
  static getRiskFunnelColor(label: string): string {
    const colorMap: Record<string, string> = {
      'Total Receivables': '#3B82F6',
      'Performing': '#10B981',
      'At-Risk': '#F59E0B',
      'Overdue (30-60)': '#EF4444',
      'Overdue (60-90)': '#DC2626',
      'Critical (>90)': '#991B1B',
    };
    return colorMap[label] || '#6B7280';
  }

  // Obtener color de riesgo con styling completo
  static getRiskColor(score: number): string {
    const scorePercent = score * 100;
    
    if (scorePercent >= 80) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30";
    if (scorePercent >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30";
    if (scorePercent >= 40) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30";
    return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30";
  }

  // Obtener color para progress bars
  static getProgressColor(score: number): string {
    const scorePercent = score * 100;
    if (scorePercent >= 80) return 'bg-red-500';
    if (scorePercent >= 60) return 'bg-yellow-500';
    if (scorePercent >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  }

  // ============================================================================
  // CÁLCULOS Y MÉTRICAS
  // ============================================================================

  // Calcular tendencia basada en datos históricos
  static calculateTrend(data: TrendData[]): { change: number; trend: 'up' | 'down' | 'neutral' } {
    if (data.length < 2) return { change: 0, trend: 'neutral' };
    
    const latest = data[data.length - 1].amount;
    const previous = data[data.length - 2].amount;
    const change = ((latest - previous) / previous) * 100;
    
    return {
      change: Math.abs(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }

  // Calcular métricas de resumen
  static calculateSummaryMetrics(data: CollectionsKPIResponse): CollectionsSummaryMetrics {
    const totalInvoices = data.onTimeInvoices + data.overdueInvoices;
    const totalAmount = data.onTimeAmount + data.overdueAmount;
    const overduePercentage = totalInvoices > 0 ? (data.overdueInvoices / totalInvoices) * 100 : 0;
    const collectionEfficiency = totalAmount > 0 ? (data.onTimeAmount / totalAmount) * 100 : 0;
    const onTimeRate = totalInvoices > 0 ? (data.onTimeInvoices / totalInvoices) * 100 : 0;

    return {
      totalInvoices: this.formatNumber(totalInvoices),
      totalAmount: this.formatAmount(totalAmount),
      overduePercentage: `${overduePercentage.toFixed(1)}%`,
      collectionEfficiency: `${collectionEfficiency.toFixed(1)}%`,
      dso: `${Math.round(data.daysSalesOutstanding)} days`,
      arTurnover: data.arTurnover.toFixed(2),
      averageDaysDelinquent: `${Math.round(data.averageDaysDelinquent.current_value)} days`,
      criticalInvoices: this.formatNumber(data.criticalInvoices),
      onTimeRate: `${onTimeRate.toFixed(1)}%`,
      avgRiskScore: this.formatPercentage(data.overdueAverageRisk),
    };
  }

  // Calcular stats para KPIs
  static calculateStats(data: CollectionsKPIResponse): CollectionsKPIStats {
    const totalInvoices = data.onTimeInvoices + data.overdueInvoices;
    const totalAmount = data.onTimeAmount + data.overdueAmount;
    const collectionEfficiency = totalAmount > 0 ? (data.onTimeAmount / totalAmount) * 100 : 0;
    const conversionRate = totalInvoices > 0 ? (data.onTimeInvoices / totalInvoices) * 100 : 0;

    return {
      totalInvoices,
      totalAmount,
      onTimeInvoices: data.onTimeInvoices,
      onTimeAmount: data.onTimeAmount,
      overdueInvoices: data.overdueInvoices,
      overdueAmount: data.overdueAmount,
      criticalInvoices: data.criticalInvoices,
      averageRiskScore: data.overdueAverageRisk,
      currentReceivables: data.currentReceivables,
      arTurnover: data.arTurnover,
      daysSalesOutstanding: data.daysSalesOutstanding,
      averageDaysDelinquent: data.averageDaysDelinquent,
      collectionEfficiency: collectionEfficiency / 100,
      conversionRate: conversionRate / 100,
    };
  }

  // ============================================================================
  // PROCESAMIENTO DE DATOS PARA GRÁFICOS
  // ============================================================================

  // Procesar datos para gráficos
  static processChartData(data: CollectionsKPIResponse): CollectionsChartData {
    const totalAmount = data.onTimeAmount + data.overdueAmount;

    return {
      // Trend data
      receivableTrend: data.receivableTrend.map(item => ({
        month: item.label,
        amount: item.amount,
        formattedAmount: this.formatAmount(item.amount),
      })),

      // Aging breakdown
      agingBreakdown: data.agingBreakdown.map(item => ({
        name: item.label,
        amount: item.amount,
        count: item.tooltip.amount,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
        formattedAmount: this.formatAmount(item.amount),
        color: this.getAgingColor(item.label),
      })),

      // Risk funnel
      riskFunnel: data.riskFunnel.map(item => ({
        name: item.label,
        amount: item.amount,
        percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
        formattedAmount: this.formatAmount(item.amount),
        color: this.getRiskFunnelColor(item.label),
      })),

      // Communication rates
      communicationRates: data.communicationRates.map(item => ({
        channel: item.channel,
        rate: item.rate * 100,
        formattedRate: this.formatPercentage(item.rate),
      })),
    };
  }

  // ============================================================================
  // ANÁLISIS DE TENDENCIAS
  // ============================================================================

  // Analizar tendencias
  static analyzeTrends(data: CollectionsKPIResponse): CollectionsTrendAnalysis {
    const receivableTrend = this.calculateTrend(data.receivableTrend);
    const stats = this.calculateStats(data);

    return {
      receivableTrend: {
        change: receivableTrend.change,
        trend: receivableTrend.trend,
        direction: receivableTrend.trend === 'up' ? 'increasing' : 
                  receivableTrend.trend === 'down' ? 'decreasing' : 'stable',
      },
      collectionRate: {
        current: stats.collectionEfficiency,
        change: 0, // Requiere datos históricos
        trend: 'neutral',
      },
      dsoTrend: {
        current: data.daysSalesOutstanding,
        change: data.averageDaysDelinquent.change_last_30_days,
        trend: data.averageDaysDelinquent.change_last_30_days > 0 ? 'up' : 
               data.averageDaysDelinquent.change_last_30_days < 0 ? 'down' : 'neutral',
      },
    };
  }

  // ============================================================================
  // GENERACIÓN DE ALERTAS
  // ============================================================================

  // Generar alertas basadas en métricas
  static generateAlerts(data: CollectionsKPIResponse): CollectionsAlert[] {
    const alerts: CollectionsAlert[] = [];
    
    // Alerta DSO alto
    if (data.daysSalesOutstanding > 90) {
      alerts.push({
        id: 'dso-high',
        type: 'critical',
        title: 'High Days Sales Outstanding',
        message: `DSO is ${Math.round(data.daysSalesOutstanding)} days, significantly above industry average of 30-45 days`,
        value: data.daysSalesOutstanding,
        threshold: 90,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta facturas críticas
    if (data.criticalInvoices > 10) {
      alerts.push({
        id: 'critical-invoices',
        type: 'critical',
        title: 'High Critical Invoices',
        message: `${data.criticalInvoices} invoices are 90+ days overdue and require immediate attention`,
        value: data.criticalInvoices,
        threshold: 10,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta AR turnover bajo
    if (data.arTurnover < 1) {
      alerts.push({
        id: 'low-turnover',
        type: 'warning',
        title: 'Low AR Turnover',
        message: `AR turnover is ${data.arTurnover.toFixed(2)}, indicating slow collections`,
        value: data.arTurnover,
        threshold: 1,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta monto vencido alto
    const overduePercentage = (data.overdueAmount / (data.onTimeAmount + data.overdueAmount)) * 100;
    if (overduePercentage > 30) {
      alerts.push({
        id: 'high-overdue',
        type: 'warning',
        title: 'High Overdue Amount',
        message: `${overduePercentage.toFixed(1)}% of receivables are overdue`,
        value: overduePercentage,
        threshold: 30,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta días morosos en aumento
    if (data.averageDaysDelinquent.change_last_30_days > 10) {
      alerts.push({
        id: 'increasing-delinquency',
        type: 'warning',
        title: 'Increasing Delinquency',
        message: `Average days delinquent increased by ${data.averageDaysDelinquent.change_last_30_days.toFixed(1)} days`,
        value: data.averageDaysDelinquent.change_last_30_days,
        threshold: 10,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    return alerts;
  }

  // ============================================================================
  // RECOMENDACIONES
  // ============================================================================

  // Obtener recomendaciones basadas en métricas
  static getRecommendations(data: CollectionsKPIResponse): Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low' | 'recommended';
    actionRequired: boolean;
  }> {
    const recommendations = [];
    const stats = this.calculateStats(data);

    // DSO alto
    if (data.daysSalesOutstanding > 90) {
      recommendations.push({
        title: "Accelerate Collections Process",
        description: "Implement automated reminder system and consider early payment discounts",
        priority: "high" as const,
        actionRequired: true,
      });
    }

    // Facturas críticas
    if (data.criticalInvoices > 10) {
      recommendations.push({
        title: "Escalate Critical Accounts",
        description: "Move overdue accounts to collection agency or legal action",
        priority: "high" as const,
        actionRequired: true,
      });
    }

    // AR turnover bajo
    if (data.arTurnover < 1) {
      recommendations.push({
        title: "Improve Payment Terms",
        description: "Review and tighten payment terms, consider requiring deposits",
        priority: "medium" as const,
        actionRequired: true,
      });
    }

    // Eficiencia de cobranza baja
    if (stats.collectionEfficiency < 0.8) {
      recommendations.push({
        title: "Enhance Collection Strategy",
        description: "Implement proactive customer communication and payment follow-up",
        priority: "medium" as const,
        actionRequired: true,
      });
    }

    // Buena performance
    if (data.daysSalesOutstanding < 45 && stats.collectionEfficiency > 0.9) {
      recommendations.push({
        title: "Maintain Excellence",
        description: "Continue current collection practices and consider benchmarking",
        priority: "low" as const,
        actionRequired: false,
      });
    }

    return recommendations;
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  // Truncar texto
  static truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  }

  // Obtener nivel de riesgo
  static getRiskLevel(score: number): string {
    const scorePercent = score * 100;
    
    if (scorePercent >= 80) return "High Risk";
    if (scorePercent >= 60) return "Medium-High Risk";
    if (scorePercent >= 40) return "Medium Risk";
    return "Low Risk";
  }

  // Calcular urgencia de cobranza
  static calculateCollectionUrgency(daysOverdue: number, riskScore: number): {
    urgency: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    actionRequired: boolean;
  } {
    if (daysOverdue > 90 || (daysOverdue > 30 && riskScore > 0.8)) {
      return {
        urgency: 'critical',
        message: 'Immediate escalation required',
        actionRequired: true,
      };
    }

    if (daysOverdue > 60 || (daysOverdue > 15 && riskScore > 0.6)) {
      return {
        urgency: 'high',
        message: 'Priority collection action needed',
        actionRequired: true,
      };
    }

    if (daysOverdue > 30 || riskScore > 0.4) {
      return {
        urgency: 'medium',
        message: 'Monitor and follow up',
        actionRequired: true,
      };
    }

    return {
      urgency: 'low',
      message: 'Standard processing',
      actionRequired: false,
    };
  }
}
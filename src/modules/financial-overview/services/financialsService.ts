// services/financialsService.ts

import { 
  FinancialsKPIResponse, 
  FinancialsKPIStats, 
  FinancialsAlert,
  FinancialsChartData,
  FinancialsSummaryMetrics,
  FinancialsTrendAnalysis,
  FinancialsRecommendation,
  FinancialsTrendItem
} from '../types/financials';

export class FinancialsService {
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

  // Obtener color basado en performance
  static getPerformanceColor(value: number, type: 'rate' | 'score' | 'days'): string {
    if (type === 'rate') {
      if (value >= 0.9) return '#10B981'; // Excellent
      if (value >= 0.75) return '#F59E0B'; // Good
      if (value >= 0.6) return '#EF4444'; // Warning
      return '#DC2626'; // Critical
    }
    
    if (type === 'score') {
      if (value >= 80) return '#10B981';
      if (value >= 60) return '#F59E0B';
      if (value >= 40) return '#EF4444';
      return '#DC2626';
    }
    
    if (type === 'days') {
      if (value <= 30) return '#10B981';
      if (value <= 45) return '#F59E0B';
      if (value <= 60) return '#EF4444';
      return '#DC2626';
    }

    return '#6B7280';
  }

  // Obtener status basado en valor
  static getPerformanceStatus(value: number, type: 'rate' | 'score' | 'days'): 'excellent' | 'good' | 'warning' | 'critical' {
    if (type === 'rate') {
      if (value >= 0.9) return 'excellent';
      if (value >= 0.75) return 'good';
      if (value >= 0.6) return 'warning';
      return 'critical';
    }
    
    if (type === 'score') {
      if (value >= 80) return 'excellent';
      if (value >= 60) return 'good';
      if (value >= 40) return 'warning';
      return 'critical';
    }
    
    if (type === 'days') {
      if (value <= 30) return 'excellent';
      if (value <= 45) return 'good';
      if (value <= 60) return 'warning';
      return 'critical';
    }

    return 'good';
  }

  // Obtener clases CSS para status
  static getStatusClasses(status: 'excellent' | 'good' | 'warning' | 'critical'): string {
    const statusMap = {
      excellent: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
      good: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
      critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
    };
    return statusMap[status];
  }

  // ============================================================================
  // CÁLCULOS Y MÉTRICAS
  // ============================================================================

  // Calcular tendencia basada en datos históricos
  static calculateTrend(data: FinancialsTrendItem[]): { change: number; trend: 'up' | 'down' | 'neutral' } {
    if (data.length < 2) return { change: 0, trend: 'neutral' };
    
    const latest = data[data.length - 1].amount;
    const previous = data[data.length - 2].amount;
    
    if (previous === 0) return { change: 0, trend: 'neutral' };
    
    const change = ((latest - previous) / previous) * 100;
    
    return {
      change: Math.abs(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }

  // Calcular métricas de resumen
  static calculateSummaryMetrics(data: FinancialsKPIResponse): FinancialsSummaryMetrics {
    const netPerformance = data.collectionRate - data.badDebtWriteOffRate;
    const healthScore = Math.max(0, 100 - (data.badDebtWriteOffRate * 100));
    
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (data.badDebtWriteOffRate > 0.15) riskLevel = 'critical';
    else if (data.badDebtWriteOffRate > 0.1) riskLevel = 'high';
    else if (data.badDebtWriteOffRate > 0.05) riskLevel = 'medium';

    return {
      portfolioValue: this.formatMoneyCompact(data.totalPortfolioValue),
      collectionRate: this.formatPercentage(data.collectionRate),
      liquidationRate: this.formatPercentage(data.liquidationRate),
      badDebtRate: this.formatPercentage(data.badDebtWriteOffRate),
      daysOutstanding: `${Math.round(data.daysSalesOutstanding)} days`,
      netPerformance: this.formatPercentage(netPerformance),
      healthScore: `${healthScore.toFixed(1)}`,
      riskLevel,
    };
  }

  // Calcular stats para KPIs
  static calculateStats(data: FinancialsKPIResponse): FinancialsKPIStats {
    const netCollectionRate = data.collectionRate - data.badDebtWriteOffRate;
    const portfolioHealth = Math.max(0, 100 - (data.badDebtWriteOffRate * 100));
    
    const performanceScore = (
      (data.collectionRate * 0.4) +
      (data.liquidationRate * 0.3) +
      ((1 - data.badDebtWriteOffRate) * 0.3)
    ) * 100;

    return {
      totalPortfolioValue: data.totalPortfolioValue,
      collectionRate: data.collectionRate,
      liquidationRate: data.liquidationRate,
      badDebtWriteOffRate: data.badDebtWriteOffRate,
      daysSalesOutstanding: data.daysSalesOutstanding,
      netCollectionRate,
      portfolioHealth,
      performanceScore,
    };
  }

  // ============================================================================
  // PROCESAMIENTO DE DATOS PARA GRÁFICOS
  // ============================================================================

  // Procesar datos para gráficos
  static processChartData(data: FinancialsKPIResponse): FinancialsChartData {
    return {
      // Portfolio trend
      portfolioTrend: data.portfolioValueTrend.map(item => ({
        month: item.label,
        value: item.amount,
        formattedValue: this.formatMoneyCompact(item.amount),
      })),

      // Collection rate trend
      collectionTrend: data.collectionRateTrend.map(item => ({
        month: item.label,
        rate: item.amount * 100,
        formattedRate: this.formatPercentage(item.amount),
      })),

      // Liquidation rate trend
      liquidationTrend: data.liquidationRateTrend.map(item => ({
        month: item.label,
        rate: item.amount * 100,
        formattedRate: this.formatPercentage(item.amount),
      })),

      // Performance metrics
      performanceMetrics: [
        {
          name: 'Collection Rate',
          value: data.collectionRate * 100,
          target: 85,
          status: this.getPerformanceStatus(data.collectionRate, 'rate'),
          formattedValue: this.formatPercentage(data.collectionRate),
        },
        {
          name: 'Liquidation Rate',
          value: data.liquidationRate * 100,
          target: 75,
          status: this.getPerformanceStatus(data.liquidationRate, 'rate'),
          formattedValue: this.formatPercentage(data.liquidationRate),
        },
        {
          name: 'Bad Debt Rate',
          value: data.badDebtWriteOffRate * 100,
          target: 5,
          status: data.badDebtWriteOffRate <= 0.05 ? 'excellent' : 
                 data.badDebtWriteOffRate <= 0.1 ? 'good' :
                 data.badDebtWriteOffRate <= 0.15 ? 'warning' : 'critical',
          formattedValue: this.formatPercentage(data.badDebtWriteOffRate),
        },
        {
          name: 'DSO',
          value: data.daysSalesOutstanding,
          target: 30,
          status: this.getPerformanceStatus(data.daysSalesOutstanding, 'days'),
          formattedValue: `${Math.round(data.daysSalesOutstanding)} days`,
        },
      ],
    };
  }

  // ============================================================================
  // ANÁLISIS DE TENDENCIAS
  // ============================================================================

  // Analizar tendencias
  static analyzeTrends(data: FinancialsKPIResponse): FinancialsTrendAnalysis {
    const portfolioTrend = this.calculateTrend(data.portfolioValueTrend);
    const collectionTrend = this.calculateTrend(data.collectionRateTrend);
    const liquidationTrend = this.calculateTrend(data.liquidationRateTrend);

    return {
      portfolioTrend: {
        change: portfolioTrend.change,
        trend: portfolioTrend.trend,
        direction: portfolioTrend.trend === 'up' ? 'increasing' : 
                  portfolioTrend.trend === 'down' ? 'decreasing' : 'stable',
      },
      collectionPerformance: {
        current: data.collectionRate,
        change: collectionTrend.change,
        trend: collectionTrend.trend,
      },
      liquidationEfficiency: {
        current: data.liquidationRate,
        change: liquidationTrend.change,
        trend: liquidationTrend.trend,
      },
    };
  }

  // ============================================================================
  // GENERACIÓN DE ALERTAS
  // ============================================================================

  // Generar alertas basadas en métricas
  static generateAlerts(data: FinancialsKPIResponse): FinancialsAlert[] {
    const alerts: FinancialsAlert[] = [];
    
    // Alerta bad debt rate alto
    if (data.badDebtWriteOffRate > 0.15) {
      alerts.push({
        id: 'high-bad-debt',
        type: 'critical',
        title: 'High Bad Debt Write-off Rate',
        message: `Bad debt rate is ${this.formatPercentage(data.badDebtWriteOffRate)}, exceeding 15% threshold`,
        value: data.badDebtWriteOffRate * 100,
        threshold: 15,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta collection rate bajo
    if (data.collectionRate < 0.75) {
      alerts.push({
        id: 'low-collection-rate',
        type: 'critical',
        title: 'Low Collection Rate',
        message: `Collection rate is ${this.formatPercentage(data.collectionRate)}, below 75% target`,
        value: data.collectionRate * 100,
        threshold: 75,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta DSO alto
    if (data.daysSalesOutstanding > 60) {
      alerts.push({
        id: 'high-dso',
        type: 'warning',
        title: 'High Days Sales Outstanding',
        message: `DSO is ${Math.round(data.daysSalesOutstanding)} days, above optimal range`,
        value: data.daysSalesOutstanding,
        threshold: 60,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta liquidation rate bajo
    if (data.liquidationRate < 0.6) {
      alerts.push({
        id: 'low-liquidation-rate',
        type: 'warning',
        title: 'Low Liquidation Rate',
        message: `Liquidation rate is ${this.formatPercentage(data.liquidationRate)}, below 60% target`,
        value: data.liquidationRate * 100,
        threshold: 60,
        timestamp: new Date().toISOString(),
        actionRequired: true,
      });
    }

    // Alerta portfolio value trend
    const portfolioTrend = this.calculateTrend(data.portfolioValueTrend);
    if (portfolioTrend.trend === 'down' && portfolioTrend.change > 10) {
      alerts.push({
        id: 'declining-portfolio',
        type: 'warning',
        title: 'Declining Portfolio Value',
        message: `Portfolio value has decreased by ${portfolioTrend.change.toFixed(1)}% recently`,
        value: portfolioTrend.change,
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
  static getRecommendations(data: FinancialsKPIResponse): FinancialsRecommendation[] {
    const recommendations: FinancialsRecommendation[] = [];

    // Bad debt rate alto
    if (data.badDebtWriteOffRate > 0.1) {
      recommendations.push({
        title: "Enhance Credit Assessment",
        description: "Implement stricter credit scoring and risk assessment protocols",
        priority: "high",
        actionRequired: true,
        impact: "high",
      });
    }

    // Collection rate bajo
    if (data.collectionRate < 0.8) {
      recommendations.push({
        title: "Optimize Collection Strategy",
        description: "Review collection processes and implement automated follow-up systems",
        priority: "high",
        actionRequired: true,
        impact: "high",
      });
    }

    // DSO alto
    if (data.daysSalesOutstanding > 45) {
      recommendations.push({
        title: "Accelerate Collection Cycle",
        description: "Implement early intervention strategies and payment incentives",
        priority: "medium",
        actionRequired: true,
        impact: "medium",
      });
    }

    // Liquidation rate bajo
    if (data.liquidationRate < 0.7) {
      recommendations.push({
        title: "Improve Liquidation Process",
        description: "Review asset valuation and liquidation channels for efficiency",
        priority: "medium",
        actionRequired: true,
        impact: "medium",
      });
    }

    // Buena performance
    if (data.collectionRate > 0.9 && data.badDebtWriteOffRate < 0.05) {
      recommendations.push({
        title: "Maintain Excellence",
        description: "Continue current practices and consider scaling successful strategies",
        priority: "low",
        actionRequired: false,
        impact: "low",
      });
    }

    return recommendations;
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  // Obtener nivel de riesgo del portfolio
  static getPortfolioRiskLevel(badDebtRate: number): {
    level: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    color: string;
  } {
    if (badDebtRate > 0.15) {
      return {
        level: 'critical',
        message: 'Critical risk - immediate intervention required',
        color: '#DC2626',
      };
    }
    
    if (badDebtRate > 0.1) {
      return {
        level: 'high',
        message: 'High risk - enhanced monitoring needed',
        color: '#EF4444',
      };
    }
    
    if (badDebtRate > 0.05) {
      return {
        level: 'medium',
        message: 'Medium risk - standard monitoring',
        color: '#F59E0B',
      };
    }
    
    return {
      level: 'low',
      message: 'Low risk - portfolio performing well',
      color: '#10B981',
    };
  }

  // Calcular health score del portfolio
  static calculatePortfolioHealthScore(data: FinancialsKPIResponse): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    description: string;
  } {
    const collectionWeight = 0.4;
    const liquidationWeight = 0.3;
    const badDebtWeight = 0.3;
    
    const collectionScore = Math.min(100, (data.collectionRate / 0.9) * 100);
    const liquidationScore = Math.min(100, (data.liquidationRate / 0.8) * 100);
    const badDebtScore = Math.max(0, 100 - (data.badDebtWriteOffRate / 0.1) * 100);
    
    const totalScore = (
      collectionScore * collectionWeight +
      liquidationScore * liquidationWeight +
      badDebtScore * badDebtWeight
    );

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let description: string;

    if (totalScore >= 90) {
      grade = 'A';
      description = 'Excellent portfolio performance';
    } else if (totalScore >= 80) {
      grade = 'B';
      description = 'Good portfolio performance';
    } else if (totalScore >= 70) {
      grade = 'C';
      description = 'Average portfolio performance';
    } else if (totalScore >= 60) {
      grade = 'D';
      description = 'Below average performance';
    } else {
      grade = 'F';
      description = 'Poor portfolio performance';
    }

    return {
      score: Math.round(totalScore),
      grade,
      description,
    };
  }
}
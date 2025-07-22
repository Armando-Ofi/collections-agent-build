
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Target } from "lucide-react";
import CustomTooltip from '@/shared/components/common/CustomTooltip';

interface KeyMetricsSummaryProps {
  summaryMetrics: any;
}

const KeyMetricsSummary: React.FC<KeyMetricsSummaryProps> = ({ summaryMetrics }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-inner">
            <Target className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Key Metrics</h3>
            <p className="text-xs text-muted-foreground">Performance indicators</p>
          </div>
        </div>
        <CustomTooltip 
          title="Key Performance Metrics" 
          content="Essential KPIs for monitoring accounts receivable effectiveness and efficiency"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/20 shadow-inner">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summaryMetrics?.collectionEfficiency || '0%'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            Collection Efficiency
          </div>
        </div>
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20 shadow-inner">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summaryMetrics?.arTurnover || '0'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            AR Turnover
          </div>
        </div>
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-amber-50/80 to-amber-100/60 dark:from-amber-900/30 dark:to-amber-800/20 shadow-inner">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summaryMetrics?.dso || '0 days'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            DSO
          </div>
        </div>
        <div className="text-center space-y-2 p-3 rounded-xl bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-900/30 dark:to-red-800/20 shadow-inner">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summaryMetrics?.averageDaysDelinquent || '0 days'}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">
            Avg Days Delinquent
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default KeyMetricsSummary;
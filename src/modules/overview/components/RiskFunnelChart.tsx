
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CollectionsService } from '../services/collectionsService';
import CustomTooltip from '@/shared/components/common/CustomTooltip';
import { getTooltipStyle } from '../utils/getTooltipStyle';

interface RiskFunnelChartProps {
  chartData: any;
}

const RiskFunnelChart: React.FC<RiskFunnelChartProps> = ({ chartData }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-red-50/80 to-red-100/60 dark:from-red-900/30 dark:to-red-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Risk Funnel Analysis</h3>
            <p className="text-xs text-muted-foreground">Progressive risk assessment</p>
          </div>
        </div>
        <CustomTooltip 
          title="Risk Funnel Analysis" 
          content="Progressive risk assessment showing potential collection issues from total receivables to critical accounts"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={chartData?.riskFunnel || []}
          layout="horizontal"
          margin={{ left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
          <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
            {chartData?.riskFunnel?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default RiskFunnelChart;
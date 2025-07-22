import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CollectionsService } from '../services/collectionsService';
import CustomTooltip from '@/shared/components/common/CustomTooltip';
import { getTooltipStyle } from '../utils/getTooltipStyle';

interface ReceivablesTrendChartProps {
  chartData: any;
}

const ReceivablesTrendChart: React.FC<ReceivablesTrendChartProps> = ({ chartData }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-blue-50/80 to-blue-100/60 dark:from-blue-900/30 dark:to-blue-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-inner">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Receivables Trend</h3>
            <p className="text-xs text-muted-foreground">Monthly performance overview</p>
          </div>
        </div>
        <CustomTooltip 
          title="Receivables Trend Analysis" 
          content="Visualizes monthly trends in outstanding receivables to identify patterns and seasonal variations"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData?.receivableTrend || []}>
          <defs>
            <linearGradient id="receivableGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#receivableGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default ReceivablesTrendChart;
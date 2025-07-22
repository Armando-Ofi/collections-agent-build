
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart3 } from "lucide-react";
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

interface AgingBarChartProps {
  chartData: any;
}

const AgingBarChart: React.FC<AgingBarChartProps> = ({ chartData }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-violet-50/80 to-violet-100/60 dark:from-violet-900/30 dark:to-violet-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/40 shadow-inner">
            <BarChart3 className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Aging Distribution</h3>
            <p className="text-xs text-muted-foreground">Amount by category</p>
          </div>
        </div>
        <CustomTooltip 
          title="Aging Distribution Chart" 
          content="Detailed view of receivables amounts distributed across different aging categories"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData?.agingBreakdown || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
            {chartData?.agingBreakdown?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default AgingBarChart;
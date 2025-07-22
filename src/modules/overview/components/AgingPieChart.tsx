
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Clock } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CollectionsService } from '../services/collectionsService';
import CustomTooltip from '@/shared/components/common/CustomTooltip';
import { getTooltipStyle } from '../utils/getTooltipStyle';

interface AgingPieChartProps {
  chartData: any;
}

const AgingPieChart: React.FC<AgingPieChartProps> = ({ chartData }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-orange-50/80 to-orange-100/60 dark:from-orange-900/30 dark:to-orange-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 shadow-inner">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Aging Breakdown</h3>
            <p className="text-xs text-muted-foreground">Portfolio distribution</p>
          </div>
        </div>
        <CustomTooltip 
          title="Aging Breakdown Analysis" 
          content="Visual breakdown of receivables portfolio by age categories to identify collection priorities"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData?.agingBreakdown || []}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={5}
            dataKey="amount"
          >
            {chartData?.agingBreakdown?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [CollectionsService.formatAmount(value as number), 'Amount']}
          />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default AgingPieChart;
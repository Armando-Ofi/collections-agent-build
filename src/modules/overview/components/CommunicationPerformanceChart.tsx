
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomTooltip from '@/shared/components/common/CustomTooltip';
import { getTooltipStyle } from '../utils/getTooltipStyle';

interface CommunicationPerformanceChartProps {
  chartData: any;
}

const CommunicationPerformanceChart: React.FC<CommunicationPerformanceChartProps> = ({ chartData }) => (
  <Card className="glass-card hover-lift rounded-2xl overflow-hidden shadow-lg">
    <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-emerald-100/60 dark:from-emerald-900/30 dark:to-emerald-800/20 border-b border-border/50 p-4">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 shadow-inner">
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Communication Performance</h3>
            <p className="text-xs text-muted-foreground">Channel effectiveness</p>
          </div>
        </div>
        <CustomTooltip 
          title="Communication Performance Analysis" 
          content="Response rates by communication channel to optimize collection outreach strategies"
        />
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData?.communicationRates || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
          <XAxis dataKey="channel" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={getTooltipStyle()}
            formatter={(value) => [`${value}%`, 'Response Rate']}
          />
          <Bar dataKey="rate" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default CommunicationPerformanceChart;
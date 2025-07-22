
import React from 'react';
import KPICard from "@/shared/components/common/KPICard";

interface KPICardsGridProps {
  kpiCards: any[];
}

const KPICardsGrid: React.FC<KPICardsGridProps> = ({ kpiCards }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {kpiCards.map((kpi, index) => (
      <div key={index} className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative">
          <KPICard 
            {...kpi} 
            className="glass-card hover-lift hover:neon-glow transition-all duration-300 rounded-2xl p-4 shadow-lg"
          />
        </div>
      </div>
    ))}
  </div>
);

export default KPICardsGrid;
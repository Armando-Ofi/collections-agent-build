
// Theme-responsive tooltip style for charts
export const getTooltipStyle = () => ({
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--foreground))",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8px)",
});
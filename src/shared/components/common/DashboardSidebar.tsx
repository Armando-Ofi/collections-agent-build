import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/shared/components/ui/sidebar";
import {
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  BotIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  {
    title: "Overview",
    url: "/",
    icon: BarChart3,
    description: "Dashboard & Analytics",
  },
  {
    title: "Payment Risk",
    url: "/payment-risk",
    icon: Users,
    description: "Clients Payment Risks",
  }
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar className="glass-sidebar border-r-0" variant="sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl cyber-gradient flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Sarah</h1>
              <p className="text-sm text-muted-foreground">Agent Dashboard</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive =
              (location.pathname === "/" && item.url === "/") ||
              (location.pathname === "/overview" && item.url === "/") ||
              (location.pathname.startsWith(item.url) && item.url !== "/");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive} size="lg">
                  <Link
                    to={item.url}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300",
                      "hover:text-foreground dark:hover:bg-white/10 hover:bg-gray-100/50",
                      isActive &&
                        "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground dark:neon-glow border border-primary/30 dark:border-primary/50",
                    )}
                  >
                    <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-electric-500 to-neon-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                AI Performance
              </p>
              <p className="text-xs text-muted-foreground">94% Success Rate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              Auto-optimizing
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;

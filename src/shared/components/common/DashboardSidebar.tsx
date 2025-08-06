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
  Wallet,
  Settings,
  Shield,
  UserCircle,
  PieChart,
  FileText,
  Activity,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useRole } from "@/shared/store/roleContext";
import SettingsComponent from "./SettingsComponent";

// Navegación para Collections Agent (Rol 1)
const agentNavigation = [
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
  },
  {
    title: "Payment Plans",
    url: "/payment-plan",
    icon: Wallet,
    description: "Clients Payment Plans",
  }
];

// Navegación para Manager (Rol 2)
const managerNavigation = [
  {
    title: "Overview",
    url: "/",
    icon: BarChart3,
    description: "Dashboard & Analytics",
  },
  {
    title: "Team Performance",
    url: "/team-performance",
    icon: Activity,
    description: "Agent Performance Metrics",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    description: "Management Reports",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: PieChart,
    description: "Advanced Analytics",
  }
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { role } = useRole();

  // Seleccionar navegación basada en el rol
  const navigation = role === 2 ? managerNavigation : agentNavigation;

  const getRoleInfo = (roleId: number) => {
    switch (roleId) {
      case 1:
        return {
          name: "Collections Agent",
          icon: UserCircle,
          description: "Agent Dashboard"
        };
      case 2:
        return {
          name: "Manager",
          icon: Shield,
          description: "Management Dashboard"
        };
      default:
        return {
          name: "User",
          icon: UserCircle,
          description: "Dashboard"
        };
    }
  };

  const roleInfo = getRoleInfo(role);

  return (
    <Sidebar className="glass-sidebar border-r-0" variant="sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                role === 2 
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500" 
                  : "cyber-gradient"
              )}>
                <roleInfo.icon className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Sarah</h1>
            </div>
          </div>
          <SettingsComponent />
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

        {/* Role Indicator */}
        <div className="px-3 mt-6">
          <div className="glass-card p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center",
                role === 2 
                  ? "bg-purple-500/20 text-purple-600 dark:text-purple-400" 
                  : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
              )}>
                <roleInfo.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Current Role
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {roleInfo.name}
            </p>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              role === 2 
                ? "bg-gradient-to-r from-purple-500 to-indigo-500" 
                : "bg-gradient-to-r from-electric-500 to-neon-500"
            )}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {role === 2 ? "Team Performance" : "AI Performance"}
              </p>
              <p className="text-xs text-muted-foreground">
                {role === 2 ? "Team: 89% Success Rate" : "94% Success Rate"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 w-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {role === 2 ? "Auto-monitoring" : "Auto-optimizing"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
import { Settings, Moon, Sun, Plus, Minus, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useInterestRates } from "../../hooks/useInterestRates";
import { cn } from "@/shared/lib/utils";

const SettingsComponent = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { states, actions } = useInterestRates();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch interest rates when modal opens
  useEffect(() => {
    if (isOpen && states.interestRates.length === 0 && !states.loading) {
      actions.fetchInterestRates();
    }
  }, [isOpen, states.interestRates.length, states.loading, actions]);

  if (!mounted) {
    return null;
  }

  const handleInterestChange = (countryId: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      actions.updateInterestRate(countryId, Math.round(numValue * 100) / 100);
    }
  };

  const handleSaveChanges = async () => {
    await actions.saveInterestRates();
  };

  const handleDiscardChanges = () => {
    actions.discardChanges();
  };

  const handleCloseModal = () => {
    // Limpiar mensajes de estado al cerrar
    actions.clearStatusMessages();
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="glass-card hover:bg-primary/10 transition-all duration-300 group dark:hover:bg-primary/20 hover:neon-glow"
          >
            <Settings className="h-4 w-4 transition-all group-hover:scale-110 group-hover:rotate-45" />
            <span className="sr-only">Open settings</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>

      {/* Modal using Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-background/98 backdrop-blur-xl border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden m-4 glass-card" style={{ zIndex: 10000 }}>
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-xl border-b border-border p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Settings
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your theme preferences and interest rates configuration
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseModal}
                  className="hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* Theme Settings */}
              <div>
                <h3 className="text-base font-semibold mb-2">Theme</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose your preferred theme
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border" />

              {/* Interest Rates Settings */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold">Interest Rates by Country</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure interest rates for different countries
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {states.hasChanges && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 animate-pulse">
                        Unsaved changes
                      </span>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={actions.forceRefresh}
                          disabled={states.loading}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className={cn("h-3 w-3", states.loading && "animate-spin")} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh data from server</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Loading State */}
                {states.loading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading interest rates...</span>
                  </div>
                )}

                {/* Unified Status Banner - Shows either error or success, never both */}
                {(states.error || states.success) && (
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg mb-4",
                    states.error 
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-green-500/10 text-green-600 dark:text-green-400"
                  )}>
                    {states.error ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    <span className="text-sm flex-1">
                      {states.error || "Changes saved successfully"}
                    </span>
                    {states.error && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={actions.retryFetch}
                        className="hover:bg-red-500/20"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Interest Rates List */}
                {!states.loading && states.interestRates.length > 0 && (
                  <div className="space-y-3">
                    {states.interestRates.map((rate) => (
                      <div key={rate.id} className="glass-card p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-medium">{rate.country_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => actions.decrementInterest(rate.id, 0.1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={rate.interest}
                                onChange={(e) => handleInterestChange(rate.id, e.target.value)}
                                className="w-20 text-center px-2 py-1 text-sm border border-border rounded bg-background"
                                step="0.01"
                                min="0"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => actions.incrementInterest(rate.id, 0.1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {states.interestRates.length > 0 && (
                  <div className="flex items-center justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleDiscardChanges}
                      disabled={!states.hasChanges || states.saving}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Discard Changes
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      disabled={!states.hasChanges || states.saving}
                      className={cn(
                        "flex items-center gap-2",
                        states.hasChanges && "animate-pulse"
                      )}
                    >
                      {states.saving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {states.saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SettingsComponent;
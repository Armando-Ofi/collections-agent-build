import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  MoreHorizontal,
  Search,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSuggestions?: (row: any) => void;
  searchPlaceholder?: string;
  className?: string;
  loading?: boolean;
}

const DataTable = ({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  onSuggestions,
  searchPlaceholder = "Search...",
  className,
  loading = false,
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    if (sortDirection === "asc") {
      return aString.localeCompare(bString);
    } else {
      return bString.localeCompare(aString);
    }
  });

  // Skeleton rows component
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow
          key={`skeleton-${index}`}
          className="border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-200 dark:hover:shadow-lg"
        >
          {columns.map((column) => (
            <TableCell key={column.key} className="text-foreground">
              <div 
                className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                style={{ width: `${Math.random() * 40 + 60}%` }}
              />
            </TableCell>
          ))}
          <TableCell>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-card dark:border-white/10 border-gray-200/50"
            disabled={loading}
          />
        </div>
        <Badge variant="secondary" className="glass-card">
          {loading ? (
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : (
            `${sortedData.length} items`
          )}
        </Badge>
      </div>

      <div className="glass-card rounded-xl border border-white/10 dark:border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-muted-foreground font-medium transition-colors",
                    column.sortable &&
                      !loading &&
                      "cursor-pointer hover:text-foreground dark:hover:text-primary",
                  )}
                  onClick={() => !loading && column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && <ArrowUpDown className="w-4 h-4" />}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-white/10 dark:border-white/10 hover:bg-white/5 dark:hover:bg-white/5 transition-all duration-200 dark:hover:shadow-lg"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-foreground">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="glass-card border-white/10 dark:border-white/10"
                      >
                        {onSuggestions && (
                          <DropdownMenuItem
                            onClick={() => onSuggestions(row)}
                            className="flex items-center gap-2 text-primary hover:text-primary"
                          >
                            <MessageSquare className="w-4 h-4" />
                            AI Suggestions
                          </DropdownMenuItem>
                        )}
                        {onView && (
                          <DropdownMenuItem
                            onClick={() => onView(row.id)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(row.id)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(row.id)}
                            className="flex items-center gap-2 text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
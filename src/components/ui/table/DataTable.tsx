"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { SkeletonTable } from "../Skeleton";
import { StateView } from "../StateView";
import { useDebounce } from "@/lib/hooks/useDebounce";
import SearchInput from "../SearchInput";

export interface ColumnDef<T> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick: (selectedRows: T[]) => void | Promise<void>;
}

interface DataTableProps<T extends { id?: string | number }> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  loading = false,
  searchPlaceholder = "Search records...",
  searchKey,
  pageSize = 10,
  selectable = false,
  bulkActions = [],
  emptyTitle = "No records found",
  emptyDescription = "There are currently no items to display in this list.",
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // 1. Filtered Data
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim() || !searchKey) return data;
    const q = debouncedSearch.toLowerCase().trim();
    return data.filter((row) => {
      const val = row[searchKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(q);
    });
  }, [data, debouncedSearch, searchKey]);

  // 2. Sorted Data
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    const colDef = columns.find((c) => c.id === sortCol);
    if (!colDef) return filteredData;

    return [...filteredData].sort((a, b) => {
      const valA = colDef.accessorKey ? a[colDef.accessorKey] : null;
      const valB = colDef.accessorKey ? b[colDef.accessorKey] : null;

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDir === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredData, sortCol, sortDir, columns]);

  // 3. Paginated Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  // Handle Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string | number>();
      paginatedData.forEach((row, i) => {
        const id = row.id ?? i;
        next.add(id);
      });
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row, i) => selectedIds.has(row.id ?? i));
  const isSomeSelected =
    selectedIds.size > 0 && !isAllSelected;

  const handleSort = (colId: string) => {
    if (sortCol === colId) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortCol(null);
        setSortDir("asc");
      }
    } else {
      setSortCol(colId);
      setSortDir("asc");
    }
  };

  const selectedRows = useMemo(() => {
    return data.filter((row, i) => selectedIds.has(row.id ?? i));
  }, [data, selectedIds]);

  if (loading) {
    return <SkeletonTable rows={pageSize} cols={columns.length + (selectable ? 1 : 0)} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls: Search & Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchKey && (
          <div className="flex-1 max-w-sm">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              sizeVariant="sm"
            />
          </div>
        )}

        {/* Floating / Inline Bulk Actions Bar */}
        {selectable && selectedIds.size > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black px-3.5 py-1.5 shadow-md animate-in fade-in-0 duration-200 text-xs font-medium">
            <span>
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-white/20 dark:bg-black/20 mx-1" />
            <div className="flex items-center gap-1.5">
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => action.onClick(selectedRows)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    action.variant === "danger"
                      ? "bg-rose-500 text-white hover:bg-rose-600"
                      : "bg-white/15 dark:bg-black/10 hover:bg-white/25 dark:hover:bg-black/20"
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="ml-1 text-[0.72rem] text-slate-300 dark:text-slate-600 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0c101d]/70 backdrop-blur-xl shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03]">
              {selectable && (
                <th className="w-10 px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    aria-label="Select all rows on this page"
                    className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    {isAllSelected ? (
                      <CheckSquare size={17} className="text-[#007BA7] dark:text-sb-cyan" />
                    ) : isSomeSelected ? (
                      <MinusSquare size={17} className="text-[#007BA7] dark:text-sb-cyan" />
                    ) : (
                      <Square size={17} />
                    )}
                  </button>
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortCol === col.id;
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";

                return (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-200 ${alignClass}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className="inline-flex items-center gap-1.5 group hover:text-[#007BA7] dark:hover:text-sb-cyan transition-colors"
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDir === "asc" ? (
                            <ArrowUp size={13} className="text-[#007BA7] dark:text-sb-cyan" />
                          ) : (
                            <ArrowDown size={13} className="text-[#007BA7] dark:text-sb-cyan" />
                          )
                        ) : (
                          <ArrowUpDown size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center">
                  <StateView
                    type={debouncedSearch ? "no-results" : "empty"}
                    title={debouncedSearch ? "No matches found" : emptyTitle}
                    description={
                      debouncedSearch
                        ? `No records matching “${debouncedSearch}”. Try clearing your search.`
                        : emptyDescription
                    }
                    action={
                      debouncedSearch
                        ? {
                            label: "Clear Search",
                            onClick: () => setSearchQuery(""),
                            variant: "secondary",
                          }
                        : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => {
                const rowId = row.id ?? i;
                const isSelected = selectedIds.has(rowId);

                return (
                  <tr
                    key={String(rowId)}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.04]" : "hover:bg-slate-50/40 dark:hover:bg-white/[0.02]"
                    } ${isSelected ? "bg-cyan-50/50 dark:bg-cyan-950/20" : ""}`}
                  >
                    {selectable && (
                      <td className="w-10 px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => toggleSelectRow(rowId, e)}
                          aria-label={`Select row ${i + 1}`}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#007BA7] dark:text-sb-cyan" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";

                      return (
                        <td
                          key={col.id}
                          className={`px-4 py-3.5 text-slate-600 dark:text-slate-300 ${alignClass}`}
                        >
                          {col.render
                            ? col.render(row, i)
                            : col.accessorKey
                            ? String(row[col.accessorKey] ?? "—")
                            : "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > pageSize && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {(safePage - 1) * pageSize + 1} to{" "}
            {Math.min(safePage * pageSize, sortedData.length)} of {sortedData.length} records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-3 font-semibold text-slate-700 dark:text-slate-200">
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

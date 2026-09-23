"use client";

import React, { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Trade } from "@/types";
import { formatPnL, cn, getEmotionColor, getEmotionLabel } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2 } from "lucide-react";

interface TradeTableProps {
  data: Trade[];
  onEdit: (trade: Trade) => void;
  currencyDisplay?: "usd" | "percent";
}

const columnHelper = createColumnHelper<Trade>();

export function TradeTable({ data, onEdit, currencyDisplay = "usd" }: TradeTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = React.useMemo(() => [
    columnHelper.accessor("openTime", {
      header: ({ column }) => {
        return (
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--text-primary)]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date/Time
            <ArrowUpDown className="h-3 w-3" />
          </div>
        );
      },
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex flex-col">
            <span className="font-medium text-[var(--text-primary)]">
              {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("asset", {
      header: "Asset",
      cell: (info) => <span className="font-semibold text-[var(--text-primary)]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("direction", {
      header: "Dir",
      cell: (info) => (
        <Badge variant={info.getValue() === "long" ? "profit" : "loss"}>
          {info.getValue().toUpperCase()}
        </Badge>
      ),
    }),
    columnHelper.accessor("entryPrice", {
      header: "Entry",
      cell: (info) => <span className="font-mono text-sm">{info.getValue().toFixed(5)}</span>,
    }),
    columnHelper.accessor("exitPrice", {
      header: "Exit",
      cell: (info) => {
        const val = info.getValue();
        return val ? <span className="font-mono text-sm">{val.toFixed(5)}</span> : <span className="text-[var(--text-tertiary)]">-</span>;
      },
    }),
    columnHelper.accessor("lotSize", {
      header: "Lots",
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("pnl", {
      header: ({ column }) => {
        return (
          <div
            className="flex justify-end items-center gap-2 cursor-pointer hover:text-[var(--text-primary)]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            PnL
            <ArrowUpDown className="h-3 w-3" />
          </div>
        );
      },
      cell: (info) => {
        const val = currencyDisplay === "usd" ? info.row.original.pnl : (info.row.original.pnlPercent || 0);
        return (
          <div className="text-right font-mono font-medium">
            <span className={val > 0 ? "text-profit" : val < 0 ? "text-loss" : "text-[var(--text-secondary)]"}>
              {formatPnL(val, currencyDisplay, true)}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("riskReward", {
      header: "RR",
      cell: (info) => <span className="font-mono text-sm">{info.getValue() ? `${info.getValue().toFixed(2)}R` : "-"}</span>,
    }),
    columnHelper.accessor("emotionLevel", {
      header: "Emotion",
      cell: (info) => {
        const level = info.getValue();
        const color = getEmotionColor(level);
        return (
          <div className="flex items-center gap-1.5" title={getEmotionLabel(level)}>
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-[var(--text-secondary)]">{level}/5</span>
          </div>
        );
      },
    }),
    columnHelper.accessor("tags", {
      header: "Tags",
      cell: (info) => {
        const tags = info.getValue() || [];
        if (tags.length === 0) return <span className="text-[var(--text-tertiary)] text-xs">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] bg-surface-100 dark:bg-surface-200 text-[var(--text-secondary)] px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-[var(--text-tertiary)]">+{tags.length - 2}</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onEdit(info.row.original)}
            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-surface-100 dark:hover:bg-surface-200 rounded transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-[var(--text-tertiary)] hover:text-loss hover:bg-loss/10 rounded transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ], [currencyDisplay, onEdit]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-50/50 dark:bg-surface-100/50 text-xs text-[var(--text-tertiary)] uppercase border-b border-[var(--border-primary)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-medium whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-[var(--border-primary)]/50 transition-colors hover:bg-surface-50 dark:hover:bg-surface-100/30",
                  index % 2 === 0 ? "bg-transparent" : "bg-surface-50/20 dark:bg-surface-100/10"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                No trades found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

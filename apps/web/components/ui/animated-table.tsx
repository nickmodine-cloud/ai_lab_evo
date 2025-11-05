"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/components/ui/table";

interface AnimatedTableProps {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
  className?: string;
}

export function AnimatedTable({ headers, rows, className }: AnimatedTableProps) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-surface-muted/70 overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border/60">
            {headers.map((header, index) => (
              <TableHead key={index} className="text-text-primary">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              className="border-border/60 hover:bg-surface-hover/50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
            >
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="text-text-secondary">
                  {cell}
                </TableCell>
              ))}
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


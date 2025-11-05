"use client";

import { useState, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { AnimatedModal } from "@/components/ui/animated-modal";
import { HypothesisItem } from "@/lib/hypothesis-data";
import { Checkbox } from "@/components/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/components/ui/select";
import { AnimatedInput } from "@/components/ui/animated-input";
import { X, Tag, User, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hypotheses: HypothesisItem[];
  onBulkEdit: (ids: string[], changes: BulkEditChanges) => void;
}

interface BulkEditChanges {
  tags?: string[];
  priority?: "high" | "medium" | "low";
  owner?: string;
}

const priorityOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const mockOwners = [
  "Cassie Liu",
  "Arjun Patel",
  "Mila Novak",
  "Leo Zhang",
  "Mia Torres",
  "David Romero",
  "Nina Petrova",
  "Evelyn Shaw"
];

const mockTags = [
  "Insurance",
  "GenAI",
  "Manufacturing",
  "Vision",
  "CX",
  "Prediction",
  "Operations",
  "Finance",
  "Retail",
  "Forecasting",
  "Sales",
  "Risk",
  "Revenue",
  "Optimization",
  "Detection"
];

export function BulkEditDialog({
  open,
  onOpenChange,
  hypotheses,
  onBulkEdit
}: BulkEditDialogProps) {
  const t = useTranslations('hypotheses.bulkEdit');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [changes, setChanges] = useState<BulkEditChanges>({});
  const [tagInput, setTagInput] = useState("");

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedIds.size === hypotheses.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < hypotheses.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(hypotheses.map((h) => h.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !changes.tags?.includes(tagInput.trim())) {
      setChanges({
        ...changes,
        tags: [...(changes.tags || []), tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setChanges({
      ...changes,
      tags: changes.tags?.filter((t) => t !== tag) || []
    });
  };

  const handleApply = () => {
    if (selectedIds.size > 0) {
      onBulkEdit(Array.from(selectedIds), changes);
      setSelectedIds(new Set());
      setChanges({});
      setTagInput("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setChanges({});
    setTagInput("");
    onOpenChange(false);
  };

  return (
    <AnimatedModal
      open={open}
      onOpenChange={handleClose}
      title="Bulk Edit Hypotheses"
      size="xl"
    >
      <div className="space-y-6">
        {/* Selection Summary */}
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-muted/70 px-4 py-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className={cn(
                "h-4 w-4 border-border/60",
                isIndeterminate && "data-[state=checked]:bg-neon-green/50"
              )}
            />
            <span className="text-sm font-medium text-text-primary">
              {selectedCount > 0
                ? `${selectedCount} hypothesis${selectedCount > 1 ? "es" : ""} selected`
                : "Select hypotheses to edit"}
            </span>
          </div>
        </div>

        {/* Edit Fields */}
        {selectedCount > 0 && (
          <div className="rounded-2xl border border-border/60 bg-surface-muted/70 px-4 py-4 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Apply Changes</h3>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {changes.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-[rgba(0,255,136,0.08)] px-2.5 py-1 text-xs text-neon-green"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-neon-green/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <AnimatedInput
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="rounded-full border border-border/60 px-3 py-2 text-xs font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green"
                >
                  <Tag className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Priority
              </label>
              <Select
                value={changes.priority || ""}
                onValueChange={(value) =>
                  setChanges({ ...changes, priority: value as "high" | "medium" | "low" })
                }
              >
                <SelectTrigger className="border-border/60 bg-surface-muted/70 text-text-primary focus:border-neon-green/60">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/60">
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Owner */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Owner
              </label>
              <Select
                value={changes.owner || ""}
                onValueChange={(value) =>
                  setChanges({ ...changes, owner: value })
                }
              >
                <SelectTrigger className="border-border/60 bg-surface-muted/70 text-text-primary focus:border-neon-green/60">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/60">
                  {mockOwners.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Hypotheses Table */}
        <div className="rounded-2xl border border-border/60 bg-surface-muted/70 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className={cn(
                        "h-4 w-4 border-border/60",
                        isIndeterminate && "data-[state=checked]:bg-neon-green/50"
                      )}
                    />
                  </TableHead>
                  <TableHead className="text-xs font-medium text-text-secondary/60">ID</TableHead>
                  <TableHead className="text-xs font-medium text-text-secondary/60">Title</TableHead>
                  <TableHead className="text-xs font-medium text-text-secondary/60">Owner</TableHead>
                  <TableHead className="text-xs font-medium text-text-secondary/60">Stage</TableHead>
                  <TableHead className="text-xs font-medium text-text-secondary/60">Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hypotheses.map((hypothesis) => {
                  const isSelected = selectedIds.has(hypothesis.id);
                  return (
                    <TableRow
                      key={hypothesis.id}
                      className={cn(
                        "border-border/60 transition duration-200",
                        isSelected && "bg-[rgba(0,255,136,0.05)]"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectOne(hypothesis.id, checked as boolean)
                          }
                          className="h-4 w-4 border-border/60"
                        />
                      </TableCell>
                      <TableCell className="text-xs font-medium text-text-primary">
                        {hypothesis.id}
                      </TableCell>
                      <TableCell className="text-sm text-text-primary max-w-[200px] truncate">
                        {hypothesis.title}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {hypothesis.owner}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {hypothesis.stage}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {hypothesis.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-text-secondary"
                            >
                              {tag}
                            </span>
                          ))}
                          {hypothesis.tags.length > 2 && (
                            <span className="text-[10px] text-text-secondary/60">
                              +{hypothesis.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-full border border-border/80 text-sm font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={selectedIds.size === 0 || Object.keys(changes).length === 0}
            className={cn(
              "relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold text-base shadow-neon transition duration-200 ease-soft-spring",
              selectedIds.size > 0 && Object.keys(changes).length > 0
                ? "hover:shadow-neon-hover"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.9),rgba(64,224,208,0.9))]" />
            <span className="relative flex items-center gap-2">
              Apply to {selectedCount} {selectedCount === 1 ? "hypothesis" : "hypotheses"}
            </span>
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
}



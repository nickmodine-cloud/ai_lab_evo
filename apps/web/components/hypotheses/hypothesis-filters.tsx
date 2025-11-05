"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Filter, X, Search, Calendar, Tag, User, Building2, TrendingUp, Sparkles } from "lucide-react";
import { HypothesisStageKey } from "@/lib/hypothesis-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/components/ui/select";
import { Checkbox } from "@/components/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface HypothesisFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  searchQuery: string;
  stages: HypothesisStageKey[];
  priorities: string[];
  aiTypes: string[];
  owners: string[];
  departments: string[];
  tags: string[];
  roiMin?: number;
  roiMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

const stageOptions: { value: HypothesisStageKey; label: string }[] = [
  { value: "IDEATION", label: "Ideation" },
  { value: "SCOPING", label: "Scoping" },
  { value: "PRIORITIZATION", label: "Prioritization" },
  { value: "EXPERIMENTATION", label: "Experimentation" },
  { value: "EVALUATION", label: "Evaluation" },
  { value: "SCALING", label: "Scaling" }
];

const priorityOptions = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const aiTypeOptions = [
  { value: "LLM", label: "LLM" },
  { value: "ML", label: "ML" },
  { value: "CV", label: "CV" },
  { value: "NLP", label: "NLP" },
  { value: "RPA", label: "RPA" }
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

const mockDepartments = [
  "Business Analyst Guild",
  "Product Strategy",
  "Portfolio Council",
  "Lab Squad Alpha",
  "Governance Office",
  "Scale Factory"
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

export function HypothesisFilters({ onFiltersChange }: HypothesisFiltersProps) {
  const t = useTranslations('hypotheses.filters');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    stages: [],
    priorities: [],
    aiTypes: [],
    owners: [],
    departments: [],
    tags: []
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      searchQuery: "",
      stages: [],
      priorities: [],
      aiTypes: [],
      owners: [],
      departments: [],
      tags: []
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = 
    filters.stages.length > 0 ||
    filters.priorities.length > 0 ||
    filters.aiTypes.length > 0 ||
    filters.owners.length > 0 ||
    filters.departments.length > 0 ||
    filters.tags.length > 0 ||
    filters.roiMin !== undefined ||
    filters.roiMax !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neon-green/80" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            placeholder="Search hypotheses..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-border/70 bg-surface-muted/70 text-sm text-text-primary placeholder:text-text-secondary/70 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-300"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-200 ease-soft-spring whitespace-nowrap",
            showFilters || hasActiveFilters
              ? "border-neon-green/60 bg-[rgba(0,255,136,0.08)] text-neon-green"
              : "border-border/80 text-text-secondary hover:border-neon-green/60 hover:text-neon-green"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="rounded-full bg-neon-green/20 text-neon-green px-2 py-0.5 text-xs">
              {filters.stages.length + filters.priorities.length + filters.aiTypes.length + filters.owners.length + filters.departments.length + filters.tags.length}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 px-3 py-2 text-sm font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border/60 bg-surface-muted/70 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Stages */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Stage
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stageOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 text-sm text-text-primary cursor-pointer hover:text-neon-green transition duration-200"
                  >
                    <Checkbox
                      checked={filters.stages.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("stages", option.value)}
                      className="h-4 w-4 border-border/60"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Priorities */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                Priority
              </label>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 text-sm text-text-primary cursor-pointer hover:text-neon-green transition duration-200"
                  >
                    <Checkbox
                      checked={filters.priorities.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("priorities", option.value)}
                      className="h-4 w-4 border-border/60"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* AI Types */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                AI Type
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {aiTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 text-sm text-text-primary cursor-pointer hover:text-neon-green transition duration-200"
                  >
                    <Checkbox
                      checked={filters.aiTypes.includes(option.value)}
                      onCheckedChange={() => toggleArrayFilter("aiTypes", option.value)}
                      className="h-4 w-4 border-border/60"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Owners */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Owner
              </label>
              <Select
                value={filters.owners[0] || ""}
                onValueChange={(value) => {
                  if (value) {
                    updateFilter("owners", [value]);
                  } else {
                    updateFilter("owners", []);
                  }
                }}
              >
                <SelectTrigger className="border-border/60 bg-surface-muted/70 text-text-primary focus:border-neon-green/60 h-9">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/60">
                  <SelectItem value="">All owners</SelectItem>
                  {mockOwners.map((owner) => (
                    <SelectItem key={owner} value={owner}>
                      {owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Departments */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Department
              </label>
              <Select
                value={filters.departments[0] || ""}
                onValueChange={(value) => {
                  if (value) {
                    updateFilter("departments", [value]);
                  } else {
                    updateFilter("departments", []);
                  }
                }}
              >
                <SelectTrigger className="border-border/60 bg-surface-muted/70 text-text-primary focus:border-neon-green/60 h-9">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/60">
                  <SelectItem value="">All departments</SelectItem>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {mockTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleArrayFilter("tags", tag)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition duration-200",
                      filters.tags.includes(tag)
                        ? "border-neon-green/60 bg-[rgba(0,255,136,0.08)] text-neon-green"
                        : "border-border/60 bg-surface-hover/70 text-text-secondary hover:border-neon-green/60 hover:text-neon-green"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* ROI Range */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5" />
                ROI Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.roiMin || ""}
                  onChange={(e) => updateFilter("roiMin", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Min"
                  className="w-full rounded-lg border border-border/60 bg-surface-muted/70 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-300"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="number"
                  value={filters.roiMax || ""}
                  onChange={(e) => updateFilter("roiMax", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Max"
                  className="w-full rounded-lg border border-border/60 bg-surface-muted/70 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => updateFilter("dateFrom", e.target.value || undefined)}
                  className="w-full rounded-lg border border-border/60 bg-surface-muted/70 px-3 py-1.5 text-sm text-text-primary focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-300"
                />
                <span className="text-text-secondary">-</span>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => updateFilter("dateTo", e.target.value || undefined)}
                  className="w-full rounded-lg border border-border/60 bg-surface-muted/70 px-3 py-1.5 text-sm text-text-primary focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-border/60">
              <div className="flex flex-wrap gap-2">
                {filters.stages.map((stage) => (
                  <span
                    key={stage}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-[rgba(0,255,136,0.08)] px-2.5 py-1 text-xs text-neon-green"
                  >
                    Stage: {stageOptions.find((o) => o.value === stage)?.label}
                    <button
                      type="button"
                      onClick={() => toggleArrayFilter("stages", stage)}
                      className="hover:text-neon-green/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.priorities.map((priority) => (
                  <span
                    key={priority}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-[rgba(0,255,136,0.08)] px-2.5 py-1 text-xs text-neon-green"
                  >
                    Priority: {priority}
                    <button
                      type="button"
                      onClick={() => toggleArrayFilter("priorities", priority)}
                      className="hover:text-neon-green/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-[rgba(0,255,136,0.08)] px-2.5 py-1 text-xs text-neon-green"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleArrayFilter("tags", tag)}
                      className="hover:text-neon-green/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



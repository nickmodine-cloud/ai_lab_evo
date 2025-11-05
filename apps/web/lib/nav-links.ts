"use client";

import { useTranslations } from 'next-intl';
import { FloatingDock } from "@/components/ui/floating-dock";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  Cpu,
  FileStack,
  FlaskConical,
  Gauge,
  GitBranchPlus,
  LineChart,
  Microscope,
  PanelTop,
  Settings,
  ShieldCheck,
  Users2
} from "lucide-react";

export type PrimaryNavLink = {
  label: string;
  description: string;
  href: Route;
  icon: LucideIcon;
};

export function useNavLinks(): PrimaryNavLink[] {
  const t = useTranslations('navigation');

  return [
    {
      label: t('overview'),
      description: t('descriptions.overview'),
      href: "/",
      icon: Gauge
    },
    {
      label: t('hypotheses'),
      description: t('descriptions.hypotheses'),
      href: "/hypotheses",
      icon: Microscope
    },
    {
      label: t('experiments'),
      description: t('descriptions.experiments'),
      href: "/experiments",
      icon: FlaskConical
    },
    {
      label: t('value'),
      description: t('descriptions.value'),
      href: "/value",
      icon: LineChart
    },
    {
      label: t('people'),
      description: t('descriptions.people'),
      href: "/people",
      icon: Users2
    },
    {
      label: t('governance'),
      description: t('descriptions.governance'),
      href: "/governance",
      icon: ShieldCheck
    },
    {
      label: t('resources'),
      description: t('descriptions.resources'),
      href: "/resources",
      icon: Cpu
    },
    {
      label: t('labs'),
      description: t('descriptions.labs'),
      href: "/labs",
      icon: Building2
    },
    {
      label: t('dashboards'),
      description: t('descriptions.dashboards'),
      href: "/dashboards",
      icon: PanelTop
    },
    {
      label: t('notifications'),
      description: t('descriptions.notifications'),
      href: "/notifications",
      icon: Bell
    },
    {
      label: t('files'),
      description: t('descriptions.files'),
      href: "/files",
      icon: FileStack
    },
    {
      label: t('admin'),
      description: t('descriptions.admin'),
      href: "/admin",
      icon: Settings
    },
    {
      label: t('analytics'),
      description: t('descriptions.analytics'),
      href: "/analytics",
      icon: BarChart3
    },
    {
      label: t('workflows'),
      description: t('descriptions.workflows'),
      href: "/workflows",
      icon: GitBranchPlus
    }
  ];
}

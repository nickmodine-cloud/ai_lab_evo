"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import { useNavLinks } from "@/lib/nav-links";

export function FloatingDockNav() {
  const navLinks = useNavLinks();
  
  const dockItems = navLinks.map((link) => ({
    title: link.label,
    href: link.href,
    icon: <link.icon className="h-5 w-5" />
  }));

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 h-24 pointer-events-none bg-gradient-to-t from-base/95 via-base/40 to-transparent" />
      <FloatingDock
        items={dockItems}
        desktopClassName="border border-border/70 bg-surface/90 backdrop-blur-sm shadow-[0_0_28px_rgba(0,255,136,0.2)]"
        mobileClassName=""
      />
    </>
  );
}


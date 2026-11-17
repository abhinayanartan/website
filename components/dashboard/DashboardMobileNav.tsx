"use client";

import { LayoutDashboard, Users, CheckSquare, CreditCard, History, Menu } from "lucide-react";

type MobileNavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

export default function DashboardMobileNav({
  activeTab,
  onSelectTab,
  onOpenMore,
  canManageFinances,
  pendingCount,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMore: () => void;
  canManageFinances: boolean;
  pendingCount: number;
}) {
  const items: MobileNavItem[] = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "attendance", label: "Attendance", icon: CheckSquare },
    {
      id: canManageFinances ? "fee-collection" : "payment-history",
      label: canManageFinances ? "Fees" : "Payments",
      icon: canManageFinances ? CreditCard : History,
      badge: canManageFinances && pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="Dashboard quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border/80 bg-white/95 px-2 pt-1.5 shadow-[0_-8px_24px_rgba(42,22,80,0.10)] backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.62rem] font-semibold transition-colors ${
                active
                  ? "bg-[#F5F0FC] text-brand-primary-dark"
                  : "text-brand-muted active:bg-gray-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 2} />
              <span className="max-w-full truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="absolute right-2 top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[0.55rem] leading-none text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenMore}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.62rem] font-semibold text-brand-muted active:bg-gray-100"
          aria-label="Open more dashboard options"
        >
          <Menu size={21} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}

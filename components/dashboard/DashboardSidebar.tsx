"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  CheckSquare,
  CreditCard,
  History,
  AlertTriangle,
  BarChart3,
  Settings,
  Sparkles,
  ArrowLeft,
  X,
} from "lucide-react";
import { UserProfile } from "@/lib/types/academy";
import LogoutButton from "@/components/auth/LogoutButton";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
  badgeColor?: "primary" | "gold" | "accent";
}

export default function DashboardSidebar({
  activeTab,
  onSelectTab,
  user,
  pendingCount,
  activeStudentsCount,
  isOpenMobile,
  onCloseMobile,
}: {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  user: UserProfile;
  pendingCount: number;
  activeStudentsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}) {
  // Exact 9 sidebar items requested
  const sidebarItems: NavItemConfig[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users, badge: activeStudentsCount, badgeColor: "primary" },
    { id: "batches", label: "Batches", icon: Calendar },
    { id: "classes", label: "Classes", icon: CalendarDays },
    { id: "attendance", label: "Attendance", icon: CheckSquare },
    { id: "fee-collection", label: "Fee Collection", icon: CreditCard },
    { id: "payment-history", label: "Payment History", icon: History },
    { id: "pending-fees", label: "Pending Fees", icon: AlertTriangle, badge: pendingCount > 0 ? pendingCount : undefined, badgeColor: "accent" },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-purple-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Academy Brand Header */}
          <div className="flex items-center justify-between p-5 border-b border-brand-border">
            <Link
              href="/"
              className="flex items-center gap-3 group outline-none"
              title="Return to Public Website"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-gold bg-purple-950 p-1 shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src={`${basePath}/logo-an.png`}
                  alt="Abhinaya Nartan Emblem"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-sm font-bold text-brand-dark leading-tight group-hover:text-brand-primary-dark transition-colors">
                  Abhinaya Nartan
                </span>
                <span className="text-[0.62rem] uppercase tracking-[0.2em] text-brand-gold-dark font-bold">
                  Admin Dashboard
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              type="button"
              className="p-1 rounded-lg text-brand-muted hover:text-brand-dark lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items (9 items) */}
          <div className="p-3">
            <p className="px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <Sparkles size={11} className="text-brand-gold" />
              <span>Academy Navigation</span>
            </p>

            <nav className="mt-1 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? "bg-[#F5F0FC] text-brand-primary-dark shadow-sm border border-brand-primary/30"
                        : "text-brand-dark/80 hover:bg-[#F8F9FA] hover:text-brand-dark"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={`transition-colors ${
                          isActive ? "text-brand-primary-dark" : "text-brand-muted"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                          item.badgeColor === "accent"
                            ? "bg-rose-100 text-brand-accent border border-rose-200"
                            : "bg-purple-100 text-brand-primary-dark border border-purple-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Staff Profile & Public Site Link */}
        <div className="p-3 border-t border-brand-border space-y-2">
          {/* Public Website Shortcut */}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-brand-muted hover:bg-gray-50 hover:text-brand-dark transition-colors"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft size={14} />
              <span>Public Website</span>
            </div>
            <span className="text-[0.65rem] text-brand-gold-dark font-semibold">Exit</span>
          </Link>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8F9FA] border border-brand-border">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white font-serif font-bold text-xs shadow-sm">
              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-brand-dark truncate">
                  {user.name}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <span className="text-[0.65rem] text-brand-muted capitalize block">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <LogoutButton variant="sidebar" />
        </div>
      </aside>
    </>
  );
}

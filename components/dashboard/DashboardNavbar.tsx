"use client";

import {
  Menu,
  Search,
  Bell,
  Plus,
  CreditCard,
  Building2,
  ShieldCheck,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { Branch, UserProfile } from "@/lib/types/academy";

export default function DashboardNavbar({
  branches,
  selectedBranchId,
  onSelectBranch,
  user,
  onToggleRole,
  onOpenMobileSidebar,
  onOpenEnrollModal,
  onOpenFeeModal,
  searchQuery,
  onSearchChange,
}: {
  branches: Branch[];
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
  user: UserProfile;
  onToggleRole: () => void;
  onOpenMobileSidebar: () => void;
  onOpenEnrollModal: () => void;
  onOpenFeeModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-brand-border bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shadow-sm">
      {/* Left: Mobile Toggle & Studio Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          type="button"
          className="p-1.5 rounded-lg border border-brand-border text-brand-dark lg:hidden hover:bg-gray-50"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Studio Branch Selector */}
        <div className="flex items-center gap-2 rounded-full border border-brand-border bg-[#F8F9FA] px-3 py-1 text-xs text-brand-dark">
          <Building2 size={13} className="text-brand-gold-dark" />
          <select
            value={selectedBranchId}
            onChange={(e) => onSelectBranch(e.target.value)}
            className="bg-transparent font-semibold text-xs text-brand-dark outline-none cursor-pointer"
            aria-label="Select Studio Branch"
          >
            <option value="all">All Studios</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          placeholder="Search students, roll no, batches, receipts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-full border border-brand-border bg-[#F8F9FA] pl-9 pr-4 py-1.5 text-xs text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
        />
      </div>

      {/* Right: Quick Action CTAs & Profile Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* "+ Collect Fee" Button */}
        <button
          onClick={onOpenFeeModal}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-gold px-3 py-1.5 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all"
        >
          <CreditCard size={13} />
          <span className="hidden sm:inline">Collect Fee</span>
        </button>

        {/* "+ New Student" Button */}
        <button
          onClick={onOpenEnrollModal}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5F0FC] border border-brand-primary/40 px-3 py-1.5 text-xs font-semibold text-brand-primary-dark hover:bg-brand-primary hover:text-white active:scale-95 transition-all"
        >
          <Plus size={13} />
          <span className="hidden sm:inline">New Student</span>
        </button>

        {/* Role Toggle Switcher */}
        <button
          onClick={onToggleRole}
          type="button"
          title="Click to toggle between Super Admin and Teacher view"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-brand-dark hover:border-brand-primary transition-all"
        >
          {user.role === "super_admin" ? (
            <>
              <ShieldCheck size={13} className="text-brand-primary-dark" />
              <span>Super Admin</span>
            </>
          ) : (
            <>
              <UserCheck size={13} className="text-emerald-700" />
              <span>Teacher View</span>
            </>
          )}
        </button>

        {/* Link to Public Website */}
        <Link
          href="/"
          target="_blank"
          title="Open Public Website in new tab"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-muted hover:text-brand-dark hover:bg-gray-50 transition-colors"
        >
          <ExternalLink size={14} />
        </Link>

        {/* Staff Sign Out Button */}
        <LogoutButton variant="header" />
      </div>
    </header>
  );
}

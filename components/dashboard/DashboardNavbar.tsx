"use client";

import { Menu, Search, Plus, CreditCard, Building2, ShieldCheck, UserCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { Branch, UserProfile } from "@/lib/types/academy";

export default function DashboardNavbar({
  branches, selectedBranchId, onSelectBranch, user, onToggleRole, onOpenMobileSidebar,
  onOpenEnrollModal, onOpenFeeModal, searchQuery, onSearchChange, canCollectFees,
}: {
  branches: Branch[]; selectedBranchId: string; onSelectBranch: (id: string) => void;
  user: UserProfile; onToggleRole: () => void; onOpenMobileSidebar: () => void;
  onOpenEnrollModal: () => void; onOpenFeeModal: () => void; searchQuery: string;
  onSearchChange: (q: string) => void; canCollectFees: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-white px-3 py-2 shadow-sm sm:flex sm:h-16 sm:items-center sm:px-6">
      <div className="flex h-11 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button onClick={onOpenMobileSidebar} type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-border text-brand-dark active:bg-gray-50 lg:hidden" aria-label="Open dashboard navigation">
            <Menu size={20} />
          </button>
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-brand-border bg-[#F8F9FA] px-2.5 py-2 text-xs text-brand-dark sm:rounded-full sm:px-3 sm:py-1">
            <Building2 size={14} className="shrink-0 text-brand-gold-dark" />
            <select value={selectedBranchId} onChange={(e) => onSelectBranch(e.target.value)} className="min-w-0 max-w-[9rem] bg-transparent font-semibold text-xs text-brand-dark outline-none sm:max-w-none" aria-label="Select studio branch">
              <option value="all">All Studios</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {canCollectFees && (
            <button onClick={onOpenFeeModal} type="button" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold text-purple-950 shadow-gold-sm active:scale-95 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs sm:font-semibold" aria-label="Collect fee">
              <CreditCard size={17} /><span className="hidden sm:inline">Collect Fee</span>
            </button>
          )}
          {canCollectFees && (
            <button onClick={onOpenEnrollModal} type="button" className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-primary/40 bg-[#F5F0FC] text-brand-primary-dark active:scale-95 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs sm:font-semibold" aria-label="Enroll student">
              <Plus size={18} /><span className="hidden sm:inline">New Student</span>
            </button>
          )}
          <button onClick={onToggleRole} type="button" title="Toggle dashboard role preview" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-[#F8F9FA] px-3 py-1 text-xs font-semibold text-brand-dark">
            {user.role === "super_admin" ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
            <span>{user.role === "super_admin" ? "Super Admin" : "Teacher View"}</span>
          </button>
          <Link href="/" target="_blank" title="Open public website" className="hidden h-8 w-8 items-center justify-center rounded-lg border border-brand-border text-brand-muted sm:flex"><ExternalLink size={14} /></Link>
          <div className="hidden sm:block"><LogoutButton variant="header" /></div>
        </div>
      </div>

      <div className="relative mt-2 sm:absolute sm:left-1/2 sm:top-1/2 sm:mt-0 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:px-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted sm:left-7.5" />
        <input type="search" placeholder="Search students or phone number" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="h-11 w-full rounded-xl border border-brand-border bg-[#F8F9FA] pl-9 pr-3 text-sm text-brand-dark placeholder:text-brand-muted/70 focus:border-brand-primary focus:bg-white focus:outline-none sm:h-8 sm:rounded-full sm:py-1.5 sm:text-xs" />
      </div>
    </header>
  );
}

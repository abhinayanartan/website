"use client";

import { Receipt, ArrowRight, CreditCard, Sparkles } from "lucide-react";
import { FeePayment, Student, Batch } from "@/lib/types/academy";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function RecentPaymentsTable({
  payments,
  students,
  batches,
  onViewReceipt,
  onNavigateHistory,
}: {
  payments: FeePayment[];
  students: Student[];
  batches: Batch[];
  onViewReceipt: (payment: FeePayment) => void;
  onNavigateHistory: () => void;
}) {
  const recentList = payments.slice(0, 6);

  return (
    <div className="rounded-2xl border border-brand-border bg-white shadow-card overflow-hidden hover:shadow-card-hover transition-all">
      {/* Table Header */}
      <div className="flex items-center justify-between p-5 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-brand-dark">
              Recent Fee Transactions
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Verified receipts issued with payment method attribution
          </p>
        </div>
        <button
          onClick={onNavigateHistory}
          type="button"
          className="text-xs text-brand-primary-dark hover:text-brand-gold font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Complete Ledger</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F9FA] text-brand-muted uppercase tracking-wider text-[0.65rem] border-b border-brand-border">
            <tr>
              <th className="py-3 px-4 font-bold">Student</th>
              <th className="py-3 px-4 font-bold">Receipt ID</th>
              <th className="py-3 px-4 font-bold">Batch &amp; Period</th>
              <th className="py-3 px-4 font-bold">Payment Mode</th>
              <th className="py-3 px-4 font-bold">Amount</th>
              <th className="py-3 px-4 font-bold text-right">Voucher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60">
            {recentList.map((payment) => {
              const student = students.find((s) => s.id === payment.studentId);
              const batch = batches.find((b) => b.id === payment.batchId);
              const monthLabel = monthNames[(payment.forMonth - 1) % 12];

              // Initials
              const initials = student?.fullName
                ? student.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                : "AN";

              return (
                <tr key={payment.id} className="hover:bg-purple-50/20 transition-colors">
                  {/* Student with Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F0FC] font-serif font-bold text-brand-primary-dark text-xs border border-brand-primary/30">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-brand-dark truncate">
                          {student?.fullName || "Student"}
                        </div>
                        <div className="text-[0.68rem] text-brand-muted font-mono">
                          {student?.admissionNumber}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Receipt ID */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-xs text-brand-dark">
                      {payment.receiptNumber}
                    </span>
                    <span className="block text-[0.65rem] text-brand-muted">
                      {payment.paymentDate}
                    </span>
                  </td>

                  {/* Batch & Period */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-brand-dark truncate max-w-[150px]">
                      {batch?.name || "Kuchipudi Batch"}
                    </div>
                    <span className="text-[0.68rem] text-brand-muted">
                      {monthLabel} {payment.forYear}
                    </span>
                  </td>

                  {/* Payment Mode */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                        payment.paymentMode === "upi"
                          ? "bg-purple-100 text-purple-900 border border-purple-200"
                          : payment.paymentMode === "cash"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                          : "bg-blue-100 text-blue-900 border border-blue-200"
                      }`}
                    >
                      {payment.paymentMode}
                    </span>
                  </td>

                  {/* Amount Paid */}
                  <td className="py-3 px-4">
                    <span className="font-serif text-sm font-bold text-emerald-800">
                      ₹{payment.amountPaid.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onViewReceipt(payment)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-brand-dark hover:border-brand-gold hover:bg-[#FDFBF4] active:scale-95 transition-all"
                    >
                      <Receipt size={13} className="text-brand-gold" />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

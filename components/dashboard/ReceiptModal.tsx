"use client";

import { X, Printer, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { FeePayment, Student, Batch } from "@/lib/types/academy";
import { normalizePaymentMethod } from "@/lib/services/feeService";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ReceiptModal({
  payment,
  student,
  batch,
  onClose,
}: {
  payment: FeePayment;
  student?: Student;
  batch?: Batch;
  onClose: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  const monthLabel = monthNames[(payment.forMonth - 1) % 12] || `Month ${payment.forMonth}`;
  const feePeriodLabel = payment.paymentPeriod || `${monthLabel} ${payment.forYear}`;
  const studentCode = student?.studentCode || student?.admissionNumber || "N/A";
  const officialMethod = payment.paymentMethod || normalizePaymentMethod(payment.paymentMode || "upi");
  const balance = payment.outstandingBalance !== undefined ? Number(payment.outstandingBalance) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 p-4 backdrop-blur-sm print:p-0 print:bg-white animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-brand-gold/40 bg-white text-brand-dark shadow-2xl print:border-none print:shadow-none print:max-w-none overflow-hidden">
        {/* Modal Controls - Hidden during print */}
        <div className="flex items-center justify-between border-b border-purple-100 bg-purple-950 px-6 py-3.5 text-white print:hidden">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-gold font-semibold">
            <Sparkles size={14} />
            <span>Digital Fee Receipt Voucher</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-3.5 py-1 text-xs font-semibold text-purple-950 shadow-gold-sm hover:brightness-105 active:scale-95 transition-all"
            >
              <Printer size={13} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="rounded-full p-1 text-purple-200 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Header with Academy Branding */}
          <div className="text-center border-b border-brand-border pb-4">
            <div className="mx-auto mb-2 inline-block rounded-xl border border-brand-gold/50 bg-purple-950 p-2 shadow-sm">
              <Image
                src={`${basePath}/logo-an.png`}
                alt="Abhinaya Nartan Emblem"
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-purple-950">
              Abhinaya Nartan Dance Academy
            </h2>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-brand-gold-dark font-semibold">
              Kuchipudi Classical Dance Academy • Vijayawada
            </p>
            <p className="text-[0.72rem] text-brand-muted mt-1">
              Phone: +91 93981 18249 • Email: abhinayanartan@gmail.com
            </p>
          </div>

          {/* Receipt Number & Date Banner */}
          <div className="flex items-center justify-between text-xs bg-purple-50/70 p-3.5 rounded-xl border border-purple-100">
            <div>
              <span className="text-[0.68rem] uppercase font-bold text-brand-muted block">
                Payment Receipt Number
              </span>
              <span className="font-mono font-bold text-purple-950 text-sm sm:text-base">
                {payment.receiptNumber}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[0.68rem] uppercase font-bold text-brand-muted block">
                Payment Date
              </span>
              <span className="font-semibold text-brand-dark">
                {payment.paymentDate}
              </span>
            </div>
          </div>

          {/* Student & Course Particulars */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8F9FA] p-4 rounded-xl border border-brand-border">
            <div>
              <span className="text-[0.68rem] font-bold uppercase text-brand-muted block mb-0.5">
                Student Name
              </span>
              <span className="font-semibold text-purple-950 text-sm block">
                {student?.fullName || "Academy Student"}
              </span>
              <span className="text-[0.7rem] text-brand-muted font-mono block mt-0.5">
                Student ID: <strong>{studentCode}</strong>
              </span>
            </div>

            <div>
              <span className="text-[0.68rem] font-bold uppercase text-brand-muted block mb-0.5">
                Fee Period
              </span>
              <span className="font-semibold text-purple-950 text-sm block">
                {feePeriodLabel}
              </span>
              <span className="text-[0.7rem] text-brand-muted block mt-0.5">
                Batch: {batch?.name || "Assigned Batch"}
              </span>
            </div>

            <div>
              <span className="text-[0.68rem] font-bold uppercase text-brand-muted block mb-0.5">
                Payment Method
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-brand-border text-brand-dark">
                {officialMethod}
              </span>
              {payment.transactionRef && (
                <span className="text-[0.65rem] text-brand-muted font-mono block mt-1 truncate">
                  Ref: {payment.transactionRef}
                </span>
              )}
            </div>

            <div>
              <span className="text-[0.68rem] font-bold uppercase text-brand-muted block mb-0.5">
                Parent / Guardian
              </span>
              <span className="font-medium text-brand-dark block">
                {student?.parentName || "Guardian"}
              </span>
              <span className="text-[0.68rem] text-brand-muted block">
                {student?.parentPhone || student?.phone || "—"}
              </span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-brand-border rounded-xl p-4 space-y-2.5 text-xs bg-white">
            <div className="flex justify-between items-center text-brand-muted">
              <span>Tuition &amp; Studio Training Fee</span>
              <span className="font-semibold text-brand-dark">
                ₹{(student?.monthlyFee || batch?.monthlyFee || payment.amountPaid).toLocaleString("en-IN")}
              </span>
            </div>

            {payment.notes && (
              <div className="flex justify-between items-center text-[0.7rem] text-brand-muted italic">
                <span>Notes / Purpose:</span>
                <span>{payment.notes}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-brand-border text-sm font-bold text-brand-dark">
              <span>Amount Received</span>
              <span className="font-serif text-lg text-emerald-800">
                ₹{payment.amountPaid.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Outstanding Balance Row */}
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-brand-border">
              <span className="font-bold text-brand-dark">Outstanding Balance</span>
              <div className="text-right">
                <span
                  className={`font-serif text-sm font-bold ${
                    balance === 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  ₹{balance.toLocaleString("en-IN")}
                </span>
                <span className="block text-[0.65rem] text-brand-muted">
                  {balance === 0 ? "Settled in Full" : "Pending Balance Due"}
                </span>
              </div>
            </div>
          </div>

          {/* Signatory & Security Footer */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>Verified Ledger Record</span>
            </div>

            <div className="text-right">
              <p className="text-[0.68rem] text-brand-muted">Authorized Signatory</p>
              <p className="font-serif text-xs font-semibold text-purple-950">
                {payment.collectedBy || "G RESHMA"}
              </p>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-brand-border/60 text-[0.65rem] text-brand-muted">
            This digital receipt confirms fee payment received by Abhinaya Nartan Dance Academy. Payment records are permanently recorded in the immutable academy ledger.
          </div>
        </div>
      </div>
    </div>
  );
}

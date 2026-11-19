"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  KeyRound,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
  Wallet,
  Receipt,
  User,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCashierTransactions,
  settlePayment,
  type CashierData,
} from "@/lib/reservations-api";
import { formatBDT } from "@/lib/dashboard-api";
import { toast } from "sonner";

export default function FrontDeskCashierPage() {
  const [data, setData] = useState<CashierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"settled" | "pending">("settled");
  const [searchQuery, setSearchQuery] = useState("");

  // Payment settle modal
  const [settlingFolio, setSettlingFolio] = useState<{ id: string; guestName: string; amount: number; roomNumber: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchCashierData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCashierTransactions();
      setData(res);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load cashier data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashierData();
  }, [fetchCashierData]);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingFolio) return;

    try {
      setSubmittingPayment(true);
      await settlePayment(settlingFolio.id, paymentMethod, settlingFolio.amount, paymentNote);
      toast.success(`Folio for ${settlingFolio.guestName} (Room #${settlingFolio.roomNumber}) settled successfully!`);
      setSettlingFolio(null);
      fetchCashierData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment settlement failed");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handlePrintReceipt = (tx: { confirmationNumber: string; guestName: string; amount: number; paymentMethod: string; transactionId: string }) => {
    window.print();
  };

  const summary = data?.summary;
  const transactions = data?.transactions || [];
  const pendingFolios = data?.pendingFolios || [];

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      t.guestName.toLowerCase().includes(term) ||
      t.confirmationNumber.toLowerCase().includes(term) ||
      t.transactionId.toLowerCase().includes(term) ||
      t.roomNumber.toString().includes(term)
    );
  });

  const filteredPending = pendingFolios.filter((p) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      p.guestName.toLowerCase().includes(term) ||
      p.confirmationNumber.toLowerCase().includes(term) ||
      p.roomNumber.toString().includes(term)
    );
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/pms/front-desk">
            <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              <DollarSign className="h-4 w-4" /> Front Desk Cashier & Billing
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Cashier Operations Console
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Monitor front desk cashier drawers, record cash/card settlements, reconcile shift folios, and print guest receipts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCashierData}
            disabled={loading}
            className="rounded-xl text-xs gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh Drawer
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Collected Today */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-500" /> Total Collections Today
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1 text-emerald-600 dark:text-emerald-400">
            {formatBDT(summary?.totalCollectedToday || 0)}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {summary?.transactionsCount || 0} transactions processed
          </span>
        </div>

        {/* Cash Drawer */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-primary" /> Cash in Drawer
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
              Physical
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1">
            {formatBDT(summary?.cashTotal || 0)}
          </p>
          <span className="text-[11px] text-muted-foreground">Cash drawer balance</span>
        </div>

        {/* Card POS */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-500" /> POS Card Settlements
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600">
              Terminal
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1 text-blue-600 dark:text-blue-400">
            {formatBDT(summary?.cardTotal || 0)}
          </p>
          <span className="text-[11px] text-muted-foreground">Credit / Debit / Gateway</span>
        </div>

        {/* Pending Folios */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-bold flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-500" /> Pending Folios
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
              Due
            </span>
          </div>
          <p className="text-2xl font-black text-foreground mt-1 text-amber-600 dark:text-amber-400">
            {pendingFolios.length}
          </p>
          <span className="text-[11px] text-muted-foreground">Awaiting guest settlement</span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("settled")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "settled"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Settled Transactions
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-card text-foreground">
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Folios (Balance Due)
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-card text-foreground">
              {pendingFolios.length}
            </span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cashier transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p>Loading cashier drawer ledger...</p>
        </div>
      ) : activeTab === "settled" ? (
        /* Settled Transactions Table */
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Receipt / Ref</th>
                <th className="py-3 px-4">Guest & Contact</th>
                <th className="py-3 px-4">Room Unit</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Paid Timestamp</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No transactions match criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      <div>
                        <span>{tx.transactionId}</span>
                        <span className="text-[10px] font-normal text-muted-foreground block">
                          {tx.confirmationNumber}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-foreground block">{tx.guestName}</span>
                        <span className="text-[11px] text-muted-foreground">{tx.guestPhone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-foreground">Room #{tx.roomNumber}</span>
                      <span className="text-[10px] text-muted-foreground block">{tx.roomCategory}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        <CreditCard className="w-3 h-3" /> {tx.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatBDT(tx.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {tx.paidAt ? new Date(tx.paidAt).toLocaleString() : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePrintReceipt(tx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Pending Folios Table */
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Stay Period</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    All folios are currently settled! No pending balances.
                  </td>
                </tr>
              ) : (
                filteredPending.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {p.confirmationNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-foreground block">{p.guestName}</span>
                        <span className="text-[11px] text-muted-foreground">{p.guestPhone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-foreground">Room #{p.roomNumber}</span>
                      <span className="text-[10px] text-muted-foreground block">{p.roomCategory}</span>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground">
                      {p.checkInDate} &rarr; {p.checkOutDate}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                      {formatBDT(p.totalPrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() =>
                          setSettlingFolio({
                            id: p.id,
                            guestName: p.guestName,
                            amount: p.totalPrice,
                            roomNumber: p.roomNumber,
                          })
                        }
                        className="rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs h-8 px-3"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Settle Folio
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Settle Bill Modal */}
      {settlingFolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setSettlingFolio(null)} />

          <div className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl shadow-2xl border border-border overflow-hidden z-10 flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Settle Guest Folio</h3>
                  <p className="text-xs text-muted-foreground">Room #{settlingFolio.roomNumber} • {settlingFolio.guestName}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSettle} className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border text-center">
                <span className="text-xs text-muted-foreground block font-medium">Total Balance to Settle</span>
                <p className="text-2xl font-black text-primary mt-1">{formatBDT(settlingFolio.amount)}</p>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Payment Tender Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs"
                >
                  <option value="Cash">Cash (Front Desk Drawer)</option>
                  <option value="Credit Card">Credit Card (POS Terminal)</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Wire">Bank Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Receipt Remarks / Authorization</label>
                <Input
                  placeholder="e.g. Paid in cash at desk, Auth Code 449210..."
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSettlingFolio(null)}
                  disabled={submittingPayment}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submittingPayment}
                  className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {submittingPayment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

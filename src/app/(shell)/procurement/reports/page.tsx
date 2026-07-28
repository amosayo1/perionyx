"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "../../../../components/enterprise/page-container";
import { EnterprisePageHeader } from "../../../../components/enterprise/enterprise-page-header";
import { AlertTriangle, BarChart3, Calendar, DollarSign, FileText, Clock } from "lucide-react";
import Link from "next/link";

interface ReportCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  stat?: string;
  variant?: "default" | "warning" | "success";
}

const reports: ReportCard[] = [
  {
    title: "AP Aging",
    description: "Outstanding payables by aging bucket (current, 30, 60, 90, 120+ days overdue)",
    href: "/procurement/reports/aging",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: "Payment Calendar",
    description: "Upcoming scheduled payments by date with amounts and vendor breakdown",
    href: "/procurement/reports/payment-calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Cash Requirements",
    description: "Forecasted cash needs by week or month over a configurable horizon",
    href: "/procurement/reports/cash-requirements",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: "Duplicate Suspects",
    description: "Invoices flagged as potential duplicates based on vendor, amount, and date matching",
    href: "/procurement/reports/duplicates",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
];

export default function ReportsPage() {
  return (
    <PageContainer>
      <EnterprisePageHeader
        title="AP Reports"
        description="Accounts payable analytics, aging, and exception reporting"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <div className="group cursor-pointer rounded-lg border border-gray-800 bg-[#1a1a24] p-5 transition hover:border-gray-700 hover:bg-[#1f1f1f]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-[#0f0f0f] text-gray-400 transition group-hover:text-gray-200">
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-200 transition group-hover:text-white">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{report.description}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

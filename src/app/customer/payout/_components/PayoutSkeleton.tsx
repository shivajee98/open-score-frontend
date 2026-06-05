"use client";

export default function PayoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] pb-safe mb-18 flex justify-center">
      <div className="w-full max-w-md p-4 space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between py-2 mb-2">
          <div className="w-10 h-10 bg-slate-200/80 rounded-full animate-pulse border border-slate-100/50"></div>
          <div className="w-24 h-5 bg-slate-200/80 rounded-lg animate-pulse"></div>
          <div className="w-10 h-10 opacity-0"></div>
        </div>

        {/* Vault Section Skeleton */}
        <div className="w-full h-[195px] bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="w-20 h-3 bg-slate-200 rounded"></div>
              <div className="w-28 h-6 bg-slate-200 rounded"></div>
            </div>
            <div className="w-12 h-5 bg-slate-200 rounded-full"></div>
          </div>
          <div className="w-full h-8 bg-slate-100 rounded-xl"></div>
        </div>

        {/* Balance Cards Skeleton */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="h-36 bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between animate-pulse">
            <div className="w-16 h-3 bg-slate-200 rounded"></div>
            <div className="w-24 h-6 bg-slate-200 rounded"></div>
            <div className="flex gap-1.5">
              <div className="w-8 h-4 bg-slate-200 rounded-full"></div>
              <div className="w-8 h-4 bg-slate-200 rounded-full"></div>
              <div className="w-8 h-4 bg-slate-200 rounded-full"></div>
            </div>
          </div>
          <div className="h-36 bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between animate-pulse">
            <div className="w-16 h-3 bg-slate-200 rounded"></div>
            <div className="w-24 h-6 bg-slate-200 rounded"></div>
            <div className="flex justify-between items-center">
              <div className="w-20 h-5 bg-slate-200 rounded-full"></div>
              <div className="w-7 h-7 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Amount Input Section Skeleton */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-20 h-3 bg-slate-200 rounded"></div>
            <div className="w-16 h-3 bg-slate-200 rounded"></div>
          </div>
          <div className="w-full h-12 bg-slate-100 rounded-2xl"></div>
          <div className="flex justify-between gap-2">
            <div className="w-16 h-8 bg-slate-200 rounded-xl"></div>
            <div className="w-16 h-8 bg-slate-200 rounded-xl"></div>
            <div className="w-16 h-8 bg-slate-200 rounded-xl"></div>
            <div className="w-16 h-8 bg-slate-200 rounded-xl"></div>
          </div>
        </div>

        {/* Bank Account Form Skeleton */}
        <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm animate-pulse space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
              <div className="w-28 h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="w-16 h-3 bg-slate-200 rounded"></div>
              <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-3 bg-slate-200 rounded"></div>
              <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-3 bg-slate-200 rounded"></div>
              <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
          <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
          <div className="w-full h-12 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

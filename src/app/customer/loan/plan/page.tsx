'use client';

import { Suspense } from 'react';
import LoanPage from './LoanAmountClient';

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><div className="animate-pulse w-full max-w-md h-96 bg-slate-200 rounded-2xl"></div></div>}>
            <LoanPage />
        </Suspense>
    );
}

'use client';

import { Suspense } from 'react';
import StatusPage from './StatusClient';

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading Status...</div>}>
            <StatusPage />
        </Suspense>
    );
}

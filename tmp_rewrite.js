const fs = require('fs');
const filePath = '/home/shivajee/Desktop/open_score/sub-user/app/dashboard/page.tsx';
let data = fs.readFileSync(filePath, 'utf8');

// 1. Remove Admin Commission Rules from Desktop Block
data = data.replace(
`                {/* Admin Commission Rules */}
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg shadow-slate-200/40 border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden col-span-2 lg:col-span-3">
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">Admin Configuration</p>
                                <h3 className="text-xs font-black text-slate-900 leading-none">Your Earning Potential</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                                    <span>QR Onboarding (Net)</span>
                                    <span className="bg-slate-200 text-slate-500 px-1.5 rounded-sm">Margin</span>
                                </p>
                                <p className="text-lg md:text-xl font-black text-slate-800">
                                    {formatCurrency((stats?.default_signup_amount || 0) - (stats?.join_default_qr_rate || 0))}
                                </p>
                                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                                    Gross: {formatCurrency(stats?.default_signup_amount)}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                                    <span>V-Credit (Net)</span>
                                    <span className="bg-slate-200 text-slate-500 px-1.5 rounded-sm">Margin</span>
                                </p>
                                <p className="text-lg md:text-xl font-black text-slate-800">
                                    {formatCurrency((stats?.admin_loan_commission || 0) - (stats?.join_default_loan_commission || 0))}
                                </p>
                                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">
                                    Gross: {formatCurrency(stats?.admin_loan_commission)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>`, '');

// 2. Insert Admin Commission Rules below Desktop Block
const newAdminBlock = `            {/* Admin Commission Rules - Visible on Both */}
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg shadow-slate-200/40 border border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200 shrink-0">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-tight">Admin Configuration</p>
                            <h3 className="text-sm md:text-base font-black text-slate-900 leading-none mt-0.5">Your Earning Potential</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full lg:w-auto lg:flex-1 lg:pl-12">
                        <div className="bg-slate-50 flex items-center justify-between rounded-xl p-3 border border-slate-100">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex gap-2 items-center">
                                    <span>QR Onboarding</span>
                                    <span className="bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-sm leading-none">Gross</span>
                                </p>
                                <p className="text-lg md:text-xl font-black text-slate-800 leading-none">
                                    {formatCurrency(stats?.default_signup_amount)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-emerald-600/80 uppercase">Retained Margin</p>
                                <p className="text-base font-black text-emerald-600">{formatCurrency((stats?.default_signup_amount || 0) - (stats?.join_default_qr_rate || 0))}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 flex items-center justify-between rounded-xl p-3 border border-slate-100">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex gap-2 items-center">
                                    <span>V-Credit</span>
                                    <span className="bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-sm leading-none">Gross</span>
                                </p>
                                <p className="text-lg md:text-xl font-black text-slate-800 leading-none">
                                    {formatCurrency(stats?.admin_loan_commission)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-emerald-600/80 uppercase">Retained Margin</p>
                                <p className="text-base font-black text-emerald-600">{formatCurrency((stats?.admin_loan_commission || 0) - (stats?.join_default_loan_commission || 0))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

data = data.replace(`{/* ADDITIONAL STATS GRID - Visible on both */}`, newAdminBlock + '\n\n            {/* ADDITIONAL STATS GRID - Visible on both */}');

// 3. Fix MOBILE ROW 1&2 (Lines 161 - 253ish) to be grid-cols-1 for list view instead of squares
// Row 1: STITCH MOBILE ROW 1: Net Performance & Total Network
data = data.replace(`<div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Performance</p>
                            <p className="text-base font-black text-slate-900 truncate">{formatCurrency(stats?.field_agent_earning || 0)}</p>
                            <p className="text-[9px] font-medium text-slate-400">Total</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Network</p>
                            <p className="text-base font-black text-slate-900 truncate">{stats?.total_referrals || 0}</p>
                            <p className="text-[9px] font-medium text-slate-400">Registered</p>
                        </div>
                    </div>
                </div>`, `<div className="grid grid-cols-1 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Performance</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Total</p>
                            </div>
                        </div>
                        <p className="text-lg font-black text-slate-900">{formatCurrency(stats?.field_agent_earning || 0)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-50 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Network</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">Registered</p>
                            </div>
                        </div>
                        <p className="text-lg font-black text-slate-900">{stats?.total_referrals || 0}</p>
                    </div>
                </div>`);

// Modifying Mobile Row 2 Box 1 (Asset Allotted) to be horizontal
data = data.replace(`<div className="grid grid-cols-2 gap-3 md:hidden">
                {/* Box 1: Asset Allotted */}`, `<div className="grid grid-cols-1 gap-3 md:hidden">
                {/* Box 1: Asset Allotted */}`);

data = data.replace(`{/* Box 1: Asset Allotted */}
                <div className="bg-gradient-to-br from-[#6a5af9] to-[#8b5cf6] p-4 rounded-2xl shadow-xl shadow-indigo-200/50 text-white relative overflow-hidden">
                    <div className="absolute top-2 right-2 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/5">
                        <ShieldCheck size={18} />
                    </div>
                    <div className="mt-8">
                        <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">Asset Allotted</p>
                        <h3 className="text-[11px] font-black leading-tight mb-2">Limit From Admin</h3>
                        <p className="text-xl font-black tracking-tight leading-none mb-1">
                            {formatCurrency(stats?.given_by_admin)}
                        </p>
                        <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Distributed Power</p>
                    </div>
                </div>`, `{/* Box 1: Asset Allotted */}
                <div className="bg-gradient-to-br from-[#6a5af9] to-[#8b5cf6] p-4 rounded-2xl shadow-xl shadow-indigo-200/50 text-white relative overflow-hidden flex items-center justify-between">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/5">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black leading-tight mb-0.5 uppercase tracking-widest">Asset Allotted</h3>
                            <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Limit From Admin</p>
                        </div>
                    </div>
                    <div className="text-right relative z-10">
                        <p className="text-lg font-black tracking-tight leading-none mb-1">
                            {formatCurrency(stats?.given_by_admin)}
                        </p>
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Distributed</p>
                    </div>
                </div>`);

// 4. Modifying ADDITIONAL STATS GRID from grid-cols-2 lg:grid-cols-4 to grid-cols-1 md:grid-cols-2 lg:grid-cols-4 and rewrite the 5 inner cards to be flex row on mobile, col on desktop
data = data.replace(`className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"`, `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"`);

data = data.replace(`{/* Card 1: Total Turnover */}
                <div className="bg-indigo-700 p-4 rounded-xl shadow-xl shadow-indigo-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer" onClick={() => router.push('/history/turnover')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20" />
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-indigo-200/60 uppercase tracking-widest">Business Volume</p>
                            <h3 className="text-xs font-black text-white leading-none uppercase">Team Performance Value</h3>
                        </div>
                    </div>
                    <div className="mb-0">
                        <p className="text-xl font-black text-white tracking-tighter">
                            {formatCurrency(
                                (stats?.qr_onboard_count || 0) * (stats?.default_signup_amount || 170) + 
                                (stats?.loan_disbursed_count || 0) * (stats?.admin_loan_commission || 550)
                            )}
                        </p>
                        <p className="text-[8px] font-bold text-indigo-200/40 uppercase tracking-widest">Gross Team Revenue</p>
                    </div>
                </div>`, `{/* Card 1: Total Turnover */}
                <div className="bg-indigo-700 p-3.5 md:p-4 rounded-xl shadow-xl shadow-indigo-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-row items-center justify-between md:flex-col md:items-start" onClick={() => router.push('/history/turnover')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20 md:block hidden" />
                    <div className="flex items-center gap-3 md:mb-3 relative z-10 w-full md:w-auto overflow-hidden pr-2">
                        <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                            <TrendingUp className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </div>
                        <div className="truncate">
                            <p className="text-[8px] font-black text-indigo-200/60 uppercase tracking-widest hidden md:block">Business Volume</p>
                            <h3 className="text-[10px] md:text-xs font-black text-white uppercase truncate">Team Performance Value</h3>
                        </div>
                    </div>
                    <div className="text-right md:text-left relative z-10 shrink-0">
                        <p className="text-lg md:text-xl font-black text-white tracking-tighter leading-none">
                            {formatCurrency(
                                (stats?.qr_onboard_count || 0) * (stats?.default_signup_amount || 170) + 
                                (stats?.loan_disbursed_count || 0) * (stats?.admin_loan_commission || 550)
                            )}
                        </p>
                        <p className="text-[8px] font-bold text-indigo-200/40 uppercase tracking-widest hidden md:block mt-0.5">Gross Team Revenue</p>
                    </div>
                </div>`);

data = data.replace(`{/* Card 2: QR & ONBOARDING EARNING */}
                <div className="bg-rose-600 p-4 rounded-xl shadow-xl shadow-rose-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-col justify-between" onClick={() => router.push('/history/qr')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                                <Users size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-rose-100/60 uppercase tracking-widest">Referral</p>
                                <h3 className="text-xs font-black text-white leading-none uppercase">QR & ONBOARDING</h3>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-white/60">
                               {stats?.qr_onboard_count || 0} Items
                           </p>
                        </div>
                    </div>
                    <div className="mb-0 mt-auto">
                        <p className="text-[9px] font-bold text-rose-100/60 uppercase tracking-widest mb-0.5">Your Margin (Net)</p>
                        <p className="text-xl font-black text-white tracking-tighter mb-1 leading-none">
                            {formatCurrency((stats?.qr_verified_earning || 0) + (stats?.qr_unverified_earning || 0))}
                        </p>
                        <div className="flex gap-2 text-[9px] font-black">
                            <div className="bg-emerald-500/20 text-emerald-50 px-2 py-1.5 rounded border border-emerald-500/20 flex-1">
                                <span className="block text-emerald-200/80 text-[8px] uppercase tracking-wider mb-0.5">Confirmed</span>
                                {formatCurrency(stats?.qr_verified_earning || 0)}
                            </div>
                            <div className="bg-amber-500/20 text-amber-50 px-2 py-1.5 rounded border border-amber-500/20 flex-1">
                                <span className="block text-amber-200/80 text-[8px] uppercase tracking-wider mb-0.5">Pending</span>
                                {formatCurrency(stats?.qr_unverified_earning || 0)}
                            </div>
                        </div>
                    </div>
                </div>`, `{/* Card 2: QR & ONBOARDING EARNING */}
                <div className="bg-rose-600 p-3.5 md:p-4 rounded-xl shadow-xl shadow-rose-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-col justify-between" onClick={() => router.push('/history/qr')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20 md:block hidden" />
                    <div className="flex items-center justify-between md:mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                                <Users className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-rose-100/60 uppercase tracking-widest hidden md:block">Referral</p>
                                <h3 className="text-[10px] md:text-xs font-black text-white uppercase">QR & ONBOARDING <span className="md:hidden text-white/60">({stats?.qr_onboard_count || 0})</span></h3>
                            </div>
                        </div>
                        <div className="text-right md:text-right">
                           <p className="text-[10px] font-black text-white/60 hidden md:block">
                               {stats?.qr_onboard_count || 0} Items
                           </p>
                           <p className="text-lg md:text-xl font-black text-white tracking-tighter leading-none md:hidden">
                               {formatCurrency((stats?.qr_verified_earning || 0) + (stats?.qr_unverified_earning || 0))}
                           </p>
                        </div>
                    </div>
                    <div className="mb-0 mt-2 md:mt-auto">
                        <p className="text-[9px] font-bold text-rose-100/60 uppercase tracking-widest mb-0.5 hidden md:block">Your Margin (Net)</p>
                        <p className="text-xl font-black text-white tracking-tighter mb-1 leading-none hidden md:block">
                            {formatCurrency((stats?.qr_verified_earning || 0) + (stats?.qr_unverified_earning || 0))}
                        </p>
                        <div className="flex gap-2 text-[9px] font-black">
                            <div className="bg-emerald-500/20 text-emerald-50 px-2 flex flex-row items-center justify-between md:flex-col md:items-start py-1 md:py-1.5 rounded border border-emerald-500/20 flex-1">
                                <span className="block text-emerald-200/80 text-[8px] uppercase tracking-wider md:mb-0.5">Approved</span>
                                <span>{formatCurrency(stats?.qr_verified_earning || 0)}</span>
                            </div>
                            <div className="bg-amber-500/20 text-amber-50 px-2 flex flex-row items-center justify-between md:flex-col md:items-start py-1 md:py-1.5 rounded border border-amber-500/20 flex-1">
                                <span className="block text-amber-200/80 text-[8px] uppercase tracking-wider md:mb-0.5">Pending</span>
                                <span>{formatCurrency(stats?.qr_unverified_earning || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>`);

data = data.replace(`{/* Card 3: Loan Successful Earning */}
                <div className="bg-emerald-600 p-4 rounded-xl shadow-xl shadow-emerald-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-col justify-between" onClick={() => router.push('/history/loan')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-emerald-100/60 uppercase tracking-widest">Disbursement</p>
                                <h3 className="text-[10px] font-black text-white leading-none uppercase">Virtual Credit Successful</h3>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-white/60">
                               {stats?.loan_disbursed_count || 0} Loans
                           </p>
                        </div>
                    </div>
                    <div className="mb-0 mt-auto">
                        <p className="text-[9px] font-bold text-emerald-100/60 uppercase tracking-widest mb-0.5">Your Margin (Net)</p>
                        <p className="text-xl font-black text-white tracking-tighter mb-1 leading-none">
                            {formatCurrency((stats?.loan_verified_earning || 0) + (stats?.loan_unverified_earning || 0))}
                        </p>
                        <div className="flex gap-2 text-[9px] font-black">
                            <div className="bg-emerald-500/40 text-emerald-50 px-2 py-1.5 rounded border border-emerald-500/20 flex-1">
                                <span className="block text-emerald-100/80 text-[8px] uppercase tracking-wider mb-0.5">Confirmed</span>
                                {formatCurrency(stats?.loan_verified_earning || 0)}
                            </div>
                            <div className="bg-amber-500/40 text-amber-50 px-2 py-1.5 rounded border border-amber-500/20 flex-1">
                                <span className="block text-amber-200/80 text-[8px] uppercase tracking-wider mb-0.5">Pending</span>
                                {formatCurrency(stats?.loan_unverified_earning || 0)}
                            </div>
                        </div>
                    </div>
                </div>`, `{/* Card 3: Loan Successful Earning */}
                <div className="bg-emerald-600 p-3.5 md:p-4 rounded-xl shadow-xl shadow-emerald-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-col justify-between" onClick={() => router.push('/history/loan')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20 md:block hidden" />
                    <div className="flex items-center justify-between md:mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                                <ShieldCheck className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-emerald-100/60 uppercase tracking-widest hidden md:block">Disbursement</p>
                                <h3 className="text-[10px] md:text-xs font-black text-white uppercase">V-Credit Margin <span className="md:hidden text-white/60">({stats?.loan_disbursed_count || 0})</span></h3>
                            </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-white/60 hidden md:block">
                               {stats?.loan_disbursed_count || 0} Loans
                           </p>
                           <p className="text-lg md:text-xl font-black text-white tracking-tighter leading-none md:hidden">
                               {formatCurrency((stats?.loan_verified_earning || 0) + (stats?.loan_unverified_earning || 0))}
                           </p>
                        </div>
                    </div>
                    <div className="mb-0 mt-2 md:mt-auto">
                        <p className="text-[9px] font-bold text-emerald-100/60 uppercase tracking-widest mb-0.5 hidden md:block">Your Margin (Net)</p>
                        <p className="text-xl font-black text-white tracking-tighter mb-1 leading-none hidden md:block">
                            {formatCurrency((stats?.loan_verified_earning || 0) + (stats?.loan_unverified_earning || 0))}
                        </p>
                        <div className="flex gap-2 text-[9px] font-black">
                            <div className="bg-emerald-500/40 text-emerald-50 px-2 flex flex-row items-center justify-between md:flex-col md:items-start py-1 md:py-1.5 rounded border border-emerald-500/20 flex-1">
                                <span className="block text-emerald-100/80 text-[8px] uppercase tracking-wider md:mb-0.5">Approved</span>
                                <span>{formatCurrency(stats?.loan_verified_earning || 0)}</span>
                            </div>
                            <div className="bg-amber-500/40 text-amber-50 px-2 flex flex-row items-center justify-between md:flex-col md:items-start py-1 md:py-1.5 rounded border border-amber-500/20 flex-1">
                                <span className="block text-amber-200/80 text-[8px] uppercase tracking-wider md:mb-0.5">Pending</span>
                                <span>{formatCurrency(stats?.loan_unverified_earning || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>`);

data = data.replace(`{/* Card 4: Team Earning */}
                <div className="bg-amber-600 p-4 rounded-xl shadow-xl shadow-amber-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer" onClick={() => router.push('/agent-commissions')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20" />
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                            <Activity size={18} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-amber-100/60 uppercase tracking-widest">Hierarchy Revenue</p>
                            <h3 className="text-xs font-black text-white leading-none uppercase">Team Earnings</h3>
                        </div>
                    </div>
                    <div className="mb-0">
                        <p className="text-xl font-black text-white tracking-tighter">
                            {formatCurrency(stats?.field_agent_earning || 0)}
                        </p>
                        <p className="text-[8px] font-bold text-amber-100/40 uppercase tracking-widest">Agents & Vendors</p>
                    </div>
                </div>`, `{/* Card 4: Team Earning */}
                <div className="bg-amber-600 p-3.5 md:p-4 rounded-xl shadow-xl shadow-amber-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-row items-center justify-between md:flex-col md:items-start" onClick={() => router.push('/agent-commissions')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20 md:block hidden" />
                    <div className="flex items-center gap-3 md:mb-3 relative z-10 w-full md:w-auto overflow-hidden pr-2">
                        <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                            <Activity className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </div>
                        <div className="truncate">
                            <p className="text-[8px] font-black text-amber-100/60 uppercase tracking-widest hidden md:block">Hierarchy Revenue</p>
                            <h3 className="text-[10px] md:text-xs font-black text-white uppercase truncate">Team Earnings</h3>
                        </div>
                    </div>
                    <div className="text-right md:text-left relative z-10 shrink-0">
                        <p className="text-lg md:text-xl font-black text-white tracking-tighter leading-none">
                            {formatCurrency(stats?.field_agent_earning || 0)}
                        </p>
                        <p className="text-[8px] font-bold text-amber-100/40 uppercase tracking-widest hidden md:block mt-0.5">Agents & Vendors</p>
                    </div>
                </div>`);

data = data.replace(`{/* Team Card */}
                <div className="bg-indigo-600 p-4 rounded-xl shadow-xl shadow-indigo-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer" onClick={() => router.push('/users')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                            <Users size={16} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-indigo-100/60 uppercase tracking-widest leading-none">Hierarchy</p>
                            <h3 className="text-[11px] font-black text-white uppercase mt-0.5">Team Overview</h3>
                        </div>
                    </div>
                    <div className="mb-0">
                        <div className="flex items-baseline gap-2">
                            <p className="text-xl font-black text-white tracking-tighter">
                                {stats?.total_agents || 0}
                            </p>
                            <span className="text-[10px] font-bold text-indigo-200/60 uppercase">Agents</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 border-t border-white/10 pt-1.5">
                            <span className="text-[11px] font-black text-white">{stats?.total_vendors || 0}</span>
                            <span className="text-[11px] font-bold text-indigo-200/60 uppercase tracking-widest">Child Vendors</span>
                        </div>
                    </div>
                </div>`, `{/* Team Card */}
                <div className="bg-indigo-600 p-3.5 md:p-4 rounded-xl shadow-xl shadow-indigo-900/20 hover:shadow-2xl transition-all group relative overflow-hidden text-white hover:cursor-pointer flex flex-row items-center justify-between md:flex-col md:items-start" onClick={() => router.push('/users')}>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-2xl opacity-20 md:block hidden" />
                    <div className="flex items-center gap-3 md:mb-3 relative z-10 w-full md:w-auto overflow-hidden pr-2">
                        <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/5">
                            <Users className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                        </div>
                        <div className="truncate">
                            <p className="text-[8px] font-black text-indigo-100/60 uppercase tracking-widest hidden md:block">Hierarchy</p>
                            <h3 className="text-[10px] md:text-xs font-black text-white uppercase truncate">Team Overview</h3>
                        </div>
                    </div>
                    <div className="text-right md:text-left relative z-10 shrink-0">
                        <div className="flex items-center justify-end md:justify-start gap-1">
                            <span className="text-lg md:text-xl font-black text-white tracking-tighter mb-0 mr-2 leading-none md:mr-0">{stats?.total_agents || 0}</span>
                            <span className="text-[9px] font-bold text-indigo-200/60 uppercase hidden md:inline">Agents</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:mt-1 md:border-t border-white/10 md:pt-1.5 justify-end md:justify-start">
                            <span className="text-[10px] md:text-[11px] font-black text-white leading-none">{stats?.total_vendors || 0}</span>
                            <span className="text-[9px] font-bold text-indigo-200/60 uppercase tracking-widest leading-none">Vendors</span>
                        </div>
                    </div>
                </div>`);

fs.writeFileSync(filePath, data);

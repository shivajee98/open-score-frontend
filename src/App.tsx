import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import RootLayout from './layouts/RootLayout';
import CustomerLayout from './layouts/CustomerLayout';

import LandingPage from './pages/LandingPage';
import CustomerHome from './pages/CustomerHome';
import AddMoney from './pages/customer/AddMoney';
import Profile from './pages/customer/Profile';
import Repayments from './pages/customer/Repayments';
import LoanApply from './pages/customer/loan/Apply';
import LoanHistory from './pages/customer/loan/History';
import Onboarding from './pages/auth/Onboarding';
import Notifications from './pages/customer/Notifications';
import Pay from './pages/customer/Pay';
import Payout from './pages/customer/Payout';
import QR from './pages/customer/QR';
import Referral from './pages/customer/Referral';
import ReferralsList from './pages/customer/ReferralsList';
import Rewards from './pages/customer/Rewards';
import Support from './pages/customer/Support';
import Transactions from './pages/customer/Transactions';
import LoanBusiness from './pages/customer/loan/Business';
import LoanAmountDetail from './pages/customer/loan/AmountDetail';
import LoanStatusDetail from './pages/customer/loan/StatusDetail';
import LoanStatusRepayment from './pages/customer/loan/StatusRepayment';
import MerchantSearch from './pages/merchants/Search';
import MerchantDetail from './pages/merchants/Detail';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />

          <Route path="/auth">
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerHome />} />
            <Route path="add-money" element={<AddMoney />} />
            <Route path="profile" element={<Profile />} />
            <Route path="repayments" element={<Repayments />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="pay" element={<Pay />} />
            <Route path="payout" element={<Payout />} />
            <Route path="qr" element={<QR />} />
            <Route path="referral" element={<Referral />} />
            <Route path="referrals" element={<ReferralsList />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="support" element={<Support />} />
            <Route path="transactions" element={<Transactions />} />

            <Route path="loan">
              <Route path="apply" element={<LoanApply />} />
              <Route path="history" element={<LoanHistory />} />
              <Route path="business" element={<LoanBusiness />} />
              <Route path=":amount" element={<LoanAmountDetail />} />
              <Route path="status/:id">
                <Route index element={<LoanStatusDetail />} />
                <Route path="repayment" element={<LoanStatusRepayment />} />
              </Route>
            </Route>
          </Route>

          <Route path="/merchants">
            <Route path="search" element={<MerchantSearch />} />
            <Route path=":id" element={<MerchantDetail />} />
          </Route>

          <Route path="/admin/*" element={
            <AuthGuard allowedRoles={['ADMIN']}>
              <div>Admin Dashboard (WIP)</div>
            </AuthGuard>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

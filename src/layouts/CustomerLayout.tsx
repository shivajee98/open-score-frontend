import React from 'react';
import AuthGuard from '../components/AuthGuard';
import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <AuthGuard allowedRoles={['CUSTOMER']}>
      <Outlet />
    </AuthGuard>
  );
}

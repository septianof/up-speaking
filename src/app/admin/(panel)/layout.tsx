import React from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'Admin Portal — Up Speaking Learning Centre',
  description: 'Panel pengelolaan hasil tes penempatan, bank soal, dan pengaturan sistem Up Speaking',
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

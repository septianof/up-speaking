import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Evaluator Tutor — Up Speaking Learning Centre',
  description: 'Antrean evaluasi performa placement test dan penetapan level kelas resmi oleh Tutor Up Speaking',
};

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#f8fafc]">{children}</div>;
}

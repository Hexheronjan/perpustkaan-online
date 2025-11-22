// src/app/staf/layout.jsx
import StafLayout from '@/components/staf/StafLayout';

export const metadata = {
  title: 'Staf Panel - Perpustakaan',
  description: 'Panel manajemen untuk staf perpustakaan',
};

export default function StafLayoutWrapper({ children }) {
  return <StafLayout>{children}</StafLayout>;
}
import Sidebar from '@/components/layout/Sidebar';

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <main className="ml-72">{children}</main>
    </div>
  );
}

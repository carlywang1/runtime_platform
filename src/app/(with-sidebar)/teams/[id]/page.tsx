'use client';
import TeamDetail from '@/views/TeamDetail';
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <TeamDetail params={params} />;
}

'use client';
import AgentRun from '@/views/AgentRun';
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <AgentRun params={params} />;
}

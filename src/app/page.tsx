// The main concierge view is an interactive client-side app
// We use a thin server page that simply renders the client component
import { ConciergeApp } from '@/components/ConciergeApp';

export default function Home() {
  return <ConciergeApp />;
}

import { DashboardMetrics } from '@/components/dashboard/metrics';
import { WelcomeHero } from '@/components/dashboard/welcome-hero';
import { UpcomingActivities } from '@/components/dashboard/upcoming-activities';

export default function Home() {
  return (
    <div className="space-y-8">
      <WelcomeHero />
      <DashboardMetrics />
      <UpcomingActivities />
    </div>
  );
}
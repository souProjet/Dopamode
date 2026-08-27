import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';

export default function GenerationQuetesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pt-[4.75rem] sm:pt-24">{children}</div>
      <SiteFooter />
    </div>
  );
}

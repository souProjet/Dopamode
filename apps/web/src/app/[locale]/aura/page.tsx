import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AuraProfilePage } from '@/components/aura/AuraProfilePage';
import { Navbar } from '@/components/Navbar';
import { SiteFooter } from '@/components/SiteFooter';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: isEn ? 'Visual Aura Profile — How colors evolve with your personality | Questia' : 'Profil Aura Visuelle — Comment les couleurs évoluent avec ta personnalité | Questia',
    description: isEn
      ? 'Discover how Questia adapts its visual atmosphere to your Big Five personality. Try the interactive simulator with all 7 axes.'
      : 'Découvre comment Questia adapte son ambiance visuelle à ta personnalité Big Five. Essaie le simulateur interactif avec les 7 axes.',
    robots: { index: true, follow: true },
    openGraph: {
      title: isEn ? 'Visual Aura Profile | Questia' : 'Profil Aura Visuelle | Questia',
      description: isEn
        ? 'Your personality shapes the colors around your quest.'
        : 'Ta personnalité façonne les couleurs autour de ta quête.',
    },
  };
}

export default async function AuraPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEn = locale === 'en';
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-[4.75rem] outline-none sm:pt-24">
        <AuraProfilePage locale={isEn ? 'en' : 'fr'} />
      </main>
      <SiteFooter />
    </div>
  );
}

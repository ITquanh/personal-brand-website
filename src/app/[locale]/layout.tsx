import { ThemeProvider } from '@/contexts/ThemeContext';
import { i18n, type Locale } from '@/lib/i18n';
import { generateWebsiteJsonLd, generatePersonJsonLd } from '@/lib/seo';
import AnalyticsTracker from '@/components/layout/AnalyticsTracker';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const websiteJsonLd = generateWebsiteJsonLd(locale);
  const personJsonLd = generatePersonJsonLd();

  return (
    <ThemeProvider>
      <AnalyticsTracker />
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd),
        }}
      />
      {children}
    </ThemeProvider>
  );
}

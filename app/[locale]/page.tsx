import { setRequestLocale } from "next-intl/server";
import { AmbientBg } from "@/components/landing/ambient-bg";
import { Hero } from "@/components/landing/hero";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <AmbientBg />
      <Hero />
    </>
  );
}

import { setRequestLocale, getTranslations } from "next-intl/server";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolPanel } from "@/components/tools/tool-panel";
import { ConverterClient } from "@/components/tools/converter-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ConverterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "converter" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <ToolPageShell>
      <div className="mx-auto max-w-2xl">
        <ToolHeader
          title={t("title")}
          subtitle={t("subtitle")}
          backLabel={common("back")}
          code="// MODULE · CV_02"
        />
        <ToolPanel>
          <ConverterClient />
        </ToolPanel>
      </div>
    </ToolPageShell>
  );
}

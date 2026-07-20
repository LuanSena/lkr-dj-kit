import { setRequestLocale, getTranslations } from "next-intl/server";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolPanel } from "@/components/tools/tool-panel";
import { DownloaderForm } from "@/components/tools/downloader-form";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DownloaderPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloader" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <ToolPageShell>
      <div className="mx-auto max-w-2xl">
        <ToolHeader
          title={t("title")}
          subtitle={t("subtitle")}
          backLabel={common("back")}
          code="// MODULE · DL_01"
        />
        <ToolPanel>
          <DownloaderForm />
        </ToolPanel>
      </div>
    </ToolPageShell>
  );
}

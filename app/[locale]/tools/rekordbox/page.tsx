"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Music2, FileCode2, LayoutList, FolderTree, Activity } from "lucide-react";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EqualizerSVG } from "@/components/animations/equalizer-svg";

const roadmapItems = [
  { key: "xml" as const, icon: FileCode2 },
  { key: "structure" as const, icon: LayoutList },
  { key: "crates" as const, icon: FolderTree },
  { key: "bpm" as const, icon: Activity },
];

export default function RekordboxPage() {
  const t = useTranslations("rekordbox");

  return (
    <section className="py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600/20 to-violet-600/20 border border-white/10">
            <Music2 className="h-10 w-10 text-pink-400" />
          </div>

          <Badge variant="coming" className="mb-4">
            {t("badge")}
          </Badge>

          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-white/60">{t("subtitle")}</p>

          <p className="mx-auto mt-6 max-w-2xl text-white/50 leading-relaxed">
            {t("description")}
          </p>

          <EqualizerSVG className="mx-auto mt-10 h-16 w-32 opacity-60" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="font-display text-xl font-semibold mb-6">
            {t("roadmap.title")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {roadmapItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="text-left transition-all hover:border-pink-500/20">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="rounded-xl bg-pink-500/10 p-3 text-pink-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{t(`roadmap.${item.key}`)}</span>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <p className="text-white/50 mb-4">{t("notify")}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="mailto:contact@lkrdjtools.com">
              <Button variant="outline">{t("notifyCta")}</Button>
            </a>
            <Link href="/">
              <Button variant="secondary">{t("backHome")}</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

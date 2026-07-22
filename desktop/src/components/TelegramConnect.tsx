import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ExternalLink, LogOut, ArrowLeft } from "lucide-react";
import { NeonButton } from "@/components/ui/NeonButton";
import { getDesktopApi } from "@/types/ipc";
import type { TelegramStatus } from "@/types/ipc";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

type Step = "idle" | "creds" | "code" | "password" | "done";

type Props = {
  locale: Locale;
  onConnectedChange?: (connected: boolean) => void;
  autoStart?: boolean;
};

export function TelegramConnect({ locale, onConnectedChange, autoStart }: Props) {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDesktopApi()
      .telegramStatus()
      .then((s) => {
        setStatus(s);
        onConnectedChange?.(s.connected);
        if (!s.connected && autoStart) setStep("creds");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = status?.firstName || status?.username || status?.phone || "";

  const startLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await getDesktopApi().telegramStartLogin({
        apiId: Number(apiId.trim()),
        apiHash: apiHash.trim(),
        phone: phone.trim(),
      });
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : t(locale, "telegram.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await getDesktopApi().telegramSubmitCode(code.trim());
      if ("needsPassword" in res) {
        setStep("password");
      } else if ("connected" in res) {
        finishConnected(res);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t(locale, "telegram.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await getDesktopApi().telegramSubmitPassword(password);
      if ("connected" in res) finishConnected(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : t(locale, "telegram.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  const finishConnected = (s: TelegramStatus) => {
    setStatus(s);
    setStep("done");
    setCode("");
    setPassword("");
    onConnectedChange?.(true);
  };

  const disconnect = async () => {
    setLoading(true);
    await getDesktopApi().telegramLogout();
    setStatus({ connected: false });
    setStep("idle");
    setApiId("");
    setApiHash("");
    setPhone("");
    onConnectedChange?.(false);
    setLoading(false);
  };

  const connected = status?.connected || step === "done";

  return (
    <section className="space-y-4 rounded-2xl border border-white/8 bg-black/25 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500">
          <Send className="h-5 w-5 text-black/80" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-white">{t(locale, "telegram.title")}</h3>
          <p className="truncate text-xs text-white/45">
            {connected
              ? t(locale, "telegram.connectedAs").replace("{name}", label || "Telegram")
              : t(locale, "telegram.subtitle")}
          </p>
        </div>
        <span
          className={
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider " +
            (connected
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-white/8 text-white/40")
          }
        >
          {connected ? t(locale, "telegram.connected") : t(locale, "telegram.notConnected")}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {connected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={disconnect}
              disabled={loading}
              className="inline-flex items-center gap-2 text-sm text-white/45 transition-colors hover:text-red-300 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {t(locale, "telegram.disconnect")}
            </button>
          </motion.div>
        ) : step === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-sm leading-relaxed text-white/50">{t(locale, "telegram.why")}</p>
            <NeonButton variant="cyan" icon={<Send className="h-4 w-4" />} onClick={() => setStep("creds")}>
              {t(locale, "telegram.connect")}
            </NeonButton>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-4"
          >
            <Stepper step={step} />

            {step === "creds" && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t(locale, "telegram.step1Title")}</h4>
                  <p className="mt-1 text-xs text-white/45">{t(locale, "telegram.step1Desc")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => getDesktopApi().openExternal("https://my.telegram.org/apps")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t(locale, "telegram.getCredentials")}
                </button>
                <Field label={t(locale, "telegram.apiId")} value={apiId} onChange={setApiId} placeholder="1234567" />
                <Field label={t(locale, "telegram.apiHash")} value={apiHash} onChange={setApiHash} placeholder="a1b2c3d4..." />
                <Field
                  label={t(locale, "telegram.phone")}
                  value={phone}
                  onChange={setPhone}
                  placeholder={t(locale, "telegram.phonePlaceholder")}
                />
                <Actions
                  locale={locale}
                  onBack={() => setStep("idle")}
                  onNext={startLogin}
                  loading={loading}
                  loadingLabel={t(locale, "telegram.sending")}
                  disabled={!apiId.trim() || !apiHash.trim() || !phone.trim()}
                />
              </div>
            )}

            {step === "code" && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t(locale, "telegram.step2Title")}</h4>
                  <p className="mt-1 text-xs text-white/45">{t(locale, "telegram.step2Desc")}</p>
                </div>
                <Field
                  label={t(locale, "telegram.code")}
                  value={code}
                  onChange={setCode}
                  placeholder="12345"
                  mono
                />
                <Actions
                  locale={locale}
                  onBack={() => setStep("creds")}
                  onNext={submitCode}
                  loading={loading}
                  loadingLabel={t(locale, "telegram.verifying")}
                  disabled={!code.trim()}
                />
              </div>
            )}

            {step === "password" && (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t(locale, "telegram.step3Title")}</h4>
                  <p className="mt-1 text-xs text-white/45">{t(locale, "telegram.step3Desc")}</p>
                </div>
                <Field
                  label={t(locale, "telegram.password")}
                  value={password}
                  onChange={setPassword}
                  type="password"
                />
                <Actions
                  locale={locale}
                  onBack={() => setStep("code")}
                  onNext={submitPassword}
                  loading={loading}
                  loadingLabel={t(locale, "telegram.verifying")}
                  disabled={!password}
                />
              </div>
            )}

            {error && <p className="text-sm text-red-300/90">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ["creds", "code", "password"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center gap-2">
      {order.map((s, i) => (
        <div
          key={s}
          className={
            "h-1 flex-1 rounded-full transition-colors " +
            (i <= idx ? "bg-gradient-to-r from-cyan-400 to-violet-500" : "bg-white/10")
          }
        />
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field"
        style={mono ? { letterSpacing: "0.3em" } : undefined}
      />
    </label>
  );
}

function Actions({
  locale,
  onBack,
  onNext,
  loading,
  loadingLabel,
  disabled,
}: {
  locale: Locale;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  loadingLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-40"
      >
        <ArrowLeft className="h-4 w-4" />
        {t(locale, "telegram.back")}
      </button>
      <div className="flex-1">
        <NeonButton variant="primary" onClick={onNext} disabled={loading || disabled}>
          {loading ? loadingLabel : t(locale, "telegram.continue")}
        </NeonButton>
      </div>
    </div>
  );
}

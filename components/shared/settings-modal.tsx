"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store/user";
import { useI18n } from "@/lib/store/i18n";
import type { Language } from "@/lib/store/i18n";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const profile = useUser((s) => s.profile);
  const signOut = useUser((s) => s.signOut);
  const changePassword = useUser((s) => s.changePassword);
  const { language, setLanguage, t } = useI18n();

  const [activeTab, setActiveTab] = useState<"account" | "preferences">("account");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: t("settings.passwords_dont_match") });
      return;
    }
    const success = await changePassword(newPassword);
    if (success) {
      setPasswordMessage({ type: "success", text: t("settings.password_updated") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
    onClose();
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("settings.title")}</h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-2xl leading-none"
            aria-label={t("common.close")}
          >
            X
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition ${
              activeTab === "account"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t("settings.account_settings")}
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex-1 py-4 px-6 font-medium text-center border-b-2 transition ${
              activeTab === "preferences"
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t("settings.preferences")}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === "account" && (
            <>
              {/* Email Section */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  {t("settings.email_label")}
                </label>
                <div className="bg-surface rounded-lg p-4 text-ink border border-border">
                  {profile.email}
                </div>
              </div>

              {/* Password Change Section */}
              <div>
                <h3 className="font-semibold text-ink mb-4">{t("settings.change_password")}</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <input
                    type="password"
                    placeholder={t("settings.current_password")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder={t("settings.new_password")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder={t("settings.confirm_password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="w-full btn-primary"
                  >
                    {t("common.save")}
                  </button>
                </form>
                {passwordMessage && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}
              </div>

              {/* Logout Section */}
              <div className="border-t border-border pt-6">
                {showLogoutConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-muted">{t("settings.logout_confirmation")}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 btn-secondary"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex-1 bg-error text-white rounded-lg px-4 py-2 font-medium hover:bg-red-600 transition"
                      >
                        {t("settings.confirm")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full bg-error/10 text-error rounded-lg px-4 py-3 font-medium hover:bg-error/20 transition border border-error/20"
                  >
                    {t("settings.logout_button")}
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === "preferences" && (
            <>
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-ink mb-4">
                  {t("settings.language_label")}
                </label>
                <div className="space-y-2">
                  {(["en", "es"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`w-full p-4 rounded-lg border-2 text-left font-medium transition ${
                        language === lang
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 text-ink"
                      }`}
                    >
                      {lang === "en" ? t("settings.english") : t("settings.spanish")}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

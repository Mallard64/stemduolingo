"use client";
import { ChangeEvent, FormEvent, PointerEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store/user";
import { useI18n } from "@/lib/store/i18n";
import type { Language } from "@/lib/store/i18n";

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const profile = useUser((s) => s.profile);
  const updateProfileDetails = useUser((s) => s.updateProfileDetails);
  const signOut = useUser((s) => s.signOut);
  const changePassword = useUser((s) => s.changePassword);
  const themeMode = useUser((s) => s.themeMode);
  const setThemeMode = useUser((s) => s.setThemeMode);
  const { language, setLanguage, t } = useI18n();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">("profile");
  const [draftUsername, setDraftUsername] = useState("");
  const [draftLanguage, setDraftLanguage] = useState<Language>("en");
  const [draftThemeMode, setDraftThemeMode] = useState<"light" | "dark">("light");
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen || !profile) return;
    setActiveTab("profile");
    setDraftUsername(profile.username);
    setDraftLanguage(language);
    setDraftThemeMode(themeMode);
    setSourcePreview(null);
    setCropX(50);
    setCropY(50);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setProfileMessage(null);
    setPasswordMessage(null);
    setShowLogoutConfirm(false);
  }, [isOpen, language, profile, themeMode]);

  if (!isOpen || !profile) return null;

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSourcePreview(await readFileAsDataURL(file));
    setCropX(50);
    setCropY(50);
    event.target.value = "";
  }

  async function handleSave(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!profile) return;
    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;
    if (wantsPasswordChange) {
      if (!newPassword || newPassword !== confirmPassword) {
        setPasswordMessage({ type: "error", text: t("settings.passwords_dont_match") });
        return;
      }
      const success = await changePassword(newPassword);
      if (!success) return;
    }

    const nextImage = sourcePreview
      ? await cropToSquare(sourcePreview, cropX, cropY)
      : profile.profile_image_url ?? null;

    const result = updateProfileDetails({
      username: draftUsername.trim() || profile.username,
      profileImageUrl: nextImage,
    });
    if (!result.ok) {
      setProfileMessage(result.message ?? "Could not save profile changes.");
      return;
    }
    setLanguage(draftLanguage);
    setThemeMode(draftThemeMode);
    onClose();
  }

  function handleLogout() {
    signOut();
    router.replace("/");
    onClose();
  }

  function startCropDrag(event: PointerEvent<HTMLDivElement>) {
    if (!sourcePreview) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, cropX, cropY };
  }

  function moveCropDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setCropX(clamp(dragRef.current.cropX - (dx / rect.width) * 100));
    setCropY(clamp(dragRef.current.cropY - (dy / rect.height) * 100));
  }

  function endCropDrag() {
    dragRef.current = null;
  }

  const avatarImageUrl = sourcePreview ?? profile.profile_image_url ?? null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <form onSubmit={handleSave} className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-card border-b border-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-2xl leading-none"
            aria-label={t("common.close")}
          >
            X
          </button>
        </div>

        <div className="flex border-b border-border">
          {[
            ["profile", "Profile"],
            ["preferences", t("settings.preferences")],
          ].map(([tab, label]) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab as "profile" | "preferences")}
              className={`flex-1 py-4 px-3 text-sm font-medium text-center border-b-2 transition ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-6 space-y-6">
          {activeTab === "profile" && (
            <>
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="group relative size-32 overflow-hidden rounded-full border-2 border-border bg-surface"
                  aria-label={profile.profile_image_url ? "Change profile image" : "Add profile image"}
                >
                  {avatarImageUrl ? (
                    <img
                      src={avatarImageUrl}
                      alt=""
                      className="size-full object-cover"
                      style={sourcePreview ? { objectPosition: `${cropX}% ${cropY}%` } : undefined}
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-sm font-semibold text-ink-muted px-4">
                      Add photo
                    </span>
                  )}
                  <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {profile.profile_image_url ? "Change" : "Upload"}
                  </span>
                </button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

                {sourcePreview && (
                  <div className="mt-5 w-full">
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2">Adjust crop</div>
                    <div
                      className="relative mx-auto aspect-square w-full max-w-64 overflow-hidden rounded-xl border border-border bg-surface cursor-move touch-none"
                      onPointerDown={startCropDrag}
                      onPointerMove={moveCropDrag}
                      onPointerUp={endCropDrag}
                      onPointerCancel={endCropDrag}
                    >
                      <img
                        src={sourcePreview}
                        alt=""
                        className="size-full object-cover select-none"
                        style={{ objectPosition: `${cropX}% ${cropY}%` }}
                        draggable={false}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,transparent_49%,rgba(0,0,0,0.52)_50%,rgba(0,0,0,0.52)_100%)]" />
                      <div className="pointer-events-none absolute inset-[9%] rounded-full border-2 border-white/80" />
                    </div>
                  </div>
                )}
              </div>

              {sourcePreview && (
                <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
                  <div className="text-sm text-ink-muted">Drag the image preview to choose what stays in the circle.</div>
                  <button type="button" className="btn-secondary w-full px-4 py-2" onClick={() => setSourcePreview(null)}>
                    Cancel photo change
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <ProfileInput label="Username" value={draftUsername} onChange={setDraftUsername} />
                <ProfileField label="Email" value={profile.email || "No email set"} />
              </div>
              {profileMessage && (
                <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm font-medium text-error">
                  {profileMessage}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-ink mb-4">{t("settings.change_password")}</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder={t("settings.current_password")}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder={t("settings.new_password")}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="password"
                    placeholder={t("settings.confirm_password")}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {passwordMessage && (
                  <div
                    className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                      passwordMessage.type === "success"
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-error/10 text-error border border-error/30"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-6">
                {showLogoutConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm text-ink-muted">{t("settings.logout_confirmation")}</p>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowLogoutConfirm(false)} className="flex-1 btn-secondary">
                        {t("common.cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex-1 bg-error text-white rounded-lg px-4 py-2 font-medium hover:bg-error/80 transition"
                      >
                        {t("settings.confirm")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
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
              <div>
                <label className="block text-sm font-medium text-ink mb-4">{t("settings.language_label")}</label>
                <div className="space-y-2">
                  {(["en", "es"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setDraftLanguage(lang)}
                      className={`w-full p-4 rounded-lg border-2 text-left font-medium transition ${
                        draftLanguage === lang
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50 text-ink"
                      }`}
                    >
                      {lang === "en" ? t("settings.english") : t("settings.spanish")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-4">{t("settings.theme_label")}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["light", "dark"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDraftThemeMode(mode)}
                      className={`w-full p-4 rounded-xl border-2 text-sm font-medium transition ${
                        draftThemeMode === mode
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-surface text-ink hover:border-primary/50"
                      }`}
                    >
                      {mode === "light" ? t("settings.light_mode") : t("settings.dark_mode")}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="border-t border-border bg-card p-4">
          <button type="submit" className="btn-primary w-full">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-ink mb-2">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-surface p-4 text-ink focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-ink mb-2">{label}</div>
      <div className="rounded-lg border border-border bg-surface p-4 text-ink">{value}</div>
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function cropToSquare(source: string, cropX: number, cropY: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const sx = ((image.naturalWidth - size) * cropX) / 100;
      const sy = ((image.naturalHeight - size) * cropY) / 100;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not prepare image crop."));
        return;
      }
      context.drawImage(image, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = () => reject(new Error("Could not read image."));
    image.src = source;
  });
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

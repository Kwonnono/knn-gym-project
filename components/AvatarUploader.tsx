'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/Avatar';

export function AvatarUploader({
  userId,
  name,
  avatarUrl,
  changeLabel,
  uploadingLabel,
  errorImageTypeLabel
}: {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  changeLabel: string;
  uploadingLabel: string;
  errorImageTypeLabel: string;
}) {
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(errorImageTypeLabel);
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      cacheControl: '3600'
    });
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    if (updateError) {
      setError(updateError.message);
      setUploading(false);
      return;
    }

    setPreview(publicUrl);
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} avatarUrl={preview} size="lg" />
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {uploading ? uploadingLabel : changeLabel}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}

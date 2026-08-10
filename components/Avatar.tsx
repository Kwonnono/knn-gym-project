import { UserIcon } from '@/components/icons';

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  lg: 'h-16 w-16'
} as const;

const ICON_SIZE_CLASSES = {
  sm: 'h-5 w-5',
  lg: 'h-8 w-8'
} as const;

export function Avatar({
  name,
  avatarUrl,
  size = 'sm',
  className
}: {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  const sizeClass = SIZE_CLASSES[size];

  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover ${className ?? ''}`}
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${className ?? ''}`}
      aria-hidden="true"
    >
      <UserIcon className={ICON_SIZE_CLASSES[size]} />
    </span>
  );
}

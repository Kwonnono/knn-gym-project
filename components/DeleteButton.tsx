'use client';

export function DeleteButton({
  action,
  hiddenFields,
  confirmMessage,
  label,
  className
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenFields: Record<string, string>;
  confirmMessage: string;
  label: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

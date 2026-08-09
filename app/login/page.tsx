import { loginAction } from '@/app/actions';

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">로그인</h1>
      {message && <p className="rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">{message}</p>}
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={loginAction} className="space-y-3">
        <input name="email" type="email" placeholder="이메일" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        <input name="password" type="password" placeholder="비밀번호" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        <button type="submit" className="w-full rounded bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700">
          로그인
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        계정이 없으신가요? <a href="/signup" className="underline">회원가입</a>
      </p>
    </div>
  );
}

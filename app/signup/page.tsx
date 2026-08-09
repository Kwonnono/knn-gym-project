import { signupAction } from '@/app/actions';

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">회원가입</h1>
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={signupAction} className="space-y-3">
        <input name="name" placeholder="이름" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        <input name="email" type="email" placeholder="이메일" required className="w-full rounded border border-neutral-300 px-3 py-2" />
        <input name="password" type="password" placeholder="비밀번호 (8자 이상)" required minLength={8} className="w-full rounded border border-neutral-300 px-3 py-2" />
        <button type="submit" className="w-full rounded bg-neutral-900 px-3 py-2 text-white hover:bg-neutral-700">
          가입하기
        </button>
      </form>
      <p className="text-sm text-neutral-500">
        이미 계정이 있으신가요? <a href="/login" className="underline">로그인</a>
      </p>
    </div>
  );
}

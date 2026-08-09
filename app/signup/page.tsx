import { signupAction } from '@/app/actions';

const inputClass =
  'w-full rounded border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900';

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-5">
      <h1 className="font-display text-3xl tracking-wide">회원가입</h1>
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      <form action={signupAction} className="space-y-3">
        <input name="name" placeholder="이름 또는 닉네임" required className={inputClass} />
        <input name="email" type="email" placeholder="이메일" required className={inputClass} />
        <div>
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            minLength={8}
            maxLength={64}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            8자 이상 입력해주세요 (12자 이상 권장). 복잡한 특수문자 조합보다 길고 기억하기 쉬운 문장이 더 안전해요.
          </p>
        </div>
        <button
          type="submit"
          className="w-full rounded bg-black px-3 py-2 font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          가입하기
        </button>
      </form>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        이미 계정이 있으신가요? <a href="/login" className="underline">로그인</a>
      </p>
    </div>
  );
}

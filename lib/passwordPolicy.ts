export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

// NIST SP 800-63B는 조합 규칙보다 "알려진 유출 비밀번호 차단"을 권장합니다.
// 실제 서비스에서는 Have I Been Pwned API 등 실시간 유출 DB 대조가 이상적이지만,
// 여기서는 대표적으로 많이 쓰이는 취약 비밀번호를 최소한으로 차단합니다.
const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'letmein123',
  'admin1234',
  'iloveyou123',
  'welcome123',
  'abcd1234',
  '00000000',
  '11111111',
  '1q2w3e4r',
  'korea1234',
  'qwer1234',
  'asdf1234'
]);

export function validatePassword(password: string): { valid: true } | { valid: false; error: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.` };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, error: `비밀번호는 ${PASSWORD_MAX_LENGTH}자를 넘을 수 없습니다.` };
  }
  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, error: '너무 많이 사용된 비밀번호예요. 다른 비밀번호를 입력해주세요.' };
  }
  return { valid: true };
}

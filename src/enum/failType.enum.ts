// NOTE: {자원명}_{동사}로 작성
export enum FailType {
  PASSWORD_LENGTH_REQUIRE = '비밀번호는 10자 이상이여야 합니다.',
  PASSWORD_CHARACTER_REQUIRE = '비밀번호는 숫자, 문자, 특수문자 중 2가지 이상을 포함해야 합니다.',
  PASSWORD_DISALLOW_CONSECUTIVE = '비밀번호는 3회 이상 연속되는 문자 사용은 불가능합니다.',
  CONFIRM_PASSWORD_MISMATCH = '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
  USERNAME_EXIST = '이미 존재하는 계정입니다.',
  USERNAME_NOT_EXIST = '존재하지 않는 계정입니다.',
  PASSWORD_MISMATCH = '비밀번호가 일치하지 않습니다.',
  AUTH_INVALID_TOKEN = '유효하지 않은 토큰입니다.',
}

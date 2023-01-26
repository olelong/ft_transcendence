interface Login {
  tfaRequired: boolean;
  token?: string;
}
export type LoginRes = Promise<Login>;

interface LoginTfa {
  token: string;
}
export type LoginTfaRes = Promise<LoginTfa>;

interface Profile {
  name?: boolean;
  tfa?: string;
  ok?: boolean;
}
export type ProfileRes = Promise<Profile>;

interface ProfileTfa {
  valid: boolean;
}
export type ProfileTfaRes = Promise<ProfileTfa>;

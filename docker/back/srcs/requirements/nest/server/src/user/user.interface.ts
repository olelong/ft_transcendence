interface Login {
  tfaRequired: boolean;
  token?: string;
}
export type LoginRes = Promise<Login>;

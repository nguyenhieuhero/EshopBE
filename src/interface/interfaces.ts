export interface JWTPayloadParams {
  id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams extends SignInParams {
  fullname: string;
  address: string;
  phone: string;
}

export interface BasicUserInforParams {
  email: string;
  fullname: string;
  address: string;
  phone: string;
  role: string;
}

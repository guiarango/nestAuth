export interface JwtPayload {
  userDocument: string;
  isActive: boolean;
  roles: string[];
  areas: string[];
}

export interface JwtResponse {
  token: string;
  refreshTokenId: string;
}

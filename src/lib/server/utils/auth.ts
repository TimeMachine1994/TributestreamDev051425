import { getUserFromToken as _getUserFromJwt } from '$lib/server/auth/jwt';
export async function getUserFromJwt(token: string) {


  
  return _getUserFromJwt(token);
}
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { token } from 'src/configs';
import { ErrorHelper, TokenHelper } from 'src/utils';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization || String(req.cookies.JWT);
    const userInfo = await this.verifyAccessToken(authorization);
    req.user = userInfo;

    return true;
  }

  async verifyAccessToken(authorization: string) {
    const [bearer, accessToken] = authorization.split(' ');
    if (bearer === 'Bearer' && accessToken !== '') {
      const payload = TokenHelper.verify(accessToken, token.secretKey);
      return payload;
    } else {
      ErrorHelper.UnauthorizedException('Unauthorized');
    }
  }
}

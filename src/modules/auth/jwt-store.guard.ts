import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtStoreAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    storePayload: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !storePayload) {
      throw err || new UnauthorizedException('Token is not valid');
    }

    const req = context.switchToHttp().getRequest();
    req.store = {
      id: storePayload.id,
      email: storePayload.email,
    };

    return req.store;
  }
}

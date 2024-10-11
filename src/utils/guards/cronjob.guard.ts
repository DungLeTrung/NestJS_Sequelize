import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { application } from 'src/configs';

@Injectable()
export class CronjobGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();
    const hash = req.query.hash;
    return this.checkHashCronjob(hash);
  }

  async checkHashCronjob(hash: string) {
    if (hash === application.secretCronjob) {
      return true;
    }
    return false;
  }
}

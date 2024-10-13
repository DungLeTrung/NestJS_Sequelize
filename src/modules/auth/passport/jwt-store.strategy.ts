import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { accessTokenCode } from 'src/constants/enums/const';
import { Store } from 'src/database';
import { StoresService } from 'src/modules/stores';

@Injectable()
export class JwtStoreStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private storeService: StoresService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenCode, 
    });
  }

  async validate(payload: any): Promise<Store> {
    return this.storeService.findById(payload.sub);
  }
}

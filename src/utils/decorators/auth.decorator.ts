import { SetMetadata } from '@nestjs/common';
import { SPEC_KEY } from 'src/constants';
import { IAuthPermission } from 'src/interfaces';

export const Auth = (specs: IAuthPermission[]) => SetMetadata(SPEC_KEY, specs);

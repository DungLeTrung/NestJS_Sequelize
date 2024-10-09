import { EUserType } from 'src/constants';

export interface IAuthPermission {
  userType: EUserType;
  permission?: string;
}

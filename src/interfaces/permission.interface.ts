import { UserRole } from 'src/constants';

export interface IAuthPermission {
  userType: UserRole;
  permission?: string;
}

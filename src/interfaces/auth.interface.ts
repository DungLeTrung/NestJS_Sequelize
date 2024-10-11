import { IStore } from './store.interface';
import { IUser } from './user.interface';

export interface AuthUserResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface AuthStoreResponse {
  accessToken: string;
  refreshToken: string;
  store: IStore;
}

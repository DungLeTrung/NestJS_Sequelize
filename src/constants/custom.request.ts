import { Request } from 'express';
import { Store, User } from 'src/database';

export interface CustomRequest extends Request {
  user?: User
}

export interface CustomStoreRequest extends Request {
  store: Store
}

import { Request } from 'express';
import { User } from 'src/database';

export interface CustomRequest extends Request {
  user: User
}

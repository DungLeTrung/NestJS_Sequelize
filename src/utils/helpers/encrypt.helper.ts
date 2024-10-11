import * as bcrypt from 'bcrypt';

export class EncryptHelper {
  static async hash(str, saltRounds = 10): Promise<string> {
    return await bcrypt.hash(str, saltRounds);
  }
  static async compare(str, hash): Promise<boolean> {
    return await bcrypt.compare(str, hash);
  }
}

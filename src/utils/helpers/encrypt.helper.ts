import * as bcrypt from 'bcrypt';

export class EncryptHelper {
  static async hash(str, saltRounds = 10): Promise<string> {
    return await bcrypt.hash(str, saltRounds);
  }
  static compare(str, hash): boolean {
    return bcrypt.compare(str, hash);
  }
}

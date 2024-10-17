import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDTO {
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}

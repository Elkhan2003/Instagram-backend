import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
		message: 'Invalid token format'
	})
	readonly token: string;

	@IsString()
	@MinLength(8)
	readonly newPassword: string;
}

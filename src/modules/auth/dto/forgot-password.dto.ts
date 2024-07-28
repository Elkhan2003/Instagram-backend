import { IsString, IsNotEmpty, IsEmail, IsUrl, Matches } from 'class-validator';

export class ForgotPasswordDto {
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@Matches(/^https?:\/\/[^\/]+/, {
		message: 'frontEndUrl must be a URL address'
	})
	@IsString()
	@IsNotEmpty()
	readonly frontEndUrl: string;
}

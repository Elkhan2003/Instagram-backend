import {
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	IsUrl
} from 'class-validator';

export class ForgotPasswordDto {
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@IsUrl()
	@IsString()
	@IsNotEmpty()
	readonly frontEndUrl: string;
}

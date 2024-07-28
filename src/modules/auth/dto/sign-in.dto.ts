import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class SignInDto {
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@IsNotEmpty()
	readonly password: string;
}

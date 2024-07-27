import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class SignInDto {
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@MinLength(8)
	readonly password: string;
}

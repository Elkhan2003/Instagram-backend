import {
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	IsOptional,
	IsUrl
} from 'class-validator';

export class SignUpDto {
	// @IsEmail()
	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@MinLength(8)
	readonly password: string;

	@IsString()
	@IsNotEmpty()
	readonly username: string;

	// @IsUrl()
	@IsString()
	@IsNotEmpty()
	readonly photo: string;
}

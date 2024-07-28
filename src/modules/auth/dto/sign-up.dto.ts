import {
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	IsUrl,
	Matches
} from 'class-validator';

export class SignUpDto {
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@MinLength(8)
	readonly password: string;

	@IsString()
	@IsNotEmpty()
	readonly username: string;

	@Matches(/^https?:\/\/[^\/]+/, {
		message: 'photo must be a URL address'
	})
	@IsString()
	@IsNotEmpty()
	readonly photo: string;
}

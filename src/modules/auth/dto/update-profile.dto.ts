import {
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	IsUrl,
	Matches
} from 'class-validator';

export class UpdateProfileDto {
	@IsString()
	readonly username: string;

	@Matches(/^https?:\/\/[^\/]+/, {
		message: 'photo must be a URL address'
	})
	@IsString()
	readonly photo: string;
}

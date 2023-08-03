import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
export class SignInDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g)
  phone: string;
}

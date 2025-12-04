import { IsString, IsOptional, IsIn } from 'class-validator';
import { ROLES } from '../infrastructure/persistence/user.schema';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  identifiant?: string;

  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  prenom?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsIn(ROLES)
  @IsOptional()
  role?: string;
}

export class UpdatePasswordDto {
  @IsString()
  password: string;
}

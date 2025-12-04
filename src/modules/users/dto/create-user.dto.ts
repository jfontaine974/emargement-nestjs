import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ROLES } from '../infrastructure/persistence/user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  identifiant: string;

  @IsString()
  @IsNotEmpty()
  password: string;

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

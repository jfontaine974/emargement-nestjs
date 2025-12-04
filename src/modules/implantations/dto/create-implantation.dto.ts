import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class EcoleDto {
  @IsString()
  @IsNotEmpty()
  nom_etablissement: string;

  @IsString()
  @IsOptional()
  adresse_1?: string;

  @IsString()
  @IsOptional()
  adresse_2?: string;

  @IsString()
  @IsOptional()
  adresse_3?: string;

  @IsString()
  @IsNotEmpty()
  code_postal: string;

  @IsString()
  @IsNotEmpty()
  nom_commune: string;

  @IsString()
  @IsNotEmpty()
  identifiant_de_l_etablissement: string;
}

export class CreateImplantationDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsOptional()
  remarque?: string;

  @ValidateNested()
  @Type(() => EcoleDto)
  @IsNotEmpty()
  ecole: EcoleDto;
}

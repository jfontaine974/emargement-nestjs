import { PartialType } from '@nestjs/mapped-types';
import { CreateImplantationDto } from './create-implantation.dto';

export class UpdateImplantationDto extends PartialType(CreateImplantationDto) {}

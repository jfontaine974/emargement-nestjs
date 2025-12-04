import { Controller, Post, HttpCode } from '@nestjs/common';
import { TypeAccueilService } from './type-accueil.service';

@Controller('type-accueil')
export class TypeAccueilController {
  constructor(private readonly typeAccueilService: TypeAccueilService) {}

  @Post('list')
  @HttpCode(200)
  async list() {
    return this.typeAccueilService.listTypeAccueil();
  }
}

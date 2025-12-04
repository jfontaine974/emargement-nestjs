import { Controller, Post, HttpCode } from '@nestjs/common';
import { TypeActiviteService } from './type-activite.service';

@Controller('type-activite')
export class TypeActiviteController {
  constructor(private readonly typeActiviteService: TypeActiviteService) {}

  @Post('list')
  @HttpCode(200)
  async list() {
    return this.typeActiviteService.listTypeActivite();
  }
}

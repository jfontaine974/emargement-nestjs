import { Controller, Post, HttpCode } from '@nestjs/common';
import { PeriodeService } from './periode.service';

@Controller('periode')
export class PeriodeController {
  constructor(private readonly periodeService: PeriodeService) {}

  @Post('list')
  @HttpCode(200)
  async list() {
    return this.periodeService.listPeriode();
  }
}

import { Controller, Post, HttpCode } from '@nestjs/common';
import { TrancheAgeService } from './tranche-age.service';

@Controller('tranche-age')
export class TrancheAgeController {
  constructor(private readonly trancheAgeService: TrancheAgeService) {}

  @Post('list')
  @HttpCode(200)
  async list() {
    return this.trancheAgeService.listTrancheAge();
  }
}

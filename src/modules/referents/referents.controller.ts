import { Controller, Post, Put, Patch, Delete, Body, Param, HttpCode } from '@nestjs/common';
import { ReferentsService } from './referents.service';

@Controller('referents')
export class ReferentsController {
  constructor(private readonly referentsService: ReferentsService) {}

  @Post('list')
  @HttpCode(200)
  async list() {
    return this.referentsService.listReferents();
  }

  @Post('list/:date')
  @HttpCode(200)
  async listFromDate(@Param('date') date: string) {
    return this.referentsService.listReferentsFromDate(date);
  }

  @Put()
  @HttpCode(200)
  async create(@Body() body: any) {
    return this.referentsService.createReferent(body);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.referentsService.updateReferent(id, body);
  }

  @Patch(':id/disable')
  @HttpCode(200)
  async disable(@Param('id') id: string) {
    return this.referentsService.disableReferent(id);
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    return this.referentsService.deleteReferent(id);
  }
}

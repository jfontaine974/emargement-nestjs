import { Controller, Post, Put, Patch, Body, Param, HttpCode } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { LinkParentItem } from './domain/categorie.repository';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('list')
  @HttpCode(200)
  async list() {
    return this.categoriesService.listCategories();
  }

  @Post('list/:date')
  @HttpCode(200)
  async listFromDate(@Param('date') date: string) {
    return this.categoriesService.listCategoriesFromDate(date);
  }

  @Post('liaison/:date')
  @HttpCode(200)
  async listLiaisonsFromDate(@Param('date') date: string) {
    return this.categoriesService.listLiaisonsFromDate(date);
  }

  @Put()
  @HttpCode(200)
  async create(@Body() body: any) {
    delete body._id;
    return this.categoriesService.createCategorie(body);
  }

  @Put('updatelist')
  @HttpCode(200)
  async updateList(@Body() body: any[]) {
    return this.categoriesService.updateListCategories(body);
  }

  @Put('linkparent')
  @HttpCode(200)
  async linkParent(@Body() body: { list: LinkParentItem[] }) {
    return this.categoriesService.linkParent(body.list);
  }

  @Put(':id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.updateCategorie(id, body);
  }

  @Put(':id/duplicate')
  @HttpCode(200)
  async duplicate(@Param('id') id: string) {
    return this.categoriesService.duplicateCategorie(id);
  }

  @Patch(':id/disable')
  @HttpCode(200)
  async disable(@Param('id') id: string) {
    return this.categoriesService.disableCategorie(id);
  }

  @Patch(':id/enable')
  @HttpCode(200)
  async enable(@Param('id') id: string) {
    return this.categoriesService.enableCategorie(id);
  }

  @Patch(':id/tree')
  @HttpCode(200)
  async updateTree(@Param('id') id: string, @Body() body: { data: any; list_id: string[] }) {
    return this.categoriesService.updateTree(id, body.data, body.list_id);
  }

  @Post(':id/sub')
  @HttpCode(200)
  async getSubCategories(@Param('id') id: string) {
    return this.categoriesService.getSubCategories(id);
  }
}

import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../../shared/auth/auth.guard';
import { Roles } from '../../shared/auth/roles.decorator';
import { CreateImplantationDto } from './dto/create-implantation.dto';
import { UpdateImplantationDto } from './dto/update-implantation.dto';
import { ImplantationsService } from './implantations.service';

@Controller('implantations')
export class ImplantationsController {
  constructor(private readonly implantationsService: ImplantationsService) {}

  // PUT /implantations - Creer une nouvelle implantation
  @Put()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async createImplantation(@Body() dto: CreateImplantationDto, @Req() req: Request) {
    return this.implantationsService.createImplantation(dto, req.__user);
  }

  // POST /implantations/list - Liste des implantations
  @Post('list')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async listImplantations() {
    return this.implantationsService.listImplantations();
  }

  // POST /implantations/ecoles - Recuperer les ecoles
  @Post('ecoles')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async getEcoles() {
    return this.implantationsService.getEcoles();
  }

  // PUT /implantations/:id - Mettre a jour une implantation
  @Put(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async updateImplantation(
    @Param('id') id: string,
    @Body() dto: UpdateImplantationDto,
    @Req() req: Request,
  ) {
    return this.implantationsService.updateImplantation(id, dto, req.__user);
  }
}

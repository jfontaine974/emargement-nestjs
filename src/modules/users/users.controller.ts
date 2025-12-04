import {
  Body,
  Controller,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '../../shared/auth/auth.guard';
import { AuthService } from '../../shared/auth/auth.service';
import { Public, Roles } from '../../shared/auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  // PUT /users - Creer un nouvel utilisateur
  @Put()
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async signUp(@Body() dto: CreateUserDto, @Req() req: Request) {
    return this.usersService.signUp(dto, req.__user);
  }

  // POST /users/login - Connexion
  @Post('login')
  @HttpCode(200)
  @Public()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.usersService.login(dto);

    if (result.ret < 0) {
      return result;
    }

    // Formater la reponse comme dans Express
    const retFinal = {
      ret: 0,
      userId: result.userId,
      role: result.role,
      accessToken: result.accessToken,
      xsrfToken: result.xsrfToken,
      id_session: result.id_session,
    };

    if (!result.isMobileApp) {
      this.authService.setCookies(res, result.accessToken, result.refreshToken);
    }

    return retFinal;
  }

  // POST /users/list - Liste des utilisateurs
  @Post('list')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async listUsers() {
    return this.usersService.listUsers();
  }

  // POST /users/list/:date - Liste des utilisateurs depuis une date
  @Post('list/:date')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async listUsersFromDate(@Param('date') date: string) {
    return this.usersService.listUsersFromDate(date);
  }

  // POST /users/tokens - Revocation des tokens
  @Post('tokens')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV', 'OPER')
  async revokTokens(@Body() body: { user_id: string; id_device?: string }) {
    const result = await this.usersService.revokTokens(
      body.user_id,
      body.id_device,
    );

    if (result.ret < 0) {
      return result;
    }

    return {
      ret: 0,
      accessToken: result.access_token,
      xsrfToken: result.xsrf_token,
      refreshToken: result.refresh_token,
    };
  }

  // POST /users/:id/cats - Categories d'un utilisateur
  @Post(':id/cats')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async listCategories(@Param('id') id: string) {
    return this.usersService.listCategories(id);
  }

  // POST /users/:id - Recuperer un utilisateur
  @Post(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async getOneUser(@Param('id') id: string) {
    return this.usersService.getOneUser(id);
  }

  // PUT /users/:id/password - Mettre a jour le mot de passe
  @Put(':id/password')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
    @Req() req: Request,
  ) {
    return this.usersService.updatePassword(id, dto, req.__user);
  }

  // PATCH /users/:id/disable - Desactiver un utilisateur
  @Patch(':id/disable')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // PATCH /users/:id/enable - Activer un utilisateur
  @Patch(':id/enable')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async activeUser(@Param('id') id: string) {
    return this.usersService.activeUser(id);
  }

  // PUT /users/:id - Mettre a jour un utilisateur
  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'DEV')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.usersService.updateUser(id, dto, req.__user);
  }
}

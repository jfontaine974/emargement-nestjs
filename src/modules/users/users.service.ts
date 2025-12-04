import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, UserRepository } from './domain/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdatePasswordDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from '../../shared/auth/auth.service';
import { EnvironmentVariables } from '../../config/environment.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async listUsers() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const UserCategorie = require('../../../api/models/user-categorie-model');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const CategorieModel = require('../../../api/models/categorie-model');

    const users = await this.userRepository.findAllActive();
    const fin = [];

    for (const user of users) {
      const userView = user.view();
      const filter = { id_user: userView._id.toString() };

      // Trouver les user-categories actives
      const userCategories = await UserCategorie.find(filter).where('life_cycle').equals(0);
      const catsId = userCategories.map((c: { id_categorie: string }) => c.id_categorie);

      // Filtrer les categories par life_cycle=0 (actives uniquement)
      const cateFinal = [];
      for (const catId of catsId) {
        const cat = await CategorieModel.findById(catId).where('life_cycle').equals(0);
        if (cat) {
          cateFinal.push(cat._id);
        }
      }

      fin.push({
        user: userView,
        categories_id: cateFinal,
      });
    }

    return fin;
  }

  async listUsersFromDate(dateStr: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const UserCategorie = require('../../../api/models/user-categorie-model');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const CategorieModel = require('../../../api/models/categorie-model');

    const date = new Date(dateStr);
    const users = await this.userRepository.findFromDate(date);
    const fin: { user: any; categories_id: any[] }[] = [];

    for (const user of users) {
      const filter = { id_user: user._id.toString(), life_cycle: 0 };
      const userCategories = await UserCategorie.find(filter);
      const catsId = userCategories.map((c: { id_categorie: string }) => c.id_categorie);

      const cateFinal = [];
      for (const catId of catsId) {
        const cat = await CategorieModel.findById(catId).where('life_cycle').equals(0);
        if (cat) {
          cateFinal.push(cat._id);
        }
      }

      fin.push({
        user: user,
        categories_id: cateFinal,
      });
    }

    // Ajouter les liaisons mises a jour apres la date
    const liaisonUser = await UserCategorie.find().where('updatedAt').gt(date).where('life_cycle').equals(0);
    const userNotFound: string[] = [];

    for (const liaison of liaisonUser) {
      const u = await this.userRepository.findById(liaison.id_user);
      if (u) {
        const idx = fin.findIndex((e) => e.user._id.toString() === u._id.toString());
        if (idx !== -1) {
          fin[idx].categories_id.push(liaison.id_categorie);
        } else {
          fin.push({
            user: u,
            categories_id: [liaison.id_categorie],
          });
        }
      } else {
        if (!userNotFound.includes(liaison.id_user)) {
          userNotFound.push(liaison.id_user);
        }
      }
    }

    // Retourner directement l'array (le hash sera gere separement si necessaire)
    return fin;
  }

  async getOneUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.life_cycle >= 9) {
      return { ret: -1, err: 'User non trouve' };
    }
    return user.view();
  }

  async signUp(dto: CreateUserDto, __user?: string) {
    // Verifier si l'utilisateur existe deja
    const existing = await this.userRepository.findByIdentifiant(dto.identifiant);
    if (existing) {
      return { ret: -1, err: 'Identifiant deja utilise' };
    }

    // Hasher le mot de passe
    const saltRounds = this.configService.get('SALT_ROUND') || 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
      __user,
    });

    return user.view();
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByIdentifiant(dto.identifiant);
    if (!user) {
      return { ret: -1, err: 'Identifiant ou mot de passe incorrect' };
    }

    // Verifier le mot de passe
    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      return { ret: -1, err: 'Identifiant ou mot de passe incorrect' };
    }

    // Verifier que l'utilisateur est actif
    if (user.life_cycle >= 9) {
      return { ret: -1, err: 'Compte desactive' };
    }

    // Generer les tokens
    const isMobileApp = !!dto.id_device;
    const xsrfToken = this.authService.getXsrfToken();
    const userPayload = {
      _id: user._id.toString(),
      identifiant: user.identifiant,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.authService.getAccessToken(
      userPayload,
      isMobileApp,
      xsrfToken,
    );
    const refreshToken = await this.authService.getRefreshToken(
      userPayload,
      isMobileApp,
      xsrfToken,
    );

    return {
      ret: 0,
      userId: user._id.toString(),
      role: user.role,
      accessToken,
      refreshToken,
      xsrfToken,
      isMobileApp,
      id_session: user._id.toString(),
    };
  }

  async updateUser(id: string, dto: UpdateUserDto, __user?: string) {
    const user = await this.userRepository.update(id, {
      ...dto,
      __user,
    });

    if (!user) {
      return { ret: -1, err: 'User non trouve' };
    }

    return user.view();
  }

  async updatePassword(id: string, dto: UpdatePasswordDto, __user?: string) {
    const saltRounds = this.configService.get('SALT_ROUND') || 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.userRepository.updatePassword(id, hashedPassword);
    if (!user) {
      return { ret: -1, err: 'User non trouve' };
    }

    return user.view();
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.disable(id);
    if (!user) {
      return { ret: -1, err: 'User non trouve' };
    }
    return user.view();
  }

  async activeUser(id: string) {
    const user = await this.userRepository.enable(id);
    if (!user) {
      return { ret: -1, err: 'User non trouve' };
    }
    return user.view();
  }

  async listCategories(userId: string) {
    // Utiliser les modeles de compatibilite test pour obtenir les categories
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const UserCategorie = require('../../../api/models/user-categorie-model');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Categorie = require('../../../api/models/categorie-model');

    // Trouver les associations user-categorie actives (life_cycle === 0)
    const filter = { id_user: userId };
    const userCategories = await UserCategorie.find(filter).where('life_cycle').equals(0);

    // Extraire les IDs de categories
    const categoryIds = userCategories.map((uc: { id_categorie: string }) => uc.id_categorie);

    // Trouver les categories correspondantes (pas de filtre life_cycle ici, comme le test l'attend)
    const categories = await Categorie.find({
      _id: { $in: categoryIds },
    });

    // Utiliser view() pour formater les categories (exclut createdAt, __v, __user)
    return categories.map((c: { view: () => Record<string, unknown> }) => c.view());
  }

  async revokTokens(userId: string, id_device?: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { ret: -1, err: 'User non trouve' };
    }

    const isMobileApp = !!id_device;
    const xsrfToken = this.authService.getXsrfToken();
    const userPayload = {
      _id: user._id.toString(),
      identifiant: user.identifiant,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.authService.getAccessToken(
      userPayload,
      isMobileApp,
      xsrfToken,
    );
    const refreshToken = await this.authService.getRefreshToken(
      userPayload,
      isMobileApp,
      xsrfToken,
    );

    return {
      ret: 0,
      access_token: accessToken,
      refresh_token: refreshToken,
      xsrf_token: xsrfToken,
    };
  }
}

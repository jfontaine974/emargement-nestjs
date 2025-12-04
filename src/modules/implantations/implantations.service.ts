import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { IMPLANTATION_REPOSITORY, ImplantationRepository } from './domain/implantation.repository';
import { CreateImplantationDto } from './dto/create-implantation.dto';
import { UpdateImplantationDto } from './dto/update-implantation.dto';
import { EnvironmentVariables } from '../../config/environment.interface';
import { BusinessException } from '../../shared/exceptions/business.exception';

@Injectable()
export class ImplantationsService {
  constructor(
    @Inject(IMPLANTATION_REPOSITORY)
    private readonly implantationRepository: ImplantationRepository,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async listImplantations() {
    const implantations = await this.implantationRepository.findAll();
    return implantations.map((i) => i.view());
  }

  async createImplantation(dto: CreateImplantationDto, __user?: string) {
    // Validation des champs requis
    if (!dto.nom) {
      return { ret: -1, err: 'nom est requis' };
    }
    if (!dto.ecole?.nom_etablissement) {
      return { ret: -1, err: 'ecole.nom_etablissement est requis' };
    }
    if (!dto.ecole?.code_postal) {
      return { ret: -1, err: 'ecole.code_postal est requis' };
    }
    if (!dto.ecole?.nom_commune) {
      return { ret: -1, err: 'ecole.nom_commune est requis' };
    }
    if (!dto.ecole?.identifiant_de_l_etablissement) {
      return { ret: -1, err: 'ecole.identifiant_de_l_etablissement est requis' };
    }

    const implantation = await this.implantationRepository.create({
      ...dto,
      __user,
    });

    return implantation.view();
  }

  async updateImplantation(id: string, dto: UpdateImplantationDto, __user?: string) {
    const INFO = 'categorie-controller.js:updateImplantation';

    // Validation: ecole est requis lors de la mise a jour
    if (!dto.ecole) {
      throw new BusinessException('Champs obligatoires manquants', INFO);
    }

    // Validation des champs requis de ecole
    if (!dto.ecole.nom_etablissement || !dto.ecole.code_postal ||
        !dto.ecole.nom_commune || !dto.ecole.identifiant_de_l_etablissement) {
      throw new BusinessException('Champs obligatoires manquants', INFO);
    }

    const implantation = await this.implantationRepository.update(id, {
      ...dto,
      __user,
    });

    if (!implantation) {
      throw new BusinessException('Implantation non trouvée', INFO);
    }

    return implantation.view();
  }

  async getEcoles() {
    // Chemin du fichier JSON des ecoles (configurable via env)
    // En mode test, utiliser le fichier de test par defaut
    const nodeEnv = this.configService.get('NODE_ENV');
    let ecolesPath = this.configService.get('ECOLES_DATA_PATH') ||
                     process.env.ECOLES_DATA_PATH ||
                     (nodeEnv === 'test' ? 'test/data/ecoles.json' : '/home/thot/prod/ecolesData.json');

    // Convertir en chemin absolu si relatif
    if (!path.isAbsolute(ecolesPath)) {
      ecolesPath = path.join(process.cwd(), ecolesPath);
    }

    return new Promise((resolve) => {
      fs.readFile(ecolesPath, 'utf8', (err, data) => {
        if (err) {
          resolve({ ret: -1, err: 'Erreur lecture fichier ecoles' });
          return;
        }
        try {
          const ecoles = JSON.parse(data);
          resolve(ecoles);
        } catch {
          resolve({ ret: -1, err: 'Erreur parsing fichier ecoles' });
        }
      });
    });
  }
}

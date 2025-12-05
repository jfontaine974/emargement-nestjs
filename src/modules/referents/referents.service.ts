import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { REFERENT_REPOSITORY, ReferentRepository } from './domain/referent.repository';
import { ReferentDocument } from './infrastructure/persistence/referent.schema';

@Injectable()
export class ReferentsService {
  constructor(
    @Inject(REFERENT_REPOSITORY)
    private readonly referentRepository: ReferentRepository,
  ) {}

  async listReferents(): Promise<{ ret: number; data: Record<string, unknown>[] }> {
    const referents = await this.referentRepository.findAll();
    const views = referents.map((r) => r.view());
    return { ret: 0, data: views };
  }

  async listReferentsFromDate(
    date: string,
  ): Promise<{ ret: number; data: Record<string, unknown>[] }> {
    const referents = await this.referentRepository.findAllFromDate(date);
    const views = referents.map((r) => r.view());
    return { ret: 0, data: views };
  }

  async createReferent(
    data: Partial<ReferentDocument>,
  ): Promise<{ ret: number; data: Record<string, unknown> }> {
    delete (data as any)._id;
    const referent = await this.referentRepository.create(data);
    return { ret: 0, data: referent.view() };
  }

  async updateReferent(
    id: string,
    data: Partial<ReferentDocument>,
  ): Promise<{ ret: number; data: Record<string, unknown> }> {
    // Supprimer les champs systeme
    delete (data as any)._id;
    delete (data as any).createdAt;
    delete (data as any).updatedAt;
    delete (data as any).userId;

    // Récupérer le referent existant pour fusionner les phones
    const existingReferent = await this.referentRepository.findById(id);
    if (!existingReferent) {
      throw new HttpException({ ret: 520, message: 'Aucun update fait' }, HttpStatus.BAD_REQUEST);
    }

    // Fusionner les phones existants avec les nouveaux
    if (data.phones !== undefined) {
      const existingPhones = existingReferent.phones || {};
      const newPhones = data.phones || {};

      // Fusionner les phones
      const mergedPhones: Record<string, string> = { ...existingPhones };

      for (const key of Object.keys(newPhones)) {
        if (newPhones[key] === '' || newPhones[key] === null) {
          // Supprimer le phone si vide
          delete mergedPhones[key];
        } else {
          mergedPhones[key] = newPhones[key];
        }
      }

      data.phones = mergedPhones;

      // Synchroniser phone avec phones.principal SEULEMENT si principal a ete explicitement envoye
      if ('principal' in newPhones) {
        if (newPhones.principal === '' || newPhones.principal === null) {
          // Principal explicitement supprime -> supprimer phone
          (data as any).phone = null;
        } else {
          // Principal explicitement defini -> mettre a jour phone
          (data as any).phone = newPhones.principal;
        }
      }
      // Si principal n'est pas dans newPhones, on ne touche pas au champ phone existant
    }

    const referent = await this.referentRepository.update(id, data);
    if (!referent) {
      throw new HttpException({ ret: 520, message: 'Aucun update fait' }, HttpStatus.BAD_REQUEST);
    }
    return { ret: 0, data: referent.view() };
  }

  async disableReferent(id: string): Promise<{ ret: number; data: Record<string, unknown> }> {
    const referent = await this.referentRepository.disable(id);
    if (!referent) {
      throw new HttpException({ ret: 520, message: 'Aucun update fait' }, HttpStatus.BAD_REQUEST);
    }
    return { ret: 0, data: referent.view() };
  }

  async deleteReferent(id: string): Promise<{ ret: number; data: Record<string, unknown> }> {
    const referent = await this.referentRepository.delete(id);
    if (!referent) {
      throw new HttpException({ ret: 520, message: 'Aucune suppression faite' }, HttpStatus.BAD_REQUEST);
    }
    return { ret: 0, data: referent.view() };
  }
}

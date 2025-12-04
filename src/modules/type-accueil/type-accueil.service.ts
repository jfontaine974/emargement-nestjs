import { Injectable, Inject } from '@nestjs/common';
import { TYPE_ACCUEIL_REPOSITORY, TypeAccueilRepository } from './domain/type-accueil.repository';

@Injectable()
export class TypeAccueilService {
  constructor(
    @Inject(TYPE_ACCUEIL_REPOSITORY)
    private readonly typeAccueilRepository: TypeAccueilRepository,
  ) {}

  async listTypeAccueil() {
    const typesAccueil = await this.typeAccueilRepository.findActive();
    return typesAccueil.map((t) => t.view());
  }
}

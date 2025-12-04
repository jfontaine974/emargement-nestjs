import { Injectable, Inject } from '@nestjs/common';
import { TYPE_ACTIVITE_REPOSITORY, TypeActiviteRepository } from './domain/type-activite.repository';

@Injectable()
export class TypeActiviteService {
  constructor(
    @Inject(TYPE_ACTIVITE_REPOSITORY)
    private readonly typeActiviteRepository: TypeActiviteRepository,
  ) {}

  async listTypeActivite() {
    const typesActivite = await this.typeActiviteRepository.findActive();
    return typesActivite.map((t) => t.view());
  }
}

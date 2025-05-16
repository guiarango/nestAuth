import { SetMetadata } from '@nestjs/common';
import { ValidAreas } from '../interfaces';

export const META_AREAS = 'areas';

export const AreaProtected = (...args: ValidAreas[]) =>
  SetMetadata(META_AREAS, args);

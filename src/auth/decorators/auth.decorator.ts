import { applyDecorators, UseGuards } from '@nestjs/common';

import { UserAuthGuard } from '../guards';

export function Auth() {
  return applyDecorators(UseGuards(UserAuthGuard));
}

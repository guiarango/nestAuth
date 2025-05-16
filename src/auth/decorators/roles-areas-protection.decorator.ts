import { applyDecorators } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';

import { ValidAreas, ValidRoles } from '../interfaces';
import { RoleProtected, AreaProtected } from '.';
import { UserRoleGuard, UserAreaGuard } from '../guards';

interface AuthOptions {
  roles?: ValidRoles[];
  areas?: ValidAreas[];
}

export function RolesAreasProtection({ roles, areas }: AuthOptions) {
  return applyDecorators(
    RoleProtected(...(roles || [])),
    AreaProtected(...(areas || [])),
    UseGuards(UserRoleGuard, UserAreaGuard),
  );
}

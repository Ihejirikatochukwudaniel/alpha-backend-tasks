import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.headers['x-workspace-id'];
    if (!workspaceId || typeof workspaceId !== 'string') {
      throw new UnauthorizedException();
    }
    request.user = { workspaceId };
    return true;
  }
}

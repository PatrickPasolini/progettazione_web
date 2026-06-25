# Backend — Security (Guards e Decoratori)

**Percorso**: `libs/server/security/`
**Import**: `@server/security`

## Panoramica

Questo modulo fornisce gli strumenti di protezione delle rotte condivisi tra tutti i feature module. Non contiene logica di business — solo autenticazione e autorizzazione.

## Guards

### JwtAuthGuard

`src/lib/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Estende il guard Passport JWT. Quando applicato a una rotta, verifica il token Bearer nell'header `Authorization`. Se valido, popola `request.user` con il payload JWT.

**Uso**:
```typescript
@UseGuards(JwtAuthGuard)
@Get('/protected')
getProtected() { ... }
```

### RolesGuard

`src/lib/guards/roles.guard.ts`

Controlla che il ruolo dell'utente autenticato (da `request.user.role`) corrisponda ai ruoli richiesti dal decoratore `@Roles()`.

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
    if (!requiredRoles) return true; // nessun requisito di ruolo → accesso libero
    const user = context.switchToHttp().getRequest().user;
    if (!requiredRoles.includes(user.role)) throw new ForbiddenException();
    return true;
  }
}
```

**Uso** (sempre insieme a `JwtAuthGuard`):
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@Post('/exam')
createExam() { ... }
```

## Decoratori

### @CurrentUser()

`src/lib/decorators/current-user.decorator.ts`

Estrae `request.user` dal contesto di esecuzione. Utile per ottenere l'utente autenticato senza accedere manualmente alla request.

```typescript
@Post('/exam')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
createExam(@CurrentUser() teacher: TeacherEntity, @Body() dto: CreateExamDto) {
  return this.examService.create(dto, teacher);
}
```

### @Roles()

`src/lib/decorators/roles.decorator.ts`

Imposta i metadati di ruolo richiesti per una rotta. Letti da `RolesGuard` tramite `Reflector`.

```typescript
@Roles(UserRole.ADMIN, UserRole.SECRETARY)
```

## Pattern di protezione rotte

| Scenario | Guards applicati |
|----------|-----------------|
| Rotta pubblica | nessuno |
| Solo autenticazione | `JwtAuthGuard` |
| Autenticazione + ruolo specifico | `JwtAuthGuard, RolesGuard` + `@Roles(...)` |

## Esportazioni pubbliche (`src/index.ts`)

```typescript
export { JwtAuthGuard, RolesGuard }
export { CurrentUser, Roles }
```

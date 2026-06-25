# Backend — Autenticazione

**Percorso**: `libs/server/auth/`
**Import**: `@server/auth`

## Flusso autenticazione

```
1. POST /auth/login  (email + password)
   → LocalAuthGuard → LocalStrategy.validate()
   → UsersService.findByEmail() → bcrypt.compare()
   → AuthService.login() → JWT firmato (24h)
   → Response: { access_token, user, mustChangePassword }

2. Richiesta protetta (Bearer token)
   → JwtAuthGuard → JwtStrategy.validate()
   → Verifica firma JWT con SECRET_KEY
   → request.user = payload (id, name, email, role)
   → Controller + RolesGuard (se applicato)
```

## AuthModule

`src/lib/auth.module.ts`

```typescript
@Module({
  imports: [
    ServerUsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [ServerAuthService, LocalStrategy, JwtStrategy],
  controllers: [ServerAuthController],
})
export class ServerAuthModule {}
```

## AuthService

`src/lib/auth.service.ts`

| Metodo | Descrizione |
|--------|-------------|
| `validateUser(email, password)` | Trova utente per email, confronta password con bcrypt; lancia `UnauthorizedException` se errata |
| `login(user)` | Firma JWT payload `{ sub, name, email, role }`; ritorna `{ access_token, user, mustChangePassword }` |
| `changePassword(userId, newPassword)` | Delega a `UsersService.updatePassword()` |
| `register(dto)` | Crea utente via `UsersService.create()` poi chiama `login()` |

## AuthController

`src/lib/auth.controller.ts`

| Metodo | Rotta | Guard | Body |
|--------|-------|-------|------|
| `POST` | `/api/auth/login` | `LocalAuthGuard` | `{ email, password }` |
| `PATCH` | `/api/auth/change-password` | `JwtAuthGuard` | `{ newPassword }` |
| `POST` | `/api/auth/register` | nessuno | `RegisterDto` |

La rotta `/auth/change-password` usa `@CurrentUser()` per estrarre l'ID utente dal token JWT.

## Strategie Passport

### LocalStrategy (`src/lib/strategies/local.strategy.ts`)

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: ServerAuthService) {
    super({ usernameField: 'email' }); // usa 'email' invece di 'username'
  }

  validate(email: string, password: string) {
    return this.authService.validateUser(email, password);
  }
}
```

### JwtStrategy (`src/lib/strategies/jwt.strategy.ts`)

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_KEY,
    });
  }

  validate(payload: JwtPayload) {
    return { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
  }
}
```

## Interfacce

`src/lib/interfaces/`

```typescript
interface JwtPayload {
  sub: number;    // user ID
  name: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  access_token: string;
  user: { id: number; name: string; email: string; role: UserRole };
  mustChangePassword: boolean;
}
```

## DTOs

| DTO | Campi |
|-----|-------|
| `RegisterDto` | name, surname, email, password, role |
| `ChangePasswordDto` | newPassword |

## Flag `mustChangePassword`

Il campo `mustChangePassword` su `UserEntity` (default `false`) viene usato per forzare il cambio password al primo accesso. Quando `true`, il frontend (LoginPage) reindirizza a `/cambia-password` prima di consentire la navigazione normale.

## Token storage (frontend)

Il token JWT viene salvato in `localStorage.access_token` dalla LoginPage. Tutte le chiamate API successive includono:

```
Authorization: Bearer <token>
```

# Backend — API Entry Point

## main.ts

`apps/api/src/main.ts`

Entry point dell'applicazione NestJS.

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS abilitato (tutti gli origin in sviluppo)
  app.enableCors();

  // Tutte le rotte sotto /api
  app.setGlobalPrefix('api');

  // Swagger (documentazione interattiva)
  const config = new DocumentBuilder()
    .setTitle('Appelli API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Carica .env dalla root del workspace
  dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

**Swagger UI**: `http://localhost:3333/api/docs`

## AppModule

`apps/api/src/app/app.module.ts`

```typescript
@Module({
  imports: [
    DatabaseModule,       // TypeORM + PostgreSQL
    ServerUsersModule,    // Utenti base
    ServerAuthModule,     // JWT + login
    // Tutti i moduli da @server/entities:
    TeacherModule,
    CourseModule,
    ExamModule,
    SessionModule,
    DegreeModule,
    // Modulo esempio:
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## AppController

`apps/api/src/app/app.controller.ts`

Rotta di test, non usata dalla UI:

```typescript
@Get('/data')
getData() {
  return { message: 'Hello API' };
}
```

## Riepilogo tutte le rotte API

| Prefisso | Modulo | Descrizione |
|----------|--------|-------------|
| `/api/auth/*` | ServerAuthModule | Login, register, change-password |
| `/api/user/*` | ServerUsersModule | CRUD utenti |
| `/api/teacher/*` | TeacherModule | CRUD docenti |
| `/api/course/*` | CourseModule | CRUD corsi |
| `/api/exam/*` | ExamModule | CRUD esami + validazione |
| `/api/session/*` | SessionModule | CRUD sessioni |
| `/api/degree/*` | DegreeModule | CRUD corsi di laurea |
| `/api/book/*` | BooksModule | CRUD libri (esempio) |
| `/api/data` | AppController | Health check |

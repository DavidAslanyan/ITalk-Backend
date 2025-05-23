import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from '@nestjs/cqrs';
import { UserService } from "src/user/application/services/user.service";
import { UserController } from "src/user/presentation/controllers/user.controller";
import { UserEntity } from "../entities/user.entity";
import { AccessTokenEntity } from "../entities/access-token.entity";
import { RefreshTokenEntity } from "../entities/refresh-token.entity";
import { RoleEntity } from "../entities/role.entity";
import { PermissionEntity } from "../entities/permission.entity";
import { PasswordService } from "src/user/application/services/password.service";
import { CreateUserCommandHandler } from "src/user/application/cqrs/command-handlers/user/create-user.command.handler";
import { UserRepositoryHandler } from "../persistence/user.repository-handler";
import { LoginUserCommandHanlder } from "src/user/application/cqrs/command-handlers/user/login-user.command.handler";
import { JwtModule } from "@nestjs/jwt";
import { ACCESS_TOKEN_EXPIRATION_TIME } from "src/utilities/constants/global-data";
import { config } from "dotenv";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenService } from "src/user/application/services/token.service";
import { GetUserByIdHandler } from "src/user/application/cqrs/query-handlers/user/get-by-id.query-handler";
import { UpdateProgressCommandHanlder } from "src/user/application/cqrs/command-handlers/user/update-progress.command.handler";
import { UpdateUserCommandHandler } from "src/user/application/cqrs/command-handlers/user/update-user.command.handler";
import { DeleteUserCommandHandler } from "src/user/application/cqrs/command-handlers/user/delete-user.command.handler";
import { ProgressService } from "src/user/application/services/progress.service";
import { ProgressController } from "src/user/presentation/controllers/progress.controller";
import { AddStoreItemCommandHandler } from "src/user/application/cqrs/command-handlers/progress/add-store-item.command-handler";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "src/user/presentation/strategies/local.strategy";
import { AuthController } from "src/user/presentation/controllers/auth.controller";
import { AuthService } from "src/user/application/services/auth.service";
import { AuthMiddleware } from "src/user/presentation/middlewares/auth.middleware";
import { UserGateway } from "src/user/presentation/gateways/user.gateway";

config({ path: '.env' });

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AccessTokenEntity,
      RefreshTokenEntity,
      RoleEntity,
      PermissionEntity
    ]),
    CqrsModule,
    PassportModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'default_secret'),
        signOptions: { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME },
      }),
    }),
  ],
  controllers: [AuthController, UserController, ProgressController],
  providers: [
    UserGateway,
    AuthService,
    UserService,
    ProgressService,
    PasswordService,
    TokenService,
    CreateUserCommandHandler,
    LoginUserCommandHanlder,
    UpdateProgressCommandHanlder,
    UpdateUserCommandHandler,
    DeleteUserCommandHandler,
    AddStoreItemCommandHandler,
    LocalStrategy,
    GetUserByIdHandler,
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryHandler,
    }
  ],
  exports: [TypeOrmModule, JwtModule],
})
export class UserModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AuthMiddleware)
  //     .exclude(
  //       { path: 'auth/login', method: RequestMethod.POST },
  //       { path: 'auth/register', method: RequestMethod.POST },
  //     )
  //     .forRoutes('*');
  // }
}


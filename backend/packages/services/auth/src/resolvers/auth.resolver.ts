import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LoginInput, LoginResponse, RefreshTokenResponse, RegisterInput } from '../dto/auth.dto';
import { User } from '../entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput): Promise<LoginResponse> {
    return this.authService.login(input);
  }

  @Mutation(() => LoginResponse)
  async register(@Args('input') input: RegisterInput): Promise<LoginResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => RefreshTokenResponse)
  async refreshToken(@Args('refreshToken') refreshToken: string): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(refreshToken);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@Context() context): Promise<User> {
    const userId = context.req.user.id;
    return this.userService.findById(userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@Context() context): Promise<boolean> {
    const userId = context.req.user.id;
    return this.authService.logout(userId);
  }
} 
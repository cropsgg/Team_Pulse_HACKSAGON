import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from '@libs/prisma';
import { ProposalResolver } from './resolvers/proposal.resolver';
import { VoteResolver } from './resolvers/vote.resolver';
import { GovernanceResolver } from './resolvers/governance.resolver';
import { ProposalService } from './services/proposal.service';
import { VoteService } from './services/vote.service';
import { GovernanceService } from './services/governance.service';
import { BlockchainService } from './services/blockchain.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      playground: process.env.NODE_ENV !== 'production',
      introspection: true,
      context: ({ req }) => ({ req }),
    }),
    PrismaModule,
  ],
  providers: [
    ProposalResolver,
    VoteResolver,
    GovernanceResolver,
    ProposalService,
    VoteService,
    GovernanceService,
    BlockchainService,
  ],
})
export class AppModule {} 
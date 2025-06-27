import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from '@libs/prisma';
import { CampaignResolver } from './resolvers/campaign.resolver';
import { DonationResolver } from './resolvers/donation.resolver';
import { FundingRoundResolver } from './resolvers/funding-round.resolver';
import { CampaignService } from './services/campaign.service';
import { DonationService } from './services/donation.service';
import { FundingRoundService } from './services/funding-round.service';
import { PaymentService } from './services/payment.service';
import { BlockchainService } from './services/blockchain.service';
import { MLService } from './services/ml.service';

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
    CampaignResolver,
    DonationResolver,
    FundingRoundResolver,
    CampaignService,
    DonationService,
    FundingRoundService,
    PaymentService,
    BlockchainService,
    MLService,
  ],
})
export class AppModule {} 
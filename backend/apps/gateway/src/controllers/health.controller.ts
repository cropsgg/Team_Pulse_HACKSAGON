import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  HttpHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Check health status' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    const services = [
      'AUTH_SERVICE_URL',
      'DAO_SERVICE_URL', 
      'FUNDING_SERVICE_URL',
      'HELPDESK_SERVICE_URL',
      'AUCTION_SERVICE_URL',
      'ML_SERVICE_URL',
      'NOTIFIER_SERVICE_URL',
    ];

    return this.health.check(
      services.map((serviceKey) => () =>
        this.http.pingCheck(
          serviceKey.toLowerCase().replace('_SERVICE_URL', ''),
          this.configService.get(serviceKey),
        ),
      ),
    );
  }

  @Get('healthz')
  @ApiOperation({ summary: 'Simple health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthz() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'gateway',
    };
  }
} 
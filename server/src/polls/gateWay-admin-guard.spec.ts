/* eslint-disable prettier/prettier */
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { GatewayAdminGuard } from './gateWay-admin.guard';
import { PollsService } from './polls.service';

describe('gateWayAdminGuard', () => {
    let guard: GatewayAdminGuard;
    let service: PollsService;
    let jwtService: JwtService;

    const mockExecutionContext = {
        switchToWs: jest.fn().mockReturnThis(),
        getClient: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GatewayAdminGuard,
                {
                    provide: PollsService,
                    useValue: {
                        getPoll: jest.fn()
                    }
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn()
                    }
                }
            ]
        }).compile()

        guard = module.get<GatewayAdminGuard>(GatewayAdminGuard)
        service = module.get<PollsService>(PollsService)
        jwtService = module.get<JwtService>(JwtService)
    });

    it('should be defined', () => {
        expect(guard).toBeDefined()
        expect(service).toBeDefined()
        expect(jwtService).toBeDefined()
    })


});

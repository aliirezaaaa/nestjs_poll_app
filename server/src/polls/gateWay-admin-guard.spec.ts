/* eslint-disable prettier/prettier */
import { GatewayAdminGuard } from './gateWay-admin.guard';
import { JwtService } from '@nestjs/jwt';
import { PollsService } from './polls.service';
import { WsUnauthorizedException } from '../exceptions/ws-exceptions';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Poll } from 'shared/poll-types';

describe('GatewayAdminGuard', () => {
    let guard: GatewayAdminGuard;
    let pollsService: PollsService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GatewayAdminGuard, // Use the actual implementation
                {
                    provide: PollsService,
                    useValue: {
                        getPoll: jest.fn(), // Mock PollsService
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        verify: jest.fn(), // Mock JwtService
                    },
                },
            ],
        }).compile();

        guard = module.get<GatewayAdminGuard>(GatewayAdminGuard);
        pollsService = module.get<PollsService>(PollsService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should throw an error if no token is provided', async () => {
        const mockSocket = {
            handshake: {
                auth: {},   // No token in auth
                headers: {}, // No token in headers
            },
        };

        const mockExecutionContext = {
            switchToWs: () => ({
                getClient: () => mockSocket,
            }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrowError(
            WsUnauthorizedException,
        ); // Expect rejection with WsUnauthorizedException
    });

    it('should throw an error if token verification failed', async () => {
        const mockSocket = {
            handshake: {
                auth: { token: 'invalid token' },
                headers: {}
            }
        }

        const mockExecutionContext = {
            switchToWs: () => ({
                getClient: () => mockSocket
            })
        } as unknown as ExecutionContext

        jest.spyOn(jwtService, 'verify').mockImplementation(() => {
            throw new Error('invalid token ')
        })

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrowError(WsUnauthorizedException)
    })

    it('should throw an error if user is not admin', async () => {
        const mockSocket = {
            handshake: {
                auth: { token: 'valid token' },
                headers: {}
            }
        }

        const mockExecutionContext = {
            switchToWs: () => ({
                getClient: () => mockSocket
            })
        } as unknown as ExecutionContext

        const mockedPayload = {
            pollID: 'poll-id',
            sub: 'user-id'
        }

        jest.spyOn(jwtService, 'verify').mockReturnValue(mockedPayload)
        jest.spyOn(pollsService, 'getPoll').mockResolvedValue({
            id: 'poll-id',
            topic: 'Mock Poll',
            votesPerVoter: 1,
            participants: {},
            adminID: 'another-admin-id',
            nominations: {},
            rankings: {},
            results: [],
            hasVotingStarted: false
        } as Poll)

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrowError(WsUnauthorizedException)
    })

    it('should return true if the user is admin and token is valid', async () => {
        const mockSocket = {
            handshake: {
                auth: { token: 'valid token' },
                headers: {}
            }
        }

        const mockExecutionContext = {
            switchToWs: () => ({
                getClient: () => mockSocket
            })
        } as unknown as ExecutionContext

        const mockedPayload = {
            pollID: 'poll-id',
            sub: 'admin-id'
        }

        jest.spyOn(jwtService, 'verify').mockReturnValue(mockedPayload)
        jest.spyOn(pollsService, 'getPoll').mockResolvedValue({
            id: 'poll-id',
            topic: 'Mock Poll',
            votesPerVoter: 1,
            participants: {},
            adminID: 'admin-id',
            nominations: {},
            rankings: {},
            results: [],
            hasVotingStarted: false
        } as Poll)

        const result = await guard.canActivate(mockExecutionContext)
        expect(result).toBe(true)
    })
});

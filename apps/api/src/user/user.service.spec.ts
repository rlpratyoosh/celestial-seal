import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';

const mockValidateOrThrow = jest.fn();
jest.mock('src/common/helper/zod-validation.helper', () => ({
  __esModule: true,
  default: mockValidateOrThrow,
}));

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: '1',
    username: 'fakecelestial',
    email: 'celestial@brokenseal.com',
    password: 'BadRune123!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get(PrismaService);
    mockValidateOrThrow.mockImplementation((schema, data) => data);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockValidateOrThrow.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        username: 'fakecelestial',
        email: 'celestial@brokenseal.com',
        password: 'BadRune123!',
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockValidateOrThrow).toHaveBeenCalled();
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when username is taken', async () => {
      const createUserDto = {
        username: 'fakecelestial',
        email: 'celestial@brokenseal.com',
        password: 'BadRune123!',
      };
      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Username is already taken!'),
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const createUserDto = {
        username: 'fakecelestial',
        email: 'celestial@brokenseal.com',
        password: 'BadRune123!',
      };
      (prismaService.user.create as jest.Mock).mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [
        mockUser,
        { ...mockUser, id: '2', username: 'anotheruser' },
      ];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      (prismaService.user.findMany as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll()).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new NotFoundException('User not found!'),
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      (prismaService.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne('1')).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto = {
        username: 'updatedcelestial',
        email: 'updated@brokenseal.com',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update('1', updateUserDto);

      expect(mockValidateOrThrow).toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateUserDto,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found (P2025)', async () => {
      const updateUserDto = {
        username: 'updatedcelestial',
      };

      (prismaService.user.update as jest.Mock).mockRejectedValue({
        code: 'P2025',
      });

      await expect(
        service.update('nonexistent', updateUserDto),
      ).rejects.toThrow(new NotFoundException('User not found!'));
    });

    it('should throw BadRequestException when username already taken (P2002)', async () => {
      const updateUserDto = {
        username: 'existingusername',
      };

      (prismaService.user.update as jest.Mock).mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        new BadRequestException('Username already taken!'),
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const updateUserDto = {
        username: 'updatedcelestial',
      };

      (prismaService.user.update as jest.Mock).mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.update('1', updateUserDto)).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      (prismaService.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found (P2025)', async () => {
      (prismaService.user.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
      });

      await expect(service.remove('nonexistent')).rejects.toThrow(
        new NotFoundException('User not found!'),
      );
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      (prismaService.user.delete as jest.Mock).mockRejectedValue(
        new Error('Unknown error'),
      );

      await expect(service.remove('1')).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
    });
  });
});

import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: '1',
    username: 'fakecelestial',
    email: 'celestial@brokenseal.com',
    password: 'BadRune123!',
    isVerified: false,
    userType: 'USER' as const,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUsers = [
    mockUser,
    {
      id: '2',
      username: 'celestial_emperor',
      email: 'emperor@celetial.com',
      password: 'EmperorRune456!',
      isVerified: true,
      userType: 'ADMIN' as const,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'fakecelestial',
        email: 'celestial@brokenseal.com',
        password: 'BadRune123!',
      };

      userService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException when username is taken', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinglaw',
        email: 'law@power.com',
        password: 'Power12Law!',
      };

      userService.create.mockRejectedValue(
        new BadRequestException('Username is already taken!'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        new BadRequestException('Username is already taken!'),
      );
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const createUserDto: CreateUserDto = {
        username: 'fakecelestial',
        email: 'celestial@brokenseal.com',
        password: 'BadRune123!',
      };

      userService.create.mockRejectedValue(
        new InternalServerErrorException('Unknown error occured!'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      userService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array when no users exist', async () => {
      userService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException on service error', async () => {
      userService.findAll.mockRejectedValue(
        new InternalServerErrorException('Unknown error occured!'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      userService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(userService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userService.findOne.mockRejectedValue(
        new NotFoundException('User not found!'),
      );

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        new NotFoundException('User not found!'),
      );
      expect(userService.findOne).toHaveBeenCalledWith('nonexistent');
    });

    it('should throw InternalServerErrorException on service error', async () => {
      userService.findOne.mockRejectedValue(
        new InternalServerErrorException('Unknown error occured!'),
      );

      await expect(controller.findOne('1')).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
      expect(userService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'newCeletial',
        email: 'newBorn@young.com',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user with partial data', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'newAncientCelestial',
      };
      const updatedUser = { ...mockUser, username: 'newAncientCelestial' };

      userService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      userService.update.mockRejectedValue(
        new NotFoundException('User not found!'),
      );

      await expect(
        controller.update('nonexistent', updateUserDto),
      ).rejects.toThrow(new NotFoundException('User not found!'));
      expect(userService.update).toHaveBeenCalledWith(
        'nonexistent',
        updateUserDto,
      );
    });

    it('should throw BadRequestException when username already taken', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'existingusername',
      };

      userService.update.mockRejectedValue(
        new BadRequestException('Username already taken!'),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        new BadRequestException('Username already taken!'),
      );
      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw InternalServerErrorException on service error', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      userService.update.mockRejectedValue(
        new InternalServerErrorException('Unknown error occured!'),
      );

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      userService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove('1');

      expect(userService.remove).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      userService.remove.mockRejectedValue(
        new NotFoundException('User not found!'),
      );

      await expect(controller.remove('nonexistent')).rejects.toThrow(
        new NotFoundException('User not found!'),
      );
      expect(userService.remove).toHaveBeenCalledWith('nonexistent');
    });

    it('should throw InternalServerErrorException on service error', async () => {
      userService.remove.mockRejectedValue(
        new InternalServerErrorException('Unknown error occured!'),
      );

      await expect(controller.remove('1')).rejects.toThrow(
        new InternalServerErrorException('Unknown error occured!'),
      );
      expect(userService.remove).toHaveBeenCalledWith('1');
    });
  });
});

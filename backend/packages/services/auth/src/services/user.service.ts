import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/prisma';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id, isActive: true },
      include: {
        profile: true,
        donations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        votes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        badges: {
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true },
      include: {
        profile: true,
      },
    });

    return user as User;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username, isActive: true },
      include: {
        profile: true,
      },
    });

    return user as User;
  }

  async updateProfile(userId: string, updateData: any): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          update: updateData,
        },
      },
      include: {
        profile: true,
      },
    });

    return user as User;
  }

  async getUserStats(userId: string) {
    const [totalDonations, totalVotes, badgeCount] = await Promise.all([
      this.prisma.donation.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma.vote.count({
        where: { userId },
      }),
      this.prisma.badge.count({
        where: { userId },
      }),
    ]);

    return {
      totalDonated: totalDonations._sum.amount || 0,
      totalVotes,
      badgeCount,
    };
  }
} 
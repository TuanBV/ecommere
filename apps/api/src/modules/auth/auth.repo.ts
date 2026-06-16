import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveUserByLogin(login: string) {
    return this.prisma.user.findFirst({
      where: { OR: [{ username: login }, { email: login }], delFlag: 0 }
    });
  }
}

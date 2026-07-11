import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users.schema';

export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async createUser(input: CreateUserInput) {
    const email = input.email.trim().toLowerCase();

    const exists = await this.userModel.findOne({ email }).lean();
    if (exists) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const created = await this.userModel.create({
      email,
      passwordHash,
      name: input.name.trim(),
    });

    return { id: created._id.toString(), email: created.email, name: created.name };
  }

  async findByEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    return this.userModel.findOne({ email: normalized }).exec();
  }

  async findById(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  getPasswordHash(user: UserDocument) {
    return user.passwordHash ?? (user as UserDocument & { password?: string }).password;
  }

  getDisplayName(user: UserDocument) {
    if (user.name) return user.name;

    const legacyUser = user as UserDocument & { firstName?: string; lastName?: string };
    const fullName = [legacyUser.firstName, legacyUser.lastName].filter(Boolean).join(' ').trim();
    return fullName || user.email;
  }

  async validatePassword(user: UserDocument, password: string) {
    const hash = this.getPasswordHash(user);
    if (!hash) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
  }

  async updateName(userId: string, name: string) {
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $set: { name: name.trim() } }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('User not found');
    return { id: updated._id.toString(), email: updated.email, name: updated.name };
  }
}


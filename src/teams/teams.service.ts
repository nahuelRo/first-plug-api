import { Inject, Injectable } from '@nestjs/common';
import { Member } from '../members/schemas/member.schema';

import { Model } from 'mongoose';

@Injectable()
export class TeamsService {
  constructor(
    @Inject('MEMBER_MODEL') private memberRepository: Model<Member>,
  ) {}

  async findAll() {
    const result = await this.memberRepository
      .aggregate<{ data: string[] }>([
        {
          $match: {
            teams: { $not: { $size: 0 } },
          },
        },
        {
          $project: {
            _id: 0,
            teams: 1,
          },
        },
        {
          $unwind: '$teams',
        },
        {
          $group: {
            _id: null,
            data: { $addToSet: '$teams' },
          },
        },
      ])
      .exec();
    return result[0]?.data ?? [];
  }
}

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
      .aggregate<{ teams: string[] }>([
        {
          $match: {
            team: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            teams: { $addToSet: '$team' },
          },
        },
      ])
      .exec();
    console.log('Aggregated teams:', result);
    return result.length > 0 ? result[0].teams : [];
  }
}

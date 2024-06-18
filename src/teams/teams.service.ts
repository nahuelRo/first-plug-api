import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Model, ObjectId } from 'mongoose';
import { Team } from './schemas/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Member } from '../members/schemas/member.schema';

// Mechi:
/**
 * EL CREATE YA CONTEMPLA EL UNIQUE
 * EL UPDATE YA CONTEMPLA EL UNIQUE
 * FIND ALL
 * FIND BY ID
 * Find by name: entiendo que este no va hacer necesario buscar si existe a mano y sino no porque ya lo contempl
 * el update y el create
 *
 * Falta:
 * Vincular este schema con member y despues guardar los teams dentro de members.
 * Cuando llames en members usa populate
 * https://mongoosejs.com/docs/populate.html
 *
 * Suerte jajaja
 */
@Injectable()
export class TeamsService {
  constructor(
    @Inject('TEAM_MODEL') private teamRepository: Model<Team>,
    @Inject('MEMBER_MODEL') private memberRepository: Model<Member>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    try {
      const team = await this.teamRepository.create(createTeamDto);
      return await team.save();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async associateTeamToMember(teamId: ObjectId, memberId: ObjectId) {
    try {
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        throw new BadRequestException('Member not found');
      }
      member.team = teamId;
      await member.save();
      return member;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeTeamForMember(memberId: ObjectId, newTeamId: ObjectId) {
    try {
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        throw new BadRequestException('Member not found');
      }
      member.team = newTeamId;
      await member.save();
      return member;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeTeamForMembers(teamId: ObjectId, memberIds: ObjectId[]) {
    try {
      const members = await this.memberRepository.find({
        _id: { $in: memberIds },
      });

      if (!members.length) {
        throw new BadRequestException('Members not found');
      }
      for (const member of members) {
        member.team = teamId;
        await member.save();
      }
      return members;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: ObjectId, updateTeamDto: UpdateTeamDto) {
    try {
      const team = await this.teamRepository.findByIdAndUpdate(
        id,
        updateTeamDto,
        {
          new: true,
        },
      );

      return team;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    const teams = this.teamRepository.find();
    return teams;
  }

  async findById(id: ObjectId) {
    const team = this.teamRepository.findById(id);
    return team;
  }

  async findByName(name: string) {
    const team = this.teamRepository.findOne({ name });
    return team;
  }

  private handleDBExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        'There is already another team with that name',
      );
    }

    throw new InternalServerErrorException(
      'Unexcepted error, check server log',
    );
  }
}

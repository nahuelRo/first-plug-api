import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Model, ObjectId, Types } from 'mongoose';
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

  private normalizeTeamName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  async create(createTeamDto: CreateTeamDto) {
    try {
      const normalizedTeamName = this.normalizeTeamName(createTeamDto.name);
      let team = await this.teamRepository.findOne({
        name: normalizedTeamName,
      });

      if (team) {
        return team;
      }

      team = new this.teamRepository({
        ...createTeamDto,
        name: normalizedTeamName,
      });
      return await team.save();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async associateTeamToMember(
    TeamId: Types.ObjectId,
    memberId: Types.ObjectId,
  ) {
    try {
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        throw new BadRequestException('Member not found');
      }
      member.team = TeamId;
      await member.save();
      return member;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeTeamForMember(memberId: Types.ObjectId, TeamId: Types.ObjectId) {
    try {
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        throw new BadRequestException('Member not found');
      }
      member.team = TeamId;
      await member.save();
      return member;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async changeTeamForMembers(
    teamId: Types.ObjectId,
    memberIds: Types.ObjectId[],
  ) {
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
      const normalizedTeamName = this.normalizeTeamName(updateTeamDto.name);
      const existingTeam = await this.teamRepository.findOne({
        name: normalizedTeamName,
      });

      if (existingTeam && existingTeam._id.toString() !== id.toString()) {
        throw new BadRequestException(
          'There is already another team with that name',
        );
      }

      const team = await this.teamRepository.findByIdAndUpdate(
        id,
        { ...updateTeamDto, name: normalizedTeamName },
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

  async delete(id: Types.ObjectId) {
    try {
      const members = await this.memberRepository.find({ team: id });
      if (members.length > 0) {
        throw new BadRequestException(
          'Cannot delete team. There are members associated with it',
        );
      }
      const result = await this.teamRepository.findByIdAndDelete(id);
      if (!result) {
        throw new BadRequestException('Team not found');
      }
      return result;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async unassignTeamsFromMembers(teamIds: Types.ObjectId[]) {
    console.log('Unassigning teams from members:', teamIds); // Log de entrada
    const objectIds = teamIds.map((id) => new Types.ObjectId(id));
    console.log('Converted ObjectIds:', objectIds); // Log de IDs convertidos

    try {
      const result = await this.memberRepository.updateMany(
        { team: { $in: objectIds } },
        { $set: { team: null } },
        { multi: true },
      );
      console.log('Unassign result:', result); // Log del resultado de la actualización
    } catch (error) {
      console.error('Error during unassigning teams from members:', error); // Log de error
    }
  }

  async bulkDelete(ids: Types.ObjectId[]) {
    console.log('Bulk delete ids:', ids);

    try {
      await this.unassignTeamsFromMembers(ids);
      const result = await this.teamRepository.deleteMany({
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
      });

      console.log('Delete result:', result);
      return result;
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

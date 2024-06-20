import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { ObjectId, isValidObjectId, Types } from 'mongoose';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Delete('bulk-delete')
  async bulkDelete(@Body() body: { ids: string[] }) {
    console.log('bulkDelete Body:', body);
    const teamIds = body.ids
      .filter((id) => id && isValidObjectId(id))
      .map((id) => new Types.ObjectId(id));

    if (teamIds.length !== body.ids.length) {
      throw new BadRequestException('Some provided IDs are invalid');
    }

    return await this.teamsService.bulkDelete(teamIds);
  }

  @Get()
  async findAll() {
    const teams = await this.teamsService.findAll();
    return teams;
  }

  @Get(':id')
  async findById(@Param('id', ParseMongoIdPipe) id: ObjectId) {
    const teams = await this.teamsService.findById(id);
    return teams;
  }

  @Post()
  async create(@Body() createTeamDto: CreateTeamDto) {
    const teams = await this.teamsService.create(createTeamDto);
    return teams;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseMongoIdPipe) id: ObjectId,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    const teams = await this.teamsService.update(id, updateTeamDto);
    return teams;
  }

  @Put(':teamId/members/:memberId')
  async associateTeamToMember(
    @Param('teamId', ParseMongoIdPipe) teamId: Types.ObjectId,
    @Param('memberId', ParseMongoIdPipe) memberId: Types.ObjectId,
  ) {
    const member = await this.teamsService.associateTeamToMember(
      teamId,
      memberId,
    );
    return member;
  }

  @Put(':memberId/change-member/:teamId')
  async changeTeamForMember(
    @Param('memberId', ParseMongoIdPipe) memberId: Types.ObjectId,
    @Param('teamId', ParseMongoIdPipe) teamId: Types.ObjectId,
  ) {
    const member = await this.teamsService.changeTeamForMember(
      teamId,
      memberId,
    );
    return member;
  }

  @Put('change-members/:teamId')
  async changeTeamForMembers(
    @Param('teamId', ParseMongoIdPipe) teamId: Types.ObjectId,
    @Body('membersIds') membersIds: string[],
  ) {
    const memberIds = membersIds.map((id) => {
      if (!isValidObjectId(id)) {
        throw new BadRequestException(`Invalid member ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    return await this.teamsService.changeTeamForMembers(teamId, memberIds);
  }

  @Delete(':id')
  async delete(@Param('id', ParseMongoIdPipe) id: Types.ObjectId) {
    return await this.teamsService.delete(id);
  }
}

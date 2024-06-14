import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { ObjectId } from 'mongoose';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

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
}

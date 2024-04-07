import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export const tenantConnectionProvider = {
  provide: 'TENANT_CONNECTION',
  useFactory: async (request, connection: Connection) => {
    if (!request.tenantName) {
      return connection.useDb(`invited`);
    }
    return connection.useDb(`tenant_${request.tenantName}`);
  },
  inject: [REQUEST, getConnectionToken()],
};

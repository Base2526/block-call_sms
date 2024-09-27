import type { Role } from '@/interface/permission/role.interface';

import { intercepter, mock } from '@/mock/config';

const roles: Role[] = [
  {
    name: {
      zh_CN: '访客',
      en_US: 'Guest',
      th_TH: 'Guest',
    },
    code: 'role_guest',
    id: 0,
    status: 'enabled',
  },
  {
    name: {
      zh_CN: '管理员',
      en_US: 'Admin',
      th_TH: 'Admin',
    },
    code: 'role_admin',
    id: 1,
    status: 'enabled',
  },
];

mock.mock('/permission/role', 'get', intercepter(roles));
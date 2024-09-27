import type { MenuList } from '@/interface/layout/menu.interface';
import { intercepter, mock } from '@/mock/config';

const mockMenuList: MenuList = [
  {
    code: 'insurance',
    label: {
      zh_CN: 'พ.ร.บ',
      en_US: 'พ.ร.บ',
      th_TH: 'พ.ร.บ',
    },
    icon: 'insurance',
    path: '/insurance',

  },
  {
    code: 'report',
    label: {
      zh_CN: 'รายงาน',
      en_US: 'รายงาน',
      th_TH: 'รายงาน',
    },
    icon: 'report',
    path: '/report',
  }
];

mock.mock('/user/menu', 'get', intercepter(mockMenuList));

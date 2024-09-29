import type { MenuList } from '@/interface/layout/menu.interface';
import { intercepter, mock } from '@/mock/config';

const mockMenuList: MenuList = [
  {
    code: 'privacy',
    label: {
      zh_CN: 'Privacy',
      en_US: 'Privacy',
      th_TH: 'Privacy',
    },
    icon: 'privacy',
    path: '/privacy',

  },
  {
    code: 'About us',
    label: {
      zh_CN: 'About us',
      en_US: 'About us',
      th_TH: 'About us',
    },
    icon: 'about-us',
    path: '/about-us',
  }
];

mock.mock('/user/menu', 'get', intercepter(mockMenuList));

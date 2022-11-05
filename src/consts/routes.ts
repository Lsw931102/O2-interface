import { completeUrl } from '@/utils/common'

export interface IRoute {
  icon: string
  name: string
  path: string
  link?: string
  isShow: boolean // 是否显示
}

export const ROUTES: IRoute[] = [
  {
    icon: completeUrl('menu/personal.png'),
    name: 'Dashboard',
    path: '/dashboard',
    isShow: true,
  },
  {
    icon: completeUrl('menu/bank.png'),
    name: 'Markets',
    path: '/markets',
    isShow: true,
  },
  {
    icon: completeUrl('menu/farm.png'),
    name: 'Farm',
    path: '/farm',
    isShow: false,
  },
  {
    icon: completeUrl('menu/stake.png'),
    name: 'Stake',
    path: '/stake',
    isShow: true,
  },
  {
    icon: completeUrl('menu/refinance.png'),
    name: 'Refinance',
    path: '/cross',
    isShow: false,
  },
  {
    icon: completeUrl('menu/history.png'),
    name: 'History',
    path: '/history',
    isShow: true,
  },
  {
    icon: completeUrl('menu/price.png'),
    name: 'Price',
    path: '/price',
    isShow: true,
  },
  {
    icon: completeUrl('menu/analyse.png'),
    name: 'Analyse',
    path: '',
    isShow: false,
  },
]

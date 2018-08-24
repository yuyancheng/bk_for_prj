import Main from '@/views/Main';
import Layout from '@/views/dataCenter/Layout';
import IndexLayOut from '@/views/dataCenter/IndexLayOut';
import DataCenter from '@/views/dataCenter/DataCenter';
import Specialty from '@/views/dataCenter/Specialty';
import DataCenterViews from '@/views/dataCenter/DataCenterViews';
import Views from '@/views/dataCenter/Views';
import DistributionAnalysis from '@/views/dataCenter/DistributionAnalysis';
import ViewPoint from '@/views/dataCenter/ViewPoint';
import TranStatus from '@/views/dataCenter/TranStatus';

const prefix = 'kh';

export default [
  {
    path: '/views',
    component: IndexLayOut,
    redirect: '/views/da',
    children: [
      {
        path: '/views/dv',
        name: 'DataCenterViews',
        components: {
          default: DataCenterViews,
        },
      },
      {
        path: '/views/ts',
        name: 'TranStatus',
        components: {
          default: TranStatus,
        },
      },
      {
        path: '/views/da',
        name: 'DistributionAnalysis',
        components: {
          default: DistributionAnalysis,
        },
      },
      {
        path: '/views/vw',
        name: 'ViewPoint',
        components: {
          default: ViewPoint,
        },
      },
    ],
  },
  {
    path: `/${prefix}`,
    name: `${prefix}`,
    component: Main,
    redirect: `/${prefix}/home`,
    children: [
      {
        path: `/${prefix}/data-centre`,
        name: 'data-centre',
        redirect: `/${prefix}/data-centre/views`,
        components: {
          default: Layout,
        },
        children: [
          {
            path: `/${prefix}/data-centre/default`,
            name: 'data-centre-default',
            components: {
              default: DataCenter,
            },
          },
          {
            path: `/${prefix}/data-centre/specialty`,
            name: 'data-centre-specialty',
            components: {
              default: Specialty,
            },
          },
          {
            path: `/${prefix}/data-centre/views`,
            name: 'data-centre-views',
            components: {
              default: Views,
            },
          },
        ],
      },
    ],
  },
];

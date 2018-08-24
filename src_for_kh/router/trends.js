import Main from '@/views/Main';
import Index from '@/views/trends/Index';
import Notice from '@/views/trends/Notice';
import Solution from '@/views/trends/Solution';
import Policy from '@/views/trends/Policy';
import Experience from '@/views/trends/Experience';
import Partner from '@/views/trends/Partner';
import Details from '@/views/trends/Details';

const prefix = 'kh';

export default [
    {
        path: `/${prefix}`,
        name: `${prefix}`,
        component: Main,
        redirect: `/${prefix}/home`,
        children: [
            {
                path: `/${prefix}/trends-of-work`,
                name: 'trendsOfWork',
                components: {
                    default: Index,
                },
                redirect: `/${prefix}/trends-of-work/notice`,
                meta: { title: '工作动态' },
                children: [
                    {
                        path: `/${prefix}/trends-of-work/notice`,
                        name: 'trends-notice',
                        component: Notice,
                        meta: { title: '通知公告' },
                    },
                    {
                        path: `/${prefix}/trends-of-work/solution`,
                        name: 'trends-solution',
                        component: Solution,
                        meta: { title: '规划方案' },
                    },
                    {
                        path: `/${prefix}/trends-of-work/policy`,
                        name: 'trends-policy',
                        component: Policy,
                        meta: { title: '政策制度' },
                    },
                    {
                        path: `/${prefix}/trends-of-work/experience`,
                        name: 'trends-experience',
                        component: Experience,
                        meta: { title: '经验做法' },
                    },
                    {
                        path: `/${prefix}/trends-of-work/partner`,
                        name: 'trends-partner',
                        component: Partner,
                        meta: { title: '合作企业' },
                    },
                    {
                        path: `/${prefix}/trends-of-work/details`,
                        name: 'trends-details',
                        component: Details,
                        meta: { title: '详情' },
                    },
                ],
            },
        ],
    },
];

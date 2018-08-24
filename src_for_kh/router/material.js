import Main from '@/views/Main';
import Index from '@/views/material/Index';
import MaterialRelease from '@/views/material/MaterialRelease';

const prefix = 'kh';

export default [
    {
        path: `/${prefix}`,
        name: `${prefix}`,
        component: Main,
        redirect: `/${prefix}/home`,
        children: [
            {
                path: `/${prefix}/release-of-materials`,
                name: 'release-of-materials',
                components: {
                    default: Index,
                },
                redirect: `/${prefix}/release-of-materials/waybill-list`,
                meta: { title: '物资发运' },
                children: [
                    {
                        path: `/${prefix}/release-of-materials/waybill-list`,
                        name: 'waybill-list',
                        component: MaterialRelease,
                        meta: { title: '运单列表' },
                    },
                ],
            },
        ],
    },
];

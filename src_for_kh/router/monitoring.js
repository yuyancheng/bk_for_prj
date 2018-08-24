import Main from '@/views/Main';
import Index from '@/views/monitoring/Index';
import DespatchInfoQuery from '@/views/monitoring/DespatchInfoQuery';
import ReceptionInfoQuery from '@/views/monitoring/ReceptionInfoQuery';
import ExpressRoute from '@/views/monitoring/ExpressRoute';
import MaterialDetails from '@/views/monitoring/MaterialDetails';

const prefix = 'kh';

export default [
    {
        path: `/${prefix}`,
        name: `${prefix}`,
        component: Main,
        redirect: `/${prefix}/home`,
        children: [
            {
                path: `/${prefix}/monitoring-of-transportation`,
                name: 'monitoring-of-transportation',
                redirect: `/${prefix}/monitoring-of-transportation/default`,
                components: {
                    default: Index,
                },
                children: [
                    {
                        path: `/${prefix}/monitoring-of-transportation/default`,
                        name: 'monitoring-of-despatch',
                        components: {
                            default: DespatchInfoQuery,
                        },
                        children: [
                            {
                                path: `/${prefix}/monitoring-of-transportation/default/express-route`,
                                name: 'default-express-route',
                                components: {
                                    default: ExpressRoute,
                                },
                            },
                            {
                                path: `/${prefix}/monitoring-of-transportation/default/despatch-details`,
                                name: 'default-despatch-details',
                                components: {
                                    default: MaterialDetails,
                                },
                            },
                        ],
                    },
                    {
                        path: `/${prefix}/monitoring-of-transportation/reception`,
                        name: 'monitoring-of-reception',
                        components: {
                            default: ReceptionInfoQuery,
                        },
                        children: [
                            {
                                path: `/${prefix}/monitoring-of-transportation/reception/express-route`,
                                name: 'reception-express-route',
                                components: {
                                    default: ExpressRoute,
                                },
                            },
                            {
                                path: `/${prefix}/monitoring-of-transportation/reception/despatch-details`,
                                name: 'reception-despatch-details',
                                components: {
                                    default: MaterialDetails,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

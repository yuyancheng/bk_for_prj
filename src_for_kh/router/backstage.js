import Main from '@/views/Main';
import Index from '@/views/backstage/Index';
import UserCenter from '@/views/backstage/UserCenter';
import UserManagement from '@/views/backstage/UserManagement';
import MaterialManagement from '@/views/backstage/MaterialManagement';
import UnitManagement from '@/views/backstage/UnitManagement';
import UnitManagementList from '@/views/backstage/UnitManagementList';
import CategoryManagement from '@/views/backstage/CategoryManagement';
import CategoryManagementList from '@/views/backstage/CategoryManagementList';
import StructureManagement from '@/views/backstage/StructureManagement';
import SpecialityManagement from '@/views/backstage/SpecialityManagement';
import OrgTypeManagement from '@/views/backstage/OrgTypeManagement';
import InfoManagement from '@/views/backstage/InfoManagement';
import NoticeManagement from '@/views/backstage/NoticeManagement';
import ArticleEdit from '@/views/backstage/ArticleEdit';

const prefix = 'kh';

export default [
    {
        path: `/${prefix}`,
        name: `${prefix}`,
        component: Main,
        redirect: `/${prefix}/home`,
        children: [
            {
                path: `/${prefix}/management-of-backstage`,
                name: 'managementOfBackstage',
                components: {
                    default: Index,
                },
                redirect: `/${prefix}/management-of-backstage/user-center`,
                meta: { title: '后台管理' },
                children: [
                    {
                        path: `/${prefix}/management-of-backstage/user-center`,
                        name: 'user-center',
                        component: UserCenter,
                        meta: { title: '用户中心' },
                    },
                    {
                        path: `/${prefix}/management-of-backstage/user-management`,
                        name: 'user-management',
                        component: UserManagement,
                        meta: { title: '用户管理' },
                    },
                    {
                        path: `/${prefix}/management-of-backstage/category-management`,
                        name: 'category-management',
                        component: CategoryManagement,
                        redirect: `/${prefix}/management-of-backstage/category-management/category-management-list`,
                        meta: { title: '物资类别管理' },
                        children: [
                            {
                                path: `/${prefix}/management-of-backstage/category-management/category-management-list`,
                                name: 'category-management-list',
                                component: CategoryManagementList,
                                meta: { title: '物资类别管理列表' },
                            },
                            {
                                path: `/${prefix}/management-of-backstage/category-management/speciality-management`,
                                name: 'speciality-management',
                                component: SpecialityManagement,
                                meta: { title: '专业管理' },
                            },
                        ],
                    },
                    {
                        path: `/${prefix}/management-of-backstage/material-management`,
                        name: 'material-management',
                        component: MaterialManagement,
                        meta: { title: '物资管理' },
                    },
                    {
                        path: `/${prefix}/management-of-backstage/unit-management`,
                        name: 'unit-management',
                        component: UnitManagement,
                        redirect: `/${prefix}/management-of-backstage/unit-management/structure-management-list`,
                        meta: { title: '收发单位管理' },
                        children: [
                            {
                                path: `/${prefix}/management-of-backstage/unit-management/structure-management-list`,
                                name: 'unit-management-list',
                                component: UnitManagementList,
                                meta: { title: '收发单位列表' },
                            },
                            {
                                path: `/${prefix}/management-of-backstage/unit-management/structure-management`,
                                name: 'structure-management',
                                component: StructureManagement,
                                meta: { title: '架构管理' },
                            },
                            {
                                path: `/${prefix}/management-of-backstage/unit-management/speciality-management`,
                                name: 'speciality-management',
                                component: SpecialityManagement,
                                meta: { title: '专业管理' },
                            },
                        ],
                    },
                    {
                        path: `/${prefix}/management-of-backstage/org-type-management`,
                        name: 'org-type-management',
                        component: OrgTypeManagement,
                        meta: { title: '组织类型管理' },
                    },
                    {
                        path: `/${prefix}/management-of-backstage/info-management`,
                        name: 'info-management',
                        component: InfoManagement,
                        meta: { title: '发运信息管理' },
                    },
                    {
                        path: `/${prefix}/management-of-backstage/notice-management`,
                        name: 'notice-management',
                        component: NoticeManagement,
                        meta: { title: '文章发布管理' },
                    },
                    {
                        path: `/${prefix}/management-of-backstage/article-edit`,
                        name: 'article-edit',
                        component: ArticleEdit,
                        meta: { title: '内容编辑' },
                    },
                ],
            },
        ],
    },
];

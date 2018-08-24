
const Main = () => import('@/views/main/index');

export default [
  { path: '/', redirect: '/overview' },
  { path: '/overview', component: Main, meta: { title: '后勤物流融合网' } },
];

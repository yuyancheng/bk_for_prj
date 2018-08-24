import DataImport from '@/components/tools/DataImport';
import SimulationResult from '@/components/tools/SimulationResult';
import CompareDetail from '@/components/tools/CompareDetail';
import CitySelection from '@/components/tools/CitySelection';

let prefix = '';
// let prefix = '/vsrc';

export default [{
    path: prefix + '/tools/data_import',
    name: 'data_import',
    component: DataImport,
    meta: {title: '数据导入'},
    children: [
        {
            path: prefix + '/tools/data_import/adding_cities',
            name: 'adding_cities',
            component: CitySelection,
            meta: {title: '添加城市'}
        }
    ]
}, {
    path: prefix + '/tools/data_import/simulation_result',
    name: 'simulation_result',
    component: SimulationResult,
    meta: {title: '模拟结果'}
}, {
    path: prefix + '/tools/data_import/compare_detail',
    name: 'compare_detail',
    component: CompareDetail,
    meta: {title: '对比详情'}
}];

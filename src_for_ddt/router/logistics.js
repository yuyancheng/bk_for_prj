import RequireChanges from '@/components/logistics/RequireChanges';
import AddressManagement from '@/components/logistics/requireChanges/AddressManagement';
import Returned from '@/components/logistics/requireChanges/Returned';
import InitiatorManagement from '@/components/logistics/requireChanges/InitiatorManagement';
import ChangeReceiverInfo from '@/components/logistics/requireChanges/ChangeReceiverInfo';
import DemandResend from '@/components/logistics/requireChanges/DemandResend';
import DemandForward from '@/components/logistics/requireChanges/DemandForward';
import ExpressRoute from '@/components/logistics/express/ExpressRoute';
import TrendCurves from '@/components/logistics/express/TrendCurves';
import RealtimeTrends from '@/components/logistics/waybill/RealtimeTrends';
import ExpressInAll from '@/components/logistics/waybill/ExpressInAll';
import UnfinishedWaybill from '@/components/logistics/waybill/UnfinishedWaybill';
import MyColumn from '@/components/inner/MyColumn';
import UserCenter from '@/components/inner/UserCenter';

let prefix = '';
// let prefix = '/vsrc';.

export default [{
    path: prefix + '/logistics/self_service/express_service/requirement_changes',
    name: 'requirement_changes',
    components: {
        default: RequireChanges
    },
    meta: {title: '需求变更'},
    children: [
        {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/address_management',
            name: 'address_management',
            component: AddressManagement,
            meta: {title: '退回地址管理'}
        }, {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/returned',
            name: 'returned',
            component: Returned,
            meta: {title: '我要退回'}
        }, {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/demand_resend',
            name: 'demand_resend',
            component: DemandResend,
            meta: {title: '我要再派'}
        }, {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/demand_forward',
            name: 'demand_forward',
            component: DemandForward,
            meta: {title: '我要转寄'}
        }, {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/initiator_management',
            name: 'initiator_management',
            component: InitiatorManagement,
            meta: {title: '发起人管理'}
        }, {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/change_receiver_info',
            name: 'change_receiver_info',
            component: ChangeReceiverInfo,
            meta: {title: '更改收件人信息'}
        }, {
            path: prefix + '/logistics/self_service/express_service/requirement_changes/express_route',
            name: 'express_route',
            component: ExpressRoute,
            meta: {title: '路由追踪'}
        }
    ]
}, {
    path: prefix + '/logistics/express_analysis/express_monitoring/realtime_trends',
    name: 'realtime_trends',
    components: {
        default: RealtimeTrends
    },
    meta: {title: '今日快件动态'},
    children: [
        {
            path: prefix + '/logistics/express_analysis/express_monitoring/realtime_trends/trends_express_route',
            name: 'trends_express_route',
            component: ExpressRoute,
            meta: {title: '路由追踪'}
        }, {
            path: prefix + '/logistics/express_analysis/express_monitoring/realtime_trends/trend_curves',
            name: 'trend_curves',
            component: TrendCurves,
            meta: {title: '动态趋势'}
        }
    ]
}, {
    path: prefix + '/logistics/express_analysis/express_monitoring/unfinished_waybill',
    name: 'unfinished_waybill',
    components: {
        default: UnfinishedWaybill
    },
    meta: {title: '未完成快件跟踪'},
    children: [
        {
            path: prefix + '/logistics/express_analysis/express_monitoring/unfinished_waybill/waybill_express_route',
            name: 'waybill_express_route',
            component: ExpressRoute,
            meta: {title: '路由追踪'}
        }
    ]
}, {
    path: prefix + '/logistics/express_analysis/express_monitoring/express_in_all',
    name: 'express_in_all',
    components: {
        default: ExpressInAll
    },
    meta: {title: '快件总览'},
    children: [
        {
            path: prefix + '/logistics/express_analysis/express_monitoring/express_in_all/express_in_all_route',
            name: 'express_in_all_route',
            component: ExpressRoute,
            meta: {title: '路由追踪'}
        }
    ]
}, {
    path: prefix + '/logistics/express_analysis/despatch_analysis/my_column',
    name: 'my_column',
    components: {
        default: MyColumn
    },
    meta: {title: '我的看板'}
}, {
    path: prefix + '/logistics/user_center',
    name: 'user_center',
    component: UserCenter,
    meta: {title: '用户中心'}
}];

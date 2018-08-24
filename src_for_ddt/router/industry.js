import Express from '@/components/industry/Express';
import Overview from '@/components/industry/Overview';
import RiskIdentification from '@/components/industry/RiskIdentification';

export default [{
    path: '/industry',
    name: 'Industry',
    components: {
        default: Express
    }
}, {
    path: '/industry/overview',
    name: 'overview',
    components: {
        default: Overview
    }
}, {
    path: '/industry/riskIdentification',
    name: 'RiskIdentification',
    components: {
        default: RiskIdentification
    }
}];

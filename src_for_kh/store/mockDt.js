import axios from 'axios';
import apiData from '@/assets/datas/apiData';

const ajaxByMock = (params) => {
    const m = apiData[params.url](params.url, params.method, params.data);
    axios({
        method: params.method,
        url: params.url,
        data: params.data,
    }).then((a, b) => {
        m.success(a, b);
    }).catch((a, b) => {
        m.error(a, b);
    });
    return m;
};

ajaxByMock.get = (url, params) => {
    const m = apiData[url](url, 'get', params);
    axios.get(url, params).then((a, b) => {
        m.success(a, b);
    }).catch((a, b) => {
        m.error(a, b);
    });
    return m;
};

ajaxByMock.post = (url, params) => {
    const m = apiData[url](url, 'post', params);
    axios.post(url, params).then((a, b) => {
        m.success(a, b);
    }).catch((a, b) => {
        m.error(a, b);
    });
    return m;
};

export default ajaxByMock;

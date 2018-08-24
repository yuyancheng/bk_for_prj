import axios from 'axios';

let ajax = {
/*  axios.request(config)
    axios.get(url[, config])
    axios.delete(url[, config])
    axios.head(url[, config])
    axios.post(url[, data[, config]])
    axios.put(url[, data[, config]])
    axios.patch(url[, data[, config]])*/
};


let ajaxa = (context) => {
    // axios.defaults.baseURL = 'https://api.example.com';
    // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
    // axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    axios({
        maxRedirects: 3,
        baseURL: '/ddt',
        method: 'post',
        url: context.state.url,
        params: context.state.params,
        timeout: 3000
    }).then((res) => {
        if (context.state.success) {
            context.state.success(res);
        }
    }).catch((err) => {
        console.log(err);

        if (context.state.error) {
            context.state.error(err);
        }
    });
};

export default ajax;

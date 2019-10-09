import req from '../utils/request'
export default {
    getdata(query) {
        return req({
            method: 'post',
            url: '/api/search',
            data: query
        })
    }
}
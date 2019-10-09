import req from '../utils/request'
export default {
    getMsg() {
        return req({
            method: 'post',
            url: '/api/getmsg'
        })
    }
}
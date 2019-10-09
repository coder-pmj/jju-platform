import req from '../utils/request'
export default {
    getUser() {
        return req({
            method: 'post',
            url: '/api/getcommentuser'
        })
    }
}
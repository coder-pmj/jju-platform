import req from '../utils/request'
export default {
    checkSno(data) {
        return req({
            method: 'post',
            url: '/api/checksno',
            data: data
        })
    }
}
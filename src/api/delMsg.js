import req from '../utils/request'
export default {
    delMsg(obj) {
        return req({
            method: 'delete',
            url: '/api/delmsg',
            data: obj
        })
    }
}
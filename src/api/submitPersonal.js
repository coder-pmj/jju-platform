import req from '../utils/request'
export default {
    addPersonal(d) {
        return req({
            method: 'post',
            url: '/api/addpersonal',
            data: d
        })
    }
}
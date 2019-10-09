import req from '../utils/request'
export default {
    translate(d) {
        return req({
            method: 'post',
            url: '/api/translateflag',
            data: d
        })
    }
}
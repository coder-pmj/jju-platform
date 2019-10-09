import req from '../utils/request'
export default {
    submitItem(data) {
        return req({
            method: 'post',
            url: '/api/submititem',
            data: data
        })
    }
}
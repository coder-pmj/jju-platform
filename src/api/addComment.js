import req from '../utils/request'
export default {
    addComment(data) {
        return req({
            method: 'post',
            url: '/api/commentary',
            data: data
        })
    }
}
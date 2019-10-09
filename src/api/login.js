import req from "@/utils/request";

export default {
    getuser(data) {
        return req({
            method: 'post',
            url: '/api/login',
            data: data
        })
    },
    /* 判断是否存在此用户 */
    checkUser(user) {
        return req({
            method: 'post',
            url: '/api/login/hasuser',
            data: user
        })
    },
    /* 根据token获取用户信息 */
    getUserInfo(token) {
        return req({
            method: 'get',
            url: `/api/login/info/${token}`,
        })
    }
}
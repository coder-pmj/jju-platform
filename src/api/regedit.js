import req from "@/utils/request";

export default {
   saveUser(data){
       return req({
           method:'post',
           url:'/api/regedit',
           data:data
       })
   }
}
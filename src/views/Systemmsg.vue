<template>
  <div>
    <el-switch v-model="readyFlag" active-text="未读" inactive-text="已读"></el-switch>

    <el-card
      class="box-card"
      shadow="hover"
      style="margin-top:20px"
      v-for="(it,index) in msg"
      :key="index"
    >
      <div slot="header" class="clearfix">
        <span style="font-weight:800">动态标题 :&nbsp;</span>
        <span style="font-weight:400;color:#aabbcc">{{it.obj}}</span>
        <span style="margin-left:50px;font-weight:800">时间 :&nbsp;</span>
        <span style="font-weight:400;color:#aabbcc">{{it.date}}</span>
        <template v-if="it.flag=='0'">
          <el-tooltip content="标为已读" placement="right-end" effect="light">
            <i
              style="float:right;margin-left:20px;cursor: pointer;outline:none"
              class="el-icon-star-off"
              @click="translateFlag(index,it.id)"
            ></i>
          </el-tooltip>
        </template>
        <template v-else-if="it.flag=='1'">
          <i
            style="float:right;margin-left:20px;cursor: pointer;outline:none"
            class="el-icon-delete"
            @click="deleteMsg(index,it.id)"
          ></i>
        </template>
      </div>
      <div style="text-indent:2em;font-size:15px;color:cornflowerblue">{{it.content}}</div>
    </el-card>
  </div>
</template>

<script>
import getMsgApi from "@/api/getMsg";
import * as local from "@/utils/local";
import getDataApi from "@/api/getItem";
import translateFlagApi from "@/api/translateFlag";
import delMsgApi from "@/api/delMsg";
export default {
  data() {
    return {
      msgArr: [],
      userAllData: "",
      weiready: [], //未读
      yiready: [],
      readyFlag: "",
      msg: []
    };
  },
  created() {
    this.getdata();
  },
  methods: {
    /* 标为已读 */
    translateFlag(index, id) {
      translateFlagApi.translate({ id: id }).then(res => {
        const resp = res.data;
        if (resp.flag) {
          this.weiready[index].flag = "1";
          this.yiready.push(this.weiready[index]);
          this.weiready.splice(index, 1);
        }
      });
      // console.log(this.weiready[index])
    },
    /* 获取用户名 */
    getdata() {
      //console.log(local.getUser().user)
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
        if (res.data.flag) {
          getMsgApi.getMsg().then(res2 => {
            //console.log(res2)
            const resp = res2.data;
            this.msgArr = resp.data.filter(v => {
              return (v.user = this.userAllData.name);
            });
            /* 筛选未读 */
            this.weiready = this.msgArr.filter(v => {
              return v.flag == "0";
            });
            /* 筛选已读 */
            this.yiready = this.msgArr.filter(v => {
              return v.flag == "1";
            });
            this.msg = this.weiready.reverse();
          });
        }
        // console.log(this.userAllData)
        let ran = Math.random();
        if (ran < 0.2 && !this.userAllData.name) {
          this.$confirm("您的个人资料还不完善, 是否去完善?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info"
          })
            .then(() => {
              this.$router.push("/personal");
            })
            .catch(() => {});
        }

        //console.log(this.userAllData);
      });
    },
    /* 删除已读消息 */
    deleteMsg(index, id) {
     // this.yiready.splice(index, 1);
      delMsgApi.delMsg({ id: id }).then(res => {
        const resp = res.data;
        if (resp.flag) {
          this.$message({
            type: "success",
            message: resp.message
          });
          this.yiready.splice(index, 1);
        }
      });
    }
  },

  watch: {
    readyFlag: {
      deep: true,
      handler(v) {
        if (v) {
          this.msg = this.weiready.reverse();
        } else {
          this.msg = this.yiready.reverse();
         // console.log(this.msg);
        }
      }
    }
  }
};
</script>

<style scoped>
</style>
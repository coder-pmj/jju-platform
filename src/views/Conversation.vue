<template>
  <div>
    <el-card class="box-card" shadow="hover" v-for="(it,index) in ht" :key="index">
      <div slot="header" class="clearfix">
        <span style="font-weight:800">标题 :</span>
        <span style="font-weight:400;color:#aabbcc">{{it.title}}</span>
        <span style="margin-left:50px;font-weight:800">时间 :</span>
        <span style="font-weight:400;color:#aabbcc">{{it.date}}</span>
        <span style="margin-left:50px;font-weight:800">用户 :</span>
        <span v-if="!it.user.includes('匿名')" style="font-weight:400;color:#aabbcc">{{it.user}}</span>
        <span v-else style="font-weight:400;color:red">匿名</span>
        <el-tooltip content="删除此话题" placement="right-end" effect="light">
          <i
            v-if="it.user==userAllData.name"
            style="float:right;margin-left:20px;cursor: pointer;outline:none"
            class="el-icon-delete"
            @click="delHT(it.id,it.url,index)"
          ></i>
        </el-tooltip>

        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="showForm(it.num,userAllData.name)"
        >参与讨论</el-button>
      </div>
      <div style="text-indent:2em;font-size:15px;color:cornflowerblue">{{it.content}}</div>
      <el-divider content-position="left">
        <span style="font-weight:600">用户评论</span>
      </el-divider>
      <div v-if="it.comment.length">
        <span
          style="cursor:pointer"
          class="comment"
          v-for="(comments ,index) in it.comment"
          :key="index"
        >
          <span>
            <span style="color:cornflowerblue">{{comments.user}}</span>:
            <span style="color:dark;">{{comments.text}}</span>
          </span>
        </span>
      </div>
      <div v-else>暂无评论</div>
    </el-card>
  </div>
</template>

<script>
import getDataApi from "@/api/getItem";
import addCommentApi from "@/api/addComment";
import * as local from "@/utils/local";
import delApi from "@/api/delItem.js";
export default {
  data() {
    return {
      dialogVisible: false,
      t: "",
      ht: null,
      commentText: "",
      userAllData: null
    };
  },
  created() {
    this.t = this.$route.query.t;
    // console.log(this.items)
    this.initData(); //初始化所有话题数据
    this.getUserName();
  },
  methods: {
    /* 删除动态 */
    delHT(id, url, index) {
      this.$confirm("确认删除吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          delApi.del({ id: id, url: url }).then(res => {
            const resp = res.data;
            this.$message({
              type: resp.flag ? "success" : "error",
              message: resp.message,
              duration: 1200
            });
            if (resp.flag) {
              this.ht.splice(index, 1);
              this.$router.push("/");
            }
          });
        })
        .catch(() => {});
    },
    initData() {
      getDataApi.getdata().then(res => {
        this.ht = res.data.data
          .filter(v => {
            return v.item_type == "h";
          })
          .filter(v => {
            return v.title == this.t;
          });
        // console.log(this.htarr)
      });
    },
    showForm(num, user) {
      if (this.userAllData.name) {
        this.$prompt("请输入您的评论", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        })
          .then(({ value }) => {
            this.commentText = value;
            //更新视图
            this.ht.forEach(v => {
              if (v.num == num) {
                v.comment.push({ user: user, text: value });
              }
            });
            let obj = {
              num1: num,
              user: user,
              text: this.commentText
            };
            addCommentApi.addComment(obj).then(res => {
              this.$message({
                type: res.data.flag ? "success" : "error",
                message: res.data.message,
                duration: 1000
              });
            });
          })
          .catch(() => {});
      } else {
        this.$confirm("评论功能需完善个人资料, 是否去完善?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$router.push("/personal");
          })
          .catch(() => {});
      }
    },
    getUserName() {
      //console.log(local.getUser().user)
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
        //console.log(this.userAllData);
      });
    }
  }
};
</script>

<style scoped>
.el-card {
  margin: 10px 0 10px 0;
}
.comment {
  display: block;
  font-size: 13px;
  font-weight: 400;
}
.co {
  background-color: beige;
}
</style>
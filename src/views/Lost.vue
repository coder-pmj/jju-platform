<template>
  <div>
    <!-- item-->
    <template>
      <div class="items" v-for="(it,index) in con" :key="index">
        <el-card
          shadow="hover"
          v-if="it.item_type=='s'"
          style="min-height:190px"
          :body-style="{ padding: '26px' }"
        >
          <!--<img v-if="it.url" :src="base+it.url" class="img" />
          <img v-else :src="base+'noimg.png'" class="img" />-->
          <img :src="base+it.url" class="img" />
          <div class="text">
            <span class="title">
              {{it.title}}
              <span style="color:#d3dce9;margin-left:20px">
                <i>#</i>
                {{it.item_type|typefilter}}
              </span>
            </span>
            <p>
              {{it.date}}&nbsp;&nbsp;&nbsp;来自用户:
              <span style="color:red">{{it.user?it.user:'匿名用户'}}</span>
            </p>
            <div style="text-indent:2em">{{it.content}}</div>
          </div>
          <!--it.comment 代表此item下的所有评论集合->数组 -->
          <el-form style="margin-top:40px" @keyup.native.enter="addComment(it.num,it.comment)">
            <el-input
              type="text"
              size="mini"
              v-model="commentArea[it.num-1].text"
              placeholder="留下您的精彩评论"
            ></el-input>
            <input type="text" style="display:none" />
          </el-form>
          <!-- 评论显示区-->
          <div style="margin-top:8px">
            <span class="comment" v-for="(comments ,index) in it.comment" :key="index">
              <span style="color:#606266;font-weight:600">{{comments.user}}</span>:
              <span style="color:#909399">{{comments.text}}</span>
            </span>
          </div>
          <!--end -->
          <span v-if="it.comment.length" style="font-weight:600;cursor:pointer"></span>
          <span v-else>暂无评论</span>
        </el-card>
        
      </div>
      <span v-if="!has">暂无数据</span>
    </template>
    <!--end item -->
  </div>
</template>

<script>
import getDataApi from "@/api/getItem";
import { base } from "@/utils/baseStatic"; //导入图片基础路径
import * as local from "@/utils/local";
import addCommentApi from "@/api/addComment";
import { checkComment } from "@/utils/checkComment.js";
export default {
  data() {
    return {
      base: base,
      con: [],
      commentArea: [],
      userAllData: null
    };
  },
  created() {
    this.getUserName();
    this.initData();
  },
  computed: {
    has() {
      return this.con.filter(v => v.item_type == "s").length;
    }
  },
  methods: {
    /* 获取用户名 */
    getUserName() {
      //console.log(local.getUser().user)
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
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

    initData() {
      getDataApi.getdata().then(res => {
        this.con = res.data.data;
        for (let i = 1; i <= this.con.length; i++) {
          this.commentArea.push({ id: i, text: "" });
        }
      });
    },
    /* 添加评论 */
    addComment(num, arr) {
      if (this.userAllData.name) {
        //num为item的顺序值，如在第三个item写评论，将会传入的num值为3
        //num-1为数组下标a
        //console.log(arr);
        let obj = this.commentArea[num - 1];
        if (obj.text) {
          //如果不为空

          let strArr = [];
          for (let i = 0; i < obj.text.length; i++) {
            let s = obj.text.substr(i, 1);
            strArr.push(s);
          }
          //单个字
          let th = strArr.some(v => {
            return /[草艹操]/.test(v);
          });
          //多个字
          if (checkComment(obj.text)) {
            th = true;
          }

          if (th) {
            this.$message({
              type: "error",
              message: "您的评论含有敏感字",
              duration: 1000
            });
            this.commentArea[num - 1].text = ""; //清空表单
          } else {
            //没有敏感字执行发送数据
            arr.push({
              num1: num,
              text: this.commentArea[num - 1].text,
              user: this.userAllData.name //获取localStronge中的用户信息
            });
            this.commentArea[num - 1].text = ""; //清空表单
            //arr是每一个item块中的所有评论，需要将arr数组的最后一条评论传入后端 即  arr[arr.length-1]
            addCommentApi.addComment(arr[arr.length - 1]).then(res => {
              const resp = res.data;

              this.$message({
                type: resp.flag ? "success" : "error",
                message: resp.message,
                duration: 1000
              });
            });
          }
        }
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
    }
  }
};
</script>

<style scoped>
.news {
  width: 420px;
  max-height: 466px;
  background-color: whitesmoke;
  position: absolute;
  top: 45px;
  right: 50px;
  box-sizing: border-box;
  padding: 20px;
}
.new-content {
  color: black;
  display: block;
  font-weight: 100;
  font-size: 18px;
  padding: 32px 0 0 0;
  max-width: fit-content;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}
.items {
  width: 800px;
}
.items .img {
  margin-left: 30px;
  width: 240px;
  position: relative;
  left: -25px;
}
.items .text {
  box-sizing: border-box;
  width: 470px;
  height: 138.66px;
  float: right;
}
.title {
  display: block;
  font-size: 19px;
  font-weight: 800;
}

.comment {
  display: block;
  font-size: 13px;
  font-weight: 400;
}
</style>
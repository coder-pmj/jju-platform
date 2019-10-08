<template>
  <div>
    <el-carousel height="444px" style="width:800px;background-color:red">
      <el-carousel-item v-for="item in images" :key="item.id">
        <el-image :src="base+item.img" style="width:800px;"></el-image>
      </el-carousel-item>
    </el-carousel>
    <div class="news" ref="news">
      <el-badge :value="showTxt=='所有话题'?'':newItemValue">
        <el-button
          type="success"
          round
          plain
          size="mini"
          @mouseenter.native="showMore"
          @mouseleave.native="showOldTxt"
          @click="pushTalk"
        >{{showTxt}}</el-button>
      </el-badge>
      <el-tooltip
        v-for="(its,index) in consHT"
        :key="index"
        class="item"
        effect="dark"
        :content="its.content.length>12?its.content.substr(0,12)+' ......':its.content"
        placement="right-end"
      >
        <span v-if="!its.url&&index<6" @click="getdetail(its.title)" class="new-content">
          <span style="color:red;font-weight:400">{{its.opt}}</span>
          .&nbsp;{{its.title}}
        </span>
      </el-tooltip>
    </div>
    <!-- item-->
    <template>
      <div v-infinite-scroll="load" infinite-scroll-disabled="disabled">
        <div class="items" v-for="(it,index) in con" :key="index">
          <el-card
            shadow="hover"
            v-if="it.url"
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
                <span
                  style="color:red"
                >{{it.user.includes('匿名')?'匿名用户':it.user}}</span>
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
        <p v-if="loading">加载中...</p>
        <p v-if="noMore">没有更多了</p>
      </div>
    </template>
    <!--end item -->

    <el-popover placement="bottom-end" title="温馨提示" width="200" trigger="hover" content="注意时间哦，亲">
      <div class="clock" ref="clock" slot="reference"></div>
    </el-popover>
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
      showTxt: "今日更新",
      leftWidth: "",
      userAllData: null,
      theSelect: false,
      Interval: null,
      base: base, //图片文件在服务器的基础路径
      url: "find",
      images: [{ id: 1, img: "huan3.png" }, { id: 2, img: "huan2.png" }],
      items: [],
      con: [], //已加载出来的动态
      cons: [], //全部的动态
      arr: [],
      // Vcon: [],
      //Vcons: [],
      loading: false,
      clockarea: "",
      commentArea: [] //评论容器  是cons的子数组 在cons创建之时同步创建
    };
  },
  created() {
    this.leftWidth = (window.innerWidth - this.$root.allWidth) / 2;
    this.initData();
    this.getUserName();
    window.addEventListener("scroll", this.handleScroll, true);
  },
  mounted() {
    this.loop();
  },
  updated() {
    this.$refs.clock.style.position = "absolute";
    this.$refs.clock.style.top = this.$refs.news.clientHeight + 60 + "px";
    this.$refs.clock.style.right = 50 + "px";
  },
  computed: {
    noMore() {
      return this.con.length >= this.arr.length;
    },
    disabled() {
      return this.loading || this.noMore;
    },
    //最新话题
    consHT() {
      let arr = this.cons
        .reverse()
        .filter(v => !v.url)
        .filter(v => this.checkNewItem(v.date.substr(0, 10)));

      for (let i = 0; i < arr.length; i++) {
        arr[i].opt = i + 1;
      }

      return arr;
    },
    /* 获取最新话题个数 */
    newItemValue() {
      return this.cons
        .filter(v => !v.url)
        .filter(y => this.checkNewItem(y.date.substr(0, 10))).length;
    }
  },
  methods: {
    getdetail(t) {
      this.$router.push({
        path: "/conversation",
        query: { t: t, item: this.cons }
      });
    },
    /* 鼠标移入 */
    showMore(f) {
      this.showTxt = "所有话题";
    },
    /* 鼠标移出 */
    showOldTxt() {
      this.showTxt = "今日更新";
    },
    /* 获取用户名 */
    getUserName() {
      //console.log(local.getUser().user)
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
        // console.log(this.userAllData)
        let ran = Math.random();
        if (ran < 0.3 && !this.userAllData.name) {
          this.$confirm("您的个人资料还不完善, 是否去完善?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "info"
          })
            .then(() => {
              this.$router.push("/personal");
            })
        }

        //console.log(this.userAllData);
      });
    },
    /* 初始化数据 */
    initData() {
      getDataApi.getdata().then(res => {
        //console.log(res.data);
        this.cons = res.data.data;
        //console.log(this.cons)
        //初始化评论容器
        for (let i = 1; i <= this.cons.length; i++) {
          this.commentArea.push({ id: i, text: "" });
        }
        //console.log(this.commentArea);
        let items = this.cons.filter(v => {
          return v.item_type != "h";
        });
        this.arr = items;
        //  console.log(this.arr);

        //console.log(resp);
        if (items.length) {
          if (items.length > 1) {
            this.con.push(items[items.length - 1]); //6
            this.con.push(items[items.length - 2]); //5
          } else if ((items.length = 1)) {
            this.con.push(items[0]);
          }
        }
        //this.cons.reverse();
      });
    },
    checkNewItem(date) {
      //console.log(date);
      let boo = false;

      let d = new Date(),
        currentY = d.getFullYear(),
        currentM = this.checkNum(d.getMonth() + 1),
        currentD = this.checkNum(d.getDate());
      let currentTime = `${currentY}-${currentM}-${currentD}`;
      //console.log(currentTime)
      //console.log(y, m, d);
      if (currentTime == date) {
        boo = true;
      }
      return boo;
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
    },
    /* 时钟数字过滤方法 */
    checkNum(n) {
      if (n < 10) {
        return "0" + n;
      } else {
        return n;
      }
    },
    /* 时钟 */
    loop() {
      //console.log(new Date())
      this.Interval = setInterval(() => {
        let t = new Date(),
          h = this.checkNum(t.getHours()),
          m = this.checkNum(t.getMinutes()),
          s = this.checkNum(t.getSeconds());
        if (this.$refs.clock) {
          this.$refs.clock.innerHTML = `${h}:${m}:${s}`;
          this.time = `${h}:${m}:${s}`;
        }
      });
    },
    /* 响应滚动 */
    handleScroll() {
      // console.log('滚动')
      if (this.$refs.news) {
        this.clockarea = this.$refs.news.getBoundingClientRect().top;
      }
    },
    //滚动加载
    load() {
      let ran = Math.random();
      this.loading = true;
      setTimeout(() => {
        let arr = this.arr.filter(v => {
          return v.ind == this.arr.length - this.con.length; //每次加载一张
        });
        // console.log(obj);
        this.con.push(...arr);
        //this.Vcon=this.con
        //console.log(this.con)
        this.loading = false;
      }, ran * 2000);
    },
    /* 跳转 */
    pushTalk() {
      this.$router.push("/talk");
      this.showTxt = "今日更新";
    }
  },
  /* 即将离开页面的钩子函数 */
  beforeDestroy() {
    //console.log("清除定时器");
    clearInterval(this.Interval);
  },
  watch: {
    /* 检测时间盒子位置变化 */
    clockarea(va) {
      //console.log(va);
      if (va < 0) {
        this.$refs.clock.style.position = "fixed";
        this.$refs.clock.style.top = 100 + "px";
        this.$refs.clock.style.right = this.leftWidth + 50 + "px";
      } else {
        this.$refs.clock.style.position = "absolute";
        this.$refs.clock.style.top = this.$refs.news.clientHeight + 60 + "px";
        this.$refs.clock.style.right = 50 + "px";
      }
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
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
.clock {
  background-color: white;
  width: 420px;
  box-sizing: border-box;
  padding: 50px;
  text-align: center;
  font-size: 60px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.comment {
  display: block;
  font-size: 13px;
  font-weight: 400;
}

@media only screen and (max-width: 1465px) {
  .news,
  .clock {
    display: none;
  }
}
</style>
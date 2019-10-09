<template>
  <div>
    <!-- -->
    <div class="top-wrap" ref="lWrap">
      <span>
        搜索关键词 :
        <span style="font-weight:500;color:purple">{{Query}}</span>
      </span>
      <span style="margin-left:60px">
        搜索结果数 :
        <span style="font-weight:500;color:red">{{data.length}}</span>
        条
      </span>
    </div>
    <!-- end-->
    <el-divider content-position="left">搜索结果</el-divider>

    <!-- item-->

    <template>
      <div v-if="data.length">
        <div class="items" v-for="(it,index) in data" :key="index">
          <el-card shadow="hover" style="min-height:190px" :body-style="{ padding: '26px' }">
            <img v-if="it.url" :src="base+it.url" class="img" />
            <div :class="{text:it.url?isText:!isText}">
              <span class="title">
                {{it.title}}
                <span style="color:#d3dce9;margin-left:20px">
                  <i>#</i>
                  {{it.item_type|typefilter}}
                </span>
              </span>
              <p>{{it.date}}</p>
              <div style="text-indent:2em">{{it.content}}</div>
            </div>
            <!--it.comment 代表此item下的所有评论集合->数组 -->
            <el-form
              style="margin-top:40px"
              @keyup.native.enter="addComment(it.num,it.newId,it.comment)"
            >
              <el-input
                type="text"
                size="mini"
                v-model="commentWrap[it.newId].text"
                placeholder="留下您的精彩评论"
              ></el-input>
              <input type="text" style="display:none" />
            </el-form>
            <!-- 评论显示区-->
            <div style="margin-top:8px">
              <span class="comment" v-for="(comments ,index) in it.comment" :key="index">
                <span style="color:cornflowerblue">{{comments.user}}</span>:
                <span style="color:dark">{{comments.text}}</span>
              </span>
            </div>
          </el-card>
        </div>
      </div>

      <div v-else>未查询到相关信息</div>
    </template>

    <div class="right-wrap" ref="rWrap">
      <el-divider>
        <span style="font-weight:800">友情链接</span>
      </el-divider>
      <el-carousel height="200px" :autoplay="true" style="width:355.55px">
        <el-carousel-item v-for="item in images" :key="item.id">
          <a :href="item.url" target="_blank">
            <el-image :src="base+item.img"></el-image>
          </a>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!--end item -->
  </div>
</template>

<script>
import getDataApi from "@/api/getItem";
import { base } from "@/utils/baseStatic"; //导入图片基础路径
import searchDataApi from "@/api/getSearchdata";
import * as local from "@/utils/local";
import addCommentApi from "@/api/addComment";
import { checkComment } from "@/utils/checkComment.js";
export default {
  data() {
    return {
      isText: true,
      images: [
        { id: 1, img: "jju.png", url: "https://www.jju.edu.cn/" },
        { id: 2, img: "xinxi.png", url: "https://xxxy.jju.edu.cn/" }
      ],
      leftWidth: "",
      topNum: "",
      userAllData: null,
      base: base,
      data: "", //数据
      commentWrap: [], //评论容器
      Query: "" //关键词
    };
  },
  computed: {
    query() {
      return this.$store.state.searchdata.query;
    }
  },
  created() {
    this.getUserName();
    this.Query = this.query;
    this.leftWidth = (window.innerWidth - this.$root.allWidth) / 2;
    window.addEventListener("scroll", this.handleScroll, true);
  },
  mounted() {
    if (this.Query) {
      this.getData(this.Query);
    }
  },
  watch: {
    query(s) {
      this.Query = s;
      this.getData(s);
    },
    /* 检测盒子位置变化 */
    topNum(va) {
      //console.log(va);

      if (va < 0) {
        this.$refs.rWrap.style.position = "fixed";
        this.$refs.rWrap.style.top = 100 + "px";
        this.$refs.rWrap.style.right = this.leftWidth + 44 + "px";
      } else {
        this.$refs.rWrap.style.position = "absolute";
        this.$refs.rWrap.style.top = 116 + "px";
        this.$refs.rWrap.style.right = 44 + "px";
      }
    }
  },
  methods: {
    /* 响应滚动 */
    handleScroll() {
      // console.log('滚动')
      if (this.$refs.lWrap) {
        //
        this.topNum = this.$refs.lWrap.getBoundingClientRect().top;
        //console.log(this.topNum);
      }
    },
    getUserName() {
      //console.log(local.getUser().user)
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
        //console.log(this.userAllData);
      });
    },
    getData(a) {
      searchDataApi.getdata(a).then(res => {
        //console.log(res.data)
        const resp = res.data;
        this.data = resp.data.reverse();
        // console.log(resp);

        for (let i = 0; i < this.data.length; i++) {
          this.commentWrap.push({ id: i, text: "" });
        }
      });
    },
    /* 添加评论 */
    addComment(num, index, arr) {
      //num为item的顺序值，如在第三个item写评论，将会传入的num值为3
      //num-1为数组下标a
      //console.log(arr);
      if (this.userAllData.name) {
        let obj = this.commentWrap[index];
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
            this.commentWrap[index].text = ""; //清空表单
          } else {
            //没有敏感字执行发送数据
            arr.push({
              num1: num,
              text: this.commentWrap[index].text,
              user: this.userAllData.name //获取localStronge中的用户信息
            });
            this.commentWrap[index].text = ""; //清空表单
            //  console.log(arr[arr.length - 1])
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
.top-wrap {
  font-weight: 800;
}
.items {
  width: 800px;
}
.items .img {
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
.right-wrap {
  cursor: pointer;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
  width: 355.55px;
  background-color: white;
  position: absolute;
  top: 116px;
  right: 44px;
  box-sizing: border-box;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
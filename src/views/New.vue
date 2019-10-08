<template>
  <div>
    <el-form ref="form" :model="form" label-width="80px" :rules="rules">
      <el-form-item label="标题" style="width:600px" prop="title">
        <el-input v-model="form.title" placeholder="请输入您需要发布的标题"></el-input>
      </el-form-item>
      <el-form-item label="分类" prop="item_type">
        <el-select v-model="form.item_type" placeholder="请选择分类">
          <el-option label="投稿" value="t"></el-option>
          <el-option label="话题" value="h"></el-option>
          <el-option label="失物招领" value="s"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="匿名" prop="block">
        <el-switch v-model="form.block"></el-switch>
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
          ref="upload"
          class="upload-demo"
          drag
          action="/img/upload/imgs"
          multiple
          :auto-upload="false"
          :before-upload="beforeupload"
          :on-error="error"
          :on-success="success"
          :limit="1"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-form-item>
      <el-form-item label="详情" prop="content">
        <el-input type="textarea" v-model="form.content"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit('form')">立即提交</el-button>
        <el-button @click="$refs.form.resetFields()">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import getDataApi from "@/api/getItem";
import * as local from "@/utils/local";
import submitItemApi from "@/api/submitItem";
export default {
  data() {
    return {
      form: {
        title: "",
        item_type: "",
        block: false,
        content: ""
      },
      arrform: {}, //提交至后端的对象
      img: null, //上传的图片
      date: "", //上传时间
      userAllData: null,
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        item_type: [{ required: true, message: "请选择类型" }],
        content: [{ required: true, message: "请输入内容", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getUserName();
    const h = this.$createElement;
    this.$notify({
      title: "提示",
      message: h(
        "i",
        { style: "color: teal" },
        "发布后需要人工审核通过后上线! 除发布话题以外,其余均需上传图片"
      ),
      duration: 10000
    });
  },
  methods: {
    /* 获取用户名 */
    getUserName() {
      //console.log(local.getUser().user)
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
        //console.log(this.userAllData);
      });
    },
    /* 提交 */
    onSubmit(f) {
      if (this.userAllData.name) {
        this.$refs[f].validate(v => {
          if (v) {
            if (this.form.item_type == "h") {
              this.add();
            } else {
              if (this.$refs.upload._data.uploadFiles.length) {
                this.$refs.upload.submit();
              } else {
                this.$message({
                  type: "error",
                  message: "请上传图片"
                });
              }
            }
          }
        });
      } else {
        this.$confirm("发布功能需完善个人资料, 是否去完善?", "提示", {
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
    /* 提交数据 */
    add(s) {
      this.arrform = this.form;
      this.arrform.sno=this.userAllData.sno
      if (this.arrform.block) {
        this.arrform.user = `${this.userAllData.name}(匿名)`;
      } else {
        this.arrform.user = this.userAllData.name;
      }
      if (this.form.item_type != "h") {
        this.arrform.url = s;
      } else {
        this.arrform.url = "";
      }
      this.arrform.date = this.getTime();

      /* 发送数据 */
      submitItemApi.submitItem(this.arrform).then(res => {
        const resp = res.data;
        this.$message({
          type: resp.flag ? "success" : "error",
          message: resp.message
        });

        if (resp.flag) {
          this.$refs.form.resetFields();
          this.$refs.upload.clearFiles();
          this.$notify({
            title: "提示",
            message: "审核结果请关注收件箱",
            duration: 3500
          });
          // this.img = null;
        }
      });
    },
    /* 获取时间 */
    getTime() {
      let da = new Date(),
        n = da.getFullYear(), //年
        y = this.checkTime(da.getMonth() + 1), //月
        r = this.checkTime(da.getDate()), //日
        s = this.checkTime(da.getHours()), //时
        f = this.checkTime(da.getMinutes()), //分
        m = this.checkTime(da.getSeconds()); //秒

      return `${n}-${y}-${r} ${s}:${f}:${m}`;
    },
    /* 转换时间格式 */
    checkTime(d) {
      if (d < 10) {
        return `0${d}`;
      } else {
        return d;
      }
    },
    /* 图片上传成功的函数 */
    success(res) {
      if (res.flag) {
        this.img = res.url;
      }
    },
    error(err) {
      console.log(err);
    },
    /* 上传文件之前对图片格式 大小进行过滤 */
    beforeupload(file) {
      let index = file.name.lastIndexOf("."),
        type = file.name.substr(index + 1), //获取文件扩展名
        extype = ["png", "jpg"];
      let flag = extype.some(v => {
        return v == type;
      });
      if (!flag) {
        this.$message({
          type: "error",
          message: "只支持png/jpg格式的文件"
        });
        return false;
      }

      if (file.size > 512000) {
        this.$message({
          type: "error",
          message: "图片文件大于500kb"
        });
        return false;
      }
    }
  },
  watch: {
    img(v) {
      // console.log(v)
      this.add(v);
    }
  }
};
</script>
<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="账号" class="wid">
      <el-input v-model="form.username" disabled></el-input>
    </el-form-item>

    <el-form-item label="姓名" class="wid" prop="name">
      <el-col :span="11">
        <el-input v-model="form.name" :disabled="disName"></el-input>
      </el-col>
      <el-col class="line" :span="2">&nbsp;</el-col>
      <el-col :span="11">
        <span class="co">*设置姓名后不可修改</span>
      </el-col>
    </el-form-item>
    <el-form-item label="头像">
      <el-upload
        class="avatar-uploader"
        :action="avatar"
        :show-file-list="false"
        :on-success="success"
      >
        <el-avatar v-if="imageUrl" :size="50" :src="base+imageUrl" class="el-dropdown-link"></el-avatar>
        <el-avatar
          v-else-if="form.avatar"
          :size="50"
          :src="base+form.avatar"
          class="el-dropdown-link"
        ></el-avatar>

        <el-avatar v-else :size="50" :src="base+'init_avatar.png'" class="el-dropdown-link"></el-avatar>
      </el-upload>
    </el-form-item>
    <el-form-item label="性别" prop="sex">
      <el-radio-group v-model="form.sex">
        <el-radio label="男"></el-radio>
        <el-radio label="女"></el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="学号" class="wid" prop="sno">
      <el-col :span="11">
        <el-input v-model="form.sno" :disabled="disSno"></el-input>
      </el-col>
      <el-col class="line" :span="2">&nbsp;</el-col>
      <el-col :span="11">
        <span class="co">*设置学号后不可修改</span>
      </el-col>
    </el-form-item>
    <el-form-item label="QQ" class="wid">
      <el-input v-model="form.qq"></el-input>
    </el-form-item>
    <el-form-item label="手机" class="wid" prop="phone">
      <el-input v-model="form.phone"></el-input>
    </el-form-item>
    <el-form-item label="座右铭" style="width:600px">
      <el-input type="textarea" v-model="form.descript"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit('form')">确认修改</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { baseAvatar } from "@/utils/baseStatic"; //导入图片基础路径
import getDataApi from "@/api/getItem";
import * as local from "@/utils/local";
import subPersonalApi from "@/api/submitPersonal.js";
import checkSnoApi from "@/api/checkSno";
export default {
  data() {
    return {
      avatar: process.env.VUE_APP_BASE_IMG + "/upload/avatar",
      base: baseAvatar,
      imageUrl: null,
      disName: false,
      disSno: false,
      oldacatar: null,
      form: {
        id: "",
        username: "",
        name: "",
        sex: "",
        sno: "",
        qq: "",
        phone: "",
        descript: "",
        avatar: "",
        oldavatar: ""
      },
      rules: {
        name: [
          { required: true, message: "请填写真实姓名", trigger: "change" }
        ],
        sex: [{ required: true, message: "请选择性别", trigger: "blur" }],
        sno: [{ required: true, message: "请填写学号", trigger: "change" }],
        phone: [{ required: true, message: "请填写联系方式", trigger: "blur" }]
      },
      userAllData: null
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    /* 提交 */
    onSubmit(f) {
      let forms = this.form;
      this.$refs[f].validate(v => {
        if (v) {
          if (this.disName && this.disSno) {
            this.update();
          } else {
            checkSnoApi.checkSno(this.form.sno).then(res => {
              const resp = res.data;
              const name = resp.data.name;
              // console.log(this.form.name);
              if (resp.flag) {
                if (name != forms.name) {
                  //froms.name = "";
                  this.$message({
                    type: "error",
                    message: "姓名与学号信息不匹配"
                  });
                } else {
                  this.update();
                }
              } else {
                this.$message({
                  type: "error",
                  message: resp.message
                });
                this.form.sno = "";
              }
            });
          }
        }
      });
    },

    update() {
      //姓名学号均正确
      subPersonalApi.addPersonal(this.form).then(res => {
        this.$message({
          type: res.data.flag ? "success" : "error",
          message: res.data.message,
          duration: 1000
        });
        if (res.data.flag) {
          setTimeout(() => {
            this.$router.go(0);
          }, 1100);
        }
      });
    },
    getUserInfo() {
      getDataApi.getUserName(local.getUser().user).then(res => {
        this.userAllData = res.data.data[0];
        this.form = this.userAllData;
        this.oldavatar = this.userAllData.avatar;
        if (this.userAllData.name) {
          this.disName = true;
        }
        if (this.userAllData.sno) {
          this.disSno = true;
        }
      });
    },
    /* 图片上传成功的函数 */
    success(res, file) {
      if (res.flag) {
        //console.log(this.imageUrl)
        this.imageUrl = res.url;
        this.onSubmit("form");
        //console.log(this.imageUrl)
      }
    }
  },
  watch: {
    imageUrl(v) {
      console.log(v);
      this.form.avatar = v;
      this.form.oldavatar = this.oldavatar;
    }
  }
};
</script>

<style>
.wid {
  width: 400px;
}
.co {
  color: cadetblue;
}
</style>
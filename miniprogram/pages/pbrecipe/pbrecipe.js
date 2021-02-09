// pages/pbrecipe/pbrecipe.js
let {
  TB
} = require('../../utils/config')
let api = require('../../utils/api')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [], // 初始化图片列表
    classifyList: [], // 分类列表
    uploadTempFiles: [], // 初始化上传文件到云端的临时路径
    isLoading: false // 是否正在加载
  },
  // 得到分类列表
  async getList() {
    let listStatus = await api.findAll(TB.CF)
    this.setData({
      classifyList: listStatus.data
    })
  },
  onLoad() {
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
    this.getList()
  },
  // 选择图片时触发，用来过滤不合法的图片资源
  selectFile(files) {
    console.log('files', files)
  },
  // 图片上传的函数，返回Promise，Promise的callback里面必须resolve({urls})表示成功，否则表示失败
  uplaodFile(files) {
    console.log('upload files', files)
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      resolve({
        urls: files.tempFilePaths
      })
    })
  },
  // 上传失败触发
  uploadError(e) {
    console.log('upload err', e.detail);
  },
  // 上传成功触发
  uploadSuccess(e) {
    // console.log(this.data.files); // []
    console.log('upload success', e.detail)
    // 将获取到的照片临时路径连接到uploadFilePath里面
    this.setData({
      uploadTempFiles: this.data.uploadTempFiles.concat(e.detail.urls)
    })
  },
  // 删除照片
  delete(e) {
    let index = e.detail.index
    this.data.uploadTempFiles.splice(index, 1)
    this.setData({
      uploadTempFiles: this.data.uploadTempFiles
    })
  },
  // 将文件上传到云端
  async uploadCloud(filesArray) {
    // 得到新的图片名称
    let promiseArray = filesArray.map((item, index) => {
      let suffix = /.\w+$/.exec(item)[0] // 文件后缀名
      let newImg = new Date().getTime() + '_' + index + suffix;
      return wx.cloud.uploadFile({
        cloudPath: 'recipe/' + newImg, // 云端文件路径
        filePath: item // 本地临时路径
      })
    })
    // console.log(promiseArray);
    let fileArray = await Promise.all(promiseArray);
    // console.log(fileArray);
    let fileIdArray = fileArray.map(item => {
      return item.fileID
    })
    return fileIdArray
  },
  // 提交
  async submit(e) {
    // 开启加载开关
    this.setData({
      isLoading: true
    })
    // 获取表单数据
    let {
      recipeName,
      recipeTypeid,
      recipesMake
    } = e.detail.value
    if (recipeName.trim() == '' || recipeTypeid.trim() == '' || recipesMake.trim() == '') {
      wx.showToast({
        title: '请填写信息',
        icon: 'none'
      })
      // 关闭加载开关
      this.setData({
        isLoading: false
      })
      return
    }
    // 上传数据至云端 并得到fileIdArray
    let fileIdArray = await this.uploadCloud(this.data.uploadTempFiles)
    // 合并数据
    let insertData = {
      recipeName,
      recipeTypeid,
      recipesMake,
      follow: 0,
      visitor: 0,
      time: new Date(),
      fileIdArray
    }
    let addStatus = await api.addOne(TB.RR, insertData)
    // console.log(addStatus);
    if (addStatus._id) {
      // 发布成功
      wx.showToast({
        title: '发布成功',
      })
      // 延时跳转到个人中心页面
      setTimeout(() => {
        wx.reLaunch({
          url: '../my/my',
        })
      }, 1000);
    } else {
      wx.showToast({
        title: '发布失败',
        icon: "none"
      })
    }
    // 关闭加载开关
    this.setData({
      isLoading: false
    })

  },
})
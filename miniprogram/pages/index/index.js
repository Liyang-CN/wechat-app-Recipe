let api = require('../../utils/api')
let { TB } = require('../../utils/config')
 
Page({
    data: {
        types: [
            {
                src: "../../imgs/index_07.jpg",
                typename: "营养菜谱"
            },
            {
                src: "../../imgs/index_09.jpg",
                typename: "儿童菜谱"
            },
        ],
        recipes: []
    },
    toClassify() {
        wx.redirectTo({
            url: '../type/type',
        })
    },
    toDetail(e) {
        let id = e.currentTarget.dataset.id
        let name = e.currentTarget.dataset.name
        wx.navigateTo({
            url: '../detail/detail?id=' + id + '&name='+name,
        })
    },
    // 得到热门菜谱列表，根据菜谱的关注量降序排序 取出六条
    async getHotRecipe() {
        let getStatus = await api.findPage(TB.RR, 1, 6, {}, { fileds: "visitor", sort: 'desc' })
        // 得到的数组中  每项都需要用户信息  所以需要向每一项添加用户信息
        let recipesData = await api.addUserInfo(getStatus.data)
        this.setData({ recipes: recipesData })
    },
    onShow(options) {
        // 获取热门菜谱列表
        this.getHotRecipe()
    }
})
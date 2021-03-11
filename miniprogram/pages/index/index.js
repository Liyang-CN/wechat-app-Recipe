let api = require('../../utils/api')
let {
    TB
} = require('../../utils/config')

Page({
    data: {
        types: [{
                src: "../../imgs/index_07.jpg",
                typename: "营养菜谱",
                _id: 'b00064a76021f63d03b92c056a3adaa9'
            },
            {
                src: "../../imgs/index_09.jpg",
                typename: "儿童菜谱",
                _id: 'b00064a76021f64403b92d5a7d53fb66'
            },
            {
                src: "../../imgs/index_11.jpg",
                typename: "家常菜谱",
                _id: 'b00064a7604990280968e0bb08f1a783'
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
            url: '../detail/detail?id=' + id + '&name=' + name,
        })
    },
    toList(e) {
        let {
            id,
            name
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: '../list/list?id=' + id + '&name=' + name,
        })
    },
    // 得到热门菜谱列表，根据菜谱的关注量降序排序 取出六条
    async getHotRecipe() {
        let getStatus = await api.findPage(TB.RR, 1, 6, {}, {
            fileds: "visitor",
            sort: 'desc'
        })
        // 得到的数组中  每项都需要用户信息  所以需要向每一项添加用户信息
        let recipesData = await api.addUserInfo(getStatus.data)
        this.setData({
            recipes: recipesData
        })
    },
    onShow(options) {
        // 获取热门菜谱列表
        this.getHotRecipe()
    }
})
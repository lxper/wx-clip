let pageX = 0, //记录刚点击图片时相对于屏幕的X轴位置
    pageY = 0, //记录刚点击图片时相对于屏幕的Y轴位置
    change = 750 / wx.getSystemInfoSync().windowWidth, //rpx与px的转换
    moveAreaWidth = wx.getSystemInfoSync().windowWidth * 0.7, //设置图片画布的宽度
    scaleDefaultX = 0, //刚点击缩放时相对于屏幕的X轴位置
    scaleDefaultY = 0, //刚点击缩放时相对于屏幕的Y轴位置
    lastMoveTime = 0, //记录前一次移动clip框的时间
    last_time = 0 //记录前一次缩放的时间
Component({
  properties: {
    img: { //从父组件获取图片
      type: String,
      value: ''
    }
  },
  data: {
    // 这里是一些组件内部数据
    image: '', //保存原始图片
    ctx: {}, //保存画布
    imageHeigth: '', //画布的高度
    newImage: '', //裁剪出的图片
    imageSacle: 0, //原始图片的宽高比
    canvasLeft: '500%', //偏移画布，因为画布的层级是最高的，所以移出屏幕，不然会遮挡clip框
    moveAreaHeight: 0, ////画布和图片的高度
    left: 0, //clip框的left值
    top: 0, //clip框的top值
    right: 0, //clip框的right值
    bottom: 0, //clip框的bottom值
    clipWidth: 300 //clip的初始宽度
  },

  ready: function () {
    // const ctx = wx.createCanvasContext('clip-canvas', this);
    // this.setData({
    //   ctx
    // })
    this.chooseImage();
  },

  methods: {
    //获取父组件的img，然后做初始化工作
    chooseImage: function() {
      // const ctx = this.data.ctx,
      //       image = this.data.img;
      const image = this.data.img;
      wx.getImageInfo({
        src: image,
        success: (res) => {
          const scale = res.width / res.height, //原始图片的宽高比
                windowWidth = moveAreaWidth, // 画布和图片的宽度
                moveAreaHeight = windowWidth / scale; //画布和图片的高度
          this.setData({
            image,
            imageHeigth: moveAreaHeight + 'px', 
            moveAreaHeight,
          })
          // ctx.drawImage(this.data.image, 0, 0, windowWidth, moveAreaHeight);
          // ctx.draw();
        }
      })
    },
    //记录刚触碰缩放框时的位置
    scaleStart: function(e) {
      scaleDefaultX = e.touches[0].pageX, //保存刚触碰缩放框时的X轴位置
      scaleDefaultY = e.touches[0].pageY; //保存刚触碰缩放框时的Y轴位置
    },
    //移动缩放框时修改clip框的大小
    scaleMove: function(e) {
      let current_time = new Date().getTime(); //获取当前时间
      if(!last_time){ //记录第一次触碰的时间
        last_time = current_time;
      }
      if(current_time - last_time > 30){ //如果大于30毫秒就触发
        last_time = current_time;
        const current_scaleX = e.changedTouches[0].pageX, //记录当前的X轴坐标
              current_scaleY = e.changedTouches[0].pageY, //记录当前的Y轴坐标
              moveX = current_scaleX - scaleDefaultX, //记录X轴移动的距离
              moveY = current_scaleY - scaleDefaultY; //记录Y轴移动的距离
        let min = 0, 
            clipWidth = this.data.clipWidth / change;
        if(moveX != 0 && moveY != 0 ){
            if(moveX > moveY){
              min = moveY
            }else{
              min = moveX
            }
        }      
        clipWidth += (min / 30);
        //限定clip框的最大宽度
        if(clipWidth > moveAreaWidth){
          clipWidth = moveAreaWidth;
        }
        clipWidth = clipWidth * change;
        this.setData({
          clipWidth
        })
      }
    },
    //记录刚触碰clip框时的位置
    contentStartMove: function(e) {
      pageX = e.touches[0].pageX; //记录刚移动clip框时的X轴位置
      pageY = e.touches[0].pageY; //记录刚移动clip框时的Y轴位置
    },
    //移动clip框
    contentMoveing: function(e) {
      let current_time = new Date().getTime(); //获取当前时间
      if(!lastMoveTime){
        lastMoveTime = current_time;
      }
      if(current_time - lastMoveTime > 17){
        lastMoveTime = current_time;
        const current_pageX = e.changedTouches[0].pageX,
              current_pageY = e.changedTouches[0].pageY,
              clipWidth = this.data.clipWidth / change,
              moveAreaHeight = this.data.moveAreaHeight;
        let left = this.data.left,
            top = this.data.top;
        //左右移
        if(current_pageX != pageX){
          left += (current_pageX - pageX);
        }
        //上下移
        if(current_pageY != pageY){
          top += (current_pageY - pageY);  
        }
        //防止clip框移出图片的范围
        if(left < 0){
          left = 0
        }
        if(left + clipWidth >= moveAreaWidth){
          left = moveAreaWidth - clipWidth;
        }
        if(top < 0){
          top = 0
        }
        if(top + clipWidth >= moveAreaHeight){
          top = moveAreaHeight - clipWidth;
        }
        this.setData({
          left,
          top
        })
        //保存当前的位置，作为当前移动时间内移动过程中的初始位置
        pageX = e.changedTouches[0].pageX;
        pageY = e.changedTouches[0].pageY;
      }
    },
    closeClip: function() {
      this.triggerEvent('closeClip')
    },
    //裁剪图片并导出
    clip: function() {
      const ctx = wx.createCanvasContext('clip-canvas', this);
      const data = this.data;
      ctx.drawImage(data.image, 0, 0, moveAreaWidth, data.moveAreaHeight)
      ctx.draw(false, () => { 
          wx.canvasToTempFilePath({ //裁剪图片并导出图片，此方法只能在draw()中执行
            x: data.left,
            y: data.top,
            width: data.clipWidth / change,
            height: data.clipWidth / change,
            destWidth: data.clipWidth,
            deatHeight: data.clipWidth,
            canvasId: 'clip-canvas',
            success: (res) => {
              this.setData({
                newImage: res.tempFilePath,
              })
              this.triggerEvent('uploadImg', res.tempFilePath)
              this.triggerEvent('closeClip')
            }
          }, this)
        })
      },
    }
})

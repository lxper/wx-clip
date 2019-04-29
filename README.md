# wx-clip
微信小程序的裁剪图片组件
## 效果
![](http://129.204.88.180/wp-content/uploads/2019/04/caixukun.gif)
## 使用

```
"usingComponentes": {
  "component-crooper": "../../../component/crooper/crooper"
}
```
```
<component-crooper 
  wx:if="{{showClip}}"  //是否显示
  img="{{images}}"  //传入图片   
  bind:uploadImg="uploadImage" //绑定上传函数
  bind:closeClip="closeClip" //绑定关闭函数
></component-crooper>
```


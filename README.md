## bigbear-mindmap

自制的思维导图工具

基于 electron+react+bigbear-ui+G6 开发

### 制作初衷

最近学了 g6 觉得很有意思，正好网上那些在线的思维导图很多都有图次数限制，于是自己制作个玩。

### 特点

-   g6 的图主要特点就是可以动，我感觉这是最吸引我的。
-   我通过 electron 结合了文件操作，利用 electron-store 使其持久化，完成读取写入等功能。使人用起来可以像使用文件一样。
-   除了可以像文件保存读取还可以自己拖拽修改以及生成图片。
-   利用electron-updater制作了更新，可以自行检测并下载最新版本。

### 使用说明

-   左边可以导入文件和新建文件，文件内容是图的信息，点击左边对应条目可以展示对应文件存储的图。
-   图操作有几种模式：
-   默认模式可以编辑节点，收缩节点。鼠标移动到对应的节点点击即可触发。
-   添加模式可以新增节点，鼠标移动到对应节点点击即可触发。
-   删除模式可以删除节点，鼠标移动到对应的节点点击即可触发。
-   此外，还有导出图片功能，保存数据功能，导出数据功能。

-   快捷键方面：
-   ctrl+s 为保存
-   ctrl+n 为新建
-   ctrl+i 为导入

### 软件截图

<img src='https://github.com/yehuozhili/bigbear-mindmap/blob/master/demo/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200825010929.png'/>

<img src='https://github.com/yehuozhili/bigbear-mindmap/blob/master/demo/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20200825011250.png'/>

<img src='https://github.com/yehuozhili/bigbear-mindmap/blob/master/demo/213.gif' />
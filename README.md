# 基金管理工具（今晚加鸡腿 Beta.1.0）

### 先上图

自己copy一下： http://img.chuansroom.com/fundManager/page1.png

自己copy一下： http://img.chuansroom.com/fundManager/page2.png



### MAC版本可以直接下载

MAC OS 下载：http://img.chuansroom.com/fundManager/%E4%BB%8A%E6%99%9A%E5%8A%A0%E9%B8%A1%E8%85%BF-Beta.1.0-0.1.0.dmg



### Linux版本需要自己clone项目构建

构建教程：https://www.electronjs.org/docs/development/build-instructions-linux



### Windows版本需要自己clone项目构建

构建教程：https://www.electronjs.org/docs/development/build-instructions-windows



### 自行构建注意事项

- 1：前端界面Build后的代码可自行放到自己的服务器上，需要修改对应main.js里面 win.loadURL地址
- 2：对于main.js里面还有一个提供的引入内嵌文件的加载方式win.loadFile，本地开发的时候没问题，但是打包之后就不行，这一点暂时没研究透彻，故用的url来使用，如果url使用我提供的那么，有更新的话也会同步进行更新



### 简易版教程说明

#### 新增删除

- 新增：通过点击界面顶部的添加基金按钮进行添加自有基金（基金编号）
- 删除：点击对应基金右上角的删除按钮进行删除基金
- 编辑：编辑可以修改当前基金的**持有份额和持仓本金**，预收益将会根据此数据进行计算

#### 系统设置

通过点击右上角的设置按钮进行设置

- 保护隐私：当打开次选项后，基金所有与钱相关的数据都会显示 **  保护您的隐私。
- 简单模式：打开简单模式后，在基金列表里面只会存在当前基金名字，和预估收益率。
- 更新提示：打开更新提示之后，每次更新数据的时候回有相应的提示



### 特别说明

- 数据来源：本应用所有的数据来源于天天基金（https://fund.eastmoney.com/），数据准确度无法保证，如果于您现在使用的平台不一致可能导致当前时间节点看到的数据不一致。
- 所有数据均使用本地缓存，没有上传到服务器，请放心使用




<template>
  <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *">
  <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'self'; style-src 'self' 'unsafe-inline'; media-src *"> -->
  <div class="Wokoo" v-if="show">
    <header class="Wokoo-header">
      <!-- <img :src="logo" class="Wokoo-logo" alt="logo" /> -->
      <span
        class="Wokoo-close-icon"
        @click="handleClose"
      >
        ×
      </span>
      <el-row>
        <el-button :disabled="scorecatching" size="small" type="primary" @click="handleScore">采集评分</el-button>
        <!-- <el-button disabled size="small" type="primary" @click="handleCost">采集导出供货价</el-button> -->
        <el-button :disabled="skctimecatching" size="small" type="primary" @click="handleSKUTime">采集加站时间</el-button>

        <el-button size="small" type="primary" v-if="!autoPage" @click="openAutoPage">开启自动翻页</el-button>
        <el-button size="small" type="primary" v-if="autoPage" @click="closeAutoPage">关闭自动翻页</el-button>
        
        <!-- <el-button size="small" type="primary" v-if="!autoExport" @click="openAutoExport">开启自动导出excel</el-button> -->
        <!-- <el-button size="small" type="primary" v-if="autoExport" @click="closeAutoExport">关闭自动导出excel</el-button> -->
        <!-- <el-button disabled size="small" type="primary" v-if="autoExport" @click="deleteAll">删除数据</el-button> -->
        <el-button size="small" type="primary"  @click="stopCatch">结束采集</el-button>
      </el-row>
      
      <!-- <p>
        Edit <code>App.vue</code> and save to reload.
        Coding By fdj，2024年1月5日00:50:48
      </p> -->
      <a
        class="Wokoo-link"
        href="https://github.com/kinyaying/wokoo/tree/master"
        target="_blank"
        rel="noopener noreferrer"
      >
      Coding By fdj,build by wokoo
      </a>
    </header>
  </div>
  <div class="Wokoo-hide" @click="handleClose" v-else>
    <img :src="logo" class="Wokoo-hide-logo" alt="logo" />
    open
  </div>
</template>
<script>
import './app.less'
import logo from '../public/icon.jpg'
import {openDB, closeDb, addData, getDataByKey, cursorGetData, getDataByIndex, cursorGetDataByIndex, updateDB, deleteDB, deleteDBAll} from './utils/database'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver';
const d = (m) => new Promise(reslove => setTimeout(() => {
    reslove('')
}, m || 400))
export default {
  data: function() {
    return {
      logo,
      show: true,
      autoPage: true,
      autoExport: true,
      catchAutoPage: true,
      scorecatching: false,
      costcatching: false,
      skctimecatching: false,
      validkey: 1712851793020,
      result: [],
      // 表头
      header: [],
      // score
      score: {

      },
      // cost
      cost: {

      },
      // skuTime
      skuTime: {

      },
      intervalId: undefined,
      tempResult: [],
      currentSource: ''
    }
  },
  methods: {
    deleteAll() {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDBAll()
        this.$message({
          type: 'info',
          message: '已成功删除之前爬取的数据'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleClose() {
      this.show = !this.show
    },
    openAutoPage() {
      // this.$message({
      //   type: 'info',
      //   message: '此处有bug，因油猴脚本暂停失败，暂不开启翻页爬，建议设置每页为40个，手动每页执行'
      // })
      this.autoPage = true
    },
    closeAutoPage() {
      this.autoPage = false
    },
    openAutoExport() {
      this.autoExport = true
    },
    closeAutoExport() {
      this.autoExport = false
    },
    stopCatch() {
      if(this.scorecatching == true || this.skutimecatching == true) {
        var i = window.confirm("确认终止采集？")
        if(i==true){
          clearInterval(this.intervalId)
          console.log("即将导出当前已采集到的结果：", this.tempResult)
          this.result = this.tempResult
          this.processData(this.currentSource)
        }else{
          window.alert("已取消停止采集操作，当前继续采集")
        }
      }else{
        window.alert("当前没有正在进行的采集任务，无需停止")
      }
    },
    handleScore(autoPage) {
      this.handleAllProcess("handleScore")
      // var keyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
      // console.log(keyList)

      // var tempdata = this.catchData(keyList, autoPage)
      // console.log(tempdata)
    },
    handleCost() {
      this.$message.success('这块代码屏蔽了，联系开发者')
      window.alert("这块的代码屏蔽了，联系开发者")
      // this.handleAllProcess("handleCost")
    },
    handleSKUTime() {
      // this.$message.success('这块代码屏蔽了，联系开发者')
      this.handleAllProcess("handleSKUTime")
    },
    handleAutoPage() {

    },
    getSourceWeb(source) {
      var url = window.location.href
      var sourceWeb = ''
      switch (source) {
        case "handleScore":
          sourceWeb = 'https://kuajing.pinduoduo.com/main/sale-manage/main'
          break;
        case "handleCost":
          sourceWeb = 'https://www.amazon.com/'
          break;
        case "handleSKUTime":
          sourceWeb = 'https://kuajing.pinduoduo.com/main/product/seller-select'
          break;
      
        default:
          break;
      }
      // console.log(sourceWeb,url, sourceWeb ==url)
      if(sourceWeb == url){
        return true
      }
      return false
    },
    async catchData(source, prekeyList, keyList, autoPage, pageElement, nextPageElement) {
      this.tempResult = []
      this.currentSource = source
      switch (source) {
        case "handleScore":
          // 禁止再次点击导出
          if(!this.scorecatching){
            this.scorecatching = true
          }
          break;
        case "handleCost":
          // 禁止再次点击导出
          break;
        case "handleSKUTime":
          // 禁止再次点击导出
          if(!this.skctimecatching){
            this.skctimecatching = true
          }
          break;
      }
      var pageTotal = parseInt(document.querySelectorAll('[data-testid="beast-core-pagination"] li')[document.querySelectorAll('[data-testid="beast-core-pagination"] li').length - 2].textContent)
      if(isNaN(pageTotal)){
        window.alert("未获取到页码，将采用爬取单页的形式导出");
        this.autoPage = false
        this.catchData(source, prekeyList, keyList, false, pageElement, nextPageElement)
        return
      }else{
        var index = 1
        var that = this
        this.intervalId = window.setInterval(function() {
          if (document.readyState === "complete") {
            
            if(autoPage){
              // 在这里放置你想要延迟执行的油猴脚本代码
              console.log("当前爬取第："+index+'页',)
              const elementAll = document.querySelector(pageElement);
              const trElements = elementAll.querySelectorAll("tr");
              const trCount = trElements.length;
              // const elementAll = document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody");
              // const trElements = elementAll.querySelectorAll("tr");
              // const trCount = trElements.length;
              console.log("待爬取tr项："+trCount);  // 输出tbody中的tr数量
              var pageCount = 1
              switch (source) {
                case "handleScore":
                  
                  // 禁止再次点击导出
                  if(!this.scorecatching){
                    this.scorecatching = true
                  }
                  for (let trIndex = 0; trIndex < trCount; trIndex++) {
                    // skc
                    var currentSkc = prekeyList[0] + trIndex + keyList[0]
                    // pingfen
                    var currentPingfen = prekeyList[1] + trIndex + keyList[1]
                    // zanwu
                    var currentZanwu = prekeyList[2] + trIndex + keyList[2]
                    
                    var skcText = document.querySelector(currentSkc) != null ? document.querySelector(currentSkc).innerText : ''
                    // var pingfenText = document.querySelector(currentPingfen) != null ? document.querySelector(currentPingfen).innerText : ''
                    var zanwuText = document.querySelector(currentZanwu) != null ? document.querySelector(currentZanwu).innerText : ''
                    if(skcText.length>0){
                        console.log('当前爬取第:'+index+'页第：'+pageCount+'条',skcText, zanwuText)
                        pageCount++
                        let obj = {skc: skcText, zanwu:zanwuText}
                        that.tempResult.push(obj)
                    }
                  }
                  break;
                
                case "handleCost":
                  break;
                case "handleSKUTime":
                  // 禁止再次点击导出
                  if(!this.skctimecatching){
                    this.skctimecatching = true
                  }
                  for (let trIndex = 0; trIndex < trCount; trIndex++) {
                    // skc
                    var currentSkc = prekeyList[0] + trIndex + keyList[0]
                    // currentZhandianshijian
                    var currentZhandianshijian = prekeyList[1] + trIndex + keyList[1]
                    
                    
                    var skcText = document.querySelector(currentSkc) != null ? document.querySelector(currentSkc).innerText : ''
                    var zhandianshijianText = document.querySelector(currentZhandianshijian) != null ? document.querySelector(currentZhandianshijian).innerText : ''
                    
                    if(skcText.length>0){
                        console.log('当前爬取第:'+index+'页第：'+pageCount+'条',skcText, zhandianshijianText)
                        pageCount++
                        let obj = {skc: skcText, zhandianshijianText: zhandianshijianText}
                        that.tempResult.push(obj)
                    }
                  }
                  break;
                default:
                  break;
              }
              
              pageCount = 1
              // document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0")
              // const element = document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0");
              const element = document.querySelector(nextPageElement);
              // console.log(element != null, !element.classList.contains('PGT_disabled_5-80-0'))
              if (element != null && !element.classList.contains('PGT_disabled_5-80-0')) {
                // console.log("元素可点击");
                // document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0").click()
                document.querySelector(nextPageElement).click()
                // 计算翻页
                index++
              } else {
                console.log("已经到最后一页，元素不可点击",element != null && !element.classList.contains('PGT_disabled_5-80-0'));
                that.catchAutoPage = false
                clearInterval(that.intervalId);
              }
              
              console.log('result', that.tempResult)
              if(index >= pageTotal){
                that.result = that.tempResult
                that.processData(source)
              }
            } else {
              const elementAll = document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody");
              const trElements = elementAll.querySelectorAll("tr");
              const trCount = trElements.length;

              console.log("待爬取tr项："+trCount);  // 输出tbody中的tr数量
              var pageCount = 1

              switch (source) {
                case "handleScore":
                  for (let trIndex = 0; trIndex < trCount; trIndex++) {
                    // skc
                    var currentSkc = prekeyList[0] + trIndex + keyList[0]
                    // pingfen
                    var currentPingfen = prekeyList[1] + trIndex + keyList[1]
                    // zanwu
                    var currentZanwu = prekeyList[2] + trIndex + keyList[2]

                    // console.log(trIndex, currentSkc, currentPingfen, currentZanwu)
                    
                    var skcText = document.querySelector(currentSkc) != null ? document.querySelector(currentSkc).innerText : ''
                    // var pingfenText = document.querySelector(currentPingfen) != null ? document.querySelector(currentPingfen).innerText : ''
                    var zanwuText = document.querySelector(currentZanwu) != null ? document.querySelector(currentZanwu).innerText : ''
                    if(skcText.length>0){
                        console.log('当前爬取第1页第：'+pageCount+'条',skcText, zanwuText)
                        pageCount++
                        let obj = {skc: skcText, zanwu:zanwuText}
                        that.tempResult.push(obj)
                    }
                  }
                  pageCount = 1
                  break;
                
                case "handleCost":
                  break;
                case "handleSKUTime":
                  for (let trIndex = 0; trIndex < trCount; trIndex++) {
                    // skc
                    var currentSkc = prekeyList[0] + trIndex + keyList[0]
                    // currentZhandianshijian
                    var currentZhandianshijian = prekeyList[1] + trIndex + keyList[1]
                    
                    
                    var skcText = document.querySelector(currentSkc) != null ? document.querySelector(currentSkc).innerText : ''
                    var zhandianshijianText = document.querySelector(currentZhandianshijian) != null ? document.querySelector(currentZhandianshijian).innerText : ''
                    
                    if(skcText.length>0){
                        console.log('当前爬取第1页第：'+pageCount+'条',skcText, zhandianshijianText)
                        pageCount++
                        let obj = {skc: skcText, zhandianshijianText: zhandianshijianText}
                        that.tempResult.push(obj)
                    }
                  }
                  pageCount = 1
                  break;
                default:
                  break;
              }
              console.log('result', that.tempResult)
              that.result = that.tempResult
              that.processData(source)
              // 单页主动停止并清空定时器
              clearInterval(that.intervalId);
              return that.tempResult
            }
          }
        }, 4000);
      }
    },
    processData(source) {
      // // 获取二维数组的列数
      var result = this.result
      var filterVal = []
      if(this.scorecatching == true || this.skctimecatching == true){
        this.scorecatching = false
        this.skctimecatching = false
      }
      switch (source) {
        case "handleScore":
          filterVal = ['skc','zanwu']
          break;
        case "handleCost":
          
          break;
        case "handleSKUTime":
          filterVal = ['skc','zhandianshijianText']
          break;
      
        default:
          break;
      }
      var temp = this.formatJson(filterVal, result)
      console.log("最终结果", temp)
      if(temp.length>0){
        this.handleDownloadExcel(source, temp)
      }else{
        window.alert("没有数据，请检查并刷新页面重新点击采集导出按钮")
        return
      }
    },
    utf8_to_b64( str ) {
      return window.btoa(unescape(encodeURIComponent( str )));
    },
    b64_to_utf8( str ) {
      return decodeURIComponent(escape(window.atob( str )));
    },
    validityState(value) {
      if(value<this.validkey) { return true }
      return false
    },
    handleAllProcess(source, url) {
      // 判断是否在试用期
      if (this.validityState(new Date().getTime())) {
        // 判断页面是否正确
        if (!this.getSourceWeb(source)) {
          window.alert("点错页面了吧，睁开你的卡姿兰大眼睛确认一下");
          return
        }
        // 判断是哪个来源以及是否打开自动翻页
        switch (source) {
          case 'handleScore':
            var prekeyList = ["#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(",
                            "#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(",
                            "#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child("
                            ]
            var keyList = [") > td:nth-child(2) > div > div > p:nth-child(5)",
                              ") > td:nth-child(2) > div > div > p:nth-child(6)", 
                              ") > td:nth-child(2) > div > div > div.spu-rate_main__DxqS- > div > div"]
            // console.log(prekeyList, keyList)
            var pageElement = "#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody"
            var nextPageElement = "#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0"
            this.catchData("handleScore", prekeyList, keyList, this.autoPage, pageElement, nextPageElement)
            break
          case 'handleCost':
            var prekeyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
            var keyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
            var nextPageElement = "#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0"
            // console.log(prekeyList, keyList)
            this.catchData("handleCost", prekeyList, keyList, this.autoPage, pageElement, nextPageElement)
            break
          case 'handleSKUTime':
          var prekeyList = ["#root > div > div > div > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(",
                            "#root > div > div > div > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child("
                            ]
            var keyList = [") > td:nth-child(5) > div > div > div:nth-child(1) > span",
                              ") > td:nth-child(10) > div > div > div:nth-child(6) > span"]
                              // console.log(prekeyList, keyList)
            var pageElement = "#root > div > div > div > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody"
            var nextPageElement = "#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0"
            this.catchData("handleSKUTime", prekeyList, keyList, this.autoPage, pageElement, nextPageElement)
            break
          default:
            // this.$message.success('做个人吧，别瞎搞，搞坏了不负责')
            window.alert('别瞎搞，搞坏了不负责')
            break
        }
      } else {
        window.alert('已经过了试用期，请联系开发者')
      }
    },
    async RandomClick(min, max) {
      await d(Math.floor(Math.random() * (max - min + 1)) + min);
    },
    handleDownloadExcel(source, handledList) {
      let that = this
      var tHeader = []
      var multiHeader = []
      var fileName = ''
      switch (source) {
        case "handleScore":
          tHeader = ['SKC', '评分']
          multiHeader = ['自动采集评分']
          fileName = '自动采集评分'+ new Date().toLocaleString()+'.xlsx'
          break;
        case "handleCost":
          
          break;
        case "handleSKUTime":
          tHeader = ['SKC', '加入站点时间']
          multiHeader = ['自动采集SKC加入站点时间']
          fileName = '自动采集SKC加入站点时间'+ new Date().toLocaleString()+'.xlsx'
          break;
      
        default:
          break;
      }
      const list = handledList
      // 直接处理数据

      // 全局引入ExcelJS
      // const ExcelJS = require('exceljs')
      // 创建工作簿
      const workbook = new ExcelJS.Workbook()
      // 添加工作表
      const worksheet = workbook.addWorksheet('My Sheet')
      
      
      worksheet.addRow(multiHeader)
      worksheet.addRow(tHeader)

      var columnsList = []
      
      worksheet.column = columnsList
      // 添加数据
      list.map((value)=>{
        worksheet.addRow(value)
      })
      
      worksheet.getCell('A1').font = { size: 24, bold: true };
      worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      
      

      // const options = {}
      // var key = AES.generatekey(16)
      // worksheet.protect(AES.encrypt(new Date().toString(), key), options)
      // 将工作簿保存到文件
      workbook.xlsx.writeBuffer().then(data => {
        const blob = new Blob([data], { type: this.blobType })
        saveAs(blob, fileName)
      })
      // this.consumerLogTotal = response.content.count
    
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getMerge(mergeComlune, list, offset) {
      var result = []
      var merge = []
      var endmerge = []
      var temp = ''
      for (let index = 0; index < mergeComlune.length; index++) {
        const column = mergeComlune[index];
        var preStr = String.fromCharCode((column+1) +'A'.charCodeAt() - 1 )
        merge.length = 0
        endmerge.length = 0
        temp = ''
        for (let listIndex = 0; listIndex < list.length; listIndex++) {
          const element = list[listIndex];
          if(temp==='') {
            temp = element[column]
            merge.push(listIndex)
          }
          if(temp !== element[column]) {
            endmerge.push(listIndex-1)
            merge.push(listIndex)
            temp = element[column]
          }
          if(listIndex === list.length - 1) {
            endmerge.push(listIndex)
          }
        }
        for (let index = 0; index < merge.length; index++) {
          const start = merge[index] + offset;
          const end = endmerge[index] + offset;
          result.push(preStr+start+':'+preStr+end)
        }
      }
      return result
    },
  }
}
</script>
<style scoped>
</style>

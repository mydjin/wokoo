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
        <el-button size="small" type="primary" @click="handleScore">采集导出评分</el-button>
        <el-button disabled size="small" type="primary" @click="handleCost">采集导出供货价</el-button>
        <el-button disabled size="small" type="primary" @click="handleSKUTime">采集导出SKU站点时间</el-button>

        <el-button disabled size="small" type="primary" v-if="!autoPage" @click="openAutoPage">开启自动翻页</el-button>
        <el-button disabled size="small" type="primary" v-if="autoPage" @click="closeAutoPage">关闭自动翻页</el-button>
        
        <el-button size="small" type="primary" v-if="!autoExport" @click="openAutoExport">开启自动导出excel</el-button>
        <el-button size="small" type="primary" v-if="autoExport" @click="closeAutoExport">关闭自动导出excel</el-button>
        <el-button disabled size="small" type="primary" v-if="autoExport" @click="deleteAll">删除数据</el-button>
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
const d = (m) => new Promise(reslove => setTimeout(() => {
    reslove('')
}, m || 400))
export default {
  data: function() {
    return {
      logo,
      show: true,
      autoPage: false,
      autoExport: true,
      catchAutoPage: true,
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

      }
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
      this.$message({
        type: 'info',
        message: '此处有bug，因油猴脚本暂停失败，暂不开启翻页爬，建议设置每页为40个，手动每页执行'
      })
      this.autoPage = false
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
    handleScore(autoPage) {
      this.handleAllProcess("handleScore")
      // var keyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
      // console.log(keyList)

      // var tempdata = this.catchData(keyList, autoPage)
      // console.log(tempdata)
    },
    handleCost() {
      this.$message.success('这块代码屏蔽了，联系开发者')
      // this.handleAllProcess("handleCost")
    },
    handleSKUTime() {
      this.$message.success('这块代码屏蔽了，联系开发者')
      // this.handleAllProcess("handleSKUTime")
    },
    handleAutoPage() {

    },
    getSourceWeb(source) {
      console.log(window.location.href)
      return true
    },
    async catchData(source, keyList, autoPage) {
      var result = []
      if(autoPage){
        var pageTotal = parseInt(document.querySelectorAll('[data-testid="beast-core-pagination"] li')[document.querySelectorAll('[data-testid="beast-core-pagination"] li').length - 2].textContent)
        for (let index = 1; index < pageTotal; index++) {
          // var intervalId = window.setInterval(function() {
          //   if (document.readyState === "complete") {
          //     clearInterval(intervalId);
          //     // 在这里放置你想要延迟执行的油猴脚本代码
          //   }
          // }, 3000);

          console.log("当前爬取第："+index+'页',)
          const elementAll = document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody");
          const trElements = elementAll.querySelectorAll("tr");
          const trCount = trElements.length;
          console.log(trCount);  // 输出tbody中的tr数量
          var pageCount = 1
          for (let trIndex = 0; trIndex < trCount; trIndex++) {
            // skc
            var currentSkc = '#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(' + trIndex + ') > td:nth-child(2) > div > div > p:nth-child(5)' 
            // pingfen
            var currentPingfen = '#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(' + trIndex + ') > td:nth-child(2) > div > div > p:nth-child(6)'
            // zanwu
            var currentZanwu = '#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(' + trIndex + ') > td:nth-child(2) > div > div > div.spu-rate_main__DxqS- > div > div'
            var skcText = document.querySelector(currentSkc) != null ? document.querySelector(currentSkc).innerText : ''
            // var pingfenText = document.querySelector(currentPingfen) != null ? document.querySelector(currentPingfen).innerText : ''
            var zanwuText = document.querySelector(currentZanwu) != null ? document.querySelector(currentZanwu).innerText : ''
            if(skcText.length>0){
                console.log('当前爬取第:'+index+'页第：'+pageCount+'条',skcText, zanwuText)
                pageCount++
                let obj = {skc: skcText, zanwu:zanwuText}
                result.push(obj)
            }
          }
          pageCount = 1
          // document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0")
          const element = document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0");
          if (element && element.classList.contains('PGT_disabled_5-80-0')) {
            // console.log("元素可点击");
            document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-0-0___I-d-v.index-module__sticky-table-bottom___Oi-nB > div.index-module__pagination-wrapper___17qlp > ul > li.PGT_next_5-80-0").click()
            console.log(new Date().toLocaleString())
            await d(5000)
            setTimeout(() => {
              this.$message.success('第'+index+'页自动翻页中')
            }, 5000);
            console.log(new Date().toLocaleString())
          } else {
            console.log("已经到最后一页，元素不可点击",element && element.classList.contains('PGT_disabled_5-80-0'));
            this.catchAutoPage = false
          }
        }
      } else {
        const elementAll = document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody");
        const trElements = elementAll.querySelectorAll("tr");
        const trCount = trElements.length;

        console.log(trCount);  // 输出tbody中的tr数量
        var pageCount = 1
        for (let trIndex = 0; trIndex < trCount; trIndex++) {
          // const element = array[index];
          // skc
          var currentSkc = '#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(' + trIndex + ') > td:nth-child(2) > div > div > p:nth-child(5)' 
          // pingfen
          var currentPingfen = '#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(' + trIndex + ') > td:nth-child(2) > div > div > p:nth-child(6)'
          // zanwu
          var currentZanwu = '#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(' + trIndex + ') > td:nth-child(2) > div > div > div.spu-rate_main__DxqS- > div > div'
          var skcText = document.querySelector(currentSkc) != null ? document.querySelector(currentSkc).innerText : ''
          // var pingfenText = document.querySelector(currentPingfen) != null ? document.querySelector(currentPingfen).innerText : ''
          var zanwuText = document.querySelector(currentZanwu) != null ? document.querySelector(currentZanwu).innerText : ''
          if(skcText.length>0){
              console.log('当前爬取第:1页第：'+pageCount+'条',skcText, zanwuText)
              pageCount++
              let obj = {skc: skcText, zanwu:zanwuText}
              result.push(obj)
          }
        }
        
        pageCount = 1
      }
      console.log(new Date().toLocaleString())
      // await this.RandomClick(3000, 3100)
      await d(500)
      console.log(new Date().toLocaleString())
      console.log('result', result)
      this.result = result
      this.processData()
      return result
    },
    processData() {
      // // 获取二维数组的列数
      var result = this.result
      // const cols = result[0].length;
      // var tempdata = []
      // // 遍历列
      // for (let j = 0; j < cols; j++) {
      //   let columnElements = []; // 存储相同索引位置的元素
      //   // 遍历行
      //   for (let i = 0; i < result.length; i++) {
      //     // 获取相同索引位置的元素
      //     var element = result[i][j].innerHTML;
      //     // if (element.includes("SKC")) {
      //     //   element = element.substring(3);
      //     //   // console.log(substring);
      //     // }
      //     // 将元素添加到数组中
      //     columnElements.push(element);
      //   }
      //   // 输出该列的元素
      //   console.log(`列 [${j}]:`, columnElements);
      //   tempdata.push(columnElements)
      // }
      // // this.downloadData(tempdata)
      // console.log(tempdata)
      var filterVal = ['skc','zanwu']
      var temp = this.formatJson(filterVal, result)
      console.log("最终结果", temp)
      this.handleDownloadExcel(temp)
    },
    handleAllProcess(source) {
      // 判断页面是否正确
      if (!this.getSourceWeb(source)) {
        this.$message.error('别瞎搞，怀孕了你负责啊')
      }
      // 判断是哪个来源以及是否打开自动翻页
      switch (source) {
        case 'handleScore':
          var keyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
          console.log(keyList)
          this.catchData("handleScore", keyList, this.autoPage)
          break
        case 'handleCost':
          var keyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
          console.log(keyList)
          this.catchData("handleCost", keyList, this.autoPage)
          break
        case 'handleCost':
          var keyList = ["div > div > p:nth-child(5)", '[class="spu-rate_dark__fkkkH"]']
          console.log(keyList)
          this.catchData("handleCost", keyList, this.autoPage)
          break
        default:
          this.$message.success('做个人吧，别瞎搞，搞坏了不负责')
          break
      }
    },
    async RandomClick(min, max) {
      await d(Math.floor(Math.random() * (max - min + 1)) + min);
    },
    handleDownloadExcel(handledList) {
      let that = this
      const tHeader = ['SKC', '评分']
      const header = []
      const list = handledList
      const multiHeader = ['自动采集评分'] // 对应表格输出的title
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
        saveAs(blob, '自动采集评分'+ new Date().toLocaleString()+'.xlsx')
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

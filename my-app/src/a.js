async function processPageSetting() {
    //全部
    //document.querySelectorAll('[data-testid="beast-core-tab"] [data-testid="beast-core-tab-topWrapper"] [data-testid="beast-core-tab-itemLabel-wrapper"]:nth-child(1)')[1].click();
    //更改每页显示数量
    RandomClick(2500,3500);
    const elements1 = document.querySelectorAll('[data-testid="beast-core-select-header"] [data-testid="beast-core-input"]');
    if (elements1.length >= 12) {
        const element = elements1[11];
        if (element) {
            element.click();
        }
    } else {
        RandomClick(2500,3500);
        document.querySelectorAll('[data-testid="beast-core-select-header"] [data-testid="beast-core-input"]')[11].click();
    }
    const elements2 = document.querySelectorAll('[data-testid="beast-core-portal-main"] ul li');
    if (elements2.length >= 4) {
        const element = elements2[3];
        if (element) {
            element.click();
        }
    } else {
        RandomClick(2500,3500);
        document.querySelectorAll('[data-testid="beast-core-select-header"] [data-testid="beast-core-input"]')[11].click();
    }
    //定义当前页数
    //document.querySelectorAll('[data-testid="beast-core-pagination"]')[3].click();
    //向后翻页
    //document.querySelectorAll('[data-testid="beast-core-pagination"] [data-testid="beast-core-pagination-next"]')[0].click()
    //向前翻页
    //document.querySelectorAll('[data-testid="beast-core-pagination"] [data-testid="beast-core-pagination-prev"]')[0].click()
    // 获取总页数
    //页码字符串
    //document.querySelectorAll('[data-testid="beast-core-pagination"] li')[document.querySelectorAll('[data-testid="beast-core-pagination"] li').length-2].textContent
    //页码数值
    pageSize = parseInt(document.querySelectorAll('[data-testid="beast-core-pagination"] li')[document.querySelectorAll('[data-testid="beast-core-pagination"] li').length - 2].textContent);
    //点击跳转最后一页
    //document.querySelectorAll('[data-testid="beast-core-pagination"] li')[document.querySelectorAll('[data-testid="beast-core-pagination"] li').length-2].click()
}

async function RandomClick(min, max) {
    await d(Math.floor(Math.random() * (max - min + 1)) + min);
}

function startInterval() {
    intval = setInterval(function () {
        if (isAllIn) {
            AllIn();
        } else { processPageItems(); }
    }, 20000);
}
function ResetInterval() {
    intval1 = setInterval(function () {
        // 清空之前的堆栈
        clearInterval(intval);
        // 重新设置定时器
        startInterval();
    }, 120000);

}

async function runOperations(param1) {
    var splitResult = param1.split('&&');
    startInterval();
    ResetInterval();
    // if (splitResult.length == 2) {
    //     if (param1 === unique) {
    //         localStorage.setItem('scriptUser', param1);
    //         startInterval();
    //         ResetInterval();
    //         // intval1 = setInterval(function () {
    //         //     location.reload(true);
    //         // }, 60000);//一分钟自动刷新一遍，免得页面卡死
    //     } else {
    //         alert("再试试？");
    //     }
    // } else {
    //     alert("再试试？")
    // }
}

async function processPageItems() {
    items = document.querySelectorAll('[data-testid="beast-core-table-middle-tbody"]')?.[0].querySelectorAll('tr'); // 列表每一行元素
    var promises = [];

    for (var i = 0; i < items.length; i++) {
        SetButton(items[i]);
        //不是灰色的就需要加入抢单任务列表
        if (btn && btn.getAttribute('disabled') === null) {
            await processItemMultipleTimes(items[i], 3);
        }
    }
}
async function processItemMultipleTimes(item, times) {
    if (times > 0) {
    await processItem(item);
    await processItemMultipleTimes(item, times - 1);
    }
}

async function processPage() {
    for (let index = 0; index < pageSize; index++) {
        processPageItems();
        if (index < pageSize) {
            //向后翻页
            document.querySelectorAll('[data-testid="beast-core-pagination"] [data-testid="beast-core-pagination-next"]')[0].click()
            await d(3000);
        }
        if (index == pageSize - 1) {
            //从头翻页
            index = 0;
            document.querySelectorAll('[data-testid="beast-core-pagination"] li')[3].click();
            await d(3000);
        }
    }
}

// 评分
var scores = document.querySelectorAll('[class="spu-rate_dark__fkkkH"]')

// SKC
var r = document.querySelectorAll("div > div > p:nth-child(5)")
for(var i = 0; i < r.length; i++){
    var skc = r[i].innerHTML
    var score = scores[i].innerHTML
    console.log(skc, score)
}
r[0].innerHTML
document.querySelector("#root > div > div > div.outerWrapper-1-3-1.outerWrapper-d0-1-3-2.index-module__table-with-filter___cCyT_ > div.index-module__flex-1-1___1sS5J.index-module__column-space-between___TZS4c > div.index-module__flex-1-1___1sS5J > div.TB_outerWrapper_5-80-0.TB_bordered_5-80-0.TB_notTreeStriped_5-80-0 > div > div > div.TB_body_5-80-0 > div > div.TB_hiddenScrollBar_5-80-0.TB_scrollXY_5-80-0 > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > div > p:nth-child(5)")
// 整块
var i = document.querySelectorAll('[class="main_productInfo__1t8Sv"]')?.[0].innerHTML


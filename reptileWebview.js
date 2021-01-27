/**
 * Created by Chuans on 2021/1/23
 * Author: Chuans
 * Github: https://github.com/chuans
 * Time: 下午4:33
 * Desc:
 */
const cheerio = require('cheerio');
const superagent = require('superagent');

/**
 * 爬虫数据管理
 */
class Reptile {
    keys = [];
    webContents = null;
    
    /**
     * 需要抓取的基金编号列表
     * @param keys
     * @param webContents
     */
    constructor(keys, webContents) {
        this.keys = keys;
        this.webContents = webContents;
    }
    
    getData = () => {
        const arr = [];
        
        for (let i = 0; i < this.keys.length; i++) {
            arr.push(this.getReadyData(this.keys[i]));
        }
        
        return Promise.all(arr);
    };
    
    async asyncData(id) {
        return new Promise(resolve => {
            superagent.get(`http://fundgz.1234567.com.cn/js/${id}.js?rt=1463558676006`)
                .set('Accept', 'application/json')
                .then(res => resolve(res))
                .catch(err => resolve({}))
        })
    }
    
    getReadyData(id) {
        const url = `http://fund.eastmoney.com/${id}.html?spm=search`;
        
        return new Promise(resolve => {
            superagent.get(url)
                .end(async(err, res) => {
                    if (err) {
                        res = {
                            text: `<body>1</body>`
                        };
                    }
                    
                    const realTimeResp = await this.asyncData(id);
                    const { gztime, fundcode, gszzl, dwjz, gsz } = JSON.parse(realTimeResp.body.toString().replace(/jsonpgz\(|\)\;/g, ''))
                    const $ = cheerio.load(res.text);
    
                    resolve({
                        // name
                        name: $('.fundDetail-tit').text(),
                        key: fundcode,
                        // 基金规模
                        fundSize: $('.fundInfoItem .infoOfFund table tbody tr:first-child td:nth-child(2)').text().replace(/(.+\：)/g, ''),
                        // 净值估算时间  gztime
                        calculatingTime: gztime || '-',
                        // 估算涨幅比例  gszzl
                        calculatingIncrease: gszzl ? `${gszzl}%` : '-',
                        // 估算净值涨幅
                        calculatingNetWorthIncrease: (gsz === '-' || dwjz === '-') ? '-' : (Number(gsz) - Number(dwjz)).toFixed(4),
                        // 估算净值   gz_gsz
                        calculatingNetWorth: gsz || '-',
                        
                        // 单位净值
                        unitNetWorth: $('.dataItem02 .dataNums .ui-font-large').text(),
                        // 单位净值比例
                        unitNetWorthIncrease: $('.dataItem02 .dataNums .ui-font-middle').text(),
                        // 单位净值时间
                        unitNetWorthTime: $('.dataItem02 p').text().replace(/(.+\()|\)/g, '')
                    })
                });
        });
    }
    
    start() {
        const handle = async() => {
            const data = await this.getData();
            
            // ipcMain 模块不能主动发起推送 所以只能用webContents
            this.webContents.send('data-change', data);
        }
        
        setInterval(async() => {
            await handle()
        }, 10000)
        
        handle();
    }
}

module.exports = Reptile;

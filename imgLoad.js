/**
 * @fs imgLoad.js
 * @author lixiaohu(lixioahu_neuq@163.com)
 */



const path = require('path')
const fs = require('fs')
const superagent = require('superagent')


/**
 * 下载图片到本地
 * @param {String} url 图片地址
 * @param {String} filename 图片名称 
 */

const imgLoad = function(url, filename) {
    if (typeof url !== 'string') {
        return 
    }


    //保存图片的路径
    const savePath = path.resolve(__dirname, 'assets')

    //创建写入流并发起请求
    const creatWriteStream = () => {
    
        const writeStream = fs.createWriteStream(`./assets/${filename}.jpg`, {})

        writeStream.on('close', () => {
            console.log('download success')
        })
    
        const req = superagent.get(url)
        req.pipe(writeStream)
    
    }

    fs.exists(savePath, isExists => {
        //如果图片存储路径已经存在
        if (isExists) {
            creatWriteStream()
        }else {
            //路径不存在
            fs.mkdir(savePath, { recursive: true}, err => {
                if (err) throw err

                creatWriteStream()
            })
        }
    })
} 


//图片地址和名称通过命令行传入

const args = process.argv.slice(2)
const url = args[0]
const filename = args[1]

imgLoad(url, filename)


/**
 * @file app.js
 * @author lixiaohu(lixiaohu_neuq@163.com)
 */

const superagent = require('superagent')
const path = require('path')
const fs = require('fs')
const jsdom = require('jsdom')
const { JSDOM } = jsdom



//设置请求头信息

const headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",     
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Cookie": "imooc_uuid=da540210-bba5-43cd-ae18-20d417a3e000; imooc_isnew_ct=1545119654; zg_did=%7B%22did%22%3A%20%22167c04ee69e0-0b6c173be5e1c-35657600-1fa400-167c04ee69f453%22%7D; imooc_isnew=2; loginstate=1; apsid=EyNGE4ZjdlMWU1ZTA3ZjA4ZDdlNGExMmZjNTkyNDcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANDk4Mzc3OQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADExM2FhNWRmNTVjYWI4MjNiMDFkNjFmYTI4ZWFlMGYwB%2BA%2BXAfgPlw%3DOW; IMCDNS=0; zg_f375fe2f71e542a4b890d9a620f9fb32=%7B%22sid%22%3A%201549011432361%2C%22updated%22%3A%201549011432383%2C%22info%22%3A%201549011432367%2C%22superProperty%22%3A%20%22%7B%5C%22%E5%BA%94%E7%94%A8%E5%90%8D%E7%A7%B0%5C%22%3A%20%5C%22%E6%85%95%E8%AF%BE%E7%BD%91%E6%95%B0%E6%8D%AE%E7%BB%9F%E8%AE%A1%5C%22%2C%5C%22Platform%5C%22%3A%20%5C%22web%5C%22%7D%22%2C%22platform%22%3A%20%22%7B%7D%22%2C%22utm%22%3A%20%22%7B%7D%22%2C%22referrerDomain%22%3A%20%22%22%2C%22zs%22%3A%200%2C%22sc%22%3A%200%2C%22cuid%22%3A%20%22c7ZIxNgogWs%2C%22%7D; Hm_lvt_f0cfcccd7b1393990c78efdeebff3968=1546779794,1547624412,1547810626,1549011433; Hm_lpvt_f0cfcccd7b1393990c78efdeebff3968=1549011433; cvde=5c5409e7bfa3a-2"
}


/**
 * 解析html页面
 * @param {object} headers request headers
 * @param {couseId} every course has id 
 * @returns {undefined} undefined
 */

const superagentHtml = (headers = {}, couseId = 441) => {
    
    let url = 'www.imooc.com/learn/'
        url += couseId

    //发起一个请求
    superagent.get(url).set(headers).end((err, res) => {

        
        //如果请求失败 
        if (err) {
            throw new Error(err)
        }

        //成功请求到页面后
        const { text } = res
        const { document } = (new JSDOM(text)).window
        
        
        //得到该课程的名称
        const courseName = document.querySelector('.hd').firstElementChild.innerHTML

        //获取所有视频的id和name
        let videoDoms = document.querySelectorAll('.chapter')

        videoDoms = Array.from(videoDoms)
        
        const videos = []
        
        videoDoms.forEach((videoDom, index) => {

            let videoInfo = Object.create(null)
            //课程名称
            const filename = videoDom.firstElementChild.innerHTML.trim()
            //包含视频id的元素 有的课程可能几个视频
            let viedoIdWrappers = videoDom.querySelector('.video').children
            viedoIdWrappers = Array.from(viedoIdWrappers)

            const ids = []

            //循环获取课程下视频id
            viedoIdWrappers.forEach((viedoIdWrapper, index) => {

                const id = viedoIdWrapper.getAttribute('data-media-id')
                ids.push(id)
            })

            videoInfo.ids = ids
            videoInfo.filename = filename

            getVideoUrl(ids)

            videos.push(videoInfo)

        })


    })
}



/**
 * 获取视频下载地址
 * @param {Array} 视频id
 * @returns {Array} 视频下载地址
 */

const getVideoUrl = (ids = []) => {

    if (ids && ids.length > 0) {

        const idUrls = []
        
        ids.forEach((id, index) => {

            const videoUrl = `http://www.imooc.com/course/ajaxmediainfo/?mid=${id}&mode=flash`

            superagent.get(videoUrl).end((err, res) => {
                        
                    if(err) {
                        throw new Error(err)
                    }
        
                    const { mpath } = JSON.parse(res.text).data.result


                    mpath.forEach((path, index) => {
                        downloadVideo(path, index)
                    })

                    })
            })
    }
}

/**
 * 下载视频
 * @param {String} url
 */

const downloadVideo = (url, filename) => {
    
    console.log(url)

    if (!url) {
        return
    }

    const savePath = path.resolve(__dirname, 'videos')

    const writeStream = fs.createWriteStream(`${savePath}${String(filename)}.mp4`)

    writeStream.on('close', () => {
        console.log('download over')
    })

    fs.exists(savePath, isExists => {
        if (isExists) {

            const req = superagent.get(url)
            req.pipe(writeStream)

        }else {
            fs.mkdir(savePath, { recursive: true }, err => {
                
                const req = superagent.get(url)
                req.pipe(writeStream)

            })
        }
    })
    
}


superagentHtml(headers, 441)
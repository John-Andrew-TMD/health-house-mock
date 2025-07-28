import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import http from 'http'
import path from 'path'

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(cors())
app.use(express.json())
app.use('/images', express.static(path.resolve('../src/static/images')))

// Mock 数据
const mockProducts = {
  1: {
    id: '1',
    name: '养生茶饮·定制配方A',
    price: 128,
    originalPrice: 168,
    tags: ['专业定制', '优质原料', '快速配送'],
    images: [
      '/static/images/medicine-1.jpg',
      '/static/images/medicine-2.avif',
      '/static/images/medicine-3.webp',
    ],
    description: `
      <div class="space-y-4">
        <h3 class="font-bold">产品特点</h3>
        <p>根据您的体质特点，专业定制的养生茶饮配方，采用优质中药材，科学配比，帮助您调理身体。</p>
        <h3 class="font-bold">使用方法</h3>
        <p>1. 每日1-2次，每次1包</p>
        <p>2. 用沸水冲泡3-5分钟即可饮用</p>
        <p>3. 建议空腹服用效果更佳</p>
      </div>
    `,
    deliveryInfo: {
      estimatedTime: '预计48小时内送达',
      shippingFee: 0,
    },
  },
  2: {
    id: '2',
    name: '养生茶饮·定制配方B',
    price: 158,
    originalPrice: 198,
    tags: ['专业定制', '优质原料', '快速配送', '限时特惠'],
    images: [
      '/static/images/medicine-2.avif',
      '/static/images/medicine-3.webp',
      '/static/images/medicine-1.jpg',
    ],
    description: `
      <div class="space-y-4">
        <h3 class="font-bold">产品特点</h3>
        <p>特别添加珍贵药材，针对亚健康人群，帮助改善睡眠质量，提升免疫力。</p>
        <h3 class="font-bold">使用方法</h3>
        <p>1. 每日1-2次，每次1包</p>
        <p>2. 用沸水冲泡5-8分钟即可饮用</p>
        <p>3. 建议睡前1小时服用</p>
      </div>
    `,
    deliveryInfo: {
      estimatedTime: '预计24小时内送达',
      shippingFee: 0,
    },
  },
}

// 预定义的回复
const predefinedResponses = {
  '糖尿病患者如何选择降糖药？':
    '选择降糖药物需要考虑以下几个方面：\n1. 血糖水平和类型\n2. 年龄和身体状况\n3. 并发症情况\n4. 用药禁忌\n建议在医生指导下选择合适的降糖药物。',
  '儿童疫苗接种后发热如何处理？':
    '疫苗接种后发热处理建议：\n1. 观察体温变化\n2. 适当物理降温\n3. 保持室内通风\n4. 多补充水分\n如果发热超过38.5度或持续时间较长，建议及时就医。',
  '老年人夜间频繁起夜怎么办？':
    '针对老年人夜间频繁起夜，建议：\n1. 控制晚间饮水量\n2. 保持规律作息\n3. 适当运动锻炼\n4. 检查是否存在前列腺问题\n必要时请咨询专业医生。',
}

// WebSocket 连接处理
wss.on('connection', (ws) => {
  console.log('New client connected')

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      const { type, content } = data

      if (type === 'chat') {
        // 获取回复内容
        const response =
          predefinedResponses[content] ||
          '您好，我是小美AI助手。您的问题是关于健康方面的吗？我可以为您提供专业的健康咨询和建议。'

        // 模拟打字效果发送回复
        let currentIndex = 0
        const interval = setInterval(() => {
          if (currentIndex < response.length) {
            const chunk = response.slice(currentIndex, currentIndex + 2)
            ws.send(
              JSON.stringify({
                type: 'chunk',
                content: chunk,
              }),
            )
            currentIndex += 2
          } else {
            ws.send(
              JSON.stringify({
                type: 'done',
              }),
            )
            clearInterval(interval)
          }
        }, 50)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      ws.send(
        JSON.stringify({
          type: 'error',
          content: '消息处理失败',
        }),
      )
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

// 欢迎信息接口
app.get('/api/welcome', (req, res) => {
  res.json({
    code: 0,
    data: {
      greeting: '早上好，张阿姨',
      date: '今天是 2023年4月29日 星期一',
      weather: {
        icon: 'sun',
        desc: '晴朗',
        temp: '23℃',
      },
    },
    msg: 'ok',
  })
})

// 设备列表接口
app.get('/api/devices', (req, res) => {
  res.json({
    code: 0,
    data: [
      {
        id: 1,
        icon: 'icon-activity',
        iconColor: 'text-green-500',
        bgGradient: 'bg-gradient-to-r from-green-50 to-green-100',
        name: '智能输液器',
        status: '设备已连接',
        badge: { text: '电量 85%', color: 'bg-green-500' },
      },
      {
        id: 2,
        icon: 'icon-activity',
        iconColor: 'text-green-500',
        bgGradient: 'bg-gradient-to-r from-green-50 to-green-100',
        name: '智能手环',
        status: '设备已连接',
        badge: { text: '电量 85%', color: 'bg-green-500' },
      },
      {
        id: 3,
        icon: 'icon-scale',
        iconColor: 'text-emerald-500',
        bgGradient: 'bg-gradient-to-r from-emerald-50 to-teal-50',
        name: '智能体重秤',
        status: '设备已连接',
        badge: { text: '已同步', color: 'bg-green-500' },
      },
      {
        id: 4,
        icon: 'icon-droplet',
        iconColor: 'text-amber-500',
        bgGradient: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        name: '血压计',
        status: '设备已连接',
        badge: { text: '已同步', color: 'bg-green-500' },
      },
    ],
    msg: 'ok',
  })
})

// 健康状态接口
app.get('/api/health-status', (req, res) => {
  res.json({
    code: 0,
    data: {
      statusText: '您的健康指标处于正常范围',
      heartRate: { value: 75, unit: '次/分', range: '60-100', percent: 75 },
      bloodPressure: { value: '125/85', range: '90/60-140/90', percent: 70 },
      temperature: { value: '36.5℃', range: '36.1-37.2℃', percent: 60 },
      sleep: { value: 7.5, unit: '小时', range: '7-8', percent: 85 },
    },
    msg: 'ok',
  })
})

// 登录接口
app.post('/api/auth/login', (req, res) => {
  // 可以从请求体获取用户名密码
  // const { username, password } = req.body
  res.json({
    "code": 200,
    "message": "string",
    "data": {
      token: "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMGJiYzAzNS05NmMwLTQ1ZTUtOTI1Mi1kZDMwOTBlZWY3NTQiLCJzdWIiOiI3MzYwNjMxMTQ2OTY1OTM0MDgiLCJpc3MiOiJjb21wYW55LWF1dGgtc2VydmVyIiwiaWF0IjoxNzUzMzQ0MDA0LCJleHAiOjE3NTM0MzA0MDR9.YmCyybgZ19OwRNdHrZTm0X77NWVD84Qu8qpwG19R5cg",
      userId: 736063114696593400
    },
    "timestamp": 0,
    "error": true,
    "success": true
  })
})
app.post('/api/auth/logout', (req, res) => {
  res.json({
    "code": 200,
    "message": "操作成功",
    "data": "登出成功",
    "timestamp": 1753341585955,
    "error": false,
    "success": true
  })
})
// 获取推荐商品列表
app.get('/api/products/recommendations', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '养生茶包', price: 68, image: '/static/images/medicine-1.jpg' },
      { id: 2, name: '滋补汤料', price: 88, image: '/static/images/medicine-2.jpg' },
      { id: 3, name: '养生套装', price: 198, image: '/static/images/medicine-3.jpg' },
      { id: 4, name: '养生茶饮', price: 128, image: '/static/images/medicine-1.jpg' },
      { id: 5, name: '滋补养生汤', price: 168, image: '/static/images/medicine-2.jpg' },
    ],
  })
})
// 获取商品详情
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params
  const product = mockProducts[id]

  if (product) {
    res.json({
      code: 200,
      message: 'success',
      data: product,
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在',
      data: null,
    })
  }
})

// 获取新闻列表
app.get('/api/news', (req, res) => {
  res.json({
    code: 200,
    data: [
      {
        img: '/src/static/vibrant-healthy-meal.png',
        title: '老年人健康饮食指南：平衡营养的重要性',
        desc: '了解如何通过饮食改善健康状况，增强免疫力，预防慢性疾病...',
        tags: ['饮食', '健康'],
        time: '2天前',
      },
      {
        img: '/src/static/active-seniors-park.png',
        title: '适合老年人的五种低强度运动',
        desc: '保持活力不需要高强度运动，这些简单的活动可以帮助您保持健康...',
        tags: ['运动', '健康'],
        time: '3天前',
      },
    ],
    msg: 'ok',
  })
})

// 西医健康报告接口
app.post('/api/health-reports/western', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      user: {
        name: '兰瑞泉',
        gender: '男',
      },
      health_report: {
        summary:
          '整体健康状况良好。各项指标均在正常范围内，包括BMI、体脂肪率、基础代谢率、血压等。内脏脂肪等级有所下降，表明近期可能有良好的生活习惯调整。',
        key_metrics: [
          {
            name: 'BMI',
            value: 22.81,
            unit: '',
            reference_range: '18.5-24.9',
            status: '正常',
            desc: '体重管理良好',
          },
          {
            name: '体脂肪率',
            value: 18.6,
            unit: '%',
            reference_range: '男10-20%',
            status: '正常',
            desc: '属于健康范围',
          },
          {
            name: '血压',
            value: '106/60',
            unit: 'mmHg',
            reference_range: '理想血压',
            status: '正常',
            desc: '心血管系统健康',
          },
          {
            name: '内脏脂肪等级',
            value: 7.4,
            unit: '',
            reference_range: '',
            status: '改善',
            desc: '较历史数据下降5.1%，表明内脏脂肪减少，代谢健康改善',
          },
        ],
        trend_analysis: [
          {
            metric: 'BMI、体脂率、体重、基础代谢率',
            trend: '稳定',
            desc: '均保持稳定，无显著波动',
          },
          {
            metric: '内脏脂肪等级',
            trend: '下降',
            desc: '下降趋势明显，建议继续保持健康饮食和运动习惯',
          },
        ],
        attention: ['目前无异常指标，但建议定期监测内脏脂肪等级和体脂率，以维持代谢健康。'],
        suggestions: [
          '继续每日记录健康数据，关注内脏脂肪和体脂率的变化。',
          '建议每晚保持7-9小时的高质量睡眠，避免熬夜。',
          '养成固定的作息时间，有助于身体代谢和恢复。',
        ],
      },
      exercise_report: {
        ability_evaluation:
          '骨骼肌率（46.7%）和肌肉量（56.5 kg）显示其肌肉状态良好，适合进行中等强度的运动。',
        personal_plan: [
          {
            type: '有氧运动',
            frequency: '每周3-5次',
            duration: '每次30-45分钟',
            examples: ['慢跑', '游泳', '骑行'],
          },
          {
            type: '力量训练',
            frequency: '每周2-3次',
            duration: '每次20-30分钟',
            focus: ['核心肌群', '下肢'],
          },
        ],
        intensity: '中等强度（心率控制在最大心率的60-70%）',
        goals: ['维持肌肉量', '进一步降低内脏脂肪等级至7以下'],
        notes: ['运动前后充分热身和拉伸，避免受伤。', '根据身体反应调整运动强度，避免过度疲劳。'],
      },
      diet_report: {
        nutrition_analysis: '体成分数据显示蛋白质和水分充足，但需注意微量元素的均衡摄入。',
        diet_suggestions: [
          {
            category: '营养均衡',
            details: [
              '适量摄入优质蛋白（如鱼、鸡胸肉、豆类）',
              '增加富含维生素D和钙的食物（如牛奶、坚果）',
            ],
          },
          {
            category: '饮食习惯',
            details: [
              '控制进食速度，每餐咀嚼充分，避免消化不良',
              '避免高糖、高脂零食，减少内脏脂肪堆积风险',
            ],
          },
          {
            category: '特殊调理',
            details: ['无特殊需求，但建议定期补充Omega-3脂肪酸（如深海鱼油）'],
          },
        ],
        taboos: ['避免过量饮酒和高盐饮食，以防血压波动。'],
      },
      conclusion:
        '健康状况良好，继续保持当前的生活习惯即可。建议重点关注内脏脂肪的进一步优化，并通过运动和饮食的调整实现目标。如有任何疑问或需要进一步建议，请随时咨询！',
    },
  })
})

// 中医健康报告接口
app.post('/api/health-reports/tcm', (req, res) => {
  res.json({
    message: '数据接收成功',
    code: 200,
    data: {
      advise:
        '您好，您可能有气虚质的表现，如容易疲乏、精神不振、易出汗等，同时伴有阴虚火旺的症状，如五心烦热、失眠盗汗等。这款人参玫瑰桂圆姜枣茶，含有人参补气，玫瑰疏肝，桂圆养血，姜枣温中，适合您调理气虚与阴虚并见的情况，帮助改善疲劳与虚火症状。',
      data: {
        final_rtn: {
          all_itmes: [
            {
              child: [
                {
                  fengxian_tips:
                    '面对长期压力发生抑郁症、焦虑症的风险会增加。容易产生消极悲观情绪；引发饮食失调；引发饮食失调；导致免疫力下降；导致阴阳失衡、疾病丛生。',
                  health_advice:
                    '调整自己的心态和状态；保证充足睡眠；注意饮食营养，荤素搭配平衡膳食，补充人体各种营养物质和微量元素，保持健康体质和充沛体能；可以通过健身和体育运动来缓解和适当发泄心情。',
                  image: 'https://images.1699yun.cn/10001/report_icon/jingshenyali.png',
                  rate: '0.53%',
                  reyuan_tips: '额头局部温度异常偏高',
                  sort: 1,
                  sub_item: '精神压力',
                  value: 1,
                },
                {
                  fengxian_tips: '',
                  health_advice: '',
                  image: 'https://images.1699yun.cn/10001/report_icon/pilao.jpg',
                  rate: '0.82%',
                  reyuan_tips: '',
                  sort: 3,
                  sub_item: '疲劳',
                  value: 1,
                },
                {
                  fengxian_tips: '',
                  health_advice: '',
                  image: 'https://images.1699yun.cn/10001/report_icon/jingshenyali.png',
                  rate: '0.87%',
                  reyuan_tips: '',
                  sort: 4,
                  sub_item: '焦虑',
                  value: 1,
                },
                {
                  fengxian_tips:
                    '高血脂容易诱发动脉粥样硬化，心脑血管疾病，还可能引起脂肪肝、胰腺炎、糖尿病等其他系统疾病。一些患者会在眼睑周围出现黄色瘤，头晕、失眠、健忘、肢体麻木等症状。',
                  health_advice:
                    '减少高脂肪、高胆固醇食物的摄入，增加蔬菜、水果、全谷类食物的摄入。定期进行有氧运动，如快走、慢跑、游泳等。避免吸烟和过量饮酒，以降低高血脂的风险。',
                  image: 'https://images.1699yun.cn/10001/report_icon/gaoxuezhi.png',
                  rate: '0.22%',
                  reyuan_tips: '手指之间温差呈现异常分布',
                  sort: 10,
                  sub_item: '高血脂倾向',
                  value: 1,
                },
              ],
              title: '循环系统',
            },
          ],
          all_reyuantishi: [],
          bacunping: 1,
          biaoxiantizheng: [],
          biaoxiantizheng_new: [],
          biaozhun_weight: '64kg-70kg',
          bingzheng_tiaoli_jianyi: [
            '可在医生指导下使用具有滋阴降火等功效的中药进行治疗。例如，阴虚火旺者可使用六味地黄丸、杞菊地黄丸等药物。',
            '',
          ],
          bmi: '24.69',
          ecg_report: {
            anxious: 29.97,
            avgHr: 81,
            diagLabels: ['窦性心律'],
            ecg_ir_flag: 'small',
            hrv: 81.02,
            ppg: {
              pilaozhuangtai: '',
              pilaozhuangtai_icon_url: 'https://images.1699yun.cn/10001/report_icon/naogeng.png',
              pilaozhuangtai_info:
                '疲劳又称疲乏，是主观上一种疲乏无力的不适感觉，客观上可能会在同等条件下，失去其完成原来所从事的正常活动或工作能力。',
              pilaozhuangtai_reason:
                '常见于工作、学习任务重，或者运动过量、睡眠不足等生理性疲劳，或者心理焦虑、悲观压抑等心理性疲劳',
              pilaozhuangtai_result:
                '过度疲劳，表现为周身乏力、记忆力减退、情绪波动较大以及睡眠质量较差等。',
              pilaozhuangtai_suggestion:
                '保证睡眠充足，补充营养，注意劳逸结合，以及调节心情，疏解压力，增加跑步、打太极等有氧运动等',
              xueguan_icon_url: 'https://images.1699yun.cn/10001/report_icon/naogeng.png',
              xueguan_info:
                '血管弹性是维持血管正常生理功能的重要特性，人体血液循环的脉动性就是血流与弹性血管壁持续作用的结果。如果血管弹性下降，将会对心血管系统产生多方面的影响。',
              xueguan_reason: '可能对心血管系统产生多方面的影响，容易诱发局部微循环障碍。',
              xueguan_result:
                '血管指数过低，处于亚健康状态，容易出现疲乏无力、情绪低落、睡眠质量差等症状。',
              xueguan_suggestion:
                '少熬夜、避免过度劳累；低盐低脂饮食；戒烟戒酒；增加有氧运动，例如慢跑、打太极等',
              xueguan_tanxing: '',
              xueyang_bhd: '',
              xueyang_info:
                '血氧饱和度是血液中被氧结合的氧合血红蛋白的容量占全部可结合的血红蛋白容量的百分比，即血液中血氧的浓度，它是呼吸循环的重要生理参数。',
              xueyang_reason:
                '呼吸系统或心血管系统可能存在异常，长时间低氧会对神经系统及身体器官造成损伤。',
              xueyang_result:
                '血氧饱和度较低，轻度缺氧无明显症状，如果低于90可能出现呼吸不畅，四肢乏力，头晕以及胸闷等症状。',
              xueyang_suggestion:
                '增加有氧运动，例如慢跑、打太极等；戒烟戒酒；吃富含维生素和铁的菜花、菠菜等绿叶蔬菜的健康饮食，避免由于贫血造成血氧不足。',
            },
            score: 99,
          },
          fangchagAvg: '6,171.1071',
          height: '180',
          jingshengyali_tips: {
            max: {
              fengxiantishi:
                '极高风险可能发展为抑郁症、焦虑障碍等精神疾病，伴随心血管疾病、消化系统病变等躯体问题。',
              tiaolijianyi:
                '可能需要药物（如抗抑郁药）结合长期心理治疗；避免独处，家人需密切观察情绪和行为。',
            },
            mid: {
              fengxiantishi: '可能诱发焦虑症、抑郁症等心理问题。',
              tiaolijianyi: '严格限制咖啡因、酒精摄入；建立固定的睡眠节律，睡前1小时远离电子设备。',
            },
            min: {
              fengxiantishi: '可能引发轻度躯体症状（如头痛、胃部不适）。',
              tiaolijianyi: '规律作息，保证7-8小时睡眠；每日适量运动。',
            },
            ok: {
              fengxiantishi: '指标正常，无风险。',
              tiaolijianyi: '继续保持现有生活状态。',
            },
          },
          jingshenyali: 20,
          just_show_name: 0,
          kjg_face_show: {
            chunse: '青紫',
            guangzedu: '少量光泽',
            minase: '面红黄隐隐明润含蓄',
          },
          lixiang_weight: '72.00',
          mailv: 81,
          maiwei: 2,
          mianshebianshi: [],
          patient_birthday: '2001-01-01',
          patient_mob: '178****3601',
          patient_name: '兰瑞泉',
          patient_sex: 1,
          pdf_url: 'https://images.1699yun.cn/report_pdf/2025/06/24/13145_5957635015.pdf',
          qingdaoDingzhiRes: [],
          qingdaoDingzhiResYizhu: '',
          qingdaoFlag: 0,
          report_time: '2025-06-24 09:57:52',
          select_tizhi_jianyi: [
            {
              changjianbiaoxian:
                '平素语言低怯，气短懒言，肢体容易疲乏，精神不振，易出汗，舌淡红，舌体胖大、边有齿痕，舌苔厚。',
              chengyin:
                '先天本弱，后天失养或病后气亏。如家族成员多较弱，或孕育时父母体弱，或早产，或人工喂养\r\n不当，或偏食、厌食，或因年老气衰等。',
              define: '由于元气不足，以气息低弱，机体、脏腑功能状态低下为主要特征的一种体质状态。',
              fabingqinxiang:
                '平素体质虚弱，卫表不固易患感冒；或病后抗病能力弱，易迁延不愈；或易患内脏下垂、虚劳等病。',
              id: 1,
              name: '气虚质',
              qitabiaoxian:
                '面色偏黄或㿠白，目光少神，口淡，唇色少华，毛发不华，头晕，健忘；大便正常，或有便秘、但不结硬，或大便不成形、便后仍觉未尽；小便正常或偏多。',
              shiyingnengli: '不耐寒邪、风邪和暑邪。',
            },
          ],
          shemiantezheng:
            '舌暗红通常表现为舌体颜色较正常淡红色偏暗，可能伴有舌苔的变化，如舌苔厚腻、少苔或无苔等。舌暗红的程度可以因个体差异而有所不同，但一般都能被肉眼所察觉。\r\n',
          shiqi_zhishu: 21,
          store_id: 10217,
          t1h1rate: '2.51',
          t_age_val: 24,
          tiaolifangfa: [],
          tizhi_chengdu: [],
          tj_shemian_new: {
            shese: '暗红舌',
            shexing: '正常',
            taise: '',
            taixing: '无苔',
            taizhi: '',
          },
          tj_shuoming: [
            '由于体内阴液不足，无法制约阳气，导致阳气相对亢盛，形成虚火内生。',
            '正常舌形应该是舌体柔软、活动自如、形状椭圆、厚度适中、舌质淡红有光泽、舌苔薄白而均匀的。',
          ],
          type_name: {
            content: {
              chafang: '人参茶',
              chengfen: '人参3克',
              gongxiao: '适用于偏于脾胃虚弱，自汗、盗汗厉害的人也可服用。',
              id: 5,
              peifang: '人参10克，冰糖10克，莲子10枚',
              shiyongfangfa: '把人参切成薄片，放在碗内或杯中，用开水冲泡，闷盖5分钟后即可服用。',
              shiyongrenqun: '适用于气虚体质者',
              tangfang: '人参莲肉汤',
              tizhi: '气虚质',
              zhifa:
                '用红参或生晒参、湘莲子（去心）放入瓷碗中，加适量的水浸泡，再加入冰糖。然后将盛药碗置蒸锅中，隔水蒸1小时以上。食用时，喝汤，吃莲肉。人参捞出留下次再用。人参可连续使用3次，最后将人参嚼服。',
              zhucunfangfa: '常温密封保存',
            },
            id: 6,
            image: 'https://images.1699yun.cn/10001/report/qixu.png',
            name: '气虚质',
            selected: 1,
          },
          watch_report: [],
          weight: '80',
          xueyu_zhishu: 27,
          yang_zhishu: 21,
          yin_zhishu: 29,
          zangfu_tiaolijianyi: [
            {
              bingyinbingji:
                '（1）年龄增长：随着年龄增长，人体阴液逐渐耗损。<br />（2）情志因素：郁怒伤肝、情志不遂等情志因素可导致肝气郁结，久化火伤阴。<br />（3）生活习惯：长期食用易引发上火的食物、过度劳累、熬夜等不良生活习惯。',
              bingzheng: '冠心病、慢性肝病',
              citezheng: '',
              id: 1,
              jieshao:
                '舌暗红通常表现为舌体颜色较正常淡红色偏暗，可能伴有舌苔的变化，如舌苔厚腻、少苔或无苔等。舌暗红的程度可以因个体差异而有所不同，但一般都能被肉眼所察觉。\r\n',
              linchuangbiaoxian:
                '五心烦热、失眠盗汗、口燥咽干、大便干结、小便短黄、舌红少苔、脉细数。',
              show_first: 1,
              shuoming: '由于体内阴液不足，无法制约阳气，导致阳气相对亢盛，形成虚火内生。',
              tiaolijianyi:
                '可在医生指导下使用具有滋阴降火等功效的中药进行治疗。例如，阴虚火旺者可使用六味地黄丸、杞菊地黄丸等药物。',
              zhengzhuang: '阴虚火旺',
              zhutezheng: '舌暗红',
            },
          ],
          zangfubianzheng: [],
          zhongchengyao: ['六味地黄丸', '知柏地黄丸'],
          zhongyibingzheng: ['阴虚火旺', ''],
        },
      },
      message: 'success',
      metaInfo: {
        algVersion: 'algName1V1.0',
      },
      shangpin_id: '1',
    },
    status: 'success',
  })
})

// 启动服务器
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

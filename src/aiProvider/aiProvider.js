import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();


const zhipukey=process.env.ZHIPU_KEY  ?? "test"
const deepseekkey=process.env.DEEPSEEK_KEY ?? "test"

const deepseek = {
  api: new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: deepseekkey,
  }),
  model: "deepseek-chat",
  poinwordconf:[
    {
      System:"你是一个学习助教，请将共学者们提交来学习笔记信息汇总分析生成一个分析简报，简报第一行标题：${itemname}。然后说明统计日期区间，需要统计多少人，共提交了多少笔记,先分析近期情况，后摘要两则优秀笔记进行推荐。控制在1000字内，输出markdown格式为：禁用#的标题符号，采取**标题**加粗缩进方式",
      User:"共学者们学习笔记："
    }
  
  
  ]
}



const zhipu = {
  api: new OpenAI({
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
    apiKey:  zhipukey,
  }),
  model: "glm-4-plus",
  poinwordconf:[
    {
      System:"你是一个学习助教，请将共学者们提交来学习笔记信息汇总分析生成一个分析简报，简报第一行标题：${itemname}。然后说明统计日期区间，需要统计多少人，共提交了多少笔记,先分析近期情况，后摘要两则优秀笔记进行推荐。控制在1000字内，注意markdown格式标准性(禁用#的标题符号，采取**标题**缩进方式)",
      User:"统计数据与共学者们学习笔记："
    }
  
  
  ]
};




function createCompletionFunction(config) {
  const poinwordconf=config.poinwordconf
  return async function ( hotwords,poinword) {
    const completion = await config.api.chat.completions.create({
      messages: [
        { "role": "system", "content": poinwordconf[poinword].System },
        { "role": "user", "content": poinwordconf[poinword].User + hotwords }
      ],
      model: config.model,
    });

    // 获取生成的简报内容
    const report = completion.choices[0].message.content;


    // 返回分类汇总后的结果
    return report;
  }
}

const getzhipu=createCompletionFunction(zhipu);
const getdeepseek=createCompletionFunction(deepseek);

export {
 getdeepseek,
  getzhipu
}
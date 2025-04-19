import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();


const zhipukey=process.env.ZHIPU_KEY ?? 'test'
const deepseekkey=process.env.DEEPSEEK_KEY ?? 'test'

const deepseek = {
  api: new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: deepseekkey,
  }),
  model: "deepseek-chat",
  poinwordconf:[
    {
        System:"你是一个信息汇总助手，过滤重复信息，生成简报输出(格式：**类别**\n **title** **messages**\n)",
        User:"请将以下信息去重整理汇总摘要："
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
      System:"你是一个信息汇总助手，过滤重复信息，生成简报输出(格式：**类别**\n **title** **messages**\n)",
      User:"请将以下信息去重整理汇总摘要："
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
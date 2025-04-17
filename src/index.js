// src/index.js
/* import {getnewdata} from "./tools/getgitdata.js"
import {telegrembot } from "./tools/telegrembot.js"
import {getzhipu} from "./aiProvider/aiProvider.js" */
import {initScheduler} from './task/loadscedule.js'
import { startBot} from './server/botserver.js'


/* async function main() {
  const learndata=await getnewdata(itemname,days)
  console.log(learndata)
  //const textdata=await getzhipu(learndata,0)
 // console.log(textdata)
 // const results=await telegrembot(itemname,textdata)
  //console.log(results)
}

main() */

initScheduler('./conf/task.json');
startBot()


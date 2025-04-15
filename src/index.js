// src/index.js
import {getnewdata} from "./tools/getgitdata.js"
import {telegrembot } from "./tools/telegrembot.js"
import {getzhipu} from "./aiProvider/aiProvider.js"

const itemname="Ethereum-Protocol-Fellowship-3"
const days=7

async function main() {
  const learndata=await getnewdata(itemname,days)
  console.log(learndata)
  const textdata=await getzhipu(learndata,0)
  console.log(textdata)
  const results=await telegrembot(itemname,textdata)
  console.log(results)
}

main()

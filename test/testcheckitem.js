import { checkItem, pullgitdata, sendDayPush,sendWeekPush} from "../src/task/pushmessage.js"

/* async function main() {
    await checkItem();
    await sendDayPush();
}
main().catch((err) => {
    console.error("主函数执行出错:", err);
});
console.log("test") */

sendWeekPush();
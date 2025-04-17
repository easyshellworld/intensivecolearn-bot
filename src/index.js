// src/index.js

import {initScheduler} from './task/loadscedule.js'
import { startBot} from './server/botserver.js'




initScheduler('./conf/task.json');
startBot()


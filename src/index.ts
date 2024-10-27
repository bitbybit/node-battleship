import { httpServer } from './http_server'
import { wsServer } from './ws_server'
import { getPorts } from './helpers/env'

const { http: portHttp, ws: portWs } = getPorts()

httpServer(portHttp)
wsServer(portWs)

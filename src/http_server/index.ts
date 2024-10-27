import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'

export const httpServer = (port: number): void => {
  const server = http.createServer(async (req, res) => {
    const __dirname = path.resolve(path.dirname(''))

    const file_path =
      __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url)

    try {
      const data = await fs.readFile(file_path)

      res.writeHead(200)
      res.end(data)
    } catch (error) {
      res.writeHead(404)
      res.end(JSON.stringify(error))
    }
  })

  server.listen(port)

  console.log(`Start static http server on the ${port} port!`)
}

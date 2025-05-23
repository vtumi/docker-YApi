import fs from 'fs-extra'
import { join, parse } from 'path'
import childProcess from 'child_process'

function clean(rootDir: string) {
  const projectFilePath = join.bind(null, rootDir)
  const pkgFilePath = join.bind(null, projectFilePath('node_modules'))

  // 需要保留的文件列表
  const reservedFiles = [
    pkgFilePath('ajv-i18n/localize/es'),
    pkgFilePath('svgo/.svgo.yml'),
    pkgFilePath('.bin'),
  ].map((filePath) => {
    const { dir, base } = parse(filePath)
    return {
      from: filePath,
      to: join(dir, 'r_' + base.replace(/\./g, '')),
    }
  })

  reservedFiles.map(({ from, to }) => {
    fs.moveSync(from, to)
  })

  childProcess.execSync(
    `
      cd ${rootDir}
      shopt -s globstar
      rm -rf \\
        **/*.{map,lock,log,md,yml,yaml,ts,tsx,vue,txt} \\
        **/.[!.]* \\
        **/__*__ \\
        **/{tsconfig.json,package-lock.json,Makefile,CHANGELOG} \\
        **/*.{test,spec,es,esm}.* \\
        **/{test,tests,example,examples,doc,docs,coverage,demo,umd,es,esm}/
    `,
    { shell: '/bin/bash' },
  )

  reservedFiles.map(({ from, to }) => {
    fs.moveSync(to, from)
  })
}

clean(process.argv[2])

require('module-alias/register')

const fs = require('fs')
const path = require('path')
const {h} = require('preact')
const render = require('preact-render-to-string')
const recursive = require('recursive-readdir')

const Markdown = require('./Markdown')
const Page = require('./Page')

let extractTitle = content => render(h(Markdown, {
    containerTagName: 'title',
    containerProps: {},
    source: content,
    skipHtml: true,
    allowedTypes: ['Heading', 'Text'],
    renderers: {
        Heading: ({level, children}) => level === 1 ? children : null
    }
})).slice('<title>'.length, -'</title>'.length)

let isNotMarkdownFile = (file, stats) => stats.isFile() && path.extname(file) !== '.md'
let isInDependency = (file, stats) => stats.isDirectory() && path.basename(file) === 'node_modules'

recursive('./', [isNotMarkdownFile, isInDependency])
.then(files => files.map((file, index) => {
    let content = fs.readFileSync(file, 'utf8')
    let out = file === 'README.md' ? 'index.html' : `${file.slice(0, -3)}.html`
    let percent = Math.round((index + 1) * 100 / files.length)
    let title = extractTitle(content)

    if (title.indexOf('Cookbook') !== 0) {
        title = `Cookbook: ${title}`
    }

    return {index, percent, file, out, title, content}
}))
.then(entries => {
    for (let {percent, out, title, content} of entries) {
        fs.writeFileSync(out, render(
            h(Page, {title},
                h(Markdown, {source: content})
            )
        ))

        process.stdout.write(`\rProcessing ${percent}%...`)
    }
})
.then(() => console.log('\nFinished.'))
.catch(console.error)

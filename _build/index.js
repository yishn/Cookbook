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
})).replace(/<\/?title>/g, '')

let isNotMarkdownFile = (file, stats) => stats.isFile() && path.extname(file) !== '.md'
let isInDependency = (file, stats) => stats.isDirectory() && path.basename(file) === 'node_modules'

recursive(path.join(__dirname, '..'), [isNotMarkdownFile, isInDependency])
.then(files => files.map((file, index) => {
    let content = fs.readFileSync(file, 'utf8')
    let out = `${file.slice(0, -3)}.html`.replace('README', 'index')
    let percent = Math.round((index + 1) * 100 / files.length)

    return {index, percent, file, out, content}
}))
.then(entries => {
    for (let {percent, out, content} of entries) {
        let title = extractTitle(content)

        fs.writeFileSync(out, '<!DOCTYPE html>' + render(
            h(Page,
                {
                    title: title.indexOf('Cookbook') !== 0 ? `Cookbook: ${title}` : title,
                    stylesheet: path.relative(path.dirname(out), path.join(__dirname, 'cookbook.css'))
                        .replace(/\\/g, '/')
                },

                h(Markdown, {
                    containerProps: {id: 'root', class: title !== 'Cookbook' && 'recipe'},
                    indexLink: path.relative(path.dirname(out), path.join(__dirname, '..', 'index.html'))
                        .replace(/\\/g, '/'),
                    source: content
                })
            )
        ))

        process.stdout.write(`\rProcessing ${percent}%...`)
    }

    console.log('\nFinished.')
})
.catch(console.error)

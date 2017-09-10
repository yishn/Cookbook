const {h, Component} = require('preact')
const ReactMarkdown = require('react-markdown')

module.exports = class Markdown extends Component {
    render() {
        return h(ReactMarkdown, Object.assign({
            containerProps: {id: 'root'},
            skipHtml: true,
            renderers: {
                Heading: ({level, children}) => h(`h${level}`, {
                    id: level <= 2 ? children[0].toLowerCase().replace(/\W+/g, '-') : null
                }, children),

                Link: ({href, title, children}) => h('a', {
                    title,
                    href: href.slice(-3) === '.md' ? href.slice(0, -3) + '.html' : href
                }, children)
            }
        }, this.props))
    }
}

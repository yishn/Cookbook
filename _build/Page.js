const {h, Component} = require('preact')

module.exports = class Page extends Component {
    render() {
        return h('html', {},
            h('head', {},
                h('meta', {charset: 'utf-8'}),
                this.props.stylesheet && h('link', {rel: 'stylesheet', href: this.props.stylesheet}),
                this.props.title && h('title', {}, this.props.title)
            ),
            h('body', {},
                this.props.children
            )
        )
    }
}

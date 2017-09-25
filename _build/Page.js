const {h, Component} = require('preact')

module.exports = class Page extends Component {
    render() {
        return h('html', {},
            h('head', {},
                h('meta', {charset: 'utf-8'}),
                h('meta', {name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no'}),
                this.props.title && h('title', {}, this.props.title),
                this.props.stylesheet && h('link', {rel: 'stylesheet', href: this.props.stylesheet})
            ),
            h('body', this.props.bodyProps,
                this.props.children
            )
        )
    }
}

const {h, Component} = require('preact')

module.exports = class Page extends Component {
    render() {
        return h('html', {},
            h('head', {},
                h('meta', {charset: 'utf-8'}),
                h('title', {}, this.props.title)
            ),
            h('body', {},
                this.props.children
            )
        )
    }
}

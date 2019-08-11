'use strict';

/* jshint undef: true, unused: true */
/* globals m */

window.component('select', function(select) {
    select.controller = function(opts){
        if (!(this instanceof select.controller)) {
            return new select.controller(opts);
        }

        this.opts = opts;
        this.value = typeof opts.value === 'function' ? opts.value : m.prop(opts.value);
        this.options = m.prop(opts.options.map(window.components.selector.Option));
    };
    select.view = function(ctrl){
        return m('.comp-select', m('select' + (ctrl.opts.class ? '.' + ctrl.opts.class : ''), {onchange: m.withAttr('value', ctrl.value)}, ctrl.options().map(function(o){
            var opts = {
                value: o.value()
            };
            if (('' + ctrl.value()) === ('' + o.value())) {
                opts.selected = 'selected';
            }

            return m('option', opts, o.title());
        })));
    };
});

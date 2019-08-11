'use strict';

/* jshint undef: true, unused: true */
/* globals m, moment, jQuery, $ */

window.component('datepicker', function(datepicker) {
    var t = window.components.t;
	
    datepicker.controller = function(opts){
        if (!(this instanceof datepicker.controller)) {
            return new datepicker.controller(opts);
        }
        this.opts = opts;
        this.value = opts.value;
        this.date = (opts.value() || opts.defaultDate) ? new Date((opts.value() || opts.defaultDate).getTime()) : new Date();
        this.hours = m.prop(('00' + this.date.getHours()).slice(-2));
        this.minutes = m.prop(('00' + this.date.getMinutes()).slice(-2));
        var open = false;
        this.open = function(){
            if (arguments.length) {
                open = !!arguments[0];
                if (open) {
                    this.date = (opts.value() || opts.defaultDate) ? new Date((opts.value() || opts.defaultDate).getTime()) : new Date();
                }
            }
            return open;
        }.bind(this);
        this.valueFormatter = opts.valueFormatter || function(d) { return moment(d).format('DD.MM.YYYY, HH:mm'); };

        this.normalize = function() {
            var d = new Date(this.date.getTime()),
                h = parseInt(this.hours()),
                m = parseInt(this.minutes());

            if (isNaN(h)) {
                d.setHours(0);
                this.hours('00');
            } else if (isNaN(m)) {
                d.setMinutes(0);
                this.minutes('00');
            } else if (h > 23) {
                d.setHours(h);
                d.setMinutes(m);
                d.setHours(0);
                d.setMinutes(0);
                this.hours('00');
                this.minutes('00');
            } else if (m > 59) {
                d.setHours(h);
                d.setMinutes(m);
                d.setHours(0);
                d.setMinutes(0);
                this.hours('00');
                this.minutes('00');
            } else {
                d.setHours(h);
                d.setMinutes(m);
                this.hours(('00' + h).slice(-2));
                this.minutes(('00' + m).slice(-2));
            }
            this.date = d;
        };

        this.isValid = function() {
            return this.date.getTime() > Date.now();
        };

        this.applyDate = function(ev) {
            ev.stopPropagation();
            this.normalize();
            if (this.isValid()) {
                this.value(new Date(this.date.getTime()));
                this.open(false);
            }
        }.bind(this);

        this.clearDate = function(ev){
            ev.stopPropagation();
            this.value(undefined);
            this.open(false);
        }.bind(this);

        // this.date = m.prop(opts.defaultDate ? new Date(opts.defaultDate.getTime()) : new Date());
    };

    datepicker.view = function(ctrl){
        return m('.comp-datepicker' + (ctrl.opts.class ? '.' + ctrl.opts.class : ''), {
            class: ctrl.open() ? 'active' : '',
            config : function(){
                $(window).unbind('click.' + ctrl.opts.id).bind('click.' + ctrl.opts.id,  function(e){
                    if (!$(e.target).parents('.comp-datepicker').length) {
                        m.startComputation();
                        ctrl.open(false);
                        $(window).unbind('click.' + ctrl.opts.id);
                        m.endComputation();
                    }
                });
            }
        }, [
            m('.comp-datepicker-head', {onclick: function(ev) {
                if (ctrl.opts.onclick) {
                    ctrl.opts.onclick(ev);
                }
                ctrl.open(!ctrl.open());
            }}, [
                m('i.material-icons', {}, 'date_range'),
                ctrl.value() ? 
                    m('span.formatted', ctrl.valueFormatter(ctrl.value())) :
                    m('span.formatted', t('datepicker.dt.click')),
                m('span.ion-chevron-down'),
            ]),
            m('.picker', {
                class : ctrl.opts.position === 'top' ? 'on-top' : '',
                config: function(element, isInitialized) {
                    if (!isInitialized) {
                        var parent = element.parentElement.clientWidth || 180;
                        element.style['margin-left'] = (parent - 205 - 10) + 'px';
                    }
                }
            }, [
                m('.comp-datepicker-ui-picker', {config: datepicker.config(ctrl)}),
                m('.comp-datepicker-time', [
                    m('span.comp-datepicker-time-label', t('datepicker.pick-time') + ': '),
                    m('input[type=number][min=0][max=23]', {value: ctrl.hours(), oninput: m.withAttr('value', ctrl.hours), onblur: ctrl.normalize}),
                    m('span.comp-datepicker-time-spacer', ':'),
                    m('input[type=number][min=0][max=59]', {value: ctrl.minutes(), oninput: m.withAttr('value', ctrl.minutes), onblur: ctrl.normalize})
                ]),
                m('.comp-datepicker-apply', [
                    m('div', [
                        m('.icon-button.dark', { onclick: ctrl.clearDate }, t('datepicker.clear')),
                        m('.icon-button.green', { class: ctrl.isValid() ? '' : 'disabled', onclick: ctrl.applyDate }, t('datepicker.apply'))
                    ])
                ])
            ])
        ]);
    };

    datepicker.config = function(ctrl) {
        return function(element, isInitialized) {
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.datepicker !== 'undefined') {
                if (!isInitialized) {
                    $(element).datepicker({
                        defaultDate: ctrl.opts.defaultDate,
                        minDate: ctrl.opts.minDate || new Date(),
                        maxDate: ctrl.opts.maxDate,
                        numberOfMonths:1,
                        showOtherMonths:true,
                        onSelect:function (selectedDate) {
                            var instance = $(this).data('datepicker'),
                                date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat, selectedDate, instance.settings);

                            if (ctrl.hours()) {
                                date.setHours(ctrl.hours());
                            }
                            if (ctrl.minutes()) {
                                date.setMinutes(ctrl.minutes());
                            }

                            m.startComputation();
                            ctrl.date = date;
                            m.endComputation();
                        }
                    });
                }
            } else {
                console.warn('ERROR: No jQuery found when initializing comp-datepicker');    
            }
        };
    };
});
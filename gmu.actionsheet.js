/**
 * @file 仿iOS7风格的 modal全屏 actionsheet
 * @import core/widget.js, extend/highlight.js, extend/parseTpl.js, extend/event.ortchange.js
 * @module GMU
 */
;(function (gmu, $, undefined) {
    /**
     * @class Actionsheet
     * @constructor
     * javascript部分
     * ```javascript
     *
     * var actionsheet = new gmu.Actionsheet({
     *      title: 'please choose',
     *      items: ['first', 'second', 'third'],
     *      itemClick: function (e, data) {
     *          console.debug('item clicked, index is ' + data.index);
     *      },
     *      cancelClick: function (e) {
     *          console.debug('cancel button clicked');
     *      }
     * });
     * ```
     */
    gmu.define('Actionsheet', {
        options: {
            /**
             * @property {String} [title=null] 标题
             * @namespace options
             */
            title: '',

            /**
             * @property {Array} [items=null] item内容，每个item为一个String
             * @namespace options
             */
            items: null
        },

        template: {
            container: '<div class="ui-actionsheet-container"></div>',
            mask: '<div class="ui-actionsheet-mask"></div>',
            content: '<ul class="ui-acitonsheet-content-hidden">' +

                '<li>' +
                '<div class="ui-actionsheet-title">' +
                '<h3><%=title%></h3>' +
                '</div>' +
                '</li>' +

                '<li>' +
                '<div class="ui-actionsheet-btns-wapper-portrait">' +
                '<ul>' +
                '<%=btns%>' +
                '</ul>' +
                '</div>' +
                '</li>' +

                '<li class="placeholder"></li>' +

                '<li>' +
                '<button class="button actionsheet-cancel-button">取消</button>' +
                '</li>' +

                '</ul>',

            item: '<li><button class="button actionsheet-button"><%=btnText%></button></li>'
        },


        _init: function () {
            var me = this, opts = me._options, btns,
                eventHanlder = $.proxy(me._eventHandler, me);

            me.on('ready', function () {
                //bind events绑定事件
                $(window).on('ortchange', eventHanlder);
            });
        },

        _create: function () {
            //dom 创建
            var me = this,
                opts = me._options,
                btnsHtml = '',
                itemBtns;

            /**
             *
             *
             +----------------------------------------------+
             |                                              |
             | +------------------------------------------+ |
             | |                                          | |
             | |  +------------------------------------+  | |
             | |  |  +------------------------------+  |  | |
             | |  |  |           title              |  |  | |
             | |  |  +------------------------------+  |  | |
             | |  |                                    |  | |
             | |  |  +------------------------------+  |  | |
             | |  |  | +--------------------------+ |  |  | |
             | |  |  | |      <ul> </ul>          | |  |  | |
             | |  |  | +--------------------------+ |  |  | |
             | |  |  |          btnsWapper          |  |  | |
             | |  |  +------------------------------+  |  | |
             | |  |                                    |  | |
             | |  |  +------------------------------+  |  | |
             | |  |  |       cancel button          |  |  | |
             | |  |  +------------------------------+  |  | |
             | |  |            _content <ul></ul>      |  | |
             | |  +------------------------------------+  | |
             | |                  _mask <div></div>       | |
             | +------------------------------------------+ |
             |                 _container  <div></div>      |
             +----------------------------------------------+
             *
             *
             * */


            opts._container = $(me.tpl2html('container')).appendTo($('body'));
            opts._mask = $(me.tpl2html('mask')).appendTo(opts._container);

            if (opts.items !== null
                && opts.items !== undefined
                && $.type(opts.items) === 'array') {
                //render button item in <ul></ul>
                $.each(opts.items, function (index, item) {
                    btnsHtml += me.tpl2html('item', {btnText: item});
                });
            }

            opts._content = $(me.tpl2html('content', {title: opts.title, btns: btnsHtml})).appendTo(opts._mask);
            opts._btnsWapper = $('.ui-actionsheet-btns-wapper-portrait', opts._content);

            /////////
            $('.button', opts._content).button();

            itemBtns = $('.actionsheet-button', opts._content).button();
            itemBtns.each(function (index) {
//                console.debug('input %d is: %o, %s', index, this, $.type(this));
                $(this).on('click',function () {
//                    console.debug('item' + index + 'clicked');
                    me.trigger('itemClick', {index: index});

                    me.destroy();
                    opts._container.remove();
                });
            });

            $('.actionsheet-cancel-button', opts._content).on('click',function () {
//                console.debug('cancel button click');
                me.trigger('cancelClick');

                me.destroy();
                opts._container.remove();
            });

            opts._btnsWapper.iScroll();

            opts._container.css({
                'position': 'absolute',
                'z-index': 5000,

                'top': '0',
                'right': '0',
                'bottom': '0',
                'left': '0',

                'background-color': 'rgba(0,0,0,0.5)'
            });

            opts._mask.css({
                'position': 'absolute',
                'z-index': 5000,

                'top': '0',
                'right': '0',
                'bottom': '0',
                'left': '0',

                'background-color': 'rgba(0,0,0,0.3)'
            });


            opts._container.css('display', 'none');


            if (this._options.setup) {
                throw new Error('actionsheet组件不支持setup模式，请使用render模式');
            }
        },

        _eventHandler: function (e) {
            var me = this;
            switch (e.type) {
                case 'ortchange':
                    me._refresh();
                    break;
            }
        },


        /**
         * 用来更新弹出框位置和mask大小。如父容器大小发生变化时，可能弹出框位置不对，可以外部调用refresh来修正。
         * @method refresh
         * @return {self} 返回本身
         */
        _refresh: function () {
            var me = this, opts = me._options;

            if (window.innerWidth <= window.innerHeight) {
                //竖屏
                opts._btnsWapper.attr('class', 'ui-actionsheet-btns-wapper-portrait');
            } else {
                opts._btnsWapper.attr('class', 'ui-actionsheet-btns-wapper-landscape');
            }

            return me;
        },


        /**
         * 显示弹出层。
         * @method show
         * @chainable
         * @return {self} 返回本身。
         */
        show: function () {
            var me = this,
                opts = me._options,
                evt = gmu.Event('beforeshow');

            me.trigger(evt);

            // 如果外部阻止了关闭，则什么也不做。
            if (evt.isDefaultPrevented()) {
                return;
            }

            opts._container.css('display', 'block');
            opts._content.attr('class', 'ui-acitonsheet-content-show');
            me._visible = true;
            me._refresh();
            return me.trigger('show');
        },

        /**
         * @desc 销毁组件。
         * @name destroy
         */
        destroy: function () {
            var opts = this._options, _eventHander = this._eventHandler;
            $(window).off('ortchange', _eventHander);

            return this.$super('destroy');
        }

    });
})(gmu, gmu.$);

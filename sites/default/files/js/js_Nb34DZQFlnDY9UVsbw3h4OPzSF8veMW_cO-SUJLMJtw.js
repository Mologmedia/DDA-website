/*
Copyright © 2013 Adobe Systems Incorporated.

Licensed under the Apache License, Version 2.0 (the “License”);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an “AS IS” BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * See <a href="http://jquery.com">http://jquery.com</a>.
 * @name jquery
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See <a href="http://jquery.com">http://jquery.com</a>
 * @name fn
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jquery
 */

/**
 * @fileOverview accessibleMegaMenu plugin
 *
 *<p>Licensed under the Apache License, Version 2.0 (the “License”)
 *<br />Copyright © 2013 Adobe Systems Incorporated.
 *<br />Project page <a href="https://github.com/adobe-accessibility/Accessible-Mega-Menu">https://github.com/adobe-accessibility/Accessible-Mega-Menu</a>
 * @version 0.1
 * @author Michael Jordan
 * @requires jquery
 */

/*jslint browser: true, devel: true, plusplus: true, nomen: true */
/*global jQuery */
(function ($, window, document) {
    "use strict";
    var pluginName = "accessibleMegaMenu",
        defaults = {
            uuidPrefix: "accessible-megamenu", // unique ID's are required to indicate aria-owns, aria-controls and aria-labelledby
            menuClass: "accessible-megamenu", // default css class used to define the megamenu styling
            topNavItemClass: "accessible-megamenu-top-nav-item", // default css class for a top-level navigation item in the megamenu
            panelClass: "accessible-megamenu-panel", // default css class for a megamenu panel
            panelGroupClass: "accessible-megamenu-panel-group", // default css class for a group of items within a megamenu panel
            hoverClass: "hover", // default css class for the hover state
            focusClass: "focus", // default css class for the focus state
            openClass: "open" // default css class for the open state
        },
        Keyboard = {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            keyMap: {
                48: "0",
                49: "1",
                50: "2",
                51: "3",
                52: "4",
                53: "5",
                54: "6",
                55: "7",
                56: "8",
                57: "9",
                59: ";",
                65: "a",
                66: "b",
                67: "c",
                68: "d",
                69: "e",
                70: "f",
                71: "g",
                72: "h",
                73: "i",
                74: "j",
                75: "k",
                76: "l",
                77: "m",
                78: "n",
                79: "o",
                80: "p",
                81: "q",
                82: "r",
                83: "s",
                84: "t",
                85: "u",
                86: "v",
                87: "w",
                88: "x",
                89: "y",
                90: "z",
                96: "0",
                97: "1",
                98: "2",
                99: "3",
                100: "4",
                101: "5",
                102: "6",
                103: "7",
                104: "8",
                105: "9",
                190: "."
            }
        };
    /**
     * @desc Creates a new accessible mega menu instance.
     * @param {jquery} element
     * @param {object} [options] Mega Menu options
     * @param {string} [options.uuidPrefix=accessible-megamenu] - Prefix for generated unique id attributes, which are required to indicate aria-owns, aria-controls and aria-labelledby
     * @param {string} [options.menuClass=accessible-megamenu] - CSS class used to define the megamenu styling
     * @param {string} [options.topNavItemClass=accessible-megamenu-top-nav-item] - CSS class for a top-level navigation item in the megamenu
     * @param {string} [options.panelClass=accessible-megamenu-panel] - CSS class for a megamenu panel
     * @param {string} [options.panelGroupClass=accessible-megamenu-panel-group] - CSS class for a group of items within a megamenu panel
     * @param {string} [options.hoverClass=hover] - CSS class for the hover state
     * @param {string} [options.focusClass=focus] - CSS class for the focus state
     * @param {string} [options.openClass=open] - CSS class for the open state
     * @constructor
     */
    function AccessibleMegaMenu(element, options) {
        this.element = element;

        // merge optional settings and defaults into settings
        this.settings = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.mouseTimeoutID = null;
        this.focusTimeoutID = null;
        this.mouseFocused = false;
        this.justFocused = false;

        this.init();
    }

    AccessibleMegaMenu.prototype = (function () {

        /* private attributes and methods ------------------------ */
        var uuid = 0,
            keydownTimeoutDuration = 1000,
            keydownSearchString = "",
            isTouch = typeof window.hasOwnProperty === "function" && !!window.hasOwnProperty("ontouchstart"),
            _getPlugin,
            _addUniqueId,
            _togglePanel,
            _clickHandler,
            _clickOutsideHandler,
            _DOMAttrModifiedHandler,
            _focusInHandler,
            _focusOutHandler,
            _keyDownHandler,
            _mouseDownHandler,
            _mouseOverHandler,
            _mouseOutHandler,
            _toggleExpandedEventHandlers;

        /**
         * @name jQuery.fn.accessibleMegaMenu~_getPlugin
         * @desc Returns the parent accessibleMegaMenu instance for a given element
         * @param {jQuery} element
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _getPlugin = function (element) {
            return $(element).closest(':data(plugin_' + pluginName + ')').data("plugin_" + pluginName);
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_addUniqueId
         * @desc Adds a unique id and element.
         * The id string starts with the
         * string defined in settings.uuidPrefix.
         * @param {jQuery} element
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _addUniqueId = function (element) {
            element = $(element);
            var settings = this.settings;
            if (!element.attr("id")) {
                element.attr("id", settings.uuidPrefix + "-" + new Date().getTime() + "-" + (++uuid));
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_togglePanel
         * @desc Toggle the display of mega menu panels in response to an event.
         * The optional boolean value 'hide' forces all panels to hide.
         * @param {event} event
         * @param {Boolean} [hide] Hide all mega menu panels when true
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _togglePanel = function (event, hide) {
            var target = $(event.target),
                that = this,
                settings = this.settings,
                menu = this.menu,
                topli = target.closest('.' + settings.topNavItemClass),
                panel = target.hasClass(settings.panelClass) ? target : target.closest('.' + settings.panelClass),
                newfocus;

            _toggleExpandedEventHandlers.call(this, true);

            if (hide) {
                topli = menu.find('.' + settings.topNavItemClass + ' .' + settings.openClass + ':first').closest('.' + settings.topNavItemClass);
                if (!(topli.is(event.relatedTarget) || topli.has(event.relatedTarget).length > 0)) {
                    if ((event.type === 'mouseout' || event.type === 'focusout') && topli.has(document.activeElement).length > 0) {
                        return;
                    }
                    topli.find('[aria-expanded]')
                        .attr('aria-expanded', 'false')
                        .removeClass(settings.openClass)
                        .filter('.' + settings.panelClass)
                        .attr('aria-hidden', 'true');
                    if ((event.type === 'keydown' && event.keyCode === Keyboard.ESCAPE) || event.type === 'DOMAttrModified') {
                        newfocus = topli.find(':tabbable:first');
                        setTimeout(function () {
                            menu.find('[aria-expanded].' + that.settings.panelClass).off('DOMAttrModified.accessible-megamenu');
                            newfocus.focus();
                            that.justFocused = false;
                        }, 99);
                    }
                } else if (topli.length === 0) {
                    menu.find('[aria-expanded=true]')
                        .attr('aria-expanded', 'false')
                        .removeClass(settings.openClass)
                        .filter('.' + settings.panelClass)
                        .attr('aria-hidden', 'true');
                }
            } else {
                clearTimeout(that.focusTimeoutID);
                topli.siblings()
                    .find('[aria-expanded]')
                    .attr('aria-expanded', 'false')
                    .removeClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'true');
                topli.find('[aria-expanded]')
                    .attr('aria-expanded', 'true')
                    .addClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'false');
                if (event.type === 'mouseover' && target.is(':tabbable') && topli.length === 1 && panel.length === 0 && menu.has(document.activeElement).length > 0) {
                    target.focus();
                    that.justFocused = false;
                }

                _toggleExpandedEventHandlers.call(that);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_clickHandler
         * @desc Handle click event on mega menu item
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _clickHandler = function (event) {
            var target = $(event.currentTarget),
                topli = target.closest('.' + this.settings.topNavItemClass),
                panel = target.closest('.' + this.settings.panelClass);
            if (topli.length === 1
                    && panel.length === 0
                    && topli.find('.' + this.settings.panelClass).length === 1) {
                if (!target.hasClass(this.settings.openClass)) {
                    event.preventDefault();
                    event.stopPropagation();
                    _togglePanel.call(this, event);
                    this.justFocused = false;
                } else {
                    if (this.justFocused) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.justFocused = false;
                    } else if (isTouch) {
                        event.preventDefault();
                        event.stopPropagation();
                        _togglePanel.call(this, event, target.hasClass(this.settings.openClass));
                    }
                }
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_clickOutsideHandler
         * @desc Handle click event outside of a the megamenu
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _clickOutsideHandler = function (event) {
            if ($(event.target).closest(this.menu).length === 0) {
                event.preventDefault();
                event.stopPropagation();
                _togglePanel.call(this, event, true);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_DOMAttrModifiedHandler
         * @desc Handle DOMAttrModified event on panel to respond to Windows 8 Narrator ExpandCollapse pattern
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _DOMAttrModifiedHandler = function (event) {
            if (event.originalEvent.attrName === 'aria-expanded'
                    && event.originalEvent.newValue === 'false'
                    && $(event.target).hasClass(this.settings.openClass)) {
                event.preventDefault();
                event.stopPropagation();
                _togglePanel.call(this, event, true);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_focusInHandler
         * @desc Handle focusin event on mega menu item.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _focusInHandler = function (event) {
            clearTimeout(this.focusTimeoutID);
            var target = $(event.target),
                panel = target.closest('.' + this.settings.panelClass);
            target
                .addClass(this.settings.focusClass)
                .on('click.accessible-megamenu', $.proxy(_clickHandler, this));
            this.justFocused = !this.mouseFocused;
            this.mouseFocused = false;
            if (this.panels.not(panel).filter('.' + this.settings.openClass).length) {
                _togglePanel.call(this, event);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_focusOutHandler
         * @desc Handle focusout event on mega menu item.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _focusOutHandler = function (event) {
            this.justFocused = false;
            var that = this,
                target = $(event.target),
                topli = target.closest('.' + this.settings.topNavItemClass),
                keepOpen = false;
            target
                .removeClass(this.settings.focusClass)
                .off('click.accessible-megamenu');

            if (window.cvox) {
                // If ChromeVox is running...
                that.focusTimeoutID = setTimeout(function () {
                    window.cvox.Api.getCurrentNode(function (node) {
                        if (topli.has(node).length) {
                            // and the current node being voiced is in
                            // the mega menu, clearTimeout,
                            // so the panel stays open.
                            clearTimeout(that.focusTimeoutID);
                        } else {
                            that.focusTimeoutID = setTimeout(function (scope, event, hide) {
                                _togglePanel.call(scope, event, hide);
                            }, 275, that, event, true);
                        }
                    });
                }, 25);
            } else {
                that.focusTimeoutID = setTimeout(function () {
                    _togglePanel.call(that, event, true);
                }, 300);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_keyDownHandler
         * @desc Handle keydown event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _keyDownHandler = function (event) {
            var that = (this.constructor === AccessibleMegaMenu) ? this : _getPlugin(this), // determine the AccessibleMegaMenu plugin instance
                settings = that.settings,
                target = $($(this).is('.' + settings.hoverClass + ':tabbable') ? this : event.target), // if the element is hovered the target is this, otherwise, its the focused element
                menu = that.menu,
                topnavitems = that.topnavitems,
                topli = target.closest('.' + settings.topNavItemClass),
                tabbables = menu.find(':tabbable'),
                panel = target.hasClass(settings.panelClass) ? target : target.closest('.' + settings.panelClass),
                panelGroups = panel.find('.' + settings.panelGroupClass),
                currentPanelGroup = target.closest('.' + settings.panelGroupClass),
                next,
                keycode = event.keyCode || event.which,
                start,
                i,
                o,
                label,
                found = false,
                newString = Keyboard.keyMap[event.keyCode] || '',
                regex,
                isTopNavItem = (topli.length === 1 && panel.length === 0);

            if (target.is("input:focus, select:focus, textarea:focus, button:focus")) {
                // if the event target is a form element we should handle keydown normally
                return;
            }

            if (target.is('.' + settings.hoverClass + ':tabbable')) {
                $('html').off('keydown.accessible-megamenu');
            }

            switch (keycode) {
            case Keyboard.ESCAPE:
                _togglePanel.call(that, event, true);
                break;
            case Keyboard.DOWN:
                event.preventDefault();
                if (isTopNavItem) {
                    _togglePanel.call(that, event);
                    found = (topli.find('.' + settings.panelClass + ' :tabbable:first').focus().length === 1);
                } else {
                    found = (tabbables.filter(':gt(' + tabbables.index(target) + '):first').focus().length === 1);
                }

                if (!found && window.opera && opera.toString() === "[object Opera]" && (event.ctrlKey || event.metaKey)) {
                    tabbables = $(':tabbable');
                    i = tabbables.index(target);
                    found = ($(':tabbable:gt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                }
                break;
            case Keyboard.UP:
                event.preventDefault();
                if (isTopNavItem && target.hasClass(settings.openClass)) {
                    _togglePanel.call(that, event, true);
                    next = topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last');
                    if (next.children('.' + settings.panelClass).length) {
                        found = (next.children()
                            .attr('aria-expanded', 'true')
                            .addClass(settings.openClass)
                            .filter('.' + settings.panelClass)
                            .attr('aria-hidden', 'false')
                            .find(':tabbable:last')
                            .focus() === 1);
                    }
                } else if (!isTopNavItem) {
                    found = (tabbables.filter(':lt(' + tabbables.index(target) + '):last').focus().length === 1);
                }

                if (!found && window.opera && opera.toString() === "[object Opera]" && (event.ctrlKey || event.metaKey)) {
                    tabbables = $(':tabbable');
                    i = tabbables.index(target);
                    found = ($(':tabbable:lt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                }
                break;
            case Keyboard.RIGHT:
                event.preventDefault();
                if (isTopNavItem) {
                    found = (topnavitems.filter(':gt(' + topnavitems.index(topli) + '):first').find(':tabbable:first').focus().length === 1);
                } else {
                    if (panelGroups.length && currentPanelGroup.length) {
                        // if the current panel contains panel groups, and we are able to focus the first tabbable element of the next panel group
                        found = (panelGroups.filter(':gt(' + panelGroups.index(currentPanelGroup) + '):first').find(':tabbable:first').focus().length === 1);
                    }

                    if (!found) {
                        found = (topli.find(':tabbable:first').focus().length === 1);
                    }
                }
                break;
            case Keyboard.LEFT:
                event.preventDefault();
                if (isTopNavItem) {
                    found = (topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last').find(':tabbable:first').focus().length === 1);
                } else {
                    if (panelGroups.length && currentPanelGroup.length) {
                        // if the current panel contains panel groups, and we are able to focus the first tabbable element of the previous panel group
                        found = (panelGroups.filter(':lt(' + panelGroups.index(currentPanelGroup) + '):last').find(':tabbable:first').focus().length === 1);
                    }

                    if (!found) {
                        found = (topli.find(':tabbable:first').focus().length === 1);
                    }
                }
                break;
            case Keyboard.TAB:
                i = tabbables.index(target);
                if (event.shiftKey && isTopNavItem && target.hasClass(settings.openClass)) {
                    _togglePanel.call(that, event, true);
                    next = topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last');
                    if (next.children('.' + settings.panelClass).length) {
                        found = next.children()
                            .attr('aria-expanded', 'true')
                            .addClass(settings.openClass)
                            .filter('.' + settings.panelClass)
                            .attr('aria-hidden', 'false')
                            .find(':tabbable:last')
                            .focus();
                    }
                } else if (event.shiftKey && i > 0) {
                    found = (tabbables.filter(':lt(' + i + '):last').focus().length === 1);
                } else if (!event.shiftKey && i < tabbables.length - 1) {
                    found = (tabbables.filter(':gt(' + i + '):first').focus().length === 1);
                } else if (window.opera && opera.toString() === "[object Opera]") {
                    tabbables = $(':tabbable');
                    i = tabbables.index(target);
                    if (event.shiftKey) {
                        found = ($(':tabbable:lt(' + $(':tabbable').index(target) + '):last').focus().length === 1);
                    } else {
                        found = ($(':tabbable:gt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                    }
                }

                if (found) {
                    event.preventDefault();
                }
                break;
            case Keyboard.SPACE:
                if (isTopNavItem) {
                    event.preventDefault();
                    _clickHandler.call(that, event);
                } else {
                    return true;
                }
                break;
            case Keyboard.ENTER:
                return true;
                break;
            default:
                // alphanumeric filter
                clearTimeout(this.keydownTimeoutID);

                keydownSearchString += newString !== keydownSearchString ? newString : '';

                if (keydownSearchString.length === 0) {
                    return;
                }

                this.keydownTimeoutID = setTimeout(function () {
                    keydownSearchString = '';
                }, keydownTimeoutDuration);

                if (isTopNavItem && !target.hasClass(settings.openClass)) {
                    tabbables = tabbables.filter(':not(.' + settings.panelClass + ' :tabbable)');
                } else {
                    tabbables = topli.find(':tabbable');
                }

                if (event.shiftKey) {
                    tabbables = $(tabbables.get()
                        .reverse());
                }

                for (i = 0; i < tabbables.length; i++) {
                    o = tabbables.eq(i);
                    if (o.is(target)) {
                        start = (keydownSearchString.length === 1) ? i + 1 : i;
                        break;
                    }
                }

                regex = new RegExp('^' + keydownSearchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'), 'i');

                for (i = start; i < tabbables.length; i++) {
                    o = tabbables.eq(i);
                    label = $.trim(o.text());
                    if (regex.test(label)) {
                        found = true;
                        o.focus();
                        break;
                    }
                }
                if (!found) {
                    for (i = 0; i < start; i++) {
                        o = tabbables.eq(i);
                        label = $.trim(o.text());
                        if (regex.test(label)) {
                            o.focus();
                            break;
                        }
                    }
                }
                break;
            }
            that.justFocused = false;
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_mouseDownHandler
         * @desc Handle mousedown event on mega menu.
         * @param {event} Event object
         * @memberof accessibleMegaMenu
         * @inner
         * @private
         */
        _mouseDownHandler = function (event) {
            if ($(event.target).is(this.settings.panelClass) || $(event.target).closest(":focusable").length) {
                this.mouseFocused = true;
            }
            this.mouseTimeoutID = setTimeout(function () {
                clearTimeout(this.focusTimeoutID);
            }, 1);
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_mouseOverHandler
         * @desc Handle mouseover event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _mouseOverHandler = function (event) {
            clearTimeout(this.mouseTimeoutID);
            $(event.target)
                .addClass(this.settings.hoverClass);
            _togglePanel.call(this, event);
            if ($(event.target).is(':tabbable')) {
                $('html').on('keydown.accessible-megamenu', $.proxy(_keyDownHandler, event.target));
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_mouseOutHandler
         * @desc Handle mouseout event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _mouseOutHandler = function (event) {
            var that = this;
            $(event.target)
                .removeClass(that.settings.hoverClass);

            that.mouseTimeoutID = setTimeout(function () {
                _togglePanel.call(that, event, true);
            }, 250);
            if ($(event.target).is(':tabbable')) {
                $('html').off('keydown.accessible-megamenu');
            }
        };

        _toggleExpandedEventHandlers = function (hide) {
            var menu = this.menu;
            if (hide) {
                $('html').off('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu,  pointerup.outside-accessible-megamenu');

                menu.find('[aria-expanded].' + this.settings.panelClass).off('DOMAttrModified.accessible-megamenu');
            } else {
                $('html').on('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu,  pointerup.outside-accessible-megamenu', $.proxy(_clickOutsideHandler, this));

                /* Narrator in Windows 8 automatically toggles the aria-expanded property on double tap or click.
                   To respond to the change to collapse the panel, we must add a listener for a DOMAttrModified event. */
                menu.find('[aria-expanded=true].' + this.settings.panelClass).on('DOMAttrModified.accessible-megamenu', $.proxy(_DOMAttrModifiedHandler, this));
            }
        };

        /* public attributes and methods ------------------------- */
        return {
            constructor: AccessibleMegaMenu,

            /**
             * @lends jQuery.fn.accessibleMegaMenu
             * @desc Initializes an instance of the accessibleMegaMenu plugins
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            init: function () {
                var settings = this.settings,
                    nav = $(this.element),
                    menu = nav.children().first(),
                    topnavitems = menu.children();
                this.start(settings, nav, menu, topnavitems);
            },

            start: function(settings, nav, menu, topnavitems) {
                var that = this;
                this.settings = settings;
                this.menu = menu;
                this.topnavitems = topnavitems;

                nav.attr("role", "navigation");
                menu.addClass(settings.menuClass);
                topnavitems.each(function (i, topnavitem) {
                    var topnavitemlink, topnavitempanel;
                    topnavitem = $(topnavitem);
                    topnavitem.addClass(settings.topNavItemClass);
                    topnavitemlink = topnavitem.find(":tabbable:first");
                    topnavitempanel = topnavitem.children(":not(:tabbable):last");
                    _addUniqueId.call(that, topnavitemlink);
                    if (topnavitempanel.length) {
                        _addUniqueId.call(that, topnavitempanel);
                        topnavitemlink.attr({
                            "aria-haspopup": true,
                            "aria-controls": topnavitempanel.attr("id"),
                            "aria-expanded": false
                        });

                        topnavitempanel.attr({
                            "role": "group",
                            "aria-expanded": false,
                            "aria-hidden": true
                        })
                            .addClass(settings.panelClass)
                            .not("[aria-labelledby]")
                            .attr("aria-labelledby", topnavitemlink.attr("id"));
                    }
                });

                this.panels = menu.find("." + settings.panelClass);

                menu.on("focusin.accessible-megamenu", ":focusable, ." + settings.panelClass, $.proxy(_focusInHandler, this))
                    .on("focusout.accessible-megamenu", ":focusable, ." + settings.panelClass, $.proxy(_focusOutHandler, this))
                    .on("keydown.accessible-megamenu", $.proxy(_keyDownHandler, this))
                    .on("mouseover.accessible-megamenu", $.proxy(_mouseOverHandler, this))
                    .on("mouseout.accessible-megamenu", $.proxy(_mouseOutHandler, this))
                    .on("mousedown.accessible-megamenu", $.proxy(_mouseDownHandler, this));

                if (isTouch) {
                    menu.on("touchstart.accessible-megamenu",  $.proxy(_clickHandler, this));
                }

                menu.find("hr").attr("role", "separator");

                if ($(document.activeElement).closest(menu).length) {
                  $(document.activeElement).trigger("focusin.accessible-megamenu");
                }
            },

            /**
             * @desc Get default values
             * @example $(selector).accessibleMegaMenu("getDefaults");
             * @return {object}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            getDefaults: function () {
                return this._defaults;
            },

            /**
             * @desc Get any option set to plugin using its name (as string)
             * @example $(selector).accessibleMegaMenu("getOption", some_option);
             * @param {string} opt
             * @return {string}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            getOption: function (opt) {
                return this.settings[opt];
            },

            /**
             * @desc Get all options
             * @example $(selector).accessibleMegaMenu("getAllOptions");
             * @return {object}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            getAllOptions: function () {
                return this.settings;
            },

            /**
             * @desc Set option
             * @example $(selector).accessibleMegaMenu("setOption", "option_name",  "option_value",  reinitialize);
             * @param {string} opt - Option name
             * @param {string} val - Option value
             * @param {boolean} [reinitialize] - boolean to re-initialize the menu.
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            setOption: function (opt, value, reinitialize) {
                this.settings[opt] = value;
                if (reinitialize) {
                    this.init();
                }
            }
        };
    }());

    /* lightweight plugin wrapper around the constructor,
       to prevent against multiple instantiations */

    /**
     * @class accessibleMegaMenu
     * @memberOf jQuery.fn
     * @classdesc Implements an accessible mega menu as a jQuery plugin.
     * <p>The mega-menu It is modeled after the mega menu on {@link http://adobe.com|adobe.com} but has been simplified for use by others. A brief description of the interaction design choices can be found in a blog post at {@link http://blogs.adobe.com/accessibility/2013/05/adobe-com.html|Mega menu accessibility on adobe.com}.</p>
     * <h3>Keyboard Accessibility</h3>
     * <p>The accessible mega menu supports keyboard interaction modeled after the behavior described in the {@link http://www.w3.org/TR/wai-aria-practices/#menu|WAI-ARIA Menu or Menu bar (widget) design pattern}, however we also try to respect users' general expectations for the behavior of links in a global navigation. To this end, the accessible mega menu implementation permits tab focus on each of the six top-level menu items. When one of the menu items has focus, pressing the Enter key, Spacebar or Down arrow will open the submenu panel, and pressing the Left or Right arrow key will shift focus to the adjacent menu item. Links within the submenu panels are included in the tab order when the panel is open. They can also be navigated with the arrow keys or by typing the first character in the link name, which speeds up keyboard navigation considerably. Pressing the Escape key closes the submenu and restores focus to the parent menu item.</p>
     * <h3>Screen Reader Accessibility</h3>
     * <p>The accessible mega menu models its use of WAI-ARIA Roles, States, and Properties after those described in the {@link http://www.w3.org/TR/wai-aria-practices/#menu|WAI-ARIA Menu or Menu bar (widget) design pattern} with some notable exceptions, so that it behaves better with screen reader user expectations for global navigation. We don't use <code class="prettyprint prettyprinted" style=""><span class="pln">role</span><span class="pun">=</span><span class="str">"menu"</span></code> for the menu container and <code class="prettyprint prettyprinted" style=""><span class="pln">role</span><span class="pun">=</span><span class="str">"menuitem"</span></code> for each of the links therein, because if we do, assistive technology will no longer interpret the links as links, but instead, as menu items, and the links in our global navigation will no longer show up when a screen reader user executes a shortcut command to bring up a list of links in the page.</p>
     * @example <h4>HTML</h4><hr/>
&lt;nav&gt;
    &lt;ul class=&quot;nav-menu&quot;&gt;
        &lt;li class=&quot;nav-item&quot;&gt;
            &lt;a href=&quot;?movie&quot;&gt;Movies&lt;/a&gt;
            &lt;div class=&quot;sub-nav&quot;&gt;
                &lt;ul class=&quot;sub-nav-group&quot;&gt;
                    &lt;li&gt;&lt;a href=&quot;?movie&amp;genre=0&quot;&gt;Action &amp;amp; Adventure&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&lt;a href=&quot;?movie&amp;genre=2&quot;&gt;Children &amp;amp; Family&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&amp;#8230;&lt;/li&gt;
                &lt;/ul&gt;
                &lt;ul class=&quot;sub-nav-group&quot;&gt;
                    &lt;li&gt;&lt;a href=&quot;?movie&amp;genre=7&quot;&gt;Dramas&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&lt;a href=&quot;?movie&amp;genre=9&quot;&gt;Foreign&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&amp;#8230;&lt;/li&gt;
                &lt;/ul&gt;
                &lt;ul class=&quot;sub-nav-group&quot;&gt;
                    &lt;li&gt;&lt;a href=&quot;?movie&amp;genre=14&quot;&gt;Musicals&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&lt;a href=&quot;?movie&amp;genre=15&quot;&gt;Romance&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&amp;#8230;&lt;/li&gt;
                &lt;/ul&gt;
            &lt;/div&gt;
        &lt;/li&gt;
        &lt;li class=&quot;nav-item&quot;&gt;
            &lt;a href=&quot;?tv&quot;&gt;TV Shows&lt;/a&gt;
            &lt;div class=&quot;sub-nav&quot;&gt;
                &lt;ul class=&quot;sub-nav-group&quot;&gt;
                    &lt;li&gt;&lt;a href=&quot;?tv&amp;genre=20&quot;&gt;Classic TV&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&lt;a href=&quot;?tv&amp;genre=21&quot;&gt;Crime TV&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&amp;#8230;&lt;/li&gt;
                &lt;/ul&gt;
                &lt;ul class=&quot;sub-nav-group&quot;&gt;
                    &lt;li&gt;&lt;a href=&quot;?tv&amp;genre=27&quot;&gt;Reality TV&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&lt;a href=&quot;?tv&amp;genre=30&quot;&gt;TV Action&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&amp;#8230;&lt;/li&gt;
                &lt;/ul&gt;
                &lt;ul class=&quot;sub-nav-group&quot;&gt;
                    &lt;li&gt;&lt;a href=&quot;?tv&amp;genre=33&quot;&gt;TV Dramas&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&lt;a href=&quot;?tv&amp;genre=34&quot;&gt;TV Horror&lt;/a&gt;&lt;/li&gt;
                    &lt;li&gt;&amp;#8230;&lt;/li&gt;
                &lt;/ul&gt;
            &lt;/div&gt;
        &lt;/li&gt;
    &lt;/ul&gt;
&lt;/nav&gt;
     * @example <h4>CSS</h4><hr/>
&#47;* Rudimentary mega menu CSS for demonstration *&#47;

&#47;* mega menu list *&#47;
.nav-menu {
    display: block;
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 15;
}

&#47;* a top level navigation item in the mega menu *&#47;
.nav-item {
    list-style: none;
    display: inline-block;
    padding: 0;
    margin: 0;
}

&#47;* first descendant link within a top level navigation item *&#47;
.nav-item &gt; a {
    position: relative;
    display: inline-block;
    padding: 0.5em 1em;
    margin: 0 0 -1px 0;
    border: 1px solid transparent;
}

&#47;* focus/open states of first descendant link within a top level
   navigation item *&#47;
.nav-item &gt; a:focus,
.nav-item &gt; a.open {
    border: 1px solid #dedede;
}

&#47;* open state of first descendant link within a top level
   navigation item *&#47;
.nav-item &gt; a.open {
    background-color: #fff;
    border-bottom: none;
    z-index: 1;
}

&#47;* sub-navigation panel *&#47;
.sub-nav {
    position: absolute;
    display: none;
    top: 2.2em;
    margin-top: -1px;
    padding: 0.5em 1em;
    border: 1px solid #dedede;
    background-color: #fff;
}

&#47;* sub-navigation panel open state *&#47;
.sub-nav.open {
    display: block;
}

&#47;* list of items within sub-navigation panel *&#47;
.sub-nav ul {
    display: inline-block;
    vertical-align: top;
    margin: 0 1em 0 0;
    padding: 0;
}

&#47;* list item within sub-navigation panel *&#47;
.sub-nav li {
    display: block;
    list-style-type: none;
    margin: 0;
    padding: 0;
}
     * @example <h4>JavaScript</h4><hr/>
&lt;!-- include jquery --&gt;
&lt;script src=&quot;http://code.jquery.com/jquery-1.10.1.min.js&quot;&gt;&lt;/script&gt;

&lt;!-- include the jquery-accessibleMegaMenu plugin script --&gt;
&lt;script src=&quot;js/jquery-accessibleMegaMenu.js&quot;&gt;&lt;/script&gt;

&lt;!-- initialize a selector as an accessibleMegaMenu --&gt;
&lt;script&gt;
    $(&quot;nav:first&quot;).accessibleMegaMenu({
        &#47;* prefix for generated unique id attributes, which are required to indicate aria-owns, aria-controls and aria-labelledby *&#47;
        uuidPrefix: &quot;accessible-megamenu&quot;,

        &#47;* css class used to define the megamenu styling *&#47;
        menuClass: &quot;nav-menu&quot;,

        &#47;* css class for a top-level navigation item in the megamenu *&#47;
        topNavItemClass: &quot;nav-item&quot;,

        &#47;* css class for a megamenu panel *&#47;
        panelClass: &quot;sub-nav&quot;,

        &#47;* css class for a group of items within a megamenu panel *&#47;
        panelGroupClass: &quot;sub-nav-group&quot;,

        &#47;* css class for the hover state *&#47;
        hoverClass: &quot;hover&quot;,

        &#47;* css class for the focus state *&#47;
        focusClass: &quot;focus&quot;,

        &#47;* css class for the open state *&#47;
        openClass: &quot;open&quot;
    });
&lt;/script&gt;
     * @param {object} [options] Mega Menu options
     * @param {string} [options.uuidPrefix=accessible-megamenu] - Prefix for generated unique id attributes, which are required to indicate aria-owns, aria-controls and aria-labelledby
     * @param {string} [options.menuClass=accessible-megamenu] - CSS class used to define the megamenu styling
     * @param {string} [options.topNavItemClass=accessible-megamenu-top-nav-item] - CSS class for a top-level navigation item in the megamenu
     * @param {string} [options.panelClass=accessible-megamenu-panel] - CSS class for a megamenu panel
     * @param {string} [options.panelGroupClass=accessible-megamenu-panel-group] - CSS class for a group of items within a megamenu panel
     * @param {string} [options.hoverClass=hover] - CSS class for the hover state
     * @param {string} [options.focusClass=focus] - CSS class for the focus state
     * @param {string} [options.openClass=open] - CSS class for the open state
     */
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new $.fn[pluginName].AccessibleMegaMenu(this, options));
            }
        });
    };

    $.fn[pluginName].AccessibleMegaMenu = AccessibleMegaMenu;

    /* :focusable and :tabbable selectors from
       https://raw.github.com/jquery/jquery-ui/master/ui/jquery.ui.core.js */

    /**
     * @private
     */
    function visible(element) {
        return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
            return $.css(this, "visibility") === "hidden";
        }).length;
    }

    /**
     * @private
     */
    function focusable(element, isTabIndexNotNaN) {
        var map, mapName, img,
            nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled :
                "a" === nodeName ?
                        element.href || isTabIndexNotNaN :
                        isTabIndexNotNaN) &&
                            // the element and all of its ancestors must be visible
                            visible(element);
    }

    $.extend($.expr[":"], {
        data: $.expr.createPseudo ? $.expr.createPseudo(function (dataName) {
            return function (elem) {
                return !!$.data(elem, dataName);
            };
        }) : // support: jQuery <1.8
                function (elem, i, match) {
                    return !!$.data(elem, match[3]);
                },

        focusable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },

        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex"),
                isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });
}(jQuery, window, document));
;
var fontSize = 100;
jQuery(document).ready(function(){
		//alert("ok");
			if(_getCookie("fontSize") != null){
				var fontSize = _getCookie("fontSize");
			}else{
				var fontSize = 100;
			}
			jQuery("#fontSize").css("font-size",fontSize + "%");
});
function _getCookie (name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {
			return _getCookieVal (j);
		}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) 
			break;
	}
	return null;
}
function _deleteCookie (name,path,domain) {
	if (_getCookie(name)) {
		document.cookie = name + "=" +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		"; expires=Thu, 01-Jan-70 00:00:01 GMT";
	}
}
function _setCookie (name,value,expires,path,domain,secure) {
	var vurl = true;
	if(path != '' && path != undefined){
		vurl = validUrl(path);
	}
	if(jQuery.type(name) == "string" &&  vurl){
		document.cookie = name + "=" + escape (value) +
		((expires) ? "; expires=" + expires.toGMTString() : "") +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");
	}
}
function _getCookieVal (offset) {
	var endstr = document.cookie.indexOf (";", offset);
	if (endstr == -1) { endstr = document.cookie.length; }
	return unescape(document.cookie.substring(offset, endstr));
}
/*********Font size resize**********/
function set_font_size(fontType){
	if(fontType == "increase"){
			 if(fontSize < 130){
			  fontSize = parseInt(fontSize) + 15;
			 }
		  }else if(fontType == "decrease"){
			  if(fontSize > 70){
				fontSize = parseInt(fontSize) - 15;
			  }
		  }else{
			  fontSize = 100;
		  }
	_setCookie("fontSize",fontSize);
	jQuery("#fontSize").css("font-size",fontSize + "%");
	jQuery(".gallery-right-container").css("font-size",fontSize + "%");
	jQuery(".goi-wrapper").css("font-size",fontSize + "%");
} 
;

// date 24-2-2016   code for add class in mega menu  written by waliullah 
/*
( function($) {
$(document).ready(function(){
	//alert('hello');
if($('.nav-menu li ul[class="sub-nav-group"] li ul[class="sub-nav-group"] li').find('li')){
 alert('hello');	
}
			
});

} ) ( jQuery );
*/
// code end
jQuery(document).ready(function(){
	jQuery("#edit-search-block-form--2").attr("placeholder", "Search - Keyword, Phrase");
	jQuery(".gtranslate select").attr("id","gtranslate");			   
	jQuery("#gtranslate").before('<label class="notdisplay" for="gtranslate">Google Translate</label>');
	//contrast
	if(getCookie('contrast') == 0 || getCookie('contrast') == null){
	jQuery(".light").hide();
	jQuery(".dark").show();
    }else{
	jQuery(".light").show();
	jQuery(".dark").hide();
	
    }
    jQuery(".search-drop").css("display", "none");
    jQuery(".common-right ul li ul").css("visibility", "hidden");

// Fix Header

	var num = 36; //number of pixels before modifying styles
    jQuery(window).bind('scroll', function () {
        if (jQuery(window).scrollTop() > num) {
        jQuery('.fixed-wrapper').addClass('sticky');
		
    
        } else {
        jQuery('.fixed-wrapper').removeClass('sticky');
    
        }
    });		
			
		
	
// Mobile Nav	
jQuery('.sub-menu').append('<i class="fa fa-caret-right"></i>');
	jQuery('.toggle-nav-bar').click(function(){	
	jQuery('#nav').slideToggle();
	//jQuery('#nav li').removeClass('open');
    
	/*jQuery("#nav li").click(function(){
		jQuery("#nav li").removeClass('open');
		jQuery(this).addClass('open');
	}); */
	
		jQuery("#nav li").hover(
		function() {
		jQuery( this  ).addClass( "open" );
		}, function() {
		jQuery( this ).removeClass( "open" );
		}
		);
		
	});


//Skip Content
jQuery('a[href^="#skipCont"]').click(function() {
jQuery('html,body').animate({ scrollTop: jQuery(this.hash).offset().top}, 500);
//return false;
//e.preventDefault();

});

// Toggle Search



    jQuery("#toggleSearch").click(function(e) {
        jQuery(".search-drop").toggle();
        e.stopPropagation();
    });

    jQuery(document).click(function(e) {
        if (!jQuery(e.target).is('.search-drop, .search-drop *')) {
            jQuery(".search-drop").hide();
        }
    });


});


jQuery(document).ready(function(){
	
	jQuery("#main-menu div > ul" ).attr("id","nav");

	dropdown1('nav','hover',10);

	dropdown1("header-nav", "hover", 20);

});


jQuery(document).ready(function(){
	
	jQuery('.lang_select').change(function() {
          var url = jQuery(this).val(); // get selected value
          if (url) { // require a URL
              window.location = url; // redirect
          }
          return false;
      });
	

});


//Drop down menu for Keyboard accessing

function dropdown1(dropdownId, hoverClass, mouseOffDelay) { 
	if(dropdown = document.getElementById(dropdownId)) {
		var listItems = dropdown.getElementsByTagName('li');
		for(var i = 0; i < listItems.length; i++) {
			listItems[i].onmouseover = function() { this.className = addClass(this); }
			listItems[i].onmouseout = function() {
				var that = this;
				setTimeout(function() { that.className = removeClass(that); }, mouseOffDelay);
				this.className = that.className;
			}
			var anchor = listItems[i].getElementsByTagName('a');
			anchor = anchor[0];
			anchor.onfocus = function() { tabOn(this.parentNode); }
			anchor.onblur = function() { tabOff(this.parentNode); }
		}
	}
	
	function tabOn(li) {
		if(li.nodeName == 'LI') {
			li.className = addClass(li);
			tabOn(li.parentNode.parentNode);
		}
	}
	
	function tabOff(li) {
		if(li.nodeName == 'LI') {
			li.className = removeClass(li);
			tabOff(li.parentNode.parentNode);
		}
	}
	
	function addClass(li) { return li.className + ' ' + hoverClass; }
	function removeClass(li) { return li.className.replace(hoverClass, ""); }
}

//<![CDATA[
jQuery(function ()
{
jQuery('table').wrap('<div class="scroll-table1"></div>');
jQuery(".scroll-table1").before( "<div class='guide-text'>Swipe to view <i class='fa fa-long-arrow-right'></i></div>" );

});
//]]>


jQuery(document).ready(function(){
	var params = new Array();
	var count = 0;
	jQuery('table.views-table thead tr th').each(function () {
		params[count] = jQuery(this).text();
		count++;	
	});
	jQuery('table.views-table tbody tr').each(function () {
		for(var j = 1; j <= count; j++){
			jQuery('td:nth-child('+j+')', this).attr("data-label",params[j-1]);
		}
	});
});


function burstCache() {
var url = window.location.href;
if(base_url != url && base_url+"/" != url){
if (!navigator.onLine) {
document.body.innerHTML = "Loading...";
window.location = "/";
}
}
}
window.onload = burstCache;






;
//Style Sheet Switcher version 1.1 Oct 10th, 2006

//Author: Dynamic Drive: http://www.dynamicdrive.com
//Usage terms: http://www.dynamicdrive.com/notice.htm

//Unofficial Update to fix Safari 5.1 glitch re: alternate stylesheets or the disabled property in regards to them
// See: http://www.dynamicdrive.com/forums/showthread.php?p=259199 for more info

var manual_or_random="manual" //"manual" or "random"
var randomsetting="3 days" //"eachtime", "sessiononly", or "x days (replace x with desired integer)". Only applicable if mode is random.

//////No need to edit beyond here//////////////

function getCookie(Name) { 
	var re=new RegExp(Name+"=[^;]+", "i"); //construct RE to search for target name/value pair
	if (document.cookie.match(re)) //if cookie found
		return document.cookie.match(re)[0].split("=")[1] //return its value
	return null
}

function setCookie(name, value, days) {
	var expireDate = new Date()
	//set "expstring" to either future or past date, to set or delete cookie, respectively
	var expstring=(typeof days!="undefined")? expireDate.setDate(expireDate.getDate()+parseInt(days)) : expireDate.setDate(expireDate.getDate()-5)
	document.cookie = name+"="+value+"; expires="+expireDate.toGMTString()+"; path=/";
}
 
function deleteCookie(name){
	setCookie(name, "moot")
}

function setStylesheet(title, randomize){ //Main stylesheet switcher function. Second parameter if defined causes a random alternate stylesheet (including none) to be enabled
	var i, cacheobj, altsheets=[""];
	if(setStylesheet.chosen)
	try{
		document.getElementsByTagName('head')[0].removeChild(setStylesheet.chosen);
	}catch(e){}
	for(i=0; (cacheobj=document.getElementsByTagName("link")[i]); i++) {
		if(cacheobj.getAttribute("rel").toLowerCase()=="alternate stylesheet" && cacheobj.getAttribute("title")) { //if this is an alternate stylesheet with title
		cacheobj.disabled = true
		altsheets.push(cacheobj) //store reference to alt stylesheets inside array
			if(cacheobj.getAttribute("title") == title){ //enable alternate stylesheet with title that matches parameter
				cacheobj.disabled = false //enable chosen style sheet
				setStylesheet.chosen = document.createElement('link');//cloneNode(false);
				setStylesheet.chosen.rel = 'stylesheet';
				setStylesheet.chosen.type = 'text/css';
				if(cacheobj.media)
					setStylesheet.chosen.media = cacheobj.media;
				setStylesheet.chosen.href = cacheobj.href;
				document.getElementsByTagName('head')[0].appendChild(setStylesheet.chosen);
			}
		}
	}
	if (typeof randomize!="undefined"){ //if second paramter is defined, randomly enable an alt style sheet (includes non)
		var randomnumber=Math.floor(Math.random()*altsheets.length)
		altsheets[randomnumber].disabled=false
	}
	return (typeof randomize!="undefined" && altsheets[randomnumber]!="")? altsheets[randomnumber].getAttribute("title") : "" //if in "random" mode, return "title" of randomly enabled alt stylesheet
}

function chooseStyle(styletitle, days){ //Interface function to switch style sheets plus save "title" attr of selected stylesheet to cookie
	if (document.getElementById){
		setStylesheet(styletitle)
		setCookie("mysheet", styletitle, days)
	}
}

function indicateSelected(element){ //Optional function that shows which style sheet is currently selected within group of radio buttons or select menu
	if (selectedtitle!=null && (element.type==undefined || element.type=="select-one")){ //if element is a radio button or select menu
		var element=(element.type=="select-one") ? element.options : element
		for (var i=0; i<element.length; i++){
			if (element[i].value==selectedtitle){ //if match found between form element value and cookie value
				if (element[i].tagName=="OPTION") //if this is a select menu
					element[i].selected=true
				else{ //else if it's a radio button
					element[i].checked=true
				}
			break
			}
		}
	}
}
if (manual_or_random=="manual"){ //IF MANUAL MODE
	var selectedtitle=getCookie("mysheet")
	if (document.getElementById && selectedtitle!=null) //load user chosen style sheet from cookie if there is one stored
		setStylesheet(selectedtitle)
}else if (manual_or_random=="random"){ //IF AUTO RANDOM MODE
	if (randomsetting=="eachtime")
		setStylesheet("", "random")
	else if (randomsetting=="sessiononly"){ //if "sessiononly" setting
		if (getCookie("mysheet_s")==null) //if "mysheet_s" session cookie is empty
			document.cookie="mysheet_s="+setStylesheet("", "random")+"; path=/" //activate random alt stylesheet while remembering its "title" value
		else
			setStylesheet(getCookie("mysheet_s")) //just activate random alt stylesheet stored in cookie
	}
	else if (randomsetting.search(/^[1-9]+ days/i)!=-1){ //if "x days" setting
		if (getCookie("mysheet_r")==null || parseInt(getCookie("mysheet_r_days"))!=parseInt(randomsetting)){ //if "mysheet_r" cookie is empty or admin has changed number of days to persist in "x days" variable
			setCookie("mysheet_r", setStylesheet("", "random"), parseInt(randomsetting)) //activate random alt stylesheet while remembering its "title" value
			setCookie("mysheet_r_days", randomsetting, parseInt(randomsetting)) //Also remember the number of days to persist per the "x days" variable
		}
		else
		setStylesheet(getCookie("mysheet_r")) //just activate random alt stylesheet stored in cookie
	} 
}

jQuery(document).ready(function(){		
	jQuery('#menu-item-278 > a, #menu-item-194 > a, #menu-item-192 >  a').click(function(){return false;});		
	jQuery('.dark').click(function(){	
		var thirtyDays = 1000*60*60*24*30;
		var expireDate = new Date((new Date()).valueOf() + thirtyDays);		
		document.cookie = 'contrast' +"="+ 1 +"; expires="+expireDate.toGMTString()+"; path=/";
		document.cookie="username=John Doe";
		jQuery(".light").show();
		jQuery(".dark").hide();
		jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="'+ base_url +'/'+ modulePath +'/assets/css/change.css">');
		jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="'+ base_url +'/'+ themePath +'/css/site-change.css">');
		jQuery(".national_emblem").attr("src",base_url+"/"+modulePath+"/assets/images/emblem-light.png");// high contrast
		
		jQuery(".ico-skip img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip-y.png");
		jQuery(".ico-skip img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip-light.png");
		
		//jQuery(".ico-social img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social-y.png");
		//jQuery(".ico-social img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social-light.png");
		
		jQuery(".ico-site-search img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search-y.png");
		jQuery(".ico-site-search img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search-light.png");
		
		jQuery(".ico-sitemap img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap-y.png");
		jQuery(".ico-sitemap img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap-light.png");
		
		jQuery(".ico-accessibility img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility-light.png");
		jQuery(".ico-accessibility img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility-light.png");
		
		jQuery(".sw-logo img").attr("src",base_url+"/"+modulePath+"/assets/images/swach-bharat-y.png");
		
	});
	jQuery('.light').click(function(){	
		var thirtyDays = 1000*60*60*24*30;
		var expireDate = new Date((new Date()).valueOf() + thirtyDays);		
		document.cookie = 'contrast' +"="+ 0 +"; expires="+expireDate.toGMTString()+"; path=/";		
		jQuery(".light").hide();
		jQuery(".dark").show();		
		jQuery("[href*='change.css']").remove();
		jQuery(".national_emblem").attr("src",base_url+"/"+modulePath+"/assets/images/emblem-dark.png"); //normal
		
		jQuery(".ico-skip img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip.png");
		jQuery(".ico-skip img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip-light.png");
		
		//jQuery(".ico-social img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social.png");
		//jQuery(".ico-social img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social-light.png");
		
		jQuery(".ico-site-search img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search.png");
		jQuery(".ico-site-search img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search-light.png");
		
		jQuery(".ico-sitemap img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap.png");
		jQuery(".ico-sitemap img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap-light.png");
		
		jQuery(".ico-accessibility img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility.png");
		jQuery(".ico-accessibility img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility-light.png");
		
		jQuery(".sw-logo img").attr("src",base_url+"/"+modulePath+"/assets/images/swach-bharat.png");

	});
	if(getCookie('contrast') == "1") {
		jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="'+ base_url +'/'+ modulePath +'/assets/css/change.css">');
		jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="'+ base_url +'/'+ themePath +'/css/site-change.css">');
		jQuery(".national_emblem").attr("src",base_url+"/"+modulePath+"/assets/images/emblem-light.png");// high contrast
		
		jQuery(".ico-skip img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip-y.png");
		jQuery(".ico-skip img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip-light.png");
		
		//jQuery(".ico-social img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social-y.png");
		//jQuery(".ico-social img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social-light.png");
		
		jQuery(".ico-site-search img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search-y.png");
		jQuery(".ico-site-search img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search-light.png");
		
		jQuery(".ico-sitemap img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap-y.png");
		jQuery(".ico-sitemap img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap-light.png");
		
		jQuery(".ico-accessibility img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility-light.png");
		jQuery(".ico-accessibility img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility-light.png");
		
		jQuery(".sw-logo img").attr("src",base_url+"/"+modulePath+"/assets/images/swach-bharat-y.png");
	}
	if(getCookie('contrast') == "0" ) {
		jQuery("[href*='/css/change.css']").remove();
		jQuery(".national_emblem").attr("src",base_url+"/"+modulePath+"/assets/images/emblem-dark.png"); //normal
		
		jQuery(".ico-skip img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip.png");
		jQuery(".ico-skip img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-skip-light.png");
		
		//jQuery(".ico-social img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social.png");
		//jQuery(".ico-social img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-social-light.png");
		
		jQuery(".ico-site-search img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search.png");
		jQuery(".ico-site-search img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-site-search-light.png");
		
		jQuery(".ico-sitemap img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap.png");
		jQuery(".ico-sitemap img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-sitemap-light.png");
		
		jQuery(".ico-accessibility img.top").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility.png");
		jQuery(".ico-accessibility img.bottom").attr("src",base_url+"/"+modulePath+"/assets/images/ico-accessibility-light.png");
		
		jQuery(".sw-logo img").attr("src",base_url+"/"+modulePath+"/assets/images/swach-bharat.png");
		
	}
});
;
var se_controls = new Object(); 
se_controls.timerId;
function loadResultControls(settings){ 
	se_controls.searchServer = settings["searchServer"];
	se_controls.q = trim(settings["q"]);
	se_controls.tId = settings["textBoxId"];
	if (se_controls.startDate)
		se_controls.startDate =  trim(settings["startDate"]);
	else
		se_controls.startDate = "";

	if (se_controls.endDate)
		se_controls.endDate =   trim(settings["endDate"]);
	else
		se_controls.endDate = "";

	if (se_controls["count"] != undefined)
		se_controls.count =  trim(settings["count"]);
	else
		se_controls.count = "10";

	if (settings["fileType"] != undefined)
		se_controls.fileType =  trim(settings["fileType"]);
	else
		se_controls.fileType = "ALL";

	if (settings["lang"] != undefined)
		se_controls.lang =  trim(settings["lang"]);
	else
		se_controls.lang = "en";

	if (settings["site"] != undefined)
		se_controls.site =  trim(settings["site"]);
	else
		se_controls.site = "";

	if (settings["like_path"] != undefined)
		se_controls.like_path =  trim(settings["like_path"]);
	else
		se_controls.like_path = se_controls.searchServer+ "/content/images/like.png"

	if (settings["liked_path"] != undefined)
		se_controls.liked_path =  trim(settings["liked_path"]);
	else
		se_controls.liked_path = se_controls.searchServer+ "/content/images/liked.png"

	if (settings["DisLike_path"] != undefined)
		se_controls.disLike_path =  trim(settings["DisLike_path"]);
	else
		se_controls.disLike_path = se_controls.searchServer+ "/content/images/dislike.png"

	if (settings["liked_path"] != undefined)
		se_controls.disLiked_path =  trim(settings["DisLiked_path"]);
	else
		se_controls.disLiked_path = se_controls.searchServer+ "/content/images/disliked.png"

	if (settings["styleSheet"] != undefined)
		se_controls.styleSheet =  trim(settings["styleSheet"]);
	else
		se_controls.styleSheet = "default_JSON_1.0";

	if (settings["window"] != undefined)
		se_controls.window =  trim(settings["window"]);
	else
		se_controls.window = "_blank";
	
	if(settings["resultStartRow"] != undefined)
		se_controls.resultStartRow=settings["resultStartRow"];
	else
		se_controls.resultStartRow=0;
	if(settings["requestTimeOut"] != undefined)
		se_controls.requestTimeOut=Number(settings["requestTimeOut"]);
	else
		se_controls.requestTimeOut=10000;
	
	if(se_controls.q != undefined &&  se_controls.q != "")
	{
		var urlEntry =
			"searchKeyword="+ encodeURIComponent(se_controls.q)
			+ "&currentPage=1&startRow="+se_controls.resultStartRow
			+"&count="+ encodeURIComponent(se_controls.count)
			+ "&startDate="+encodeURIComponent(se_controls.startDate)+"&endDate="+encodeURIComponent(se_controls.endDate)
			+"&fileType="+ encodeURIComponent(se_controls.fileType)
			+"&stylesheet="+encodeURIComponent(se_controls.styleSheet)+"&output=json&lang="+encodeURIComponent(se_controls.lang)+"&type=SAS";

			sendAjaxRequest(urlEntry);
	}
	else
	{
		if(document.getElementById("result_area") != undefined)
	       document.getElementById("result_area").innerHTML ="";
	}
}	



function errorMsg()
{
	if(se_controls.resultDisplay != 2) // If successful Result is not displayed.
	{
		document.getElementById("result_area").innerHTML	= "<div class='internalError'>Request has timed out due to slow response from search server.</div>";
		se_controls.resultDisplay=0; //Error message is displayed
	}
}
function getSearchKeyword(response){
	return response['response']['header']['searchKeyword'];
}

function htmlEncode(value){
	  return htmlEscape(value);
	}
	
function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function getNoResultErrorHTML(response){
	var query = htmlEncode(getSearchKeyword(response));
	var retValue = '<div class="noResultError">' +
	       			'Your search - ' +
                                '<span class="searchKey">' +
                                        query +
                                 '</span>'+
                                 ' did not match any documents.<br/>' +
                                 'Suggestions :' +
                                  '<ul>'+
                                        '<li>  Make sure all words are spelled correctly.</li>'+
                                        '<li>Try different keywords.</li>' +
                                        '<li>Try more general keywords.</li>' +
                                        '<li>Try removing filter option.</li>' +
                                '</ul>' +
			'</div>';
	return retValue;
}

function getInvalidFromDateError(response){
	return "<div class='Error'>"+response['response']['error']['message']+"</div>";
}
function getInvalidToDateError(response){
	return "<div class='Error'>"+response['response']['error']['message']+"</div>";
}
function getInvalidYearError(response){
	return "<div class='Error'>"+response['response']['error']['message']+"</div>";
}
function getInvalidaDateRangeError(response){
	return "<div class='Error'>"+response['response']['error']['message']+"</div>";
}
function getFutureDateError(response){
	return "<div class='Error'>"+response['response']['error']['message']+"</div>";
}
function getInternalError(response){
	return "<div class='Error'>"+response['response']['error']['message']+"</div>";
}


/* Get error message, if any along with formatting. */
function getErrorHTML(response){
	var retValue=""
	var error_message=response['response']['error'];
	if(error_message!=undefined){
		error_id=error_message['id'];
		
		switch(error_id){
			case "noResult":{
				retValue=getNoResultErrorHTML(response);
				break;
			}
			case "invalidFromDate":{
				retValue=getInvalidToDateError(response);
				break;
			}
			case "invalidToDate":{
				retValue=getInvalidYearError(response);
				break;
			}

			case "invalidYear":{
				retValue=getInvalidYearError(response);
				break;
			}
			case "invalidDateRange":{
				retValue=getInvalidaDateRangeError(response);
				break;
			}
			case "futureDate":{
				retValue=getFutureDateError(response);
				break;
			}
			default:{ //internal error
				retValue = getInternalError(response);
				break;

			}
		}//switch ends
	} 
	
	return retValue;
}

function sendSpellCheckedQuery(response){
	// create a url for sending all paramtes found in response header 
	//except 
	// 1. searchKeyword = should be suggested spelling
	// 2. start = 0
	var suggestion = "";
	if(response['response']['result'] != undefined && response['response']['result'] ['spellcheck'] != undefined &&
		response['response']['result'] ['spellcheck']['suggestion'] != undefined) 
		{
		
	
		urlParam=response['response']['result'] ['spellcheck']['suggestion-link'];
		//urlParam=getExtraParamOfHeader(response,urlParam);
		sendAjaxRequest(urlParam);
		}
}

function getSpellingSuggestionHTML(response) {
	var spellCheckSuggestion = "";
	if(response['response']['result'] != undefined &&
		response['response']['result']['spellcheck'] != undefined) {

		var searchKeyword = htmlEncode(getSearchKeyword(response));
		var suggestion = htmlEncode(response['response']['result']['spellcheck']['suggestion']);
		spellCheckSuggestion  = '<div class="spellCheckerMain">' +
						'Showing Result For : ' + searchKeyword + '<br/>' +
						'<div class="spellChecker">' +
							'Did You Mean : ' +
					 		'<a class="spellCheckSuggestion" onclick="sendSpellCheckedQuery(se_controls.current_response)">' +
								suggestion +
							'</a>' +
						'</div>' +
					'</div>';
	}
	return spellCheckSuggestion;
}

function getResultsHTML(response){
	
	var resultHTML="";
		if(response['response']['result']!=undefined &&  response['response']['result']['doc'] != undefined)
		{
			resultHTML = '<div class="resultsBody">';

			for ( var i = 0; i < response['response']['result']['doc'].length; i++) {
				resultHTML += 
				"<div class='resultBody'>" +
				 	"<span class='contentType'>"+ getContentType(response,i)	+ "</span>" +
				 	"<div class='title'>"+getTitle(response,i)+"</div>" +
				 	"<span>"+ getLikeImage(response,i,se_controls.like_path) + "</span>" +
				 	"<span>"+getDisLikeImage(response,i,se_controls.disLike_path)+"</span>" +
				 	"<div class='content'>"+ getSnippet(response,i)+ "</div>" +
				 	"<div>" +
				 		"<span class='url'>"+getURL(response,i)+"</span> " + 
				 	/*	"<span class='docDate'>"+getDate(response,i)+"</span>" +*/
					"</div>" + 
				"</div>";
			}
			resultHTML += '</div>';
		}
	return resultHTML;
}
function getResultSummaryHTML(response){
	var totalResultHTML = "";
	if(response['response']['result'] != undefined){
		var totalResults = getTotalResult(response);
		if(totalResults != 0){
			var resultStart = Number(response['response']['header']['start']);  
			var pageSize = Number(response['response']['header']['count']);
			var resultEnd = totalResults;
			if(resultStart + pageSize < totalResults ){
				resultEnd = resultStart + pageSize;
			}

			if(totalResults <= pageSize){
				//Condition where all results can fit on single page
				// the display in that case should be "Showing 3 result"
				totalResultHTML = '<div class="resultSummary">Showing ' +  totalResults + ' result</div>';
			} else {
				//resultStart counts from 0, make it 1 for display purpose
				resultStart = resultStart + 1;
				totalResultHTML = '<div class="resultSummary">Showing ' + resultStart + ' - ' + resultEnd + ' of Total ' + totalResults + ' results </div>';
			}
		}
	}
	return totalResultHTML;
}

function getPageSummaryHTML(response){

	var pageDetailsHTML = "";	
	if(response['response']['result']!=undefined &&  response['response']['result']['doc'] != undefined) {
		var currentPageNo = getCurrentPageNumber(response);
		var totalPages = getTotalPages(response);
		//TODO:take care of duplicate detection logic and how this will work
		if(totalPages > 1) {
			pageDetailsHTML = "<div class='pageDetails'> Page " + currentPageNo	+ " of " + totalPages +" Pages</div>";
		}
	}
	return pageDetailsHTML;
}

function sendPaginationRequest(response,linkOffset)
{
     urlParam=response['response']['navigation']['pageLink'][linkOffset]['params'];
   // urlParam=getExtraParamOfHeader(response,urlParam);
    sendAjaxRequest(urlParam);
}
function sendNextPaginationRequest(response)
{
   urlParam=getNextPageLink(response);
    //urlParam=getExtraParamOfHeader(response,urlParam);
    sendAjaxRequest(urlParam);

                      
}
function sendPreviousPaginationRequest(response)
{
urlParam=getPreviousPageLink(response);
    //urlParam=getExtraParamOfHeader(response,urlParam);
    sendAjaxRequest(urlParam);
}
function getNavigationHTML(response){
	var navigationHTML = "";
	if(response['response']['navigation']!=undefined  && response['response']['navigation']['pageLink'] != undefined ) {
		var currentPage = getCurrentPageNumber(response);

		navigationHTML='<div class="navigationHTML">';

		// get previous page link
		if (getPreviousPageLink(response)  != "") {
			navigationHTML += '<a onclick="sendPreviousPaginationRequest(se_controls.current_response)" class="previousLink">' 
					+ "Prev" + '</a>';
		}

		// get all other links
		// current page link should have a special class

	
		var first_page = Number(response['response']['navigation']['pageLink'][0]['pageNum']);
	        if(response['response']['navigation'] != undefined && response['response']['navigation']['pageLink'] != undefined) {
			for ( var j = 0; j < response['response']['navigation']['pageLink'].length; j++) {
				var pageNum = response['response']['navigation']['pageLink'][j]['pageNum'];

				if(pageNum == currentPage) {
					navigationHTML += '<span class="currentLink">' + pageNum + '</span>';
				} else {
					navigationHTML += '<a onclick="sendPaginationRequest(se_controls.current_response,'+(pageNum - first_page) + ')" class="navigationLink">'
						+ pageNum + '</a>';
				}
			}
		}
			
		// get next page link	
		if(getNextPageLink(response)!= "") {
			navigationHTML += '<a onclick="sendNextPaginationRequest( se_controls.current_response)" class="nextLink"> Next </a>';
		}
		navigationHTML += "</div>";
	}
	return navigationHTML;
}



function displayResult(response)
{
	/**
		structure of the page
		spelling suggestion if any.
		error-message if any
		result summary
		results
		page summary
		navigation
	 */	
if(se_controls.resultDisplay == 1)// Loading Message is currently displayed
{
		var divHTML = getSpellingSuggestionHTML(response) +
				getErrorHTML(response) +
				getResultSummaryHTML(response)+
				getResultsHTML(response) +
				getPageSummaryHTML(response) +
				getNavigationHTML(response);

			se_controls.resultDisplay=2;//Successful result is displayed.

		//TODO: this should come from configuration
		document.getElementById("result_area").innerHTML = divHTML;
		document.getElementById(se_controls.tId).value =getSearchKeyword(response); 
}
}

function captureFeedback(feedback, redirectLink, i) {
	var like="like"+i;
	var dislike="dislike"+i;
	
	var urlEntry =  se_controls.searchServer + "/userFeedback?feedback="+ feedback + "&" + redirectLink+"&site="+se_controls.site;
		
	if (feedback == '1') {
		document.getElementById(like).src = se_controls.liked_path;
		document.getElementById(dislike).src = se_controls.disLike_path;

	} else {

		document.getElementById(dislike).src = se_controls.disLiked_path;
		document.getElementById(like).src = se_controls.like_path;
	}
	getJSONP(urlEntry, function(response){	
								});
}

function getSnippet(result,i)
{
return (result['response']['result']['doc'][i]['snnipetOne']);
}

function getURL(result,i)
{
return (result['response']['result']['doc'][i]['url']);
}
function getDate(result,i)
{
return (result['response']['result']['doc'][i]['date']);
}
function getNextPageLink(result)
{
if(result['response']['navigation'] != undefined && result['response']['navigation']['nextPageLink'] != undefined)
	return (result['response']['navigation']['nextPageLink']);
else 
	return "";
}

function getPreviousPageLink(result)
{
if( result['response']['navigation'] != undefined &&result['response']['navigation']['previousPageLink'] != undefined)
	return (result['response']['navigation']['previousPageLink']);
else 
	return "";
}
function getTitle(result,i)
{
return ("<a href=\" "+se_controls.searchServer+"/ClickedLink?"	+ result['response']['result']['doc'][i]['resultClickData'] + "\" target=\""+se_controls.window+"\">" + 
					result['response']['result']['doc'][i]['title']+ "</a>");
}
function getContentType(result,i)
{
	return (result['response']['result']['doc'][i]['contentType']);
}
function getLikeImage(result,i,imagePath)
{
likeUrl = result['response']['result']['doc'][i]['feedbackLike'];
return ("<img title='Recommend this result'  class='feedbackImg' src='"
					+imagePath + "' onclick=\"captureFeedback('1','"
					+ likeUrl
					+ "','"
					+ i
					+ "');\" id='like"+i+"'></img>");
}

function getDisLikeImage(result,i,imagePath)
{
disLikeUrl = result['response']['result']['doc'][i]['feedbackDislike'];
return ("<img class='feedbackImg'  src='" 
					+imagePath+ "'onclick=\"captureFeedback('-1','"
					+ disLikeUrl + "','"
					+ i	+ "');\" id='dislike"+i+"' title='Downgrade this result'></img>");
}
function getTotalPages(result)
{
	if(result['response']['result']['totalPages'] != undefined)
	   return (result['response']['result']['totalPages']);
	else
		return "";
}
function getTotalResult(result)
{
if(result['response']['result']['totalResult'] != undefined)
	return (result['response']['result']['totalResult']);
else
	return "0";
}


function getCurrentPageNumber(result)
{
	
    if(result['response']['result']['currentPage'] != undefined)
		return (Number(result['response']['result']['currentPage']) + 1);
	else 
		return "";
}

/*function getErrorMessage()
{
if(result['response']['error']['message'] != undefined)
  return (result['response']['error']['message'])
else
	return "";
}*/
/*
se_controls.resultDisplay 

When message is loading at such a time se_controls.resultDisplay=1; , timer starts and control transfer towards displayResult(response); .
When result display successfully ,se_controls.resultDisplay=2 ; 
When time out by specified duration ,check for se_controls.resultDisplay is not 2 ,then load error message.

se_controls.resultDisplay = 1 Loading Message Displayed
se_controls.resultDisplay = 2 Successful Result Displayed
se_controls.resultDisplay = 0 Error Message Displayed
*/

function sendAjaxRequest(urlEntry)
{
	
	if( document.getElementById("result_area") != null && se_controls.q != "")
  		document.getElementById("result_area").innerHTML = "Loading...";
	var urlEntry = se_controls.searchServer+ "/Search?" + urlEntry+"&site="+se_controls.site+"&callback=?";
	 se_controls.resultDisplay=1;	//Loading Message is displayed.
	 se_controls.timerId=setTimeout("errorMsg();",se_controls.requestTimeOut);
	getJSONP(urlEntry, function(response){
			se_controls.current_response=response;
			displayResult(response);
			clearTimeout(se_controls.timerId);
		}
	);
};
var se_controls = new Object();
function loadSuggestionControls(settings)
{
se_controls.searchServer=settings["searchServer"];
se_controls.tId=settings["textBoxId"];
se_controls.lang=settings["lang"];
se_controls.callBackFun=settings["callBackFunction"];
se_controls.site=settings["site"];
se_controls.request_count=0;
se_controls.cachedResponse;
se_controls.openFlag=0;

if (settings["siteSpcificSuggestion"] != undefined)
	se_controls.siteSpcificSuggestion =   trim(settings["siteSpcificSuggestion"]);
else
	se_controls.siteSpcificSuggestion = "true";

}
function getJSONP(url, success) 
{
    var ud = '_' + +new Date,
        script = document.createElement('script'),
        head = document.getElementsByTagName('head')[0] 
               || document.documentElement;

    window[ud] = function(data) {
        head.removeChild(script);
        success && success(data);
    };

    script.src = url.replace('callback=?', 'callback=' + ud);
    head.appendChild(script);

}
function trim(str)
{
	if(str)
		return str.replace(/^\s+|\s+$/g, "");
}
var noOfAuto = 0;
var currentLi = 1;
function autoComplete(){
			var val=document.getElementById(se_controls.tId).value;
			val=encodeURIComponent(val);
			if(val!=null && val!="")
			{
				showAutoComplete();
				se_controls.request_count = se_controls.request_count + 1;
				if(se_controls.siteSpcificSuggestion == "true")
					se_controls.urlEntry= se_controls.searchServer+"/AutoSuggestImpl?prefix="+val+"&output=json&site="+se_controls.site+"&reqc="+se_controls.request_count+ "&siteSpecificSuggestion="+se_controls.siteSpcificSuggestion+"&callback=?";
				else
					se_controls.urlEntry=se_controls.searchServer+"/AutoSuggestImpl?prefix="+val+"&output=json&reqc="+se_controls.request_count+ "&siteSpecificSuggestion="+se_controls.siteSpcificSuggestion+"&callback=?";
				getJSONP(se_controls.urlEntry, function(jsonResponse){
					var results = [];
					var currentResponse = jsonResponse['request_count'];
                    var json = jsonResponse['content'];
				var resultStr = '<ul class="ui-autocomplete ui-menu ui-widget ui-widget-content ui-corner-all" role="listbox" aria-activedescendant="ui-active-menuitem">';
				
				if(currentResponse == se_controls.request_count ){
					if(json['response']!= undefined &&   json['response']['docs'] != undefined )
					{
						se_controls.cachedResponse =  json['response']['docs'];
						noOfAuto = json['response']['docs'].length;
						for(var i=0;i<json['response']['docs'].length;i++)
						{
							results.push(json['response']['docs'][i]['suggestionPhrase']);
							var clsstr = '';
							if(i == 0){
								//clsstr = 'current';
							}
							resultStr += '<li class="ui-menu-item" role="menuitem"><a class="ui-corner-all '+clsstr+'"  onclick="linkClick(\''+json['response']['docs'][i]['suggestionPhrase']+'\')" href="javascript:;">'+json['response']['docs'][i]['suggestionPhrase']+'</a></li>';
						}

					}
					}else{
						if(se_controls.cachedResponse != undefined && se_controls.openFlag == 1)
						{
							for(var i=0;i<json['response']['docs'].length;i++)
							{
								var clsstr = '';
								if(i == 0){
									//clsstr = 'current';
								}
								results.push(json['response']['docs'][i]['suggestionPhrase']);
								resultStr += '<li class="ui-menu-item" role="menuitem"><a  href="javascript:;" class="ui-corner-all '+clsstr+'">'+json['response']['docs'][i]['suggestionPhrase']+'</a></li>';
							}
						}
					}
					resultStr += '</ul>';
					document.getElementById("auto_suggesion").innerHTML=resultStr;		
					document.getElementById('search_key').onkeydown = khandle;
					document.getElementById('auto_suggesion').firstChild.onkeydown = khandle1;					
				});
			}

		}
	
function showAutoComplete(){
		document.getElementById("auto_suggesion").style.display='block';
	}
	function hideAutoComplete(){
		document.getElementById("auto_suggesion").style.display='none';
	}
	function linkClick(value)
{
	document.getElementById('search_key').value=value;						
	callBack();
	document.getElementById("auto_suggesion").style.display='none';
}

function khandle(e) {
	e = e || event
	
	if(e.keyCode==40)
	{
		if(noOfAuto > 0 && currentLi >= 0 && currentLi < noOfAuto){
			currentLi = 1;
			currentKey = 1;
			var x=document.getElementById("auto_suggesion");  
			element=x.firstChild.firstChild.firstChild;
			element.className = element.className + " ui-state-hover"
			element.focus();
			document.getElementById("search_key").value=element.innerHTML;
			e.preventDefault();
		}
	}
}
function khandle1(e) {
	e = e || event
	if(currentKey == 1)
	{
		if (e.keyCode == 38) 
		{
			// go UP	
			upwards(e);
			
		} 
		else if (e.keyCode == 40) 
		{
			// go Down
			downwards(e);
		}
		else if (e.keyCode == 27) 
		{
			// go Esc
			hideAutoComplete();
		}
	}
	
}
function getElementsByClass(node,searchClass,tag) {
    var classElements;
    var els = node.getElementsByTagName(tag);
    for (var i = 0; i < els.length; i++)
	{
         if ( els[i].className.indexOf(searchClass) !== -1)
		 {
             classElements= els[i];
		 }
	}
    return classElements;
}

function upwards(e)
{
	if(noOfAuto > 0 && currentLi > 1){
		currentLi--;
		var t=getElementsByClass(document.getElementById("auto_suggesion"),"ui-state-hover","a");
		var tt=t.parentNode.previousSibling.firstChild;
		tt.className = tt.className + " ui-state-hover"
		t.className = "ui-corner-all";
		document.getElementById('search_key').value=tt.innerHTML;
		tt.focus();
		e.preventDefault();
	}
}
function downwards(e)
{	if(noOfAuto > 0 && currentLi < noOfAuto){
		currentLi++;
		var t=getElementsByClass(document.getElementById("auto_suggesion"),"ui-state-hover","a");
		var tt=t.parentNode.nextSibling.firstChild;
		tt.className = tt.className + " ui-state-hover"
		t.className = "ui-corner-all";			
		document.getElementById('search_key').value=tt.innerHTML;
		tt.focus();
		e.preventDefault();		
	}
};

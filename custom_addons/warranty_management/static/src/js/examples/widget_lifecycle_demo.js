odoo.define('warranty_management.LifecycleDemo', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');
    var core = require('web.core');

    /**
     * =============================================================================
     * WIDGET LIFECYCLE DEMONSTRATION
     * =============================================================================
     * 
     * Widget này demo tất cả các lifecycle methods và thứ tự gọi của chúng:
     * 
     * 1. new Widget()
     * 2. willStart()     - Async initialization, load data/libraries
     * 3. start()         - After inserted into DOM
     * 4. on_attach_callback() - When attached to DOM
     * 5. _render()       - Render content
     * 6. updateState()   - When field value changes
     * 7. on_detach_callback() - When detached from DOM
     * 8. destroy()       - Cleanup
     */
    var LifecycleDemoWidget = AbstractField.extend({
        className: 'o_lifecycle_demo',
        supportedFieldTypes: ['char', 'integer', 'float'],

        /**
         * 1. INIT (Constructor)
         * - Được gọi ĐẦU TIÊN khi widget được tạo
         * - Khởi tạo các biến instance
         * - KHÔNG thao tác DOM ở đây (widget chưa được insert vào DOM)
         * - KHÔNG gọi RPC ở đây - dùng willStart() thay thế
         */
        init: function (parent, name, record, options) {
            console.log('[LIFECYCLE] 1. init() - Constructor called');
            this._super.apply(this, arguments);

            // Khởi tạo các biến
            this.loadedData = null;
            this.renderCount = 0;
            this.debugMode = this.nodeOptions.debug || false;

            console.log('[LIFECYCLE] init() - Variables initialized');
        },

        /**
         * 2. WILSTART
         * - Được gọi SAU init(), TRƯỚC start()
         * - Phải RETURN PROMISE
         * - Dùng để load dữ liệu async hoặc external libraries
         * - Widget CHƯA được insert vào DOM
         * - RPC calls nên được thực hiện ở đây
         */
        willStart: function () {
            console.log('[LIFECYCLE] 2. willStart() - Before DOM insertion');
            var self = this;

            // Phải gọi _super và return promise
            var promise = this._super.apply(this, arguments);

            // Ví dụ: Load dữ liệu từ server
            var loadDataPromise = this._loadInitialData();

            // Ví dụ: Load external library
            var loadLibraryPromise = this._loadExternalLibrary();

            // Return combined promises
            return Promise.all([promise, loadDataPromise, loadLibraryPromise])
                .then(function () {
                    console.log('[LIFECYCLE] willStart() - All async operations completed');
                });
        },

        /**
         * 3. START
         * - Được gọi SAU willStart()
         * - Widget ĐÃ được insert vào DOM (this.$el có sẵn)
         * - Phải RETURN PROMISE
         * - Dùng để khởi tạo các thư viện cần DOM (như Chart.js, Select2)
         * - Setup event bindings (nếu cần manual binding)
         */
        start: function () {
            console.log('[LIFECYCLE] 3. start() - After DOM insertion');
            var self = this;

            // Phải gọi _super
            return this._super.apply(this, arguments).then(function () {
                console.log('[LIFECYCLE] start() - this.$el is available:', !!self.$el);

                // Có thể thao tác DOM ở đây
                self.$el.attr('data-widget-name', 'lifecycle-demo');

                // Khởi tạo plugins cần DOM
                self._initializePlugins();

                console.log('[LIFECYCLE] start() - Completed');
            });
        },

        /**
         * 4. ON_ATTACH_CALLBACK
         * - Được gọi khi widget được attach vào DOM
         * - Có thể được gọi NHIỀU LẦN (khi widget di chuyển trong DOM)
         * - Dùng để start animations, timers, polling
         * - KHÔNG return value
         */
        on_attach_callback: function () {
            console.log('[LIFECYCLE] 4. on_attach_callback() - Widget attached to DOM');

            // Gọi parent method nếu tồn tại
            if (this._super) {
                this._super.apply(this, arguments);
            }

            // Start polling hoặc timers
            this._startPolling();

            console.log('[LIFECYCLE] on_attach_callback() - Completed');
        },

        /**
         * 5. _RENDER (Internal)
         * - Được gọi khi cần render lại widget
         * - Gọi _renderReadonly() hoặc _renderEdit() tùy mode
         */
        _render: function () {
            console.log('[LIFECYCLE] 5. _render() - Rendering widget');
            this.renderCount++;

            return this._super.apply(this, arguments);
        },

        _renderReadonly: function () {
            console.log('[LIFECYCLE] 5a. _renderReadonly() - Render count:', this.renderCount);

            this.$el.html(
                '<div class="alert alert-info">' +
                '<strong>Lifecycle Demo Widget (Readonly)</strong><br/>' +
                'Value: ' + (this.value || 'No value') + '<br/>' +
                'Render count: ' + this.renderCount + '<br/>' +
                'Loaded data: ' + (this.loadedData ? 'Yes' : 'No') +
                '</div>'
            );
        },

        _renderEdit: function () {
            console.log('[LIFECYCLE] 5b. _renderEdit() - Render count:', this.renderCount);

            this.$el.html(
                '<div class="alert alert-success">' +
                '<strong>Lifecycle Demo Widget (Edit)</strong><br/>' +
                '<input type="text" class="form-control" value="' + (this.value || '') + '"/><br/>' +
                'Render count: ' + this.renderCount +
                '</div>'
            );
        },

        /**
         * 6. UPDATESTATE (Odoo 14+)
         * - Được gọi khi state của field thay đổi
         * - Thay thế cho các methods cũ như reset(), commitChanges()
         * - Dùng để update widget khi giá trị thay đổi từ bên ngoài
         */
        updateState: function (state, params) {
            console.log('[LIFECYCLE] 6. updateState() - State changed');
            console.log('[LIFECYCLE] updateState() - New value:', state.data[this.name]);

            // Có thể xử lý state changes ở đây
            // Ví dụ: Highlight khi giá trị thay đổi
            if (this.value !== state.data[this.name]) {
                this.$el.addClass('field-changed');
                setTimeout(function () {
                    this.$el.removeClass('field-changed');
                }.bind(this), 1000);
            }

            return this._super.apply(this, arguments);
        },

        /**
         * 7. ON_DETACH_CALLBACK
         * - Được gọi khi widget bị detach khỏi DOM
         * - Có thể được gọi NHIỀU LẦN
         * - Dùng để stop animations, timers, polling
         * - KHÔNG return value
         */
        on_detach_callback: function () {
            console.log('[LIFECYCLE] 7. on_detach_callback() - Widget detached from DOM');

            // Gọi parent method nếu tồn tại
            if (this._super) {
                this._super.apply(this, arguments);
            }

            // Stop polling hoặc timers
            this._stopPolling();

            console.log('[LIFECYCLE] on_detach_callback() - Completed');
        },

        /**
         * 8. DESTROY
         * - Được gọi CUỐI CÙNG khi widget bị remove hoàn toàn
         * - Dùng để cleanup: remove event listeners, destroy libraries, clear timers
         * - Giải phóng memory để tránh memory leaks
         * - PHẢI gọi _super.apply(this, arguments)
         */
        destroy: function () {
            console.log('[LIFECYCLE] 8. destroy() - Cleanup widget');

            // Stop polling
            this._stopPolling();

            // Cleanup external libraries
            if (this.externalLib) {
                this.externalLib.destroy();
                this.externalLib = null;
            }

            // Clear data
            this.loadedData = null;

            // PHẢI gọi _super cuối cùng
            this._super.apply(this, arguments);

            console.log('[LIFECYCLE] destroy() - Completed');
        },

        //=================================================================
        // HELPER METHODS
        //=================================================================

        _loadInitialData: function () {
            console.log('[LIFECYCLE] _loadInitialData() - Loading data from server');
            var self = this;

            // Simulate RPC call
            return new Promise(function (resolve) {
                setTimeout(function () {
                    self.loadedData = { status: 'ready', timestamp: new Date() };
                    console.log('[LIFECYCLE] _loadInitialData() - Data loaded');
                    resolve();
                }, 100);
            });
        },

        _loadExternalLibrary: function () {
            console.log('[LIFECYCLE] _loadExternalLibrary() - Loading external library');

            // Simulate library loading
            return new Promise(function (resolve) {
                setTimeout(function () {
                    console.log('[LIFECYCLE] _loadExternalLibrary() - Library loaded');
                    resolve();
                }, 100);
            });
        },

        _initializePlugins: function () {
            console.log('[LIFECYCLE] _initializePlugins() - Initializing plugins that need DOM');
            // Initialize plugins (Chart.js, Select2, etc.)
        },

        _startPolling: function () {
            console.log('[LIFECYCLE] _startPolling() - Starting polling');
            var self = this;

            this.pollingInterval = setInterval(function () {
                console.log('[LIFECYCLE] Polling... (Widget is attached)');
            }, 5000); // Poll every 5 seconds
        },

        _stopPolling: function () {
            console.log('[LIFECYCLE] _stopPolling() - Stopping polling');

            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
            }
        },
    });

    fieldRegistry.add('lifecycle_demo', LifecycleDemoWidget);

    return LifecycleDemoWidget;
});


/**
 * =============================================================================
 * TÓM TẮT LIFECYCLE
 * =============================================================================
 * 
 * THỨ TỰ GỌI:
 * 1. init()                  - Constructor, khởi tạo biến
 * 2. willStart()             - Load data/libraries (async, before DOM)
 * 3. start()                 - After DOM insertion, init plugins
 * 4. on_attach_callback()    - When attached to DOM
 * 5. _render()               - Render UI
 * 6. updateState()           - When state changes
 * 7. on_detach_callback()    - When detached from DOM
 * 8. destroy()               - Final cleanup
 * 
 * LƯU Ý QUAN TRỌNG:
 * - init(): NO DOM, NO RPC
 * - willStart(): MUST return Promise, for async operations
 * - start(): MUST return Promise, DOM available
 * - on_attach/detach: Can be called MULTIPLE times
 * - destroy(): MUST call _super, cleanup everything
 * 
 * BEST PRACTICES:
 * - Load data trong willStart(), không phải init()
 * - Initialize plugins trong start(), không phải willStart()
 * - Start timers trong on_attach_callback()
 * - Stop timers trong on_detach_callback()
 * - Cleanup trong destroy()
 */

/**
 * WIDGET WITH EXTERNAL LIBRARIES - Chart.js, Select2, DateRangePicker
 * 
 * File này demo tích hợp các thư viện bên ngoài vào Odoo widgets
 */

odoo.define('warranty_management.ChartWidget', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');

    /**
     * CHART.JS WIDGET
     * Field phải chứa JSON: {labels: [...], datasets: [...]}
     */
    var ChartJsWidget = AbstractField.extend({
        className: 'o_field_chart',
        supportedFieldTypes: ['char', 'text'],

        init: function () {
            this._super.apply(this, arguments);
            this.chartType = this.nodeOptions.chart_type || 'bar';
            this.chart = null;
        },

        willStart: function () {
            // Load Chart.js nếu chưa có
            var promise = this._super.apply(this, arguments);
            if (typeof Chart === 'undefined') {
                return promise.then(this._loadChartJs.bind(this));
            }
            return promise;
        },

        destroy: function () {
            if (this.chart) this.chart.destroy();
            this._super.apply(this, arguments);
        },

        _renderReadonly: function () { this._renderChart(); },
        _renderEdit: function () { this._renderChart(); },

        _renderChart: function () {
            if (this.chart) this.chart.destroy();

            var data = this.value ? JSON.parse(this.value) : null;
            if (!data) return;

            this.$el.html('<canvas height="300"></canvas>');
            var ctx = this.$('canvas')[0].getContext('2d');

            this.chart = new Chart(ctx, {
                type: this.chartType,
                data: data,
                options: { responsive: true }
            });
        },

        _loadChartJs: function () {
            return new Promise(function (resolve, reject) {
                var script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        },
    });

    fieldRegistry.add('chart_widget', ChartJsWidget);
    return ChartJsWidget;
});

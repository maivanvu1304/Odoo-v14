odoo.define('warranty_management.One2manyListWidget', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');
    var core = require('web.core');
    var _t = core._t;

    /**
     * CUSTOM ONE2MANY WIDGET - Hiển thị quan hệ một-nhiều dưới dạng bảng có thể thêm/xóa/sửa
     * 
     * Ví dụ sử dụng: Hiển thị danh sách warranty service lines (các dịch vụ trong ticket)
     * 
     * CÁCH SỬ DỤNG TRONG XML:
     * <field name="service_line_ids" widget="one2many_custom_list">
     *     <tree editable="bottom">
     *         <field name="service_name"/>
     *         <field name="quantity"/>
     *         <field name="price"/>
     *     </tree>
     * </field>
     */
    var One2manyCustomListWidget = AbstractField.extend({
        className: 'o_field_one2many_list',
        supportedFieldTypes: ['one2many'],

        /**
         * EVENTS
         */
        events: {
            'click .o_add_line': '_onAddLine',
            'click .o_delete_line': '_onDeleteLine',
            'click .o_edit_line': '_onEditLine',
        },

        /**
         * INIT - Khởi tạo
         */
        init: function () {
            this._super.apply(this, arguments);
            // Lấy columns từ view definition
            this.columns = this._extractColumns();
        },

        //=================================================================
        // RENDER METHODS
        //=================================================================

        /**
         * _renderReadonly - Hiển thị readonly mode
         */
        _renderReadonly: function () {
            this.$el.empty();

            if (!this.value || this.value.data.length === 0) {
                this.$el.html('<div class="text-muted">' + _t('No lines yet') + '</div>');
                return;
            }

            var $table = this._createTable(false);
            this.$el.append($table);
        },

        /**
         * _renderEdit - Hiển thị edit mode
         */
        _renderEdit: function () {
            this.$el.empty();

            var $table = this._createTable(true);

            // Nút Add Line
            var $addButton = $('<button type="button" class="btn btn-sm btn-primary o_add_line mt-2">' +
                '<i class="fa fa-plus"></i> ' + _t('Add a line') +
                '</button>');

            this.$el.append($table);
            this.$el.append($addButton);
        },

        /**
         * _createTable - Tạo bảng hiển thị dữ liệu
         */
        _createTable: function (editable) {
            var self = this;
            var $table = $('<table class="table table-sm table-bordered"></table>');

            // Header
            var $thead = $('<thead></thead>');
            var $headerRow = $('<tr></tr>');

            _.each(this.columns, function (col) {
                $headerRow.append('<th>' + col.label + '</th>');
            });

            if (editable) {
                $headerRow.append('<th style="width: 80px;">' + _t('Actions') + '</th>');
            }

            $thead.append($headerRow);
            $table.append($thead);

            // Body
            var $tbody = $('<tbody></tbody>');

            if (this.value && this.value.data.length > 0) {
                _.each(this.value.data, function (record) {
                    var $row = self._createRow(record, editable);
                    $tbody.append($row);
                });
            }

            $table.append($tbody);

            return $table;
        },

        /**
         * _createRow - Tạo một dòng trong bảng
         */
        _createRow: function (record, editable) {
            var self = this;
            var $row = $('<tr data-id="' + record.id + '"></tr>');

            // Render từng column
            _.each(this.columns, function (col) {
                var value = record.data[col.name];
                var displayValue = self._formatValue(value, col.type);
                $row.append('<td>' + displayValue + '</td>');
            });

            // Actions column
            if (editable) {
                var $actionsCell = $('<td></td>');

                var $editBtn = $('<button class="btn btn-sm btn-link o_edit_line" data-id="' + record.id + '">' +
                    '<i class="fa fa-pencil"></i>' +
                    '</button>');

                var $deleteBtn = $('<button class="btn btn-sm btn-link text-danger o_delete_line" data-id="' + record.id + '">' +
                    '<i class="fa fa-trash"></i>' +
                    '</button>');

                $actionsCell.append($editBtn).append($deleteBtn);
                $row.append($actionsCell);
            }

            return $row;
        },

        /**
         * _extractColumns - Lấy danh sách columns từ field definition
         */
        _extractColumns: function () {
            // Trong Odoo, field.views chứa các view definitions
            var viewType = 'list';
            var columns = [];

            // Simplified version - trong thực tế cần parse từ field.views
            // Giả sử chúng ta đã có columns được định nghĩa
            if (this.field.views && this.field.views.list) {
                var listView = this.field.views.list;
                // Parse columns từ listView.arch (XML architecture)
            }

            // Fallback: Sử dụng columns mặc định
            return [
                { name: 'display_name', label: _t('Name'), type: 'char' },
                { name: 'quantity', label: _t('Quantity'), type: 'float' },
                { name: 'price', label: _t('Price'), type: 'float' },
            ];
        },

        /**
         * _formatValue - Format giá trị theo type
         */
        _formatValue: function (value, fieldType) {
            if (value === false || value === null || value === undefined) {
                return '';
            }

            switch (fieldType) {
                case 'float':
                case 'monetary':
                    return parseFloat(value).toFixed(2);
                case 'integer':
                    return parseInt(value);
                case 'many2one':
                    return value[1]; // many2one trả về [id, name]
                case 'date':
                    return moment(value).format('DD/MM/YYYY');
                case 'datetime':
                    return moment(value).format('DD/MM/YYYY HH:mm');
                default:
                    return value;
            }
        },

        //=================================================================
        // EVENT HANDLERS
        //=================================================================

        /**
         * _onAddLine - Thêm dòng mới
         */
        _onAddLine: function (event) {
            event.preventDefault();
            var self = this;

            // Trigger event để mở form dialog
            this._setValue({
                operation: 'CREATE',
                data: {},
            });
        },

        /**
         * _onDeleteLine - Xóa dòng
         */
        _onDeleteLine: function (event) {
            event.preventDefault();
            event.stopPropagation();

            var recordId = $(event.currentTarget).data('id');

            this._setValue({
                operation: 'DELETE',
                ids: [recordId],
            });
        },

        /**
         * _onEditLine - Sửa dòng
         */
        _onEditLine: function (event) {
            event.preventDefault();
            event.stopPropagation();

            var recordId = $(event.currentTarget).data('id');

            this._setValue({
                operation: 'UPDATE',
                id: recordId,
            });
        },

        //=================================================================
        // SPECIALIZATION
        //=================================================================

        /**
         * isSet - Kiểm tra field có giá trị
         */
        isSet: function () {
            return this.value && this.value.data.length > 0;
        },

        /**
         * getTotalAmount - Ví dụ method tính tổng tiền (nếu có field price)
         */
        getTotalAmount: function () {
            if (!this.value || this.value.data.length === 0) {
                return 0;
            }

            var total = 0;
            _.each(this.value.data, function (record) {
                if (record.data.price) {
                    var quantity = record.data.quantity || 1;
                    total += record.data.price * quantity;
                }
            });

            return total;
        },
    });

    fieldRegistry.add('one2many_custom_list', One2manyCustomListWidget);

    return One2manyCustomListWidget;
});

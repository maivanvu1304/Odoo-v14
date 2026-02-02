odoo.define('warranty_management.Many2manyTagsWidget', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');
    var core = require('web.core');
    var _t = core._t;

    /**
     * CUSTOM MANY2MANY WIDGET - Hiển thị quan hệ nhiều-nhiều dưới dạng tags có thể thêm/xóa
     * 
     * Ví dụ sử dụng: Hiển thị danh sách spare parts (phụ tùng) cho warranty ticket
     * 
     * CÁCH SỬ DỤNG TRONG XML:
     * <field name="spare_part_ids" widget="many2many_custom_tags"/>
     */
    var Many2manyCustomTagsWidget = AbstractField.extend({
        className: 'o_field_many2many_tags',
        tagName: 'div',
        supportedFieldTypes: ['many2many'],

        /**
         * EVENTS - Xử lý các sự kiện user interaction
         */
        events: {
            'click .o_delete': '_onDeleteTag',
            'click .o_add_tag': '_onAddTag',
        },

        /**
         * INIT - Khởi tạo widget
         * Gọi đầu tiên khi widget được tạo
         */
        init: function () {
            this._super.apply(this, arguments);
            this.tagColor = this.nodeOptions.color || 'primary';
            this.allowCreate = this.nodeOptions.allow_create !== false;
        },

        //=================================================================
        // RENDER METHODS
        //=================================================================

        /**
         * _renderReadonly - Hiển thị ở chế độ chỉ đọc (readonly)
         * Được gọi khi form ở chế độ xem (không edit)
         */
        _renderReadonly: function () {
            var self = this;
            this.$el.empty();

            // this.value chứa danh sách IDs của records liên quan
            // this.value.data chứa thông tin chi tiết của từng record
            if (this.value && this.value.data.length > 0) {
                var $tagsContainer = $('<div class="o_field_many2manytags"></div>');

                _.each(this.value.data, function (record) {
                    var $tag = self._renderTag(record, false);
                    $tagsContainer.append($tag);
                });

                this.$el.append($tagsContainer);
            } else {
                this.$el.html('<span class="text-muted">' + _t('No items') + '</span>');
            }
        },

        /**
         * _renderEdit - Hiển thị ở chế độ chỉnh sửa (edit)
         * Được gọi khi form ở chế độ edit
         */
        _renderEdit: function () {
            var self = this;
            this.$el.empty();

            var $tagsContainer = $('<div class="o_field_many2manytags"></div>');

            // Render các tags hiện có với nút delete
            if (this.value && this.value.data.length > 0) {
                _.each(this.value.data, function (record) {
                    var $tag = self._renderTag(record, true);
                    $tagsContainer.append($tag);
                });
            }

            // Nút thêm tag mới
            if (this.allowCreate) {
                var $addButton = $('<button type="button" class="btn btn-sm btn-link o_add_tag">' +
                    '<i class="fa fa-plus"></i> ' + _t('Add Item') +
                    '</button>');
                $tagsContainer.append($addButton);
            }

            this.$el.append($tagsContainer);
        },

        /**
         * _renderTag - Render một tag riêng lẻ
         * @param {Object} record - Dữ liệu của record
         * @param {Boolean} showDelete - Có hiển thị nút delete không
         */
        _renderTag: function (record, showDelete) {
            var displayName = record.data.display_name || record.data.name || 'Unnamed';
            var deleteIcon = showDelete ? '<i class="fa fa-times o_delete" data-id="' + record.res_id + '"></i>' : '';

            var $tag = $('<span class="badge badge-' + this.tagColor + ' mr-1 mb-1" style="cursor: pointer;">' +
                displayName + ' ' + deleteIcon +
                '</span>');

            return $tag;
        },

        //=================================================================
        // EVENT HANDLERS
        //=================================================================

        /**
         * _onDeleteTag - Xóa một tag khỏi danh sách
         */
        _onDeleteTag: function (event) {
            event.stopPropagation();
            var recordId = parseInt($(event.currentTarget).data('id'));

            // Lấy danh sách IDs hiện tại
            var currentIds = this.value.res_ids;

            // Xóa ID khỏi danh sách
            var newIds = _.without(currentIds, recordId);

            // Cập nhật giá trị mới
            this._setValue({
                operation: 'REPLACE_WITH',
                ids: newIds,
            });
        },

        /**
         * _onAddTag - Mở dialog để thêm tag mới
         */
        _onAddTag: function (event) {
            event.preventDefault();
            var self = this;

            // Mở dialog để chọn records
            // Sử dụng SelectCreateDialog của Odoo
            new window.dialogs.SelectCreateDialog(this, {
                res_model: this.field.relation, // Model liên quan (vd: product.product)
                title: _t('Add Items'),
                disable_multiple_selection: false,
                domain: this.record.getDomain(this.recordParams),
                on_selected: function (records) {
                    // records là array các record được chọn
                    var currentIds = self.value.res_ids;
                    var newIds = _.pluck(records, 'id');
                    var combinedIds = _.union(currentIds, newIds);

                    self._setValue({
                        operation: 'REPLACE_WITH',
                        ids: combinedIds,
                    });
                }
            }).open();
        },

        //=================================================================
        // UTILITY METHODS
        //=================================================================

        /**
         * isSet - Kiểm tra xem field có giá trị không
         */
        isSet: function () {
            return this.value && this.value.res_ids.length > 0;
        },
    });

    // Đăng ký widget vào registry
    fieldRegistry.add('many2many_custom_tags', Many2manyCustomTagsWidget);

    return Many2manyCustomTagsWidget;
});

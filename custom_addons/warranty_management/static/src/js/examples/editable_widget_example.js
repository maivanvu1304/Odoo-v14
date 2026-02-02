odoo.define('warranty_management.EditableRatingWidget', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');
    var core = require('web.core');
    var _t = core._t;

    /**
     * EDITABLE WIDGET - Widget có thể chỉnh sửa với cả readonly và edit mode
     * 
     * Ví dụ: Rating widget cho đánh giá chất lượng dịch vụ bảo hành (1-5 sao)
     * 
     * CÁCH SỬ DỤNG:
     * <field name="rating" widget="editable_rating"/>
     * 
     * ĐIỂM KHÁC BIỆT CHÍNH:
     * - Readonly mode: Hiển thị stars màu vàng (không click được)
     * - Edit mode: Stars có thể click để thay đổi rating
     */
    var EditableRatingWidget = AbstractField.extend({
        className: 'o_field_rating',
        supportedFieldTypes: ['integer', 'float'],

        /**
         * EVENTS - Chỉ hoạt động khi ở edit mode
         */
        events: {
            'click .o_star': '_onClickStar',
            'mouseenter .o_star': '_onHoverStar',
            'mouseleave .o_stars_container': '_onMouseLeave',
        },

        /**
         * INIT
         */
        init: function () {
            this._super.apply(this, arguments);
            this.maxRating = this.nodeOptions.max_rating || 5;
            this.allowHalf = this.nodeOptions.allow_half || false;
            this.currentHover = null;
        },

        //=================================================================
        // RENDER METHODS
        //=================================================================

        /**
         * _renderReadonly - Readonly mode: Chỉ hiển thị, không cho edit
         */
        _renderReadonly: function () {
            this.$el.empty();
            var rating = this.value || 0;

            var $container = $('<div class="o_stars_container_readonly"></div>');

            for (var i = 1; i <= this.maxRating; i++) {
                var $star = this._createStar(i, rating, false);
                $container.append($star);
            }

            // Hiển thị số rating bên cạnh
            var $ratingText = $('<span class="ml-2 text-muted">(' + rating.toFixed(1) + '/' + this.maxRating + ')</span>');
            $container.append($ratingText);

            this.$el.append($container);
        },

        /**
         * _renderEdit - Edit mode: Cho phép click để thay đổi rating
         */
        _renderEdit: function () {
            this.$el.empty();
            var rating = this.value || 0;

            var $container = $('<div class="o_stars_container"></div>');

            for (var i = 1; i <= this.maxRating; i++) {
                var $star = this._createStar(i, rating, true);
                $container.append($star);
            }

            // Hiển thị số rating (có thể thay đổi)
            var $ratingText = $('<span class="o_rating_text ml-2 text-primary">' +
                '(' + rating.toFixed(1) + '/' + this.maxRating + ')' +
                '</span>');
            $container.append($ratingText);

            this.$el.append($container);
        },

        /**
         * _createStar - Tạo một ngôi sao
         * @param {Number} position - Vị trí của sao (1-5)
         * @param {Number} currentRating - Rating hiện tại
         * @param {Boolean} editable - Có thể edit không
         */
        _createStar: function (position, currentRating, editable) {
            var isFilled = position <= currentRating;
            var isHalfFilled = !isFilled && this.allowHalf && (position - 0.5) <= currentRating;

            var iconClass = isFilled ? 'fa-star' : (isHalfFilled ? 'fa-star-half-o' : 'fa-star-o');
            var colorClass = isFilled || isHalfFilled ? 'text-warning' : 'text-muted';

            var $star = $('<i class="fa ' + iconClass + ' o_star ' + colorClass + '" ' +
                'data-position="' + position + '" ' +
                'style="cursor: ' + (editable ? 'pointer' : 'default') + '; font-size: 20px; margin-right: 3px;">' +
                '</i>');

            if (!editable) {
                $star.css('pointer-events', 'none');
            }

            return $star;
        },

        //=================================================================
        // EVENT HANDLERS - CHỈ HOẠT ĐỘNG Ở EDIT MODE
        //=================================================================

        /**
         * _onClickStar - Khi click vào sao để set rating
         */
        _onClickStar: function (event) {
            if (this.mode === 'readonly') {
                return; // Không làm gì nếu đang ở readonly mode
            }

            var position = parseInt($(event.currentTarget).data('position'));
            var newRating = position;

            // Nếu allow half stars và click vào nửa trái của sao
            if (this.allowHalf) {
                var starWidth = $(event.currentTarget).width();
                var clickX = event.pageX - $(event.currentTarget).offset().left;

                if (clickX < starWidth / 2) {
                    newRating = position - 0.5;
                }
            }

            // Trigger change
            this._setValue(newRating);
        },

        /**
         * _onHoverStar - Preview khi hover chuột
         */
        _onHoverStar: function (event) {
            if (this.mode === 'readonly') {
                return;
            }

            var position = parseInt($(event.currentTarget).data('position'));
            this.currentHover = position;
            this._updateStarsDisplay(position);
        },

        /**
         * _onMouseLeave - Reset về rating thật khi rời chuột
         */
        _onMouseLeave: function () {
            if (this.mode === 'readonly') {
                return;
            }

            this.currentHover = null;
            this._updateStarsDisplay(this.value || 0);
        },

        /**
         * _updateStarsDisplay - Cập nhật hiển thị các sao
         */
        _updateStarsDisplay: function (rating) {
            var self = this;

            this.$('.o_star').each(function (index) {
                var position = index + 1;
                var $star = $(this);

                if (position <= rating) {
                    $star.removeClass('fa-star-o fa-star-half-o text-muted')
                        .addClass('fa-star text-warning');
                } else if (self.allowHalf && (position - 0.5) <= rating) {
                    $star.removeClass('fa-star fa-star-o text-muted')
                        .addClass('fa-star-half-o text-warning');
                } else {
                    $star.removeClass('fa-star fa-star-half-o text-warning')
                        .addClass('fa-star-o text-muted');
                }
            });

            // Update text
            this.$('.o_rating_text').text('(' + rating.toFixed(1) + '/' + this.maxRating + ')');
        },

        //=================================================================
        // ABSTRACT METHOD IMPLEMENTATION
        //=================================================================

        /**
         * isSet - Field có giá trị hay không
         */
        isSet: function () {
            return this.value !== false && this.value !== null && this.value !== undefined;
        },

        /**
         * getFocusableElement - Element nào sẽ nhận focus
         */
        getFocusableElement: function () {
            return this.$('.o_star').first();
        },
    });

    fieldRegistry.add('editable_rating', EditableRatingWidget);

    return EditableRatingWidget;
});


/**
 * =============================================================================
 * VÍ DỤ 2: EDITABLE PROGRESS BAR WIDGET
 * =============================================================================
 */
odoo.define('warranty_management.EditableProgressWidget', function (require) {
    'use strict';

    var AbstractField = require('web.AbstractField');
    var fieldRegistry = require('web.field_registry');

    /**
     * EDITABLE PROGRESS BAR - Thanh tiến trình có thể kéo thả để thay đổi giá trị
     * 
     * Ví dụ: Progress của công việc sửa chữa (0-100%)
     * 
     * CÁCH SỬ DỤNG:
     * <field name="progress" widget="editable_progress"/>
     */
    var EditableProgressWidget = AbstractField.extend({
        className: 'o_field_editable_progress',
        supportedFieldTypes: ['integer', 'float'],

        events: {
            'click .o_progress_bar': '_onClickBar',
        },

        //=================================================================
        // RENDER
        //=================================================================

        _renderReadonly: function () {
            this._renderProgressBar(false);
        },

        _renderEdit: function () {
            this._renderProgressBar(true);
        },

        _renderProgressBar: function (editable) {
            var progress = this.value || 0;
            var color = this._getColorByProgress(progress);

            this.$el.html(
                '<div class="progress" style="height: 25px; cursor: ' + (editable ? 'pointer' : 'default') + ';">' +
                '<div class="progress-bar bg-' + color + '" role="progressbar" ' +
                'style="width: ' + progress + '%;" ' +
                'aria-valuenow="' + progress + '" aria-valuemin="0" aria-valuemax="100">' +
                progress.toFixed(0) + '%' +
                '</div>' +
                '</div>'
            );

            if (!editable) {
                this.$('.progress').css('pointer-events', 'none');
            }
        },

        _getColorByProgress: function (progress) {
            if (progress < 30) return 'danger';
            if (progress < 70) return 'warning';
            return 'success';
        },

        //=================================================================
        // EVENT HANDLERS
        //=================================================================

        _onClickBar: function (event) {
            if (this.mode === 'readonly') {
                return;
            }

            var $progressContainer = this.$('.progress');
            var containerWidth = $progressContainer.width();
            var clickX = event.pageX - $progressContainer.offset().left;

            var newProgress = Math.round((clickX / containerWidth) * 100);
            newProgress = Math.max(0, Math.min(100, newProgress)); // Clamp 0-100

            this._setValue(newProgress);
        },
    });

    fieldRegistry.add('editable_progress', EditableProgressWidget);

    return EditableProgressWidget;
});

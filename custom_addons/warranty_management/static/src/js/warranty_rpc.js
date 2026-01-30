odoo.define('warranty_management.rpc_example', function (require) {
    'use strict';

    var core = require('web.core');
    var rpc = require('web.rpc');
    var Widget = require('web.Widget');

    var WarrantyRPCWidget = Widget.extend({
        events: {
            'click .load_tickets': '_onLoadTickets',
            'click .create_ticket': '_onCreateTicket',
        },

        start: function () {
            return this._super.apply(this, arguments);
        },

        // Lấy danh sách warranty tickets
        _onLoadTickets: function () {
            var self = this;
            rpc.query({
                model: 'warranty.ticket',
                method: 'search_read',
                args: [[]],  // domain
                kwargs: {
                    fields: ['name', 'customer_id', 'product_id', 'state'],
                    limit: 10,
                }
            }).then(function (tickets) {
                console.log('Tickets:', tickets);
                self._displayTickets(tickets);
            });
        },

        // Tạo ticket mới
        _onCreateTicket: function () {
            rpc.query({
                model: 'warranty.ticket',
                method: 'create',
                args: [{
                    'name': 'New Ticket from JS',
                    'customer_id': 1,  // ID của customer
                    'product_id': 1,   // ID của product
                }]
            }).then(function (ticket_id) {
                console.log('Created ticket ID:', ticket_id);
                alert('Ticket created successfully!');
            });
        },

        // Gọi custom method trong model
        _callCustomMethod: function (ticket_id) {
            rpc.query({
                model: 'warranty.ticket',
                method: 'action_confirm',  // Custom method trong Python
                args: [ticket_id],
            }).then(function (result) {
                console.log('Method result:', result);
            });
        },

        _displayTickets: function (tickets) {
            var html = '<ul>';
            tickets.forEach(function (ticket) {
                html += '<li>' + ticket.name + ' - ' + ticket.status + '</li>';
            });
            html += '</ul>';
            this.$el.find('.ticket_list').html(html);
        },
    });

    return WarrantyRPCWidget;
});
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class WarrantyServiceLine(models.Model):
    """Service lines for One2many widget testing"""
    _name = "warranty.service.line"
    _description = "Warranty Service Line"
    _order = "sequence, id"

    ticket_id = fields.Many2one(
        "warranty.ticket",
        string="Warranty Ticket",
        required=True,
        ondelete="cascade",
    )
    sequence = fields.Integer(default=10)
    
    service_name = fields.Char(
        string="Service Name",
        required=True,
        help="Name of the service",
    )
    description = fields.Text(string="Description")
    
    quantity = fields.Float(
        string="Quantity",
        default=1.0,
        required=True,
    )
    
    currency_id = fields.Many2one(
        "res.currency",
        string="Currency",
        default=lambda self: self.env.company.currency_id.id,
        required=True,
    )
    price = fields.Monetary(
        currency_field="currency_id",
        string="Unit Price",
        default=0.0,
    )
    
    subtotal = fields.Monetary(
        currency_field="currency_id",
        string="Subtotal",
        compute="_compute_subtotal",
        store=True,
    )
    
    @api.depends("quantity", "price")
    def _compute_subtotal(self):
        for rec in self:
            rec.subtotal = rec.quantity * rec.price
    
    @api.constrains("quantity")
    def _check_quantity(self):
        for rec in self:
            if rec.quantity <= 0:
                raise ValidationError("Quantity must be greater than 0")
    
    @api.constrains("price")
    def _check_price(self):
        for rec in self:
            if rec.price < 0:
                raise ValidationError("Price cannot be negative")

# -*- coding: utf-8 -*-

from odoo import fields, models


class WarrantyPartner(models.Model):
    _name = "warranty.partner"
    _description = "Warranty Partner"
    _inherits = {"res.partner": "partner_id"}

    partner_id = fields.Many2one(
        "res.partner",
        string="Partner",
        required=True,
        ondelete="cascade",
    )

    warranty_level = fields.Selection(
        [
            ("standard", "Standard"),
            ("gold", "Gold"),
            ("platinum", "Platinum"),
        ],
        string="Warranty Level",
        default="standard",
        required=True,
    )
    warranty_start_date = fields.Date(
        string="Warranty Start Date",
        default=fields.Date.context_today,
    )
    warranty_end_date = fields.Date(string="Warranty End Date")
    warranty_note = fields.Text(string="Warranty Note")

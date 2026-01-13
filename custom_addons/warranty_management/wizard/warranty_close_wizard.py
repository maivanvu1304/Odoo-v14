from odoo import models, fields, _
from odoo.exceptions import UserError


class WarrantyCloseWizard(models.TransientModel):
    _name = "warranty.close.wizard"
    _description = "Close Warranty Ticket Wizard"

    ticket_id = fields.Many2one("warranty.ticket", required=True)
    closing_note = fields.Text(string="Closing Note", required=True)

    def action_confirm(self):
        self.ensure_one()
        ticket = self.ticket_id

        if ticket.state not in ("confirmed", "in_progress"):
            raise UserError(_("Only Confirmed/In Progress tickets can be closed."))

        # tạo 1 line xử lý
        self.env["warranty.ticket.line"].create(
            {
                "ticket_id": ticket.id,
                "description": self.closing_note,
            }
        )

        ticket.state = "done"
        return {"type": "ir.actions.act_window_close"}

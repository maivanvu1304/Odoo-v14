from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from dateutil.relativedelta import relativedelta


class WarrantyTicket(models.Model):
    _name = "warranty.ticket"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _description = "Warranty Ticket"
    _order = "id desc"

    name = fields.Char(string="Ticket No.", required=True, copy=False, readonly=True, default="New")
    customer_id = fields.Many2one("res.partner", string="Customer", required=True)
    phone = fields.Char(string="Phone", related="customer_id.phone", readonly=False, store=True)
    product_id = fields.Many2one("product.product", string="Product", required=True)
    serial_no = fields.Char(string="Serial/IMEI", required=True)
    purchase_date = fields.Date(string="Purchase Date", required=True)
    warranty_months = fields.Integer(string="Warranty (Months)", default=12, required=True)

    expire_date = fields.Date(string="Expire Date", compute="_compute_expire_date", store=True)
    state = fields.Selection(
        [
            ("draft", "Draft"),
            ("confirmed", "Confirmed"),
            ("in_progress", "In Progress"),
            ("done", "Done"),
            ("cancel", "Cancelled"),
        ],
        string="Status",
        default="draft",
        tracking=True,
    )

    user_id = fields.Many2one(
        "res.users",
        string="Assigned User",
        default=lambda self: self.env.user,
        tracking=True,
    )

    line_ids = fields.One2many("warranty.ticket.line", "ticket_id", string="Lines")
    line_count = fields.Integer(string="Line Count", compute="_compute_line_count", store=True)

    @api.depends("purchase_date", "warranty_months")
    def _compute_expire_date(self):
        for rec in self:
            if rec.purchase_date and rec.warranty_months:
                rec.expire_date = rec.purchase_date + relativedelta(months=rec.warranty_months)
            else:
                rec.expire_date = False

    @api.depends("line_ids")
    def _compute_line_count(self):
        for rec in self:
            rec.line_count = len(rec.line_ids)

    @api.constrains("serial_no")
    def _check_serial_no(self):
        for rec in self:
            if not rec.serial_no or len(rec.serial_no.strip()) < 6:
                raise ValidationError(_("Serial/IMEI must have at least 6 characters."))

    @api.constrains("purchase_date")
    def _check_purchase_date(self):
        today = fields.Date.context_today(self)
        for rec in self:
            if rec.purchase_date and rec.purchase_date > today:
                raise ValidationError(_("Purchase Date cannot be in the future."))

    @api.constrains("warranty_months")
    def _check_warranty_months(self):
        for rec in self:
            if rec.warranty_months <= 0:
                raise ValidationError(_("Warranty months must be greater than 0."))

    @api.model
    def create(self, vals):
        if vals.get("name", "New") == "New":
            vals["name"] = self.env["ir.sequence"].next_by_code("warranty.ticket") or "New"
        vals.setdefault("user_id", self.env.uid)
        return super().create(vals)

    # ===== State actions (buttons) =====
    def action_confirm(self):
        for rec in self:
            if rec.state != "draft":
                continue
            rec.state = "confirmed"

    def action_start(self):
        for rec in self:
            if rec.state != "confirmed":
                continue
            rec.state = "in_progress"

    def action_done(self):
        for rec in self:
            if rec.state != "in_progress":
                continue
            rec.state = "done"

    def action_cancel(self):
        for rec in self:
            if rec.state == "done":
                raise UserError(_("You cannot cancel a Done ticket."))
            rec.state = "cancel"

    def action_set_draft(self):
        for rec in self:
            rec.state = "draft"

    # Chặn xóa nếu không phải draft
    def unlink(self):
        for rec in self:
            if rec.state != "draft":
                raise UserError(_("You can only delete tickets in Draft state."))
        return super().unlink()

    # Mở wizard đóng phiếu
    def action_open_close_wizard(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": _("Close Ticket"),
            "res_model": "warranty.close.wizard",
            "view_mode": "form",
            "target": "new",
            "context": {"default_ticket_id": self.id},
        }


class WarrantyTicketLine(models.Model):
    _name = "warranty.ticket.line"
    _description = "Warranty Ticket Line"
    _order = "sequence, id"

    ticket_id = fields.Many2one("warranty.ticket", string="Ticket", required=True, ondelete="cascade")
    sequence = fields.Integer(default=10)
    date = fields.Datetime(default=fields.Datetime.now, required=True)
    description = fields.Text(required=True)
    technician_id = fields.Many2one("res.users", string="Technician")

    currency_id = fields.Many2one(
        "res.currency",
        string="Currency",
        default=lambda self: self.env.company.currency_id.id,
        required=True,
    )
    cost = fields.Monetary(currency_field="currency_id", string="Cost", default=0.0)

    @api.constrains("cost")
    def _check_cost(self):
        for rec in self:
            if rec.cost < 0:
                raise ValidationError(_("Cost must be >= 0."))

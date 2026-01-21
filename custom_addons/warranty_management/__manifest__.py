# -*- coding: utf-8 -*-
{
    'name': "warranty_management",

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,

    'author': "My Company",
    'website': "http://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/14.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    # product is required because tickets link to products via Many2one
    'depends': ['base', 'mail', 'product'],

    # always loaded
    'data': [
        "security/warranty_security.xml",
        "security/security.xml",
        "security/ir.model.access.csv",
        "data/sequence.xml",
        "views/warranty_ticket_views.xml",
        "views/warranty_partner_views.xml",
        "wizard/warranty_close_wizard_views.xml",
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    "application": True,
    "installable": True,
}

import { forHyper, newlineBreak, html, HDoc, normalize, removeLineBeginningWhitespace } from '../src/convert';
import { EsqlateStatementNormalized, EsqlateDefinition } from '../res/schema-definition';

import test from 'tape';


test('normalize', (assert) => {

    const input: EsqlateDefinition = {
        title: "Add an order for a customer",
        name: "add_order",
        parameters: [
            {
                name: "user_id",
                type: "server",
            },
            {
                name: "credit",
                type: "integer",
            },
            {
                name: "customer_id",
                type: "select",
                definition: "list_customer_with_credit_above",
                display_field: "disp",
                value_field: "id"
            }
        ],
        statement: "insert into orders (customer_id, ref, total_credit, available_credit, created_by) values ($customer_id, 'big $$ $$a $ person', $credit, ${credit}, $user_id)",
    };

    const expected: EsqlateStatementNormalized = [
            "insert into orders (customer_id, ref, total_credit, available_credit, created_by) values (",
            {
                name: "customer_id",
                type: "select",
                definition: "list_customer_with_credit_above",
                display_field: "disp",
                value_field: "id"
            },
            ", 'big $ $a $ person', ",
            { name: "credit", type: "integer" },
            ", ",
            { name: "credit", type: "integer" },
            ", ",
            { name: "user_id", type: "server" },
            ")"
        ];

    assert.deepEqual(
        normalize(input.parameters, input.statement),
        expected
    );

    assert.end();
});

test('normalize 2', (assert) => {

    const input: EsqlateDefinition = {
        title: "Customers with credit",
        name: "customers_with_credit",
        parameters: [
            { name: "amount", type: "integer" }
        ],
        statement: "select id, disp from customers\ninner join credit on credit.customer_id = customer.id\nwhere credit.amount > $amount",
    };

    const expected: EsqlateStatementNormalized = [
        "select id, disp from customers\ninner join credit on credit.customer_id = customer.id\nwhere credit.amount > ",
        {
            "name": "amount",
            "type": "integer"
        }
    ];

    assert.deepEqual(
        normalize(input.parameters, input.statement),
        expected
    );

    assert.end();
});

test('normalize 3', (assert) => {

    const input: EsqlateDefinition = {
        title: "Customers with credit",
        name: "customers_with_credit",
        parameters: [
            { name: "amount", type: "integer" },
            { name: "user_id", type: "integer" }
        ],
        statement: [
            "select id, disp from customers\ninner join credit on credit.customer_id = customer.id\n",
            "where credit.amount > ",
            {
                "name": "amount",
                "type": "integer"
            },
            "and id > $user_id"
        ],
    };

    const expected: EsqlateStatementNormalized = [
        "select id, disp from customers\ninner join credit on credit.customer_id = customer.id\n",
        "where credit.amount > ",
        {
            "name": "amount",
            "type": "integer"
        },
        "and id > ",
        {
            "name": "user_id",
            "type": "integer"
        },
    ];

    assert.deepEqual(
        normalize(input.parameters, input.statement),
        expected
    );

    assert.end();
});

test('newlineBreak', (assert) => {

    const input: EsqlateStatementNormalized = [
            "insert into orders (customer_id, ref, total_credit, available_credit) values (",
            {
                name: "customer_id",
                type: "select",
                definition: "bob",
                display_field: "disp",
                value_field: "id"
            },
            ", 'big $\n person', ",
            { name: "credit", type: "integer" },
            ", ",
            { name: "credit", type: "integer" },
            ")"
        ];

    const expected: EsqlateStatementNormalized[] = [
        [
            "insert into orders (customer_id, ref, total_credit, available_credit) values (",
            {
                name: "customer_id",
                type: "select",
                definition: "bob",
                display_field: "disp",
                value_field: "id"
            },
            ", 'big $"
        ],
        [
            " person', ",
            { name: "credit", type: "integer" },
            ", ",
            { name: "credit", type: "integer" },
            ")"
        ]
    ];

    assert.deepEqual(
        newlineBreak(input),
        expected
    );

    assert.end();
});


test('html', (assert) => {

    const input: EsqlateStatementNormalized = [
            "insert into orders (customer_id, ref, total_credit, available_credit, sales_rep)\n  values (",
            {
                name: "customer_id",
                type: "select",
                definition: "bob",
                display_field: "disp",
                value_field: "id"
            },
            ", 'big $ person', ",
            { name: "credit", type: "integer" },
            ", ",
            { name: "credit", type: "integer" },
            ", ",
            { name: "sales_rep", type: "server" },
            ")"
        ];

    const expected: HDoc = {
        tagIdClass: "div",
        inner: [
            {
                tagIdClass: "div.line",
                attrs: {},
                inner: [
                    {
                        tagIdClass: "span",
                        inner: "insert into orders (customer_id, ref, total_credit, available_credit, sales_rep)",
                        attrs: {}
                    },
                ]
            },
            {
                tagIdClass: "div.line",
                inner: [
                    {
                        tagIdClass: "span",
                        inner: "  values (",
                        attrs: {}
                    },
                    {
                        tagIdClass: "select",
                        inner: [ ],
                        attrs: { name: "customer_id" },
                    },
                    { tagIdClass: "span", inner: ", 'big $ person', ", attrs: {} },
                    { tagIdClass: "input", inner: [ ], attrs: { type: "number", name: "credit" } },
                    { tagIdClass: "span", inner: ", ", attrs: {} },
                    { tagIdClass: "input", inner: [ ], attrs: { type: "number", name: "credit" } },
                    { tagIdClass: "span", inner: ", ", attrs: {} },
                    { tagIdClass: "span", inner: "$sales_rep", attrs: {} },
                    { tagIdClass: "span", inner: ")", attrs: {} },
                ],
                attrs: {},
            }
        ],
        attrs: {}
    };

    assert.deepEqual(
        html(input),
        expected
    );

    assert.end();
});


test('forHyper', (assert) => {

    assert.deepEqual(
        forHyper(
            (ar) => ar.concat(['z']),
            {
                tagIdClass: 'div#x',
                inner: [
                    {
                        tagIdClass: 'span',
                        inner: 'there',
                        attrs: {}
                    }
                ],
                attrs: { value: 'bob' }
            }
        ),
        [
            'div#x',
            [
                [ 'span', 'there', {}, 'z' ]
            ],
            { value: 'bob' },
            'z'
        ]
    );

    assert.end();
});

test('Can removeLineBeginningWhitespace', (assert) => {
    const input = "\
    SELECT\n\
        product_id,\n\
        product_name,\n\
        suppliers.company_name as supplier_name,\n\
        categories.category_name,\n\
        unit_price,\n\
        units_in_stock + units_on_order as available,\n\
        unit_price\n\
    FROM products\n\
    LEFT JOIN categories ON\n\
        categories.category_id = products.category_id\n\
    LEFT JOIN suppliers ON\n\
        suppliers.supplier_id = products.supplier_id\n\
   WHERE LOWER(product_name) LIKE CONCAT('%', LOWER($search_string), '%')" // Last de-indent by one space deliberate.

    const expected = "SELECT\n    product_id,\n    product_name,\n    suppliers.company_name as supplier_name,\n    categories.category_name,\n    unit_price,\n    units_in_stock + units_on_order as available,\n    unit_price\nFROM products\nLEFT JOIN categories ON\n    categories.category_id = products.category_id\nLEFT JOIN suppliers ON\n    suppliers.supplier_id = products.supplier_id\n   WHERE LOWER(product_name) LIKE CONCAT('%', LOWER($search_string), '%')"

    assert.is(removeLineBeginningWhitespace(input), expected);

assert.end();

});

import { stitchSchemas } from '@graphql-tools/stitch';
import { expect } from 'chai';
import { buildSchema, graphql } from 'graphql';
import { conformInfoToSchema, getFieldString, wrapInfo } from '../..';

const product_schema = buildSchema(`
type Product {
  id: Int!
  name: String!
  price: Int!
}

type Query {
  product(id: Int!): Product
}
`);

const order_schema = buildSchema(`
type Order {
  id: Int!
  product_id: Int!
}

type Query {
  order(id: Int!): Order
}
`);

const user_schema = buildSchema(`
type User {
  id: Int!
  order_id: Int!
}

type Query {
  user(id: Int!): User
}
`);

describe('conformInfoToSchema', () => {
  it('omit unknown field', async () => {
    let user_called = false;
    let order_called = false;
    let product_called = false;
    const merged_schema = stitchSchemas({
      resolvers: {
        Order: {
          product: {
            resolve(source, args, context, info) {
              expect(product_called).to.eql(false);
              product_called = true;
              expect(getFieldString(info)).to.eql('name price');
              return {
                name: 'Product',
                price: 100,
              };
            },
          },
        },
        Query: {
          user: {
            resolve(source, args, context, info) {
              expect(user_called).to.eql(false);
              user_called = true;
              expect(getFieldString(info)).to.eql('id order_id order { product_id product { name price } }');
              return {
                id: 1,
                order_id: 2,
              };
            },
          },
        },
        User: {
          order: {
            resolve(source, args, context, info) {
              expect(order_called).to.eql(false);
              order_called = true;
              expect(getFieldString(info)).to.eql('product_id product { name price }');
              const conformed = conformInfoToSchema(info, order_schema);
              expect(getFieldString(conformed)).to.eql('product_id');
              return {
                product_id: 3,
              };
            },
          },
        },
      },
      subschemas: [
        product_schema,
        order_schema,
        user_schema,
      ],
      typeDefs: `
        extend type Order {
          product: Product!
        }
        extend type User {
          order: Order!
        }`,
    });
    const query = '{ user(id: 1) { id order_id order { product_id product { name price } } } }';
    const result = await graphql(merged_schema, query, {}, {}, {});
    expect(result).to.eql({
      data: {
        user: {
          id: 1,
          order: {
            product: {
              name: 'Product',
              price: 100,
            },
            product_id: 3,
          },
          order_id: 2,
        },
      },
    });
    expect(user_called).to.eql(true);
    expect(order_called).to.eql(true);
    expect(product_called).to.eql(true);
  });

  it('process fragment', async () => {
    let user_called = false;
    let order_called = false;
    let product_called = false;
    const merged_schema = stitchSchemas({
      resolvers: {
        Order: {
          product: {
            fragment: '... on Order { product_id }',
            resolve(source, args, context, info) {
              expect(product_called).to.eql(false);
              product_called = true;
              expect(getFieldString(info)).to.eql('name price');
              return {
                name: 'Product',
                price: 100,
              };
            },
          },
        },
        Query: {
          user: {
            resolve(source, args, context, info) {
              expect(user_called).to.eql(false);
              user_called = true;
              expect(getFieldString(info)).to.eql('order { product { name price } }');
              return {
                id: 1,
                order_id: 2,
              };
            },
          },
        },
        User: {
          order: {
            resolve(source, args, context, info) {
              expect(order_called).to.eql(false);
              order_called = true;
              expect(getFieldString(info)).to.eql('product { name price }');
              const conformed = conformInfoToSchema(info, order_schema);
              expect(getFieldString(conformed)).to.eql('... on Order { product_id }');
              return {
                product_id: 3,
              };
            },
          },
        },
      },
      subschemas: [
        product_schema,
        order_schema,
        user_schema,
      ],
      typeDefs: `
        extend type Order {
          product: Product!
        }
        extend type User {
          order: Order!
        }`,
    });
    const query = '{ user(id: 1) { order { product { name price } } } }';
    const result = await graphql(merged_schema, query, {}, {}, {});
    expect(result).to.eql({
      data: {
        user: {
          order: {
            product: {
              name: 'Product',
              price: 100,
            },
          },
        },
      },
    });
    expect(user_called).to.eql(true);
    expect(order_called).to.eql(true);
    expect(product_called).to.eql(true);
  });

  it('process fragment with other field name', async () => {
    let user_called = false;
    let order_called = false;
    let product_called = false;
    const merged_schema = stitchSchemas({
      resolvers: {
        Order: {
          product: {
            fragment: '... on Order { product_id }',
            resolve(source, args, context, info) {
              expect(product_called).to.eql(false);
              product_called = true;
              expect(getFieldString(info)).to.eql('name price');
              return {
                name: 'Product',
                price: 100,
              };
            },
          },
        },
        Query: {
          user: {
            resolve(source, args, context, info) {
              expect(user_called).to.eql(false);
              user_called = true;
              expect(getFieldString(info)).to.eql('my_order { product { name price } }');
              return {
                id: 1,
                order_id: 2,
              };
            },
          },
        },
        User: {
          my_order: {
            resolve(source, args, context, info) {
              expect(order_called).to.eql(false);
              order_called = true;
              expect(getFieldString(info)).to.eql('product { name price }');
              const conformed = conformInfoToSchema(info, order_schema, 'order');
              expect(getFieldString(conformed)).to.eql('... on Order { product_id }');
              return {
                product_id: 3,
              };
            },
          },
        },
      },
      subschemas: [
        product_schema,
        order_schema,
        user_schema,
      ],
      typeDefs: `
        extend type Order {
          product: Product!
        }
        extend type User {
          my_order: Order!
        }`,
    });
    const query = '{ user(id: 1) { my_order { product { name price } } } }';
    const result = await graphql(merged_schema, query, {}, {}, {});
    expect(result).to.eql({
      data: {
        user: {
          my_order: {
            product: {
              name: 'Product',
              price: 100,
            },
          },
        },
      },
    });
    expect(user_called).to.eql(true);
    expect(order_called).to.eql(true);
    expect(product_called).to.eql(true);
  });

  it('wrap', async () => {
    let user_called = false;
    let order_called = false;
    let product_called = false;
    const merged_schema = stitchSchemas({
      resolvers: {
        Order: {
          product: {
            resolve(source, args, context, info) {
              expect(product_called).to.eql(false);
              product_called = true;
              expect(getFieldString(info)).to.eql('name price');
              return {
                name: 'Product',
                price: 100,
              };
            },
          },
        },
        Query: {
          user: {
            resolve(source, args, context, info) {
              expect(user_called).to.eql(false);
              user_called = true;
              expect(getFieldString(info)).to.eql('id order_id order { product_id product { name price } }');
              return {
                id: 1,
                order_id: 2,
              };
            },
          },
        },
        User: {
          order: {
            resolve(source, args, context, info) {
              expect(order_called).to.eql(false);
              order_called = true;
              expect(getFieldString(info)).to.eql('product_id product { name price }');
              const conformed = wrapInfo(info).conformToSchema(order_schema);
              expect(getFieldString(conformed)).to.eql('product_id');
              return {
                product_id: 3,
              };
            },
          },
        },
      },
      subschemas: [
        product_schema,
        order_schema,
        user_schema,
      ],
      typeDefs: `
        extend type Order {
          product: Product!
        }
        extend type User {
          order: Order!
        }`,
    });
    const query = '{ user(id: 1) { id order_id order { product_id product { name price } } } }';
    const result = await graphql(merged_schema, query, {}, {}, {});
    expect(result).to.eql({
      data: {
        user: {
          id: 1,
          order: {
            product: {
              name: 'Product',
              price: 100,
            },
            product_id: 3,
          },
          order_id: 2,
        },
      },
    });
    expect(user_called).to.eql(true);
    expect(order_called).to.eql(true);
    expect(product_called).to.eql(true);
  });
});

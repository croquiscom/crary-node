import { convertToGraphQLError } from '../..';
import { expect } from 'chai';
import { GraphQLError } from 'graphql';

describe('convertToGraphQLError', () => {
  it('기본', () => {
    const error = convertToGraphQLError({ message: 'User does not exist' });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({});
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).code).to.be.undefined;
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).ignorable).to.be.undefined;
  });

  it('extensions', () => {
    const error = convertToGraphQLError({ message: 'User does not exist', extensions: { status: 404 } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ status: 404 });
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).code).to.be.undefined;
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).ignorable).to.be.undefined;
  });

  it('code', () => {
    const error = convertToGraphQLError({ message: 'User does not exist', extensions: { code: 'user_not_found' } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ code: 'user_not_found' });
    expect((error as any).code).to.eql('user_not_found');
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).ignorable).to.be.undefined;
  });

  it('ignorable', () => {
    const error = convertToGraphQLError({ message: 'User does not exist', extensions: { ignorable: true } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ ignorable: true });
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).code).to.be.undefined;
    // tslint:disable-next-line: no-unused-expression
    expect((error as any).ignorable).to.be.true;
  });
});

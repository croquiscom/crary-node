import { expect } from 'chai';
import { GraphQLError } from 'graphql';
import { convertToCraryGraphQLError } from '../..';

describe('convertToCraryGraphQLError', () => {
  it('기본', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist' });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({});
    expect(error.code).to.be.undefined;
    expect(error.ignorable).to.be.undefined;
  });

  it('extensions', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist', extensions: { status: 404 } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ status: 404 });
    expect(error.code).to.be.undefined;
    expect(error.ignorable).to.be.undefined;
  });

  it('code', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist', extensions: { code: 'user_not_found' } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ code: 'user_not_found' });
    expect(error.code).to.eql('user_not_found');
    expect(error.ignorable).to.be.undefined;
  });

  it('ignorable', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist', extensions: { ignorable: true } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ ignorable: true });
    expect(error.code).to.be.undefined;
    expect(error.ignorable).to.be.true;
  });
});

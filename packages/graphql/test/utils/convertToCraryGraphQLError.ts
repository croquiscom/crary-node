import { expect } from 'chai';
import { GraphQLError } from 'graphql';
import { convertToCraryGraphQLError } from '../..';

describe('convertToCraryGraphQLError', () => {
  it('기본', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist' });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({});
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.code).to.be.undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.ignorable).to.be.undefined;
  });

  it('extensions', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist', extensions: { status: 404 } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.code).to.be.undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.ignorable).to.be.undefined;
  });

  it('code', () => {
    const error = convertToCraryGraphQLError({
      message: 'User does not exist',
      extensions: { code: 'user_not_found' },
    });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ code: 'user_not_found' });
    expect(error.code).to.eql('user_not_found');
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.ignorable).to.be.undefined;
  });

  it('ignorable', () => {
    const error = convertToCraryGraphQLError({ message: 'User does not exist', extensions: { ignorable: true } });
    expect(error).to.instanceOf(GraphQLError);
    expect(error.message).to.eql('User does not exist');
    expect(error.extensions).to.eql({ ignorable: true });
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.code).to.be.undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(error.ignorable).to.be.true;
  });
});

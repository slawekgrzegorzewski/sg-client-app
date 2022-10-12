import {Account} from './account';

describe('account', function () {
  it('empty constructor', function () {
    const account = new Account();
    expect(account.id).toEqual(0);
    expect(account.name).toEqual('');
    expect(account.currency).toEqual('');
    expect(account.currentBalance).toEqual(0);
    expect(account.balanceIndex).toEqual(0);
    expect(account.domain).toBeDefined();
    expect(account.domain.id).toEqual(0);
    expect(account.domain.name).toEqual('')
  });
});

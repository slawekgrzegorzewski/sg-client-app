import {Domain} from './domain';

describe('domain', function() {
  it('empty constructor', function() {
    const domain = new Domain();
    expect(domain.id).toEqual(0);
    expect(domain.name).toEqual('');
  });
  it('constructor with one parameter', function() {
    let domain = new Domain({id: 1});
    expect(domain.id).toEqual(1);
    expect(domain.name).toEqual('');
    domain = new Domain({name: 'name'});
    expect(domain.id).toEqual(0);
    expect(domain.name).toEqual('name');
  });
  it('full constructor', function() {
    let domain = new Domain({id: 1, name: 'name'});
    expect(domain.id).toEqual(1);
    expect(domain.name).toEqual('name');
  });
});

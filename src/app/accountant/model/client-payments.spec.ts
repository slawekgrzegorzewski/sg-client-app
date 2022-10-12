import {ClientPayment} from './client-payment';

describe('client payment', function() {
  it('check date', function() {
    const clientPayment = new ClientPayment({
      id: 8396,
      client: {
        id: 4032,
        name: 'Lucyna',
        domain: {
          id: 4019,
          name: 'Mobi Pet Care'
        }
      },
      date: '2021-05-04',
      price: 90,
      currency: 'PLN',
      billOfSale: true,
      billOfSaleAsInvoice: false,
      invoice: false,
      notRegistered: false,
      serviceRelations: [
        {
          id: 8441,
          performedServiceId: 6351,
          clientPaymentId: 8396,
          date: '2021-05-04',
          price: 45,
          currency: 'PLN',
          billOfSale: true,
          billOfSaleAsInvoice: false,
          invoice: false,
          notRegistered: false
        },
        {
          id: 8442,
          performedServiceId: 6357,
          clientPaymentId: 8396,
          date: '2021-05-04',
          price: 45,
          currency: 'PLN',
          billOfSale: true,
          billOfSaleAsInvoice: false,
          invoice: false,
          notRegistered: false
        }
      ],
      domain: {
        id: 4019,
        name: 'Mobi Pet Care'
      }
    });
    expect(clientPayment.date).toEqual(new Date('2021-05-04'));
  });
});

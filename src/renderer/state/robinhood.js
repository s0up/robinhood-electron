import util from '@/util/util';

export default {
  namespaced: true,

  state: {
    positions: [],
    nextPosition: null,
    previousPosition: null,
    quotes: [],
    instruments: [],
    resources: [],
    recentOrders: [],
    nextOrder: null,
    previousOrder: null,
    accounts: [],
    account: null,
    news: [],
    ACHTransfers: [],
    automaticACHTransfers: [],
    ACHRelationships: [],
    robinhoodUser: {},
    markets: null,
    historicals: [],
    tickerHistoricals: [],
    searchResults: [],
    watchlists: [],
    cards: []
  },

  actions: {
    /*
    account_number - Required: true
    interval - Required: false (Valid Values: week,day,10minute,5minute)
    span - Required: false (Valid Values: day,week,year,5year,all)
    */
    async search(state, query){
      try{
        state.commit('setSearchResults', []);

        let data = await util.post('/robinhood/getInstruments', {query: query});

        state.commit('setSearchResults', data.result.results);

        return;
      }catch(e){
        throw e;
      }
    },

    async getHistoricals(state, opts) {
      try {
        let historicals = await util.post('/robinhood/getHistoricals', {
          opts: opts
        });

        state.commit('addHistorical', historicals.result);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getTickerHistoricals(state, opts){
      try{
        let historicals = await util.post('/robinhood/getTickerHistoricals', {
          opts: opts
        });

        state.commit('addTickerHistorical', historicals.result);

        return;
      }catch(e){
        throw e;
      }
    },

    async getPositions(state, resource) {
      try {
        let data = null;

        if (typeof resource === 'undefined' || resource === null) {
          data = await util.post('/robinhood/getPositions');
        } else {
          data = await util.post('/robinhood/getPositions', {
            resource: resource
          });
        }

        state.commit('setNextPosition', data.result.next);
        state.commit('setPrevousPosition', data.result.previous);
        state.commit('setPositions', data.result.results);

        data.result.instruments.forEach(function(instrument) {
          state.commit('addInstrument', instrument);
        });

        data.result.quotes.forEach(function(quote) {
          state.commit('addQuote', quote);
        });

        return;
      } catch (e) {
        state.commit('setNextPosition', null);
        state.commit('setPrevousPosition', null);
        state.commit('setPositions', null);

        throw e;
      }
    },

    async getQuote(state, symbol) {
      try {
        let quote = await util.post('/robinhood/getQuote', {
          symbol: symbol
        });

        quote.result.instruments.forEach(function(instrument) {
          state.commit('addInstrument', instrument);
        });

        state.commit('addQuote', quote.result);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getResource(state, resource) {
      try {
        let data = await util.post('/robinhood/getResource', {
          resource: resource
        });

        data.result.url = resource;

        state.commit('addResource', data.result);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getRecentOrders(state, resource) {
      try {
        let orders = null;

        if (typeof resource === 'undefined' || resource === null) {
          orders = await util.post('/robinhood/getRecentOrders');
        } else {
          orders = await util.post('/robinhood/getRecentOrders', {
            resource: resource
          });
        }

        state.commit('setNextOrder', orders.result.next);
        state.commit('setPreviousOrder', orders.result.previous);
        state.commit('setRecentOrders', orders.result.results);

        orders.result.instruments.forEach(function(instrument) {
          state.commit('addInstrument', instrument);
        });

        return;
      } catch (e) {
        state.commit('setNextOrder', false);
        state.commit('setPreviousOrder', false);
        state.commit('setRecentOrders', null);

        throw e;
      }
    },

    async cancelOrder(state, order) {
      try {
        await util.post('/robinhood/postResource', {
          resource: order
        });

        return true;
      } catch (e) {
        throw e;
      }
    },

    async getAccounts(state) {
      try {
        let accounts = await util.post('/robinhood/getAccounts');

        state.commit('setAccounts', accounts.result.results);

        return true;
      } catch (e) {
        state.commit('setAccounts', []);

        throw e;
      }
    },

    async getUser(state) {
      try {
        let robinhoodUser = await util.post('/robinhood/getUser');

        state.commit('setRobinhoodUser', robinhoodUser.result);

        return;
      } catch (e) {
        state.commit('setRobinhoodUser', {});

        throw e;
      }
    },

    async getNews(state, symbol) {
      try {
        let newsResult = await util.post('/robinhood/getResource', {
          resource: 'https://api.robinhood.com/midlands/news/' + symbol + '/'
        });

        let news = newsResult.result;
        news.symbol = symbol;

        state.commit('addNews', news);

        return;
      } catch (e) {
        throw e;
      }
    },

    async placeOrder(state, order) {
      try {
        await util.post('/robinhood/placeOrder', {
          order: order
        });

        return;
      } catch (e) {
        throw e;
      }
    },

    async getACHRelationships(state) {
      try {
        let relationships = await util.post('/robinhood/getACHRelationships');

        state.commit('setACHRelationships', relationships.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async ACHTransfer(state, transfer) {
      try {
        await util.post('/robinhood/ACHTransfer', {
          transfer: transfer
        });

        return;
      } catch (e) {
        throw e;
      }
    },

    async getACHTransfers(state) {
      try {
        let transfers = await util.post('/robinhood/getACHTransfers');

        state.commit('setACHTransfers', transfers.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getAutomaticACHTransfers(state) {
      try {
        let transfers = await util.post('/robinhood/getAutomaticACHTransfers');

        state.commit('setAutomaticACHTransfers', transfers.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getMarkets(state) {
      try {
        let markets = await util.post('/robinhood/getMarkets');

        state.commit('setMarkets', markets.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getWatchlists(state){
      try{
        let watchlist = await util.post('/robinhood/getWatchlists');

        state.commit('setWatchlists', watchlist.result.results);

        return;
      }catch(e){
        throw e;
      }
    },

    async getCards(state){
      try{
        let cards = await util.post('/robinhood/getCards');

        state.commit('setCards', cards.result.results);

        return;
      }catch(e){
        throw e;
      }
    },

    async dismissCard(state, card){
      try{
        await util.post('/robinhood/dismissCard', {id: card});

        return;
      }catch(e){
        throw e;
      }
    }
  },

  mutations: {
    setRobinhoodUser: function(state, robinhoodUser) {
      state.robinhoodUser = robinhoodUser;
    },

    setPositions: function(state, positions) {
      state.positions = positions;
    },

    setNextPosition: function(state, position) {
      state.nextPosition = position;
    },

    setPrevousPosition: function(state, position) {
      state.previousPosition = position;
    },

    setQuotes: function(state, quotes) {
      state.quotes = quotes;
    },

    addHistorical: function(state, historical) {
      let existingHistorical = state.historicals.findIndex(item => {
        return item.span == historical.span && item.interval == historical.interval;
      });

      if (existingHistorical != -1) {
        state.historicals.splice(existingHistorical, 1);
      }

      state.historicals.push(historical);
    },

    addTickerHistorical: function(state, historical){

      let existingHistorical = state.tickerHistoricals.findIndex(item => {
        return item.symbol == historical.symbol && item.interval == historical.interval && item.span == historical.span;
      });

      if(existingHistorical != -1){
        state.tickerHistoricals.splice(existingHistorical, 1);
      }

      state.tickerHistoricals.push(historical);
    },

    addQuote: function(state, quote) {
      let existingQuote = state.quotes.findIndex(item => {
        return item.symbol == quote.symbol;
      });

      if (existingQuote != -1) {
        state.quotes.splice(existingQuote, 1);
      }

      state.quotes.push(quote);
    },

    addInstrument: function(state, instrument) {
      let existingInstrument = state.quotes.findIndex(item => {
        return item.url == instrument.url;
      });

      if (existingInstrument != -1) {
        state.instruments.splice(existingInstrument, 1);
      }

      state.instruments.push(instrument);
    },

    addResource: function(state, resource) {
      let existingResource = state.resources.findIndex(function(r) {
        return r.url == resource.url;
      });

      if (existingResource !== -1) {
        state.resources.splice(existingResource, 1);
      }

      state.resources.push(resource);
    },

    setNextOrder: function(state, order) {
      state.nextOrder = order;
    },

    setPreviousOrder: function(state, order) {
      state.previousOrder = order;
    },

    setRecentOrders: function(state, recentOrders) {
      state.recentOrders = recentOrders;
    },

    setAccount: function(state, account) {
      state.account = account.account_number;
    },

    setAccounts: function(state, accounts) {
      if (state.account === null && accounts.length > 0)
        state.account = accounts[0].account_number;

      state.accounts = accounts;
    },

    addNews: function(state, news) {
      let existingNews = state.news.find(function(i) {
        return i.symbol == news.symbol;
      });

      if (typeof existingNews !== 'undefined') {
        return;
      }

      state.news.push(news);
    },

    setACHTransfers: function(state, ACHTransfers) {
      state.ACHTransfers = ACHTransfers;
    },

    setAutomaticACHTransfers: function(state, automaticACHTransfers) {
      state.automaticACHTransfers = automaticACHTransfers;
    },

    setACHRelationships: function(state, ACHRelationships) {
      state.ACHRelationships = ACHRelationships;
    },

    setMarkets: function(state, markets) {
      state.markets = markets;
    },

    setSearchResults: (state, results) => {
      state.searchResults = results;
    },

    setWatchlists: (state, watchlists) => {
      state.watchlists = watchlists;
    },

    setCards: (state, cards) => {
      state.cards = cards;
    }
  },

  getters: {
    robinhoodUser: function(state) {
      return state.robinhoodUser;
    },

    positions: function(state) {
      return state.positions;
    },

    nextPosition: function(state) {
      return state.nextPosition;
    },

    previousPosition: function(state) {
      return state.previousPosition;
    },

    quotes: function(state) {
      return state.quotes;
    },

    quote: function(state) {
      return symbol => state.quotes.find(item => {
        return item.symbol == symbol;
      });
    },

    instrument: function(state) {
      return url => state.instruments.find(instrument => {
        return instrument.url === url;
      });
    },

    resource: function(state) {
      return url => state.resources.find(resource => {
        return resource.url == url;
      });
    },

    nextOrder: function(state) {
      return state.nextOrder;
    },

    previousOrder: function(state) {
      return state.previousOrder;
    },

    recentOrders: function(state) {
      return state.recentOrders;
    },

    accounts: function(state) {
      return state.accounts;
    },

    account: function(state) {
      return accountId => state.accounts.find(account => {
        return account.account_number == accountId;
      });
    },

    currentAccount: function(state) {
      return state.accounts.find(account => {
        return account.account_number == state.account;
      });
    },

    news: function(state) {
      return symbol => state.news.find(newsItem => {
        return newsItem.symbol == symbol;
      });
    },

    ACHTransfers: function(state) {
      return state.ACHTransfers;
    },

    automaticACHTransfers: function(state) {
      return state.automaticACHTransfers;
    },

    ACHRelationships: function(state) {
      return state.ACHRelationships;
    },

    markets: function(state) {
      return state.markets;
    },

    market: function(state) {
      return acronym => state.markets.find(market => {
        return market.acronym == acronym;
      });
    },

    historical: function(state) {
      return opts => state.historicals.find(historical => {
        return opts.interval == historical.interval && opts.span == historical.span;
      });
    },

    tickerHistorical: function(state){
      return opts => state.tickerHistoricals.find(historical => {
        return opts.symbol == historical.symbol && opts.interval == historical.interval && opts.span == historical.span;
      });
    },

    searchResults: (state) => {
      return state.searchResults;
    },

    watchlists: (state) => state.watchlists,
    cards: (state) => state.cards
  }
}

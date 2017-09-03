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
    watchlistData: [],
    cards: []
  },

  actions: {
    /*
    account_number - Required: true
    interval - Required: false (Valid Values: week,day,10minute,5minute)
    span - Required: false (Valid Values: day,week,year,5year,all)
    */
    async search(state, query) {
      try {
        state.commit('setSearchResults', []);

        const data = await util.post('/robinhood/getInstruments', { query });

        state.commit('setSearchResults', data.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getHistoricals(state, opts) {
      try {
        const tmpOpt = Object.assign({}, opts);

        if (opts.span === 'month' || opts.span === '3month') {
          tmpOpt.span = 'year';
        }

        const historicals = await util.post('/robinhood/getHistoricals', {
          opts: tmpOpt
        });

        historicals.result.span = opts.span;
        // because when its '', it might come back with a default value
        historicals.result.interval = opts.interval;

        state.commit('addHistorical', historicals.result);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getTickerHistoricals(state, opts) {
      try {
        const tmpOpt = Object.assign({}, opts);

        if (opts.span === 'month' || opts.span === '3month') {
          tmpOpt.span = 'year';
        }

        const historicals = await util.post('/robinhood/getTickerHistoricals', {
          opts: tmpOpt
        });

        // because when its '', it might come back with a default value
        historicals.result.span = opts.span;
        historicals.result.interval = opts.interval;

        state.commit('addTickerHistorical', historicals.result);

        return;
      } catch (e) {
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
            resource
          });
        }

        state.commit('setNextPosition', data.result.next);
        state.commit('setPrevousPosition', data.result.previous);
        state.commit('setPositions', data.result.results);

        data.result.instruments.forEach((instrument) => {
          state.commit('addInstrument', instrument);
        });

        data.result.quotes.forEach((quote) => {
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
        const quote = await util.post('/robinhood/getQuote', {
          symbol
        });

        quote.result.instruments.forEach((instrument) => {
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
        const data = await util.post('/robinhood/getResource', {
          resource
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
            resource
          });
        }

        state.commit('setNextOrder', orders.result.next);
        state.commit('setPreviousOrder', orders.result.previous);
        state.commit('setRecentOrders', orders.result.results);

        orders.result.instruments.forEach((instrument) => {
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
        const accounts = await util.post('/robinhood/getAccounts');

        accounts.result.results.forEach((account) => {
          const {
            type,
            cash_balances,
            margin_balances
          } = account;

          if (type === 'cash') {
            account.computed_buying_power = cash_balances.buying_power;
          } else {
            const temp = Number(margin_balances.overnight_buying_power)
              / Number(margin_balances.overnight_ratio);

            if (Number(margin_balances.margin_limit) === 0) {
              account.computed_buying_power = temp;
            } else {
              account.computed_buying_power = Math.min(
                temp, Number(margin_balances.unallocated_margin_cash)
              );
            }
          }
        });

        state.commit('setAccounts', accounts.result.results);

        return true;
      } catch (e) {
        state.commit('setAccounts', []);

        throw e;
      }
    },

    async getUser(state) {
      try {
        const robinhoodUser = await util.post('/robinhood/getUser');

        state.commit('setRobinhoodUser', robinhoodUser.result);

        return;
      } catch (e) {
        state.commit('setRobinhoodUser', {});

        throw e;
      }
    },

    async getNews(state, symbol) {
      try {
        const newsResult = await util.post('/robinhood/getResource', {
          resource: `https://api.robinhood.com/midlands/news/${symbol}/`
        });

        const news = newsResult.result;
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
          order
        });

        return;
      } catch (e) {
        throw e;
      }
    },

    async getACHRelationships(state) {
      try {
        const relationships = await util.post('/robinhood/getACHRelationships');

        state.commit('setACHRelationships', relationships.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async ACHTransfer(state, transfer) {
      try {
        await util.post('/robinhood/ACHTransfer', {
          transfer
        });

        return;
      } catch (e) {
        throw e;
      }
    },

    async getACHTransfers(state) {
      try {
        const transfers = await util.post('/robinhood/getACHTransfers');

        state.commit('setACHTransfers', transfers.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getAutomaticACHTransfers(state) {
      try {
        const transfers = await util.post('/robinhood/getAutomaticACHTransfers');

        state.commit('setAutomaticACHTransfers', transfers.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getMarkets(state) {
      try {
        const markets = await util.post('/robinhood/getMarkets');

        state.commit('setMarkets', markets.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getWatchlists(state) {
      try {
        const watchlist = await util.post('/robinhood/getWatchlists');

        state.commit('setWatchlists', watchlist.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async getWatchlist(state, url) {
      try {
        const watchlist = await util.post('/robinhood/getWatchlist', { watchlist: url });

        watchlist.result.url = url;

        state.commit('addWatchlistData', watchlist.result);

        watchlist.result.instruments.forEach((result) => {
          state.commit('addInstrument', result);
        });

        watchlist.result.quotes.forEach((result) => {
          state.commit('addQuote', result);
        });

        return watchlist;
      } catch (e) {
        throw e;
      }
    },

    async getCards(state) {
      try {
        const cards = await util.post('/robinhood/getCards');

        state.commit('setCards', cards.result.results);

        return;
      } catch (e) {
        throw e;
      }
    },

    async dismissCard(state, card) {
      try {
        await util.post('/robinhood/dismissCard', { id: card });

        return;
      } catch (e) {
        throw e;
      }
    }
  },

  mutations: {
    setRobinhoodUser(state, robinhoodUser) {
      state.robinhoodUser = robinhoodUser;
    },

    setPositions(state, positions) {
      state.positions = positions;
    },

    setNextPosition(state, position) {
      state.nextPosition = position;
    },

    setPrevousPosition(state, position) {
      state.previousPosition = position;
    },

    setQuotes(state, quotes) {
      state.quotes = quotes;
    },

    addHistorical(state, historical) {
      const existingHistorical = state.historicals.findIndex(
        item => item.span === historical.span && item.interval === historical.interval
      );

      if (existingHistorical !== -1) {
        state.historicals.splice(existingHistorical, 1);
      }

      state.historicals.push(historical);
    },

    addTickerHistorical(state, historical) {
      const existingHistorical = state.tickerHistoricals.findIndex(
        item => item.symbol === historical.symbol
          && item.interval === historical.interval
          && item.span === historical.span
      );

      if (existingHistorical !== -1) {
        state.tickerHistoricals.splice(existingHistorical, 1);
      }

      state.tickerHistoricals.push(historical);
    },

    addQuote(state, quote) {
      const existingQuote = state.quotes.findIndex(item => item.symbol === quote.symbol);

      if (existingQuote !== -1) {
        state.quotes.splice(existingQuote, 1);
      }

      state.quotes.push(quote);
    },

    addInstrument(state, instrument) {
      const existingInstrument = state.quotes.findIndex(item => item.url === instrument.url);

      if (existingInstrument !== -1) {
        state.instruments.splice(existingInstrument, 1);
      }

      state.instruments.push(instrument);
    },

    addResource(state, resource) {
      const existingResource = state.resources.findIndex(r => r.url === resource.url);

      if (existingResource !== -1) {
        state.resources.splice(existingResource, 1);
      }

      state.resources.push(resource);
    },

    setNextOrder(state, order) {
      state.nextOrder = order;
    },

    setPreviousOrder(state, order) {
      state.previousOrder = order;
    },

    setRecentOrders(state, recentOrders) {
      state.recentOrders = recentOrders;
    },

    setAccount(state, account) {
      state.account = account.account_number;
    },

    setAccounts(state, accounts) {
      if (state.account === null && accounts.length > 0) {
        state.account = accounts[0].account_number;
      }

      state.accounts = accounts;
    },

    addNews(state, news) {
      const existingNews = state.news.find(i => i.symbol === news.symbol);

      if (typeof existingNews !== 'undefined') {
        return;
      }

      state.news.push(news);
    },

    setACHTransfers(state, ACHTransfers) {
      state.ACHTransfers = ACHTransfers;
    },

    setAutomaticACHTransfers(state, automaticACHTransfers) {
      state.automaticACHTransfers = automaticACHTransfers;
    },

    setACHRelationships(state, ACHRelationships) {
      state.ACHRelationships = ACHRelationships;
    },

    setMarkets(state, markets) {
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
    },

    addWatchlistData: (state, watchlistData) => {
      const existingItem = state.watchlistData.findIndex(item => item.url === watchlistData.url);

      if (existingItem) {
        state.watchlistData.splice(existingItem, 1);
      }

      state.watchlistData.push(watchlistData);
    }
  },

  getters: {
    robinhoodUser(state) {
      return state.robinhoodUser;
    },

    positions(state) {
      return state.positions;
    },

    nextPosition(state) {
      return state.nextPosition;
    },

    previousPosition(state) {
      return state.previousPosition;
    },

    quotes(state) {
      return state.quotes;
    },

    quote(state) {
      return symbol => state.quotes.find(item => item.symbol === symbol);
    },

    instrument(state) {
      return url => state.instruments.find(instrument => instrument.url === url);
    },

    resource(state) {
      return url => state.resources.find(resource => resource.url === url);
    },

    resources(state) {
      return state.resources;
    },

    nextOrder(state) {
      return state.nextOrder;
    },

    previousOrder(state) {
      return state.previousOrder;
    },

    recentOrders(state) {
      return state.recentOrders;
    },

    accounts(state) {
      return state.accounts;
    },

    account(state) {
      return accountId => state.accounts.find(account => account.account_number === accountId);
    },

    currentAccount(state) {
      return state.accounts.find(account => account.account_number === state.account);
    },

    news(state) {
      return symbol => state.news.find(newsItem => newsItem.symbol === symbol);
    },

    ACHTransfers(state) {
      return state.ACHTransfers;
    },

    automaticACHTransfers(state) {
      return state.automaticACHTransfers;
    },

    ACHRelationships(state) {
      return state.ACHRelationships;
    },

    markets(state) {
      return state.markets;
    },

    market(state) {
      return acronym => state.markets.find(market => market.acronym === acronym);
    },

    historical(state) {
      return opts => state.historicals.find(
        historical => opts.interval === historical.interval && opts.span === historical.span
      );
    },

    tickerHistorical(state) {
      return opts => state.tickerHistoricals.find(
        historical => opts.symbol === historical.symbol
          && opts.interval === historical.interval
          && opts.span === historical.span
      );
    },

    searchResults: state => state.searchResults,

    watchlistData: state => url => state.watchlistData.find(item => item.url === url),

    watchlists: state => state.watchlists,
    cards: state => state.cards
  }
};

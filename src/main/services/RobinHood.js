"use strict";

const RobinhoodAPI = require('robinhood-api');

export default class{
  constructor(){
    this.api = new RobinhoodAPI();
    this.context = this;
  }

  async connect(username, password){
    try{
      if(typeof this.api.token == 'undefined' || this.api.token == null){
        let loginResult = await this.api.login({username: username, password: password});
      }

      return true;
    }catch(e){
      throw e;
    }
  }

  async getPortfolio(accountId){
    try{
      return await this.api.getPortfolio(accountId);
    }catch(e){
      throw e;
    }
  }

  async getHistoricals(opts){
    try{
      return await this.api.getHistoricals(opts);
    }catch(e){
      throw e;
    }
  }

  async getTickerHistoricals(opts){
    try{
      return await this.api.getTickerHistoricals(opts);
    }catch(e){
      throw e;
    }
  }

  async getInstruments(opts){
    try{
      return await this.api.getInstruments({query: opts});
    }catch(e){
      throw e;
    }
  }

  async getPositions(resource){
    try{
      let positionData = null;
      let self = this;

      if(typeof resource === 'undefined' || resource === null){
        positionData = await self.api.getPositions({nonzero: true});
      }else{
        positionData = await self.api.getResource(resource);
      }

      positionData.quotes = [];
      positionData.instruments = [];

      let promises = [];

      if(positionData.results.length > 0){
        for(let result of positionData.results){
          promises.push((async () => {
            let instrument = await self.api.getResource(result['instrument']);

            positionData.instruments.push(instrument);

            if('quote' in instrument){
              positionData.quotes.push(await self.api.getResource(instrument['quote']));
            }

            return;
          })());
        }
      }

      await Promise.all(promises);

      return positionData;
    }catch(e){
      throw e;
    }
  }

  async getRecentOrders(resource){
    try{
      let orderData = null;
      let self = this;

      if(typeof resource === 'undefined' || resource === null){
        orderData = await self.api.getRecentOrders();
      }else{
        orderData = await self.api.getResource(resource);
      }

      let promises = [];
      orderData.instruments = [];

      if(orderData.results.length > 0){
        for(let result of orderData.results){
          promises.push((async () => {
            orderData.instruments.push(await self.api.getResource(result['instrument']));

            return;
          })());
        }
      }

      await Promise.all(promises);

      return orderData;
    }catch(e){
      throw e;
    }
  }

  async getQuote(symbol){
    try{
      let quote = await this.api.getQuote({symbol: symbol});

      quote.instruments = [];

      if('instrument' in quote){
        quote.instruments.push(await this.api.getResource(quote['instrument']));
      }

      return quote;
    }catch(e){
      throw e;
    }
  }

  async getUser(){
    try{
      return await this.api.getUserData();
    }catch(e){
      throw e;
    }
  }

  async placeOrder(order){
    try{
      return await this.api.placeOrder(order);
    }catch(e){
      throw e;
    }
  }


  async getQuotes(symbols){
    try{
      return await this.api.getQuotes({symbols: symbols});
    }catch(e){
      throw e;
    }
  }

  async getACHRelationships(){
    try{
      return await this.api.getACHRelationships();
    }catch(e){
      throw e;
    }
  }

  async getACHTransfers(){
    try{
      return await this.api.getACHTransfer();
    }catch(e){
      throw e;
    }
  }

  async getAutomaticACHTransfers(){
    try{
      return await this.api.getAutomaticACHTransfer();
    }catch(e){
      throw e;
    }
  }

  async ACHTransfer(transfer){
    try{
      return await this.api.ACHTransfer(transfer);
    }catch(e){
      throw e;
    }
  }

  async automaticACHTransfer(transfer){
    try{
      return await this.api.automaticACHTransfer(transfer);
    }catch(e){
      throw e;
    }
  }

  async getAccounts(){
    try{
      return await this.api.getAccounts();
    }catch(e){
      throw e;
    }
  }


  async postResource(resource){
    try{
      return await this.api.postResource(resource);
    }catch(e){
      throw e;
    }
  }

  async getResource(resource){
    try{
      return await this.api.getResource(resource);
    }catch(e){
      throw e;
    }
  }

  async getMarkets(){
    try{
      let markets = await this.api.getMarkets();
      let promises = [];

      for(let market of markets.results){
        if('todays_hours' in market){
          promises.push((async () => {
            market['todays_hours'] = await this.api.getResource(market.todays_hours);
          })());
        }
      }

      await Promise.all(promises);

      return markets;
    }catch(e){
      throw e;
    }
  }
}

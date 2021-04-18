import axios, { AxiosInstance } from 'axios';
import qs from 'qs';
import { API_ROUTES, PLATFORMS } from './Enum';
import { CoinListResponseItem, CoinMarket, PingResponse, TrendingResponse, SimplePriceResponse, TokenPriceResponse, CoinFullInfo, CoinTickerResponse, CoinHistoryResponse, CoinMarketChartResponse, CoinStatusUpdateResponse, Exchange, NameIdPair, ExchangeId, ExchangeIdTickerResponse, StatusUpdate } from './Inteface';

export class CoinGeckoClient {
  http: AxiosInstance;
  apiV3Url = 'https://api.coingecko.com/api/v3'
  constructor() {

    this.http = axios.create({})
  }
  private withPathParams(path: string, replacements: any = {}) {
    let pathStr = path;
    Object.entries(replacements).forEach(([key, value]) => {
      pathStr = pathStr.replace('{' + key + '}', value as string)
    })
    return pathStr;
  }

  private async makeRequest<T>(action: API_ROUTES, params: any = {}) {
    const requestUrl = this.apiV3Url + this.withPathParams(action, params) + '?' + qs.stringify(params);
    console.log(requestUrl)
    const res = await this.http.get<T>(requestUrl);
    return res.data;
  }
  /**
   * Check API server status
   * @returns {PingResponse}
   */
  public async ping() {
    return this.makeRequest<PingResponse>(API_ROUTES.PING);
  }
  public async trending() {
    return this.makeRequest<TrendingResponse>(API_ROUTES.SEARCH_TRENDING);
  }

  /**
   * List all supported coins id, name and symbol (no pagination required)
   * Use this to obtain all the coins’ id in order to make API calls
   * @category Coin
   * @param input.include_platform flag to include platform contract addresses (eg. 0x… for Ethereum based tokens).
valid values: true, false
   * @returns {CoinListResponseItem[]}
   */
  public async coinList(input: { include_platform?: boolean }) {
    return this.makeRequest<CoinListResponseItem[]>(API_ROUTES.COIN_LIST, input);
  }

  /**
   * List all supported coins price, market cap, volume, and market related data
   * @category Coin
   * @param input.vs_currency The target currency of market data (usd, eur, jpy, etc.)
   * @param input.order valid values: market_cap_desc, gecko_desc, gecko_asc, market_cap_asc, market_cap_desc, volume_asc, volume_desc, id_asc, id_desc
   * @param input.category filter by coin category, only decentralized_finance_defi and stablecoins are supported at the moment
   * @param input.ids The ids of the coin, comma separated crytocurrency symbols (base). refers to /coins/list. When left empty, returns numbers the coins observing the params limit and start
   * @param input.per_page Total results per page (valid values: 1…250)
   * @param input.page Page through results
   * @param input.sparkline Include sparkline 7 days data (eg. true, false)
   * @returns {CoinMarket[]}
   */
  public async coinMarket(input: {
    vs_currency: string,
    ids: string,
    category?: 'decentralized_finance_defi' | 'stablecoins',
    order?: 'market_cap_desc' | 'gecko_desc' | 'gecko_asc' | 'market_cap_asc' | 'market_cap_desc' | 'volume_asc' | 'volume_desc' | 'id_asc' | 'id_desc',
    per_page?: number
    page?: number,
    sparkline?: boolean,
    price_change_percentage?: string
  }) {
    return this.makeRequest<CoinMarket[]>(API_ROUTES.COIN_MARKET, input);
  }

  /**
   * Get current data (name, price, market, ... including exchange tickers) for a coin
   * IMPORTANT:
   * Ticker object is limited to 100 items, to get more tickers, use /coins/{id}/tickers
   * Ticker is_stale is true when ticker that has not been updated/unchanged from the exchange for a while.
   * Ticker is_anomaly is true if ticker’s price is outliered by our system.
   * You are responsible for managing how you want to display these information (e.g. footnote, different background, change opacity, hide)
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.localization Include all localized languages in response (true/false) 
   * @param input.tickers nclude tickers data (true/false) [default: true]
   * @param input.market_data Include market_data (true/false) [default: true]
   * @param input.community_data Include community_data data (true/false) [default: true]
   * @param input.developer_data Include developer_data data (true/false) [default: true]
   * @param input.sparkline Include sparkline 7 days data (eg. true, false)
   * @returns {CoinFullInfo}
   */
  public async coin(input: {
    id: string,
    localization?: boolean,
    tickers?: boolean,
    market_data?: boolean,
    community_data?: boolean,
    sparkline?: boolean,
    developer_data?: boolean
  }) {
    return this.makeRequest<CoinFullInfo>(API_ROUTES.COIN, input);
  }

  /**
   * Get coin tickers (paginated to 100 items)
   *
   * IMPORTANT:
   * Ticker is_stale is true when ticker that has not been updated/unchanged from the exchange for a while.
   * Ticker is_anomaly is true if ticker’s price is outliered by our system.
   * You are responsible for managing how you want to display these information (e.g. footnote, different background, change opacity, hide)
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.exchange_ids filter results by exchange_ids (ref: v3/exchanges/list) 
   * @param input.include_exchange_logo flag to show exchange_logo
   * @param input.page Page through results
   * @param input.order valid values: trust_score_desc (default), trust_score_asc and volume_desc
   * @param input.depth flag to show 2% orderbook depth. valid values: true, false
   * @returns {CoinFullInfo}
   */
  public async coinTickers(input: {
    id: string,
    exchange_ids?: string,
    include_exchange_logo?: boolean,
    page?: number,
    order?: 'trust_score_desc' | 'trust_score_asc' | 'volume_desc',
    depth?: boolean,
  }) {
    return this.makeRequest<CoinTickerResponse>(API_ROUTES.COIN_TICKERS, input);
  }

  /**
   * Get historical data (name, price, market, stats) at a given date for a coin
   *
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.date The date of data snapshot in dd-mm-yyyy eg. 30-12-2017 
   * @param input.localization Set to false to exclude localized languages in response
   * @returns {CoinHistoryResponse}
   */
  public async coinHistory(input: {
    id: string,
    date: string,
    localization?: boolean,
  }) {
    return this.makeRequest<CoinHistoryResponse>(API_ROUTES.COIN_HISTORY, input);
  }

  /**
   * Get historical market data include price, market cap, and 24h volume (granularity auto)
   * Minutely data will be used for duration within 1 day, Hourly data will be used for duration between 1 day and 90 days, Daily data will be used for duration above 90 days.
   * 
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.vs_currency The target currency of market data (usd, eur, jpy, etc.)
   * @param input.days Data up to number of days ago (eg. 1,14,30,max)
   * @param input.interval Data interval. Possible value: daily
   * @returns {CoinMarketChartResponse}
   */
  public async coinMarketChart(input: {
    id: string,
    vs_currency: string,
    days: number | 'max',
    interval?: string,
  }) {
    return this.makeRequest<CoinMarketChartResponse>(API_ROUTES.COIN_MARKET_CHART, input);
  }

  /**
   * Get historical market data include price, market cap, and 24h volume within a range of timestamp (granularity auto)
   * Minutely data will be used for duration within 1 day, Hourly data will be used for duration between 1 day and 90 days, Daily data will be used for duration above 90 days.
   * 
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.vs_currency The target currency of market data (usd, eur, jpy, etc.)
   * @param input.from From date in UNIX Timestamp (eg. 1392577232)
   * @param input.to To date in UNIX Timestamp (eg. 1618716149)
   * @returns {CoinMarketChartResponse}
   */
  public async coinMarketChartRange(input: {
    id: string,
    vs_currency: string,
    from: number,
    to: number,
  }) {
    return this.makeRequest<CoinMarketChartResponse>(API_ROUTES.COIN_MARKET_CHART_RANGE, input);
  }

  /**
   * Get status updates for a given coin (beta)
   * 
   * @see https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__status_updates
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.per_page Total results per page
   * @param input.page Page through results
   * @returns {CoinStatusUpdateResponse}
   */
  public async coinStatusUpdates(input: {
    id: string,
    per_page?: number,
    page?: number,
  }) {
    return this.makeRequest<CoinStatusUpdateResponse>(API_ROUTES.COIN_STATUS_UPDATES, input);
  }

  /**
   * Get coin's OHLC (Beta)
   * ```
   * Candle’s body:
   * 1 - 2 days: 30 minutes
   * 3 - 30 days: 4 hours
   * 31 and before: 4 days
   * ```
   * @see https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__ohlc
   * @category Coin
   * @param input.id pass the coin id (can be obtained from /coins) eg. bitcoin
   * @param input.vs_currency The target currency of market data (usd, eur, jpy, etc.)
   * @param input.days Data up to number of days ago (1/7/14/30/90/180/365/max)
   * @returns {CoinStatusUpdateResponse}
   * Sample output
   * ```
   * [
   *  [
   *    1618113600000,
   *    79296.36,
   *    79296.36,
   *    79279.94,
   *    79279.94
   *   ]
   * . ... ... . .. . .. . . . . .
   * ]
   *```
   */
  public async coinOHLC(input: {
    id: string,
    vs_currency: string,
    days: number | 'max',
  }) {
    return this.makeRequest<Array<Array<number>>>(API_ROUTES.COIN_OHLC, input);
  }

  /**
   * Get the current price of any cryptocurrencies in any other supported currencies that you need.
   * @param input.vs_currency vs_currency of coins, comma-separated if querying more than 1 vs_currency. *refers to simple/supported_vs_currencies
   * @param input.ids The ids of the coin, comma separated crytocurrency symbols (base). refers to /coins/list. When left empty, returns numbers the coins observing the params limit and start
   * @param input.include_market_cap @default false
   * @returns {SimplePriceResponse}
   * @category Simple
   */
  public async simplePrice(input: {
    vs_currency: string,
    ids: string,
    include_market_cap?: boolean,
    include_24hr_vol?: boolean,
    include_24hr_change?: boolean,
    include_last_updated_at?: boolean
  }) {
    return this.makeRequest<SimplePriceResponse>(API_ROUTES.SIMPLE_PRICE, input);
  }

  /**
  * Get current price of tokens (using contract addresses) for a given platform in any other currency that you need.
  * @param input.id The id of the platform issuing tokens (Only ethereum is supported for now)
  * @param input.contract_addresses The contract address of tokens, comma separated
  * @param input.vs_currencies vs_currency of coins, comma-separated if querying more than 1 vs_currency. *refers to simple/supported_vs_currencies
  * @returns The dictionary of price pair with details
  * * Example output
  * ```json
  * {
  *    "0x8207c1ffc5b6804f6024322ccf34f29c3541ae26": {
  *      "btc": 0.00003754,
  *      "btc_market_cap": 7914.297728099776,
  *      "btc_24h_vol": 2397.477480037078,
  *      "btc_24h_change": 3.7958858800037834,
  *      "eth": 0.0009474,
  *      "eth_market_cap": 199730.22336519035,
  *      "eth_24h_vol": 60504.258122696505,
  *      "eth_24h_change": 2.8068351977135007,
  *      "last_updated_at": 1618664199
  *   }
  *}
  *```
  * @category Simple
  */
  public async simpleTokenPrice(input: {
    id: 'ethereum',
    contract_addresses: string,
    vs_currencies: string,
    include_market_cap?: boolean,
    include_24hr_vol?: boolean,
    include_24hr_change?: boolean,
    include_last_updated_at?: boolean
  }) {
    return this.makeRequest<TokenPriceResponse>(API_ROUTES.SIMPLE_TOKEN_PRICE, input);
  }

  /**
  * Get list of supported_vs_currencies.
  * @returns list of supported_vs_currencies
  * @category Simple
  */
  public async simpleSupportedCurrencies() {
    return this.makeRequest<string[]>(API_ROUTES.SIMPLE_SUPPORTED_CURRENCIES);
  }

  /**
  * Get historical market data include price, market cap, and 24h volume (granularity auto) from a contract address 
  * @see https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address_
  * @returns current data for a coin
  * @param input.id Asset platform (only ethereum is supported at this moment)
  * @param input.contract_address Token’s contract address
  * @category Contract
  * @returns {CoinFullInfo}
  */
  public async contract(input: {
    id: PLATFORMS,
    contract_address: string,
  }) {
    return this.makeRequest<CoinFullInfo>(API_ROUTES.CONTRACT, input);
  }

  /**
  * Get historical market data include price, market cap, and 24h volume (granularity auto)
  * @see https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_
  * @returns current data for a coin
  * @param input.id Asset platform (only ethereum is supported at this moment)
  * @param input.contract_address Token’s contract address
  * @param input.vs_currency The target currency of market data (usd, eur, jpy, etc.)
  * @param input.days Data up to number of days ago (eg. 1,14,30,max)
  * @category Contract
  * @returns {CoinMarketChartResponse}
  */
  public async contractMarketChart(input: {
    id: PLATFORMS,
    contract_address: string,
    vs_currency: string;
    days: number | 'max'
  }) {
    return this.makeRequest<CoinMarketChartResponse>(API_ROUTES.CONTRACT_MARKET_CHART, input);
  }

  /**
  * Get historical market data include price, market cap, and 24h volume within a range of timestamp (granularity auto) from a contract address
  * @see https://www.coingecko.com/api/documentations/v3#/contract/get_coins__id__contract__contract_address__market_chart_range
  * @returns current data for a coin
  * @param input.id Asset platform (only ethereum is supported at this moment)
  * @param input.contract_address Token’s contract address
  * @param input.vs_currency The target currency of market data (usd, eur, jpy, etc.)
  * @param input.from From date in UNIX Timestamp (eg. 1392577232)
  * @param input.to From date in UNIX Timestamp (eg. 1618716149)
  * @category Contract
  * @returns {CoinMarketChartResponse} Get historical market data include price, market cap, and 24h volume
  */
  public async contractMarketChartRange(input: {
    id: PLATFORMS,
    contract_address: string,
    vs_currency: string;
    from?: number,
    to: number,
  }) {
    return this.makeRequest<CoinMarketChartResponse>(API_ROUTES.CONTRACT_MARKET_CHART_RANGE, input);
  }

  /**
    * List all exchanges
    * @see https://www.coingecko.com/api/documentations/v3#/exchanges_(beta)/get_exchanges
    * @returns List all exchanges
    * @param input.per_page Total results per page (valid values: 1…250)
    * @param input.page Page through results
    * @category Exchange
    * @returns {CoinMarketChartResponse} Get historical market data include price, market cap, and 24h volume
    */
  public async exchanges(input: {
    per_page?: number,
    page?: number,
  }) {
    return this.makeRequest<Exchange[]>(API_ROUTES.EXCHANGES, input);
  }

  /**
    * List all supported markets id and name (no pagination required)
    * @see https://www.coingecko.com/api/documentations/v3#/exchanges_(beta)/get_exchanges_list
    * @returns Use this to obtain all the markets’ id in order to make API calls
    * @category Exchange
    * @returns {NameIdPair[]} Get historical market data include price, market cap, and 24h volume
    */
  public async exchangeList() {
    return this.makeRequest<NameIdPair[]>(API_ROUTES.EXCHANGE_LIST);
  }

  /**
  * List all supported markets id and name (no pagination required)
  * @see https://www.coingecko.com/api/documentations/v3#/exchanges_(beta)/get_exchanges__id_
  * @param id the exchange id (can be obtained from /exchanges/list) eg. binance
  * @returns Use this to obtain all the markets’ id in order to make API calls
  * ```
  * IMPORTANT:
  * Ticker object is limited to 100 items, to get more tickers, use /exchanges/{id}/tickers
  * Ticker is_stale is true when ticker that has not been updated/unchanged from the exchange for a while.
  * Ticker is_anomaly is true if ticker’s price is outliered by our system.
  * You are responsible for managing how you want to display these information (e.g. footnote, different background, change opacity, hide)
  * ```
  * @category Exchange
  * @returns {ExchangeId} Get exchange volume in BTC and top 100 tickers only
  */
  public async exchangeId(id: string) {
    return this.makeRequest<ExchangeId>(API_ROUTES.EXCHANGE_ID, { id });
  }

  /**
    * Get exchange tickers (paginated, 100 tickers per page)
    * @see https://www.coingecko.com/api/documentations/v3#/exchanges_(beta)/get_exchanges__id__tickers
    * @param input.id pass the exchange id (can be obtained from /exchanges/list) eg. binance
    * @param input.coin_ids filter tickers by coin_ids (ref: v3/coins/list)
    * @param input.include_exchange_logo flag to show exchange_logo
    * @param input.page Page through results
    * @param input.depth flag to show 2% orderbook depth i.e., cost_to_move_up_usd and cost_to_move_down_usd
    * @returns Use this to obtain all the markets’ id in order to make API calls
    * ```
    * IMPORTANT:
    * Ticker object is limited to 100 items, to get more tickers, use /exchanges/{id}/tickers
    * Ticker is_stale is true when ticker that has not been updated/unchanged from the exchange for a while.
    * Ticker is_anomaly is true if ticker’s price is outliered by our system.
    * You are responsible for managing how you want to display these information (e.g. footnote, different background, change opacity, hide)
    * ```
    * @category Exchange
    * @returns {ExchangeIdTickerResponse} Get exchange volume in BTC and top 100 tickers only
    */
  public async exchangeIdTickers(input: {
    id: string,
    coin_ids?: string,
    include_exchange_logo?: boolean,
    page?: number,
    depth?: string,
    order?: 'trust_score_desc' | 'trust_score_asc' | 'volume_desc'
  }) {
    return this.makeRequest<ExchangeIdTickerResponse>(API_ROUTES.EXCHANGE_ID_TICKER, input);
  }

  /**
   * Get status updates for a given exchange (beta)
   * @see https://www.coingecko.com/api/documentations/v3#/exchanges_(beta)/get_exchanges__id__status_updates
   * @param input.id pass the exchange id (can be obtained from /exchanges/list) eg. binance
   * @param input.page Page through results
   * @param input.per_page Total results per page
   * @returns Get status updates for a given exchange
   * @category Exchange
   * @returns {CoinStatusUpdateResponse} Get status updates for a given exchange
   */
  public async exchangeIdStatusUpdates(input: {
    id: string,
    page?: number,
    per_page?: number,
  }) {
    return this.makeRequest<CoinStatusUpdateResponse>(API_ROUTES.EXCHANGE_ID_STATUS_UPDATES, input);
  }

  /**
   * Get status updates for a given exchange (beta)
   * @see https://www.coingecko.com/api/documentations/v3#/exchanges_(beta)/get_exchanges__id__volume_chart
   * @param input.id pass the exchange id (can be obtained from /exchanges/list) eg. binance
   * @param input.days Data up to number of days ago (eg. 1,14,30)
   * @returns Get status updates for a given exchange
   * @category Exchange
   * @returns {CoinStatusUpdateResponse} Get status updates for a given exchange
   */
  public async exchangeIdVolumeChart(input: {
    id: string,
    days: number,
  }) {
    return this.makeRequest<Array<Array<number>>>(API_ROUTES.EXCHANGE_ID_VOL_CHART, input);
  }

}
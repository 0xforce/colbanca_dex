import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
import moment from "moment";
import { ethers } from "ethers";

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokensReducer.Pair.contracts');
const account = state => get(state, 'connectionReducer.account.address');
const events = state => get(state, 'exchangeReducer.events');

const allOrders = state => get(state, 'exchangeReducer.allOrders.data', []);
const cancelledOrders = state => get(state, 'exchangeReducer.cancelledOrders.data', []);
const filledOrders = state => get(state, 'exchangeReducer.filledOrders.data', []);

const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all, (order) => {
        const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
        const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
        return(orderFilled || orderCancelled)
    })

    return openOrders
}

// ---------------------------------------------------------------------------
// My EVENTS

export const myEventsSelector = createSelector(
    account,
    events,
    (account, events) => {
        events = events.filter((e) => e.args.user === account)
        return events
    }
)


// ---------------------------------------------------------------------------
// My OPEN ORDERS

export const myOpenOrdersSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter orders created by current account
        orders = orders.filter((o) => o.user === account)

        // Filter orders by token addresses
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Decorate orders
        orders = decorateMyOpenOrders(orders, tokens)

        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateMyOpenOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return(order)
        })
    )
}

const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED)
    })
}


const decorateOrder = (order, tokens) => {
    let token0Amount, token1Amount

    // Note: CBNK should be considered token0, mETH is considered token1
    // Example: Giving mETH in exchange for CBNK
    if(order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive //the amount of CBNK we are giving
        token1Amount = order.amountGet // the received amount of mETH
    } else {
        token0Amount = order.amountGet //the amount of CBNK we want
        token1Amount = order.amountGive // the amount of mETH we give
    }

    // Calculate token price to 5 decimal places
    const precision = 100000
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
        token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
        tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

// ---------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        //Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Sort orders by time ascending for price comparison
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)

        // Decorate the orders
        orders = decorateFilledOrders(orders, tokens)

        // Sort orders by time descending for price comparison
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateFilledOrders = (orders, tokens) => {
    //Track prevous order to compare history
    let previousOrder = orders[0]

    return (
        orders.map((order) => {
            //decorate each individual order
            order = decorateOrder(order, tokens)
            order = decorateFilledOrder(order, previousOrder)
            previousOrder = order // update previous order once its decorated
            return order
        })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
    })
}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
    if(previousOrder.id === orderId){
        return GREEN
    }
    // Show green price if order price higher than previous order
    // Show red price if order price lower than previous order
    if(previousOrder.tokenPrice <= tokenPrice) {
        return GREEN
    } else {
        return RED
    }
}

// ---------------------------------------------------------------------------
// MY FILLED ORDERS

export const myFilledOrdersSelector = createSelector(
    account,
    tokens,
    filledOrders,
    (account, tokens, orders) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Find our orders
        orders = orders.filter((o) => o.user === account || o.creator === account)

        //Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Sort by date descending
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        // Decorate orders
        orders = decorateMyFilledOrders(orders, account, tokens)

        return orders
    }
)

const decorateMyFilledOrders = (orders, account, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
            return(order)
        })
    )
}

const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account

    let orderType
    if(myOrder) {
        orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
    }

    return({
        ...order,
        orderType,
        orderClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
}


// ---------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(openOrders, tokens, (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }
    //Filter orders by selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Decorate Orders
    orders = decorateOrderBookOrders(orders, tokens)

    orders = groupBy(orders, 'orderType')

    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])

    // Sort buy orders by token price
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }

    // Fetch buy orders
    const sellOrders = get(orders, 'sell', [])

    // Sort sell orders by token price
    orders = {
        ...orders,
        sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
    }
    return orders
})

const decorateOrderBookOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return(order)
        })
    )
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}



// -------------------------------------------------------------------------------------
// Price Chart

export const priceChartSelector = createSelector(
    filledOrders, 
    tokens, 
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        //Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        orders = orders.sort((a,b) => a.timestamp - b.timestamp)

        // Decorate orders - add display attributes
        orders = orders.map((o) => decorateOrder(o, tokens))

        // Get last 2 order for final price & price change
        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

        // get las order and second last order price
        const lastPrice = get(lastOrder, 'tokenPrice', 0)
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

        return ({ 
            lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
            series: [{
                data: buildGraphData(orders)
            }]
        })

    }
)

const buildGraphData = (orders) => {
    // Group the orders by hour for the graph
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

    // Get each hour where data exists
    const hours = Object.keys(orders)
    
    // Build the graph series
    const graphData = hours.map((hour) => {
        // fetch all orders from current hour
        const group = orders[hour]

        // Calculate price values: open, high, low, close
        const open = group[0]
        const high = maxBy(group, 'tokenPrice')
        const low = minBy(group, 'tokenPrice')
        const close = group[group.length - 1]


        return({
            x: new Date(hour),
            y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
        })
    })

    return graphData
}


module.exports = {
    startOption : {
        reply_markup:JSON.stringify({
            inline_keyboard:[
                [{text:'BTC',callback_data:'BTC'},{text:'BTC',callback_data:'BTC'}],
                [{text:'ETH',callback_data: 'ETH'},{text:'ETH',callback_data: 'ETH'}],
                [{text:'BNB',callback_data: 'BNB'},{text: 'BNB',callback_data: 'BNB'}]
            ]
        })
    },

    favoriteOption : {
        reply_markup:JSON.stringify({
            inline_keyboard:[
                [{text:'Add more',callback_data:'/add_favorite'}]
            ]
        })
    }
}

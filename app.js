const cryptoApp = {};
//API for individual cryptoprice and value 
cryptoApp.getCryptoAPI = (cryptoName) => {
    $.ajax({
        url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=7d`,
        method: "GET",
        dataType: "json",
        data: {
            q: cryptoName
        }
    }).then((result) => {
        cryptoApp.displayCryptoInfo(result);
        cryptoApp.displayBTC(result);
        cryptoApp.generateLabels(result)
        cryptoApp.lineChart(result);
    });
}

//function to display all cryptocurrency information
cryptoApp.displayCryptoInfo = (cryptoArray) => {
    cryptoArray.forEach((crypto, index) => {
        const marketCap24h = crypto.market_cap.toLocaleString();
        const cryptoVolume = (crypto.total_volume/1000000000).toFixed(2);
        const cryptoCurrentPrice = crypto.current_price.toLocaleString();
        const cryptoDailyChange = crypto.price_change_percentage_24h.toFixed(2);
        const cryptoWeeklyChange = crypto.price_change_percentage_7d_in_currency.toFixed(2);
        const cryptoSupply = crypto.circulating_supply.toLocaleString();
        const currentID = "line-chart-" + index;
        const tableRow = `tr id="tr-${index}"`; 
        const cryptoHtml = `
            <${tableRow}>
                <td>${crypto.market_cap_rank}</td>
                <div class="crypto-name">
                    <td><img class="crypto-icon" src="${crypto.image}" alt="bitcoin icon"></td>
                    <td>${crypto.name}<span class="crypto-symbol1">[${crypto.symbol}]</span></td>
                </div>
                <td id="current-price-${index}">$ ${cryptoCurrentPrice}</td>
                <td class="align-right" id="daily-change-${index}">${cryptoDailyChange}</td>
                <td class="align-right" id="weekly-change-${index}">${cryptoWeeklyChange}</td>
                <td class="align-right market-cap" id="market-cap-${index}">$${marketCap24h}</td>
                <td class="align-right" id="crypto-volume-${index}">$ ${cryptoVolume} B</td>
                <td class="align-right supply" id="crypto-supply-${index}"> ${cryptoSupply} <span class="crypto-symbol2">${crypto.symbol}</span></td>
                <td>
                    <div class="chart-container chart">
                        <canvas id="${currentID}"></canvas>
                    </div>
                </td>
            </tr>
        `;
        cryptoApp.getUpdateInfo(index, cryptoCurrentPrice, cryptoDailyChange, cryptoWeeklyChange, marketCap24h, cryptoVolume, cryptoSupply, cryptoHtml);
        cryptoApp.getUpdatePrice(index, cryptoCurrentPrice);
        cryptoApp.dailyChangeStyling(index, cryptoDailyChange);
        cryptoApp.weeklyChangeStyling(index, cryptoWeeklyChange);
    });
    
} 

//function to get update info on market cap, volume after periodically requests
cryptoApp.getUpdateInfo = (index, cryptoCurrentPrice,  cryptoDailyChange, cryptoWeeklyChange, marketCap24h, cryptoVolume, cryptoSupply, cryptoHtml) => {
    if ($(`#tr-${index}`).length) {
        $(`#market-cap-${index}`).html(`$ ${marketCap24h}`);
        $(`#crypto-volume-${index}`).html(`$ ${cryptoVolume} B`);
        $(`#daily-change-${index}`).html(`${cryptoDailyChange}`);
        $(`#weekly-change-${index}`).html(`${cryptoWeeklyChange}`);
        $(`#crypto-supply-${index}`).html(`${cryptoSupply}`);
    } else {
        $('.crypto-table').append(cryptoHtml);
    }
}

//function to style 24h% change based on value
cryptoApp.dailyChangeStyling = (index, cryptoDailyChange) => {
    if (cryptoDailyChange > 0) {
        $(`#daily-change-${index}`).css("color", "green");
        
    } else {
        $(`#daily-change-${index}`).css("color", "red");
    }
}

//function to style 7d% change based on value 
cryptoApp.weeklyChangeStyling = (index, cryptoWeeklyChange) => {
    if (cryptoWeeklyChange > 0) {
        $(`#weekly-change-${index}`).css("color", "green");
    } else {
        $(`#weekly-change-${index}`).css("color", "red");
    }
}

//function to get update cryptocurrency price after periodically requests
cryptoApp.getUpdatePrice = (index, cryptoCurrentPrice) => {
    if ($(`#current-price-${index}`).text() == '') {
        const allCryptoPrice = cryptoCurrentPrice;
        $(`#current-price-${index}`).html(`$ ${allCryptoPrice}`);
    } else {
        const oldCryptoPrice = parseFloat($(`#current-price-${index}`).text().replace(/,/g, '').replace(/\$/g, ''));
        const newCryptoPrice = cryptoCurrentPrice;
        cryptoApp.cryptoComparison(index, newCryptoPrice, oldCryptoPrice);
        $(`#current-price-${index}`).html(`$ ${newCryptoPrice.toLocaleString()}`);
        $(`#current-price-${index}`).animate({ color: '#2A263E' }, 500);
    }
}

//function to compare old price and updated price and change element color accordingly  
cryptoApp.cryptoComparison = (index, newCryptoCurrentPrice, oldCryptoPrice) => {
    if (oldCryptoPrice > newCryptoCurrentPrice) {
        $(`#current-price-${index}`).animate({ color: 'red' }, 300)
    } else {
        $(`#current-price-${index}`).animate({ color: 'green' }, 300)
    }
}

//function to get real time data for all display elements 
cryptoApp.getRealTime = (bitcoin) => {
    setInterval(function(){
        cryptoApp.getCryptoAPI();
        cryptoApp.getCryptoGlobalAPI();
    }, 10000);
}

//function to display only Bitcoin price as header
cryptoApp.displayBTC = (bitcoin) => {
    if ($('.bitcoin-price').text() == '') {
        let bitcoinPrice = bitcoin[0].current_price;
        $('.bitcoin-price').html(`${bitcoinPrice.toLocaleString()}`);
    } else {
        let currentBtcPrice = parseFloat($('.bitcoin-price').text().replace(/,/g, ''));
        let newBtcPrice = bitcoin[0].current_price;
        cryptoApp.btcPriceComparison(currentBtcPrice, newBtcPrice);
        $('.bitcoin-price').html(`${newBtcPrice.toLocaleString()}`);
        $('.bitcoin-price').animate({ color: '#FDC242' }, 500);
    }
}

//function to compare old price and updated price for Bitcoin and change bitcoin color accordingly
cryptoApp.btcPriceComparison = (currentBtcPrice, newBtcPrice) => {
    if (currentBtcPrice > newBtcPrice) {
        $('.bitcoin-price').animate({ color: 'red' }, 300)
    } else {
        $('.bitcoin-price').animate({ color: 'green' }, 300)
    }
}

//function to generate x-axis for graph
cryptoApp.generateLabels = (prices) => {
    const totalTimePoints = prices.length;
     //get current time when the code runs
     const currentTimeStamp = new Date();
     const label = [];
     //generate label for Chart
     for (let i = 0; i < totalTimePoints - 1; i++) {
        //167 points with each point is one hour apart from each other: get current time minus one hour 
        let timestamp = currentTimeStamp - i*60*60*1000;
        let date = new Date(timestamp);
        label.push(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
     }
     return label.reverse();
}

//function to implement graph for each cryptocurrency
cryptoApp.lineChart = (dataInput) => {
    dataInput.forEach((individualInput, index) => {
        const currentID = "line-chart-" + index;
        let dataPoints = individualInput.sparkline_in_7d.price;
        let ctx = document.getElementById(currentID).getContext('2d');
        let labels = cryptoApp.generateLabels(dataPoints);
        let chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `$`,
                    data: dataPoints,
                    fill: false,
                    borderColor: 'rgb(253, 194, 66)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 0,
                }]
            },
            options: {
                scales: {
                    x: {
                        display: false,
                    },
                    y: {
                        display: false,
                    }

                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw.toFixed(2);
                            }
                        }
                    },
                }
            },
        })
    });
};  

//API for total marketcap
cryptoApp.getCryptoGlobalAPI = (cryptoName) => {
    $.ajax({
        url: `https://api.coingecko.com/api/v3/global`,
        method: "GET",
        dataType: "json",
        data: {
            q: cryptoName
        }
    }).then((globalData) => {
        cryptoApp.displayMarketCap(globalData.data);
    });
}

//function to display total market cap and 24h volume 
cryptoApp.displayMarketCap = (marketCapArray) => {
    const totalMarketCap = Object.values(marketCapArray.total_market_cap).reduce((accumulator, currentValue) => accumulator + currentValue);
    const displayTotalMarketCap = (totalMarketCap/100000000000000).toFixed(2);
    const marketCap24h = Object.values(marketCapArray.total_volume).reduce((accumulator, currentValue) => accumulator + currentValue);
    const displayMarketCap24h = (marketCap24h/100000000000000).toFixed(2);
    $('.total-market-cap').html(`${displayTotalMarketCap} B`);
    $('.volume').html(`${displayMarketCap24h} B`);
} 

cryptoApp.newsApi = (cryptoNews) => {
    let settings = {
        url: `https://saurav.tech/NewsAPI/top-headlines/category/business/us.json`,
        method: "GET",
        dataType: "json",
        data: {
            q: cryptoNews
        },
    }

    $.ajax(settings).done((response) => {
        cryptoApp.getNews(response);
    })
}

//function to get the first 3 news in news API for news header
cryptoApp.getNews = (news) => {

    const firstNews = news.articles[0].description; 
    const firstNewsLinks = news.articles[0].url;

    const secondNews = news.articles[1].description;
    const secondNewsLinks = news.articles[1].url;

    const thirdNews = news.articles[2].description;
    const thirdNewsLinks = news.articles[2].url;

    $('.news-content1').html(`${firstNews}`);
    $('.news-content2').html(`${secondNews}`);
    $('.news-content3').html(`${thirdNews}`);

    $('.news-link1',).click(function() {
        window.open(
          `${firstNewsLinks}`,
          '_blank' 
        );
    });
    $('.news-link2',).click(function() {
        window.open(
          `${secondNewsLinks}`,
          '_blank' 
        );
    });

   $('.news-link3',).click(function() {
        window.open(
          `${secondNewsLinks}`,
          '_blank' 
        );
    });
}
cryptoApp.init = () => {
    cryptoApp.getCryptoAPI();
    cryptoApp.getRealTime();
    cryptoApp.getCryptoGlobalAPI();
    cryptoApp.newsApi();
}

$(document).ready(() => {
   cryptoApp.init();
});
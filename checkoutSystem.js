const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask({questionText, defaultChoice}) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
    if(defaultChoice){ 
    readlineInterface.write(defaultChoice)
    }
  });
}

start();

function checkAd (type, quantity) {
    if (/^[a-cA-C]+$/.test(type) && /^[0-9]*$/.test(quantity)) {
        return true;
    }
    return false;
}

function calVipAds (adsName, adsPrice, quantity,vipDetails) {
    return vipDetails.offer.map((offerType)=>{
        if ((adsName === offerType.name)){
            if ((offerType.number && quantity >= offerType.number) && offerType.price) {
                return {
                    vipQuantity: quantity,
                    vipPrice: offerType.price
                };
            } else if(offerType.number && quantity >= offerType.number && (!offerType.price)) {
                return {
                    vipQuantity: (quantity - Math.round(quantity/offerType.number)),
                    vipPrice: adsPrice
                };
            } else  if(offerType.price && !offerType.number) {
                return {
                    vipQuantity: quantity,
                    vipPrice: offerType.price
                };
            }
         }
    })
}


function calPrice(ads, priceList, companyName, vip) {
    let isVip = false;
    let vipDetails={};
    for(let i=0; i<vip.length;i++) {
        if(vip[i].name === companyName) {
            vipDetails=vip[i]
            isVip = true
        }
    }
    const result = ads.map((ad)=>{
        const type = ad.charAt(0)
        let quantity = ad.slice(1)
        const isValidAd = checkAd(type, quantity); 
        if (isValidAd) {
            const adsName = priceList[type].name;
            let adsPrice = priceList[type].price;
            if(isVip) {
                const vipPrices = calVipAds(adsName, adsPrice, quantity,vipDetails);
                const filteredVipPrices = vipPrices.filter(function( element ) {
                    return element !== undefined;
                 });
                 if(filteredVipPrices.length > 0) {
                    const {vipPrice,vipQuantity} =filteredVipPrices[0]
                    adsPrice = vipPrice;
                    quantity = vipQuantity;
                 }
            }
           return {
            adsName,
            price: adsPrice * quantity
            }
        }
        return null;
    })
    return result;
}

function showPrice(priceList) {
    for (const ads in priceList) {
        console.log(`\n ${priceList[ads].name} ad: ${priceList[ads].price} \n`);
      }
}

async function start() {
    const vip = [{name: 'UEM Sunrise', offer: [{name:'standard', number: 3}]}, 
    {name: 'Sime Darby Property Bhd.', offer: [{name:'featured', price: 299.99}]}, 
    {name: 'IGB Berhad', offer: [{name:'premium', number: 4, price: 379.99}]}, 
    {name: 'Mah Sing Group', offer: [
        {name:'standard', number: 5},
        {name:'featured', price: 309.99},
        {name:'premium', number: 3, price: 389.99}
    ]},]
    const priceList = {
        a: {name: 'standard', price:269.99},
        b: {name: 'featured', price:322.99},
        c: {name: 'premium', price:394.99},
    }
    let viewPrice='';
    let moreAds = 'Yes';
    let customer = {name: 'companyName', question: '\nWhat is your company name? \n', value: ''};
    let ads = {name: 'ads', question: '\nEnter the ads ID to choose your desire ads follow by quantity\n[a: Standard, b: Fetured, c: Premium]\nfor eg: a5 \n', value: []};
    let total;

    viewPrice = await ask({questionText: '\nCheck out latest price? ', defaultChoice: 'Yes'})

    if(viewPrice === 'Yes') {
        showPrice(priceList)
    }

    while(customer.value=== ''){
        customer.value = await ask({questionText: customer.question});
    }

    while(moreAds === 'Yes'){
        while(ads.value.length < 1 || ads.value[ads.value.length - 1]  == '' || moreAds === 'Yes'){
            moreAds != 'Yes' ? ads.value.pop() : null;
            ads.value.push(await ask({questionText: ads.question}));
            moreAds = 'No';
        }
        moreAds = await ask({questionText: 'Add more ads? ', defaultChoice: 'Yes' });
    }

    total = calPrice(ads.value, priceList, customer.value, vip)
    const filteredTotal =  total.filter((el) =>el != null);
    let adsResult = [];
    let adsPrice = [];
    filteredTotal.forEach((item)=>{
        adsResult.push(item.adsName);
        adsPrice.push(item.price);
    })
    const totalAdsPrice = adsPrice.reduce((a, b) => a + b, 0)
    console.log(`\n\nCustomer: ${customer.value} \nListings Scanned: ${adsResult} \nTotal expected: ${totalAdsPrice.toFixed(2)} RM\n`)
    process.exit();
}

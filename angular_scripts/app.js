function myMap() {
        
  var mapProp= {
      center:new google.maps.LatLng(37.4419,-122.1419),
      zoom:3,
  };
  var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(37.4419,-122.1419),
    map: map,
    label: 'NY Stock Exchange',
    title: 'NY Stock Exchange'
  });

  var marker2 = new google.maps.Marker({
    position: new google.maps.LatLng(19.228825,72.854118),
    map: map,
    label: 'Mumbai Exchange',
    title: 'Mumbai Exchange'
  });


  var marker3 = new google.maps.Marker({
    position: new google.maps.LatLng(35.652832,139.839478),
    map: map, 
    label: 'Japan Exchange',
    title: 'Japan Exchange'
  });

}
var app = angular.module("myApp", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "index.htm"
    })
    .when("/addTicker", {
        templateUrl : "addTicker.htm"
    })
    .when("/removeTicker", {
        templateUrl : "removeTicker.htm"
    })
    .when("/showTickers", {
        templateUrl : "showTickers.htm"
    })
    .when("/portfolio", {
        templateUrl : "portfolio.htm"
    }).when("/getFeeds", {
        templateUrl : "getFeeds.htm"
    }).when("/showGraphs",{
        templateUrl: "showGraphs.htm",
        controller: "showGraphsController"
    }).when("/worldMarket",{
      controller: "worldMarket",
      templateUrl: "worldMarket.htm"
  });
});


app.controller("worldMarket",function($scope,$http) {
  document.getElementById("googleMap").style.visibility = 'visible';

  $http({
    method: 'get',
    headers : {
        "Content-Type":"application/json"
    },
    url: 'https://globalquotes.xignite.com/v3/xGlobalQuotes.json/ListExchanges?&_token=2CCF6D5B2AFB42CA8A8D1AEFE78D627E'
}).
  then(function(data) {
      console.log(JSON.stringify(data));
      $scope.worldmarketdata = data.data.ExchangeDescriptions;
  },function (error){
    console.log(error);
})

})
app.controller("addTickerController",function($scope,stockTickerLookup,$http) {
    document.getElementById("googleMap").style.visibility = 'hidden';
    $scope.show = false;
    $scope.stockDump = stockTickerLookup.stockTickersDump();
    $scope.onSubmit = function() {
        $scope.getLocation($scope.addTickerValue);
       // alert("result " + $scope.getLocation($scope.addTickerValue));
        let stockArray = [];
        if(localStorage.getItem("stockTickers") == null)
        {
            // create the storage and push the array
            
            stockArray.push($scope.addTickerValue.toString().toUpperCase());

            localStorage.setItem("stockTickers",stockArray);
        }
        else
        {
            // get the local storage data as it is not null
            var stockArrayString = localStorage.getItem("stockTickers");
            stockArray = stockArrayString.split(",");
            // push the new value into the array
            stockArray.push($scope.addTickerValue.toString().toUpperCase());
            // send data to Localstorage

            localStorage.setItem("stockTickers",stockArray);

        }
        $scope.show = true;
        console.log($scope.show);
    }

    $scope.closeAlert = function(index) {
        $scope.show = false;

    };

    $scope.getLocation = function(val) {
        return $http.get('stocks.json', {
          params: {
            address: val,
            sensor: false
          }
        }).then(function(response){
          //return response.data.results.map(function(item){
          //  return item.formatted_address;
           
          //});
          
          //alert(JSON.stringify(response.data.find(function(element) {
          //  return element.Ticker == val;
          //})));
          $scope.stockDump2 = JSON.stringify(response.data.find(function(element) {
              return element.Ticker == val;
            }));
             
          return JSON.stringify(response.data.find(function(element) {
            return element.Ticker == val;
           }))
        });
      };
});

app.controller("removeTickerController",function($scope,stockTickerLookup,$http) {
    
  document.getElementById("googleMap").style.visibility = 'hidden';
    


    $scope.show = false;
    $scope.onSubmit = function() {
        // get the values from localstorage

        let stockValuesString = localStorage.getItem("stockTickers");
        let stockValueArray = stockValuesString.split(",");
        // get index of array 

        let removeIndex =  stockValueArray.indexOf($scope.removeTickerValue.toString().toUpperCase());
        // remove the value from array
        stockValueArray.splice(removeIndex,1);

        // set the new value to localstorage
        localStorage.setItem("stockTickers",stockValueArray);
        $scope.stockDump3 = stockTickerLookup.stockTickersDump().find(function(element){
            return element.Ticker == $scope.removeTickerValue;
        });
        $scope.show = true;

    }

    $scope.closeAlert = function(index) {
        $scope.show = false;

    };
});

app.controller("showTickers",function($scope,$http) {
    // need to fill the tables....
    document.getElementById("googleMap").style.visibility = 'hidden';
    // get data from localstorage
    let stockValuesString = localStorage.getItem("stockTickers");
    let stockValueArray = stockValuesString.split(",");
    $scope.stockArrayScope = [];
    // loop through the array
    var stockDetails = [];
    for(let i=0;i<stockValueArray.length;i++)
    {
        $scope.stockArrayScope.push(stockValueArray[i]);
        
        var path = "https://adakadavra-smarket.p.mashape.com/api/v1/public/quote/" + stockValueArray[i];
            $http({
                method: 'get',
                headers : {
                    "Content-Type":"application/json",
                    "X-Mashape-Key" : "6d58c64d97mshc432e7d010d76b4p1c1e3djsnad9212352000",
                    "X-Mashape-Host" : "adakadavra-smarket.p.mashape.com"
                },
                url: path
            }).then(function (success){
                if(success){
                    console.log(success.data.quote);
                    stockDetails.push(success.data.quote);
                }
         
            },function (error){
                console.log(error);
            });
       // },5000);
            $scope.stockDetails = stockDetails;
    }


    $scope.refresh = function() {
        //alert("sas");
        let stockValuesString = localStorage.getItem("stockTickers");
        let stockValueArray = stockValuesString.split(",");
        $scope.stockArrayScope = [];
        // loop through the array
        var stockDetails = [];
        for(let i=0;i<stockValueArray.length;i++)
        {
            $scope.stockArrayScope.push(stockValueArray[i]);
            
            var path = "https://adakadavra-smarket.p.mashape.com/api/v1/public/quote/" + stockValueArray[i];
                $http({
                    method: 'get',
                    headers : {
                        "Content-Type":"application/json",
                        "X-Mashape-Key" : "6d58c64d97mshc432e7d010d76b4p1c1e3djsnad9212352000",
                        "X-Mashape-Host" : "adakadavra-smarket.p.mashape.com"
                    },
                    url: path
                }).then(function (success){
                    if(success){
                        console.log(success.data.quote);
                        stockDetails.push(success.data.quote);
                    }
             
                }   ,function (error){
                    console.log(error);
                });
                $scope.stockDetails = stockDetails;
        }
    }

    
});

app.controller("showGraphsController",function($scope) {

  var tests = "gowtham";
  var ctx = document.getElementById("myChart1").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 30],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });

  var ctx = document.getElementById("myChart2").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 30],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });

  var ctx = document.getElementById("myChart3").getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 30],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });
    document.getElementById("googleMap").style.visibility = 'hidden'; 
    // get the localStorage data
    let selectBox = localStorage.getItem("stockTickers");
    selectBoxArray = selectBox.split(",");

    $scope.selectBoxArray = [];
    $scope.selectBoxArray = selectBoxArray;



    



});

app.controller('getFeedsController',function($scope,$http) {
    document.getElementById("googleMap").style.visibility = 'hidden';
    let url = "http://kalathur.com/cs701/cgi-bin/getTwitterData.php?q=" + $scope.searchTickerValue  + "&callback=JSONP_CALLBACK";
    $scope.onSubmitSearch = function() {
        $http({url: "http://kalathur.com/cs701/cgi-bin/getTwitterData.php?q=" + $scope.searchTickerValue  + "&callback=JSONP_CALLBACK",
                   method: 'get'
                   //headers: {
                   //     "Access-Control-Allow-Origin": "*",
                   //}
                }).then(function(data) {
                     //   alert(JSON.stringify(data));
                        $scope.sample = JSON.stringify(data.data).replace("/**/JSONP_CALLBACK(","").replace(");","");
                        $scope.sample2 = JSON.parse(JSON.parse($scope.sample)).statuses;
                     //   alert($scope.sample2);
                })
    }

});


app.controller('portfolioController',function($scope,$http) {
  document.getElementById("googleMap").style.visibility = 'hidden';
  let portfolioDataString = localStorage.getItem('portfolioData');
  //$scope.portfolioDataPush = JSON.parse(portfolioDataString);
  $scope.portfolioDataPushTest = JSON.parse(portfolioDataString);
  console.log($scope.portfolioDataPushTest);
  $scope.portfolioDataPush = portfolioLocalStorageData($scope.portfolioDataPushTest);

  $scope.refresh = function() {
    $scope.portfolioDataPush = [];
    let portfolioDataString = localStorage.getItem('portfolioData');
    let portfolioDataArray = JSON.parse(portfolioDataString);

    // iterate through the array

    for(let i=0;i<portfolioDataArray.length;i++)
    {
      //alert(JSON.stringify(portfolioDataArray[i]));
      $scope.portfolioDataPush.push(portfolioDataArray[i]);
    }

    

  }

  // Call the API to get the data
      function portfolioLocalStorageData(inputData) {
      // loop through the array
      console.log(portfolioLocalStorageData);
      for(let i=0;i<inputData.length;i++)
      {       
          var path = "https://adakadavra-smarket.p.mashape.com/api/v1/public/quote/" + inputData[i].name;
              $http({
                  method: 'get',
                  headers : {
                      "Content-Type":"application/json",
                      "X-Mashape-Key" : "6d58c64d97mshc432e7d010d76b4p1c1e3djsnad9212352000",
                      "X-Mashape-Host" : "adakadavra-smarket.p.mashape.com"
                  },
                  url: path
              }).then(function (success){
                  if(success){
                      console.log(success.data.quote);
                      inputData[i].stockPrices = success.data.quote.financeData.ask;
                  }
           
              },function (error){
                  console.log(error);
              });
      }

      return inputData;
      }

});

app.service('stockTickerLookup', function() {
    this.stockTickersDump = function () {
        return [
            {
              "Ticker": "PIHPP",
              "Company": "1347 Property Insurance Holdings"
            },
            {
              "Ticker": "TURN",
              "Company": "180 Degree Capital Corp."
            },
            {
              "Ticker": "FLWS",
              "Company": "1-800 FLOWERS.COM"
            },
            {
              "Ticker": "FCCY",
              "Company": "1st Constitution Bancorp (NJ)"
            },
            {
              "Ticker": "SRCE",
              "Company": "1st Source Corporation"
            },
            {
              "Ticker": "VNET",
              "Company": "21Vianet Group"
            },
            {
              "Ticker": "TWOU",
              "Company": "2U"
            },
            {
              "Ticker": "TPNL",
              "Company": "3PEA International"
            },
            {
              "Ticker": "JOBS",
              "Company": "51job"
            },
            {
              "Ticker": "EGHT",
              "Company": "8x8 Inc"
            },
            {
              "Ticker": "AAON",
              "Company": "AAON"
            },
            {
              "Ticker": "ABEO",
              "Company": "Abeona Therapeutics Inc."
            },
            {
              "Ticker": "ABEOW",
              "Company": "Abeona Therapeutics Inc."
            },
            {
              "Ticker": "ABIL",
              "Company": "Ability Inc."
            },
            {
              "Ticker": "ABMD",
              "Company": "ABIOMED"
            },
            {
              "Ticker": "ABP",
              "Company": "Abpro Corporation"
            },
            {
              "Ticker": "AXAS",
              "Company": "Abraxas Petroleum Corporation"
            },
            {
              "Ticker": "ACIU",
              "Company": "AC Immune SA"
            },
            {
              "Ticker": "ACIA",
              "Company": "Acacia Communications"
            },
            {
              "Ticker": "ACTG",
              "Company": "Acacia Research Corporation"
            },
            {
              "Ticker": "ACHC",
              "Company": "Acadia Healthcare Company"
            },
            {
              "Ticker": "ACAD",
              "Company": "ACADIA Pharmaceuticals Inc."
            },
            {
              "Ticker": "ACST",
              "Company": "Acasti Pharma"
            },
            {
              "Ticker": "AXDX",
              "Company": "Accelerate Diagnostics"
            },
            {
              "Ticker": "ACCP",
              "Company": "Accelerated Pharma"
            },
            {
              "Ticker": "XLRN",
              "Company": "Acceleron Pharma Inc."
            },
            {
              "Ticker": "ANCX",
              "Company": "Access National Corporation"
            },
            {
              "Ticker": "ARAY",
              "Company": "Accuray Incorporated"
            },
            {
              "Ticker": "ACRX",
              "Company": "AcelRx Pharmaceuticals"
            },
            {
              "Ticker": "ACER",
              "Company": "Acer Therapeutics Inc."
            },
            {
              "Ticker": "ACET",
              "Company": "Aceto Corporation"
            },
            {
              "Ticker": "AKAO",
              "Company": "Achaogen"
            },
            {
              "Ticker": "ACHV",
              "Company": "Achieve Life Sciences"
            },
            {
              "Ticker": "ACHN",
              "Company": "Achillion Pharmaceuticals"
            },
            {
              "Ticker": "ACIW",
              "Company": "ACI Worldwide"
            },
            {
              "Ticker": "ACRS",
              "Company": "Aclaris Therapeutics"
            },
            {
              "Ticker": "ACMR",
              "Company": "ACM Research"
            },
            {
              "Ticker": "ACNB",
              "Company": "ACNB Corporation"
            },
            {
              "Ticker": "ACOR",
              "Company": "Acorda Therapeutics"
            },
            {
              "Ticker": "ATVI",
              "Company": "Activision Blizzard"
            },
            {
              "Ticker": "ADMS",
              "Company": "Adamas Pharmaceuticals"
            },
            {
              "Ticker": "ADMP",
              "Company": "Adamis Pharmaceuticals Corporation"
            },
            {
              "Ticker": "ADAP",
              "Company": "Adaptimmune Therapeutics plc"
            },
            {
              "Ticker": "ADUS",
              "Company": "Addus HomeCare Corporation"
            },
            {
              "Ticker": "AEY",
              "Company": "ADDvantage Technologies Group"
            },
            {
              "Ticker": "IOTS",
              "Company": "Adesto Technologies Corporation"
            },
            {
              "Ticker": "ADIL",
              "Company": "Adial Pharmaceuticals"
            },
            {
              "Ticker": "ADILW",
              "Company": "Adial Pharmaceuticals"
            },
            {
              "Ticker": "ADMA",
              "Company": "ADMA Biologics Inc"
            },
            {
              "Ticker": "ADBE",
              "Company": "Adobe Inc."
            },
            {
              "Ticker": "ADOM",
              "Company": "ADOMANI"
            },
            {
              "Ticker": "ADTN",
              "Company": "ADTRAN"
            },
            {
              "Ticker": "ADRO",
              "Company": "Aduro Biotech"
            },
            {
              "Ticker": "ADES",
              "Company": "Advanced Emissions Solutions"
            },
            {
              "Ticker": "AEIS",
              "Company": "Advanced Energy Industries"
            },
            {
              "Ticker": "AMD",
              "Company": "Advanced Micro Devices"
            },
            {
              "Ticker": "ADXS",
              "Company": "Advaxis"
            },
            {
              "Ticker": "ADXSW",
              "Company": "Advaxis"
            },
            {
              "Ticker": "ADVM",
              "Company": "Adverum Biotechnologies"
            },
            {
              "Ticker": "DWMC",
              "Company": "AdvisorShares Dorsey Wright Micro-Cap ETF"
            },
            {
              "Ticker": "DWSH",
              "Company": "AdvisorShares Dorsey Wright Short ETF"
            },
            {
              "Ticker": "ACT",
              "Company": "AdvisorShares Vice ETF"
            },
            {
              "Ticker": "AEGN",
              "Company": "Aegion Corp"
            },
            {
              "Ticker": "AGLE",
              "Company": "Aeglea BioTherapeutics"
            },
            {
              "Ticker": "AEHR",
              "Company": "Aehr Test Systems"
            },
            {
              "Ticker": "AMTX",
              "Company": "Aemetis"
            },
            {
              "Ticker": "AERI",
              "Company": "Aerie Pharmaceuticals"
            },
            {
              "Ticker": "AVAV",
              "Company": "AeroVironment"
            },
            {
              "Ticker": "ARPO",
              "Company": "Aerpio Pharmaceuticals"
            },
            {
              "Ticker": "AEZS",
              "Company": "AEterna Zentaris Inc."
            },
            {
              "Ticker": "AEMD",
              "Company": "Aethlon Medical"
            },
            {
              "Ticker": "GNMX",
              "Company": "Aevi Genomic Medicine"
            },
            {
              "Ticker": "AFMD",
              "Company": "Affimed N.V."
            },
            {
              "Ticker": "AGEN",
              "Company": "Agenus Inc."
            },
            {
              "Ticker": "AGRX",
              "Company": "Agile Therapeutics"
            },
            {
              "Ticker": "AGYS",
              "Company": "Agilysys"
            },
            {
              "Ticker": "AGIO",
              "Company": "Agios Pharmaceuticals"
            },
            {
              "Ticker": "AGMH",
              "Company": "AGM Group Holdings Inc."
            },
            {
              "Ticker": "AGNC",
              "Company": "AGNC Investment Corp."
            },
            {
              "Ticker": "AGNCB",
              "Company": "AGNC Investment Corp."
            },
            {
              "Ticker": "AGNCN",
              "Company": "AGNC Investment Corp."
            },
            {
              "Ticker": "AGFS",
              "Company": "AgroFresh Solutions"
            },
            {
              "Ticker": "AGFSW",
              "Company": "AgroFresh Solutions"
            },
            {
              "Ticker": "ALRN",
              "Company": "Aileron Therapeutics"
            },
            {
              "Ticker": "AIMT",
              "Company": "Aimmune Therapeutics"
            },
            {
              "Ticker": "AIRT",
              "Company": "Air T"
            },
            {
              "Ticker": "ATSG",
              "Company": "Air Transport Services Group"
            },
            {
              "Ticker": "AIRG",
              "Company": "Airgain"
            },
            {
              "Ticker": "AMCN",
              "Company": "AirMedia Group Inc"
            },
            {
              "Ticker": "AKAM",
              "Company": "Akamai Technologies"
            },
            {
              "Ticker": "AKTX",
              "Company": "Akari Therapeutics Plc"
            },
            {
              "Ticker": "AKCA",
              "Company": "Akcea Therapeutics"
            },
            {
              "Ticker": "AKBA",
              "Company": "Akebia Therapeutics"
            },
            {
              "Ticker": "AKER",
              "Company": "Akers Biosciences Inc"
            },
            {
              "Ticker": "AKRX",
              "Company": "Akorn"
            },
            {
              "Ticker": "AKTS",
              "Company": "Akoustis Technologies"
            },
            {
              "Ticker": "ALRM",
              "Company": "Alarm.com Holdings"
            },
            {
              "Ticker": "ALSK",
              "Company": "Alaska Communications Systems Group"
            },
            {
              "Ticker": "ALBO",
              "Company": "Albireo Pharma"
            },
            {
              "Ticker": "ABDC",
              "Company": "Alcentra Capital Corp."
            },
            {
              "Ticker": "ALDR",
              "Company": "Alder BioPharmaceuticals"
            },
            {
              "Ticker": "ALDX",
              "Company": "Aldeyra Therapeutics"
            },
            {
              "Ticker": "ALXN",
              "Company": "Alexion Pharmaceuticals"
            },
            {
              "Ticker": "ALCO",
              "Company": "Alico"
            },
            {
              "Ticker": "ALGN",
              "Company": "Align Technology"
            },
            {
              "Ticker": "ALIM",
              "Company": "Alimera Sciences"
            },
            {
              "Ticker": "ALJJ",
              "Company": "ALJ Regional Holdings"
            },
            {
              "Ticker": "ALKS",
              "Company": "Alkermes plc"
            },
            {
              "Ticker": "ALLK",
              "Company": "Allakos Inc."
            },
            {
              "Ticker": "ABTX",
              "Company": "Allegiance Bancshares"
            },
            {
              "Ticker": "ALGT",
              "Company": "Allegiant Travel Company"
            },
            {
              "Ticker": "ALGR",
              "Company": "Allegro Merger Corp."
            },
            {
              "Ticker": "ALGRR",
              "Company": "Allegro Merger Corp."
            },
            {
              "Ticker": "ALGRU",
              "Company": "Allegro Merger Corp."
            },
            {
              "Ticker": "ALGRW",
              "Company": "Allegro Merger Corp."
            },
            {
              "Ticker": "ALNA",
              "Company": "Allena Pharmaceuticals"
            },
            {
              "Ticker": "AMMA",
              "Company": "Alliance MMA"
            },
            {
              "Ticker": "ARLP",
              "Company": "Alliance Resource Partners"
            },
            {
              "Ticker": "AHPI",
              "Company": "Allied Healthcare Products"
            },
            {
              "Ticker": "AMOT",
              "Company": "Allied Motion Technologies"
            },
            {
              "Ticker": "ALQA",
              "Company": "Alliqua BioMedical"
            },
            {
              "Ticker": "ALLO",
              "Company": "Allogene Therapeutics"
            },
            {
              "Ticker": "ALLT",
              "Company": "Allot Communications Ltd."
            },
            {
              "Ticker": "MDRX",
              "Company": "Allscripts Healthcare Solutions"
            },
            {
              "Ticker": "ALNY",
              "Company": "Alnylam Pharmaceuticals"
            },
            {
              "Ticker": "AOSL",
              "Company": "Alpha and Omega Semiconductor Limited"
            },
            {
              "Ticker": "GOOG",
              "Company": "Alphabet Inc."
            },
            {
              "Ticker": "GOOGL",
              "Company": "Alphabet Inc."
            },
            {
              "Ticker": "SMCP",
              "Company": "AlphaMark Actively Managed Small Cap ETF"
            },
            {
              "Ticker": "ATEC",
              "Company": "Alphatec Holdings"
            },
            {
              "Ticker": "ALPN",
              "Company": "Alpine Immune Sciences"
            },
            {
              "Ticker": "SWIN",
              "Company": "ALPS/Dorsey Wright Sector Momentum ETF"
            },
            {
              "Ticker": "AMR",
              "Company": "Alta Mesa Resources"
            },
            {
              "Ticker": "AMRWW",
              "Company": "Alta Mesa Resources"
            },
            {
              "Ticker": "AABA",
              "Company": "Altaba Inc."
            },
            {
              "Ticker": "ALTR",
              "Company": "Altair Engineering Inc."
            },
            {
              "Ticker": "ALT",
              "Company": "Altimmune"
            },
            {
              "Ticker": "ASPS",
              "Company": "Altisource Portfolio Solutions S.A."
            },
            {
              "Ticker": "AIMC",
              "Company": "Altra Industrial Motion Corp."
            },
            {
              "Ticker": "ALZH",
              "Company": "Alzheon"
            },
            {
              "Ticker": "AMAG",
              "Company": "AMAG Pharmaceuticals"
            },
            {
              "Ticker": "AMAL",
              "Company": "Amalgamated Bank"
            },
            {
              "Ticker": "AMRN",
              "Company": "Amarin Corporation plc"
            },
            {
              "Ticker": "AMRK",
              "Company": "A-Mark Precious Metals"
            },
            {
              "Ticker": "AMZN",
              "Company": "Amazon.com"
            },
            {
              "Ticker": "AMBC",
              "Company": "Ambac Financial Group"
            },
            {
              "Ticker": "AMBCW",
              "Company": "Ambac Financial Group"
            },
            {
              "Ticker": "AMBA",
              "Company": "Ambarella"
            },
            {
              "Ticker": "AMCX",
              "Company": "AMC Networks Inc."
            },
            {
              "Ticker": "DOX",
              "Company": "Amdocs Limited"
            },
            {
              "Ticker": "AMDA",
              "Company": "Amedica Corporation"
            },
            {
              "Ticker": "AMED",
              "Company": "Amedisys Inc"
            },
            {
              "Ticker": "UHAL",
              "Company": "Amerco"
            },
            {
              "Ticker": "AMRH",
              "Company": "Ameri Holdings"
            },
            {
              "Ticker": "AMRHW",
              "Company": "Ameri Holdings"
            },
            {
              "Ticker": "ATAX",
              "Company": "America First Multifamily Investors"
            },
            {
              "Ticker": "AMOV",
              "Company": "America Movil"
            },
            {
              "Ticker": "AAL",
              "Company": "American Airlines Group"
            },
            {
              "Ticker": "AETI",
              "Company": "American Electric Technologies"
            },
            {
              "Ticker": "AFIN",
              "Company": "American Finance Trust"
            },
            {
              "Ticker": "AMNB",
              "Company": "American National Bankshares"
            },
            {
              "Ticker": "ANAT",
              "Company": "American National Insurance Company"
            },
            {
              "Ticker": "AOBC",
              "Company": "American Outdoor Brands Corporation"
            },
            {
              "Ticker": "APEI",
              "Company": "American Public Education"
            },
            {
              "Ticker": "ARII",
              "Company": "American Railcar Industries"
            },
            {
              "Ticker": "AMRB",
              "Company": "American River Bankshares"
            },
            {
              "Ticker": "AMSWA",
              "Company": "American Software"
            },
            {
              "Ticker": "AMSC",
              "Company": "American Superconductor Corporation"
            },
            {
              "Ticker": "AMWD",
              "Company": "American Woodmark Corporation"
            },
            {
              "Ticker": "CRMT",
              "Company": "America&#39;s Car-Mart"
            },
            {
              "Ticker": "ABCB",
              "Company": "Ameris Bancorp"
            },
            {
              "Ticker": "AMSF",
              "Company": "AMERISAFE"
            },
            {
              "Ticker": "ASRV",
              "Company": "AmeriServ Financial Inc."
            },
            {
              "Ticker": "ASRVP",
              "Company": "AmeriServ Financial Inc."
            },
            {
              "Ticker": "ATLO",
              "Company": "Ames National Corporation"
            },
            {
              "Ticker": "AMGN",
              "Company": "Amgen Inc."
            },
            {
              "Ticker": "FOLD",
              "Company": "Amicus Therapeutics"
            },
            {
              "Ticker": "AMKR",
              "Company": "Amkor Technology"
            },
            {
              "Ticker": "AMPH",
              "Company": "Amphastar Pharmaceuticals"
            },
            {
              "Ticker": "IBUY",
              "Company": "Amplify Online Retail ETF"
            },
            {
              "Ticker": "ASYS",
              "Company": "Amtech Systems"
            },
            {
              "Ticker": "AFSI",
              "Company": "AmTrust Financial Services"
            },
            {
              "Ticker": "AMRS",
              "Company": "Amyris"
            },
            {
              "Ticker": "ADI",
              "Company": "Analog Devices"
            },
            {
              "Ticker": "ANAB",
              "Company": "AnaptysBio"
            },
            {
              "Ticker": "AVXL",
              "Company": "Anavex Life Sciences Corp."
            },
            {
              "Ticker": "ANCB",
              "Company": "Anchor Bancorp"
            },
            {
              "Ticker": "ANGI",
              "Company": "ANGI Homeservices Inc."
            },
            {
              "Ticker": "ANGO",
              "Company": "AngioDynamics"
            },
            {
              "Ticker": "ANIP",
              "Company": "ANI Pharmaceuticals"
            },
            {
              "Ticker": "ANIK",
              "Company": "Anika Therapeutics Inc."
            },
            {
              "Ticker": "ANIX",
              "Company": "Anixa Biosciences"
            },
            {
              "Ticker": "ANSS",
              "Company": "ANSYS"
            },
            {
              "Ticker": "ATRS",
              "Company": "Antares Pharma"
            },
            {
              "Ticker": "APLS",
              "Company": "Apellis Pharmaceuticals"
            },
            {
              "Ticker": "APOG",
              "Company": "Apogee Enterprises"
            },
            {
              "Ticker": "APEN",
              "Company": "Apollo Endosurgery"
            },
            {
              "Ticker": "AINV",
              "Company": "Apollo Investment Corporation"
            },
            {
              "Ticker": "AMEH",
              "Company": "Apollo Medical Holdings"
            },
            {
              "Ticker": "APPF",
              "Company": "AppFolio"
            },
            {
              "Ticker": "APPN",
              "Company": "Appian Corporation"
            },
            {
              "Ticker": "AAPL",
              "Company": "Apple Inc."
            },
            {
              "Ticker": "ARCI",
              "Company": "Appliance Recycling Centers of America"
            },
            {
              "Ticker": "APDN",
              "Company": "Applied DNA Sciences Inc"
            },
            {
              "Ticker": "APDNW",
              "Company": "Applied DNA Sciences Inc"
            },
            {
              "Ticker": "AGTC",
              "Company": "Applied Genetic Technologies Corporation"
            },
            {
              "Ticker": "AMAT",
              "Company": "Applied Materials"
            },
            {
              "Ticker": "AAOI",
              "Company": "Applied Optoelectronics"
            },
            {
              "Ticker": "AREX",
              "Company": "Approach Resources Inc."
            },
            {
              "Ticker": "APTI",
              "Company": "Apptio"
            },
            {
              "Ticker": "APRI",
              "Company": "Apricus Biosciences"
            },
            {
              "Ticker": "APVO",
              "Company": "Aptevo Therapeutics Inc."
            },
            {
              "Ticker": "APTX",
              "Company": "Aptinyx Inc."
            },
            {
              "Ticker": "APTO",
              "Company": "Aptose Biosciences"
            },
            {
              "Ticker": "AQMS",
              "Company": "Aqua Metals"
            },
            {
              "Ticker": "AQB",
              "Company": "AquaBounty Technologies"
            },
            {
              "Ticker": "AQST",
              "Company": "Aquestive Therapeutics"
            },
            {
              "Ticker": "AQXP",
              "Company": "Aquinox Pharmaceuticals"
            },
            {
              "Ticker": "ARDM",
              "Company": "Aradigm Corporation"
            },
            {
              "Ticker": "PETX",
              "Company": "Aratana Therapeutics"
            },
            {
              "Ticker": "ABUS",
              "Company": "Arbutus Biopharma Corporation"
            },
            {
              "Ticker": "ARCW",
              "Company": "ARC Group Worldwide"
            },
            {
              "Ticker": "ABIO",
              "Company": "ARCA biopharma"
            },
            {
              "Ticker": "RKDA",
              "Company": "Arcadia Biosciences"
            },
            {
              "Ticker": "ARCB",
              "Company": "ArcBest Corporation"
            },
            {
              "Ticker": "ACGL",
              "Company": "Arch Capital Group Ltd."
            },
            {
              "Ticker": "ACGLO",
              "Company": "Arch Capital Group Ltd."
            },
            {
              "Ticker": "ACGLP",
              "Company": "Arch Capital Group Ltd."
            },
            {
              "Ticker": "FUV",
              "Company": "Arcimoto"
            },
            {
              "Ticker": "ARCE",
              "Company": "Arco Platform Limited"
            },
            {
              "Ticker": "ARCT",
              "Company": "Arcturus Therapeutics Ltd."
            },
            {
              "Ticker": "ARDX",
              "Company": "Ardelyx"
            },
            {
              "Ticker": "ARNA",
              "Company": "Arena Pharmaceuticals"
            },
            {
              "Ticker": "ARCC",
              "Company": "Ares Capital Corporation"
            },
            {
              "Ticker": "ARGX",
              "Company": "argenx SE"
            },
            {
              "Ticker": "ARDS",
              "Company": "Aridis Pharmaceuticals Inc."
            },
            {
              "Ticker": "ARKR",
              "Company": "Ark Restaurants Corp."
            },
            {
              "Ticker": "ARTX",
              "Company": "Arotech Corporation"
            },
            {
              "Ticker": "ARQL",
              "Company": "ArQule"
            },
            {
              "Ticker": "ARRY",
              "Company": "Array BioPharma Inc."
            },
            {
              "Ticker": "ARRS",
              "Company": "ARRIS International plc"
            },
            {
              "Ticker": "DWCR",
              "Company": "Arrow DWA Country Rotation ETF"
            },
            {
              "Ticker": "DWAT",
              "Company": "Arrow DWA Tactical ETF"
            },
            {
              "Ticker": "AROW",
              "Company": "Arrow Financial Corporation"
            },
            {
              "Ticker": "ARWR",
              "Company": "Arrowhead Pharmaceuticals"
            },
            {
              "Ticker": "ASNS",
              "Company": "Arsanis"
            },
            {
              "Ticker": "ARTNA",
              "Company": "Artesian Resources Corporation"
            },
            {
              "Ticker": "ARTW",
              "Company": "Art&#39;s-Way Manufacturing Co."
            },
            {
              "Ticker": "ARVN",
              "Company": "Arvinas"
            },
            {
              "Ticker": "ARYAU",
              "Company": "ARYA Sciences Acquisiton Corp."
            },
            {
              "Ticker": "ASNA",
              "Company": "Ascena Retail Group"
            },
            {
              "Ticker": "ASND",
              "Company": "Ascendis Pharma A/S"
            },
            {
              "Ticker": "ASCMA",
              "Company": "Ascent Capital Group"
            },
            {
              "Ticker": "APWC",
              "Company": "Asia Pacific Wire & Cable Corporation Limited"
            },
            {
              "Ticker": "ASLN",
              "Company": "ASLAN Pharmaceuticals Limited"
            },
            {
              "Ticker": "ASML",
              "Company": "ASML Holding N.V."
            },
            {
              "Ticker": "ASPU",
              "Company": "Aspen Group Inc."
            },
            {
              "Ticker": "AZPN",
              "Company": "Aspen Technology"
            },
            {
              "Ticker": "ASMB",
              "Company": "Assembly Biosciences"
            },
            {
              "Ticker": "ASRT",
              "Company": "Assertio Therapeutics"
            },
            {
              "Ticker": "ASFI",
              "Company": "Asta Funding"
            },
            {
              "Ticker": "ASTE",
              "Company": "Astec Industries"
            },
            {
              "Ticker": "ATRO",
              "Company": "Astronics Corporation"
            },
            {
              "Ticker": "ALOT",
              "Company": "AstroNova"
            },
            {
              "Ticker": "ASTC",
              "Company": "Astrotech Corporation"
            },
            {
              "Ticker": "ASUR",
              "Company": "Asure Software Inc"
            },
            {
              "Ticker": "ASV",
              "Company": "ASV Holdings"
            },
            {
              "Ticker": "ATAI",
              "Company": "ATA Inc."
            },
            {
              "Ticker": "ATRA",
              "Company": "Atara Biotherapeutics"
            },
            {
              "Ticker": "ATHN",
              "Company": "athenahealth"
            },
            {
              "Ticker": "ATNX",
              "Company": "Athenex"
            },
            {
              "Ticker": "ATHX",
              "Company": "Athersys"
            },
            {
              "Ticker": "AAME",
              "Company": "Atlantic American Corporation"
            },
            {
              "Ticker": "ACBI",
              "Company": "Atlantic Capital Bancshares"
            },
            {
              "Ticker": "AY",
              "Company": "Atlantica Yield plc"
            },
            {
              "Ticker": "ATLC",
              "Company": "Atlanticus Holdings Corporation"
            },
            {
              "Ticker": "AAWW",
              "Company": "Atlas Air Worldwide Holdings"
            },
            {
              "Ticker": "AFH",
              "Company": "Atlas Financial Holdings"
            },
            {
              "Ticker": "AFHBL",
              "Company": "Atlas Financial Holdings"
            },
            {
              "Ticker": "TEAM",
              "Company": "Atlassian Corporation Plc"
            },
            {
              "Ticker": "ATNI",
              "Company": "ATN International"
            },
            {
              "Ticker": "ATOM",
              "Company": "Atomera Incorporated"
            },
            {
              "Ticker": "ATOS",
              "Company": "Atossa Genetics Inc."
            },
            {
              "Ticker": "ATRC",
              "Company": "AtriCure"
            },
            {
              "Ticker": "ATRI",
              "Company": "Atrion Corporation"
            },
            {
              "Ticker": "ATIS",
              "Company": "Attis Industries Inc."
            },
            {
              "Ticker": "ATISW",
              "Company": "Attis Industries Inc."
            },
            {
              "Ticker": "ATTU",
              "Company": "Attunity Ltd."
            },
            {
              "Ticker": "LIFE",
              "Company": "aTyr Pharma"
            },
            {
              "Ticker": "AUBN",
              "Company": "Auburn National Bancorporation"
            },
            {
              "Ticker": "BOLD",
              "Company": "Audentes Therapeutics"
            },
            {
              "Ticker": "AUDC",
              "Company": "AudioCodes Ltd."
            },
            {
              "Ticker": "AEYE",
              "Company": "AudioEye"
            },
            {
              "Ticker": "AUPH",
              "Company": "Aurinia Pharmaceuticals Inc"
            },
            {
              "Ticker": "EARS",
              "Company": "Auris Medical Holding AG"
            },
            {
              "Ticker": "JG",
              "Company": "Aurora Mobile Limited"
            },
            {
              "Ticker": "ADSK",
              "Company": "Autodesk"
            },
            {
              "Ticker": "AUTL",
              "Company": "Autolus Therapeutics plc"
            },
            {
              "Ticker": "ADP",
              "Company": "Automatic Data Processing"
            },
            {
              "Ticker": "AUTO",
              "Company": "AutoWeb"
            },
            {
              "Ticker": "AVDL",
              "Company": "Avadel Pharmaceuticals plc"
            },
            {
              "Ticker": "ATXI",
              "Company": "Avenue Therapeutics"
            },
            {
              "Ticker": "AVEO",
              "Company": "AVEO Pharmaceuticals"
            },
            {
              "Ticker": "AVNW",
              "Company": "Aviat Networks"
            },
            {
              "Ticker": "CDMO",
              "Company": "Avid Bioservices"
            },
            {
              "Ticker": "CDMOP",
              "Company": "Avid Bioservices"
            },
            {
              "Ticker": "AVID",
              "Company": "Avid Technology"
            },
            {
              "Ticker": "AVGR",
              "Company": "Avinger"
            },
            {
              "Ticker": "CAR",
              "Company": "Avis Budget Group"
            },
            {
              "Ticker": "AHPA",
              "Company": "Avista Healthcare Public Acquisition Corp."
            },
            {
              "Ticker": "AHPAU",
              "Company": "Avista Healthcare Public Acquisition Corp."
            },
            {
              "Ticker": "AHPAW",
              "Company": "Avista Healthcare Public Acquisition Corp."
            },
            {
              "Ticker": "AVT",
              "Company": "Avnet"
            },
            {
              "Ticker": "AVRO",
              "Company": "AVROBIO"
            },
            {
              "Ticker": "AWRE",
              "Company": "Aware"
            },
            {
              "Ticker": "ACLS",
              "Company": "Axcelis Technologies"
            },
            {
              "Ticker": "AXGN",
              "Company": "AxoGen"
            },
            {
              "Ticker": "AAXN",
              "Company": "Axon Enterprise"
            },
            {
              "Ticker": "AXON",
              "Company": "Axovant Sciences Ltd."
            },
            {
              "Ticker": "AXSM",
              "Company": "Axsome Therapeutics"
            },
            {
              "Ticker": "AXTI",
              "Company": "AXT Inc"
            },
            {
              "Ticker": "AYTU",
              "Company": "Aytu BioScience"
            },
            {
              "Ticker": "AZRX",
              "Company": "AzurRx BioPharma"
            },
            {
              "Ticker": "BCOM",
              "Company": "B Communications Ltd."
            },
            {
              "Ticker": "RILY",
              "Company": "B. Riley Financial"
            },
            {
              "Ticker": "RILYG",
              "Company": "B. Riley Financial"
            },
            {
              "Ticker": "RILYH",
              "Company": "B. Riley Financial"
            },
            {
              "Ticker": "RILYI",
              "Company": "B. Riley Financial"
            },
            {
              "Ticker": "RILYL",
              "Company": "B. Riley Financial"
            },
            {
              "Ticker": "RILYZ",
              "Company": "B. Riley Financial"
            },
            {
              "Ticker": "BOSC",
              "Company": "B.O.S. Better Online Solutions"
            },
            {
              "Ticker": "BIDU",
              "Company": "Baidu"
            },
            {
              "Ticker": "BCPC",
              "Company": "Balchem Corporation"
            },
            {
              "Ticker": "BLDP",
              "Company": "Ballard Power Systems"
            },
            {
              "Ticker": "BANF",
              "Company": "BancFirst Corporation"
            },
            {
              "Ticker": "BANFP",
              "Company": "BancFirst Corporation"
            },
            {
              "Ticker": "BCTF",
              "Company": "Bancorp 34"
            },
            {
              "Ticker": "BAND",
              "Company": "Bandwidth Inc."
            },
            {
              "Ticker": "BOCH",
              "Company": "Bank of Commerce Holdings (CA)"
            },
            {
              "Ticker": "BMRC",
              "Company": "Bank of Marin Bancorp"
            },
            {
              "Ticker": "BMLP",
              "Company": "Bank Of Montreal"
            },
            {
              "Ticker": "BKSC",
              "Company": "Bank of South Carolina Corp."
            },
            {
              "Ticker": "BOTJ",
              "Company": "Bank of the James Financial Group"
            },
            {
              "Ticker": "OZK",
              "Company": "Bank OZK"
            },
            {
              "Ticker": "BSVN",
              "Company": "Bank7 Corp."
            },
            {
              "Ticker": "BFIN",
              "Company": "BankFinancial Corporation"
            },
            {
              "Ticker": "BWFG",
              "Company": "Bankwell Financial Group"
            },
            {
              "Ticker": "BANR",
              "Company": "Banner Corporation"
            },
            {
              "Ticker": "BZUN",
              "Company": "Baozun Inc."
            },
            {
              "Ticker": "DFVL",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DFVS",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DLBL",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DLBS",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DTUL",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DTUS",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DTYL",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "DTYS",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "FLAT",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "STPP",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "TAPR",
              "Company": "Barclays PLC"
            },
            {
              "Ticker": "BHAC",
              "Company": "Barington/Hilco Acquisition Corp."
            },
            {
              "Ticker": "BHACR",
              "Company": "Barington/Hilco Acquisition Corp."
            },
            {
              "Ticker": "BHACU",
              "Company": "Barington/Hilco Acquisition Corp."
            },
            {
              "Ticker": "BHACW",
              "Company": "Barington/Hilco Acquisition Corp."
            },
            {
              "Ticker": "BBSI",
              "Company": "Barrett Business Services"
            },
            {
              "Ticker": "BSET",
              "Company": "Bassett Furniture Industries"
            },
            {
              "Ticker": "ZTEST",
              "Company": "BATS BZX Exchange"
            },
            {
              "Ticker": "BCML",
              "Company": "BayCom Corp"
            },
            {
              "Ticker": "BCBP",
              "Company": "BCB Bancorp"
            },
            {
              "Ticker": "BECN",
              "Company": "Beacon Roofing Supply"
            },
            {
              "Ticker": "BBGI",
              "Company": "Beasley Broadcast Group"
            },
            {
              "Ticker": "BBBY",
              "Company": "Bed Bath & Beyond Inc."
            },
            {
              "Ticker": "BGNE",
              "Company": "BeiGene"
            },
            {
              "Ticker": "BELFA",
              "Company": "Bel Fuse Inc."
            },
            {
              "Ticker": "BELFB",
              "Company": "Bel Fuse Inc."
            },
            {
              "Ticker": "BLPH",
              "Company": "Bellerophon Therapeutics"
            },
            {
              "Ticker": "BLCM",
              "Company": "Bellicum Pharmaceuticals"
            },
            {
              "Ticker": "BNCL",
              "Company": "Beneficial Bancorp"
            },
            {
              "Ticker": "BNFT",
              "Company": "Benefitfocus"
            },
            {
              "Ticker": "BNTC",
              "Company": "Benitec Biopharma Limited"
            },
            {
              "Ticker": "BNTCW",
              "Company": "Benitec Biopharma Limited"
            },
            {
              "Ticker": "BRY",
              "Company": "Berry Petroleum Corporation"
            },
            {
              "Ticker": "BYSI",
              "Company": "BeyondSpring"
            },
            {
              "Ticker": "BGCP",
              "Company": "BGC Partners"
            },
            {
              "Ticker": "BGFV",
              "Company": "Big 5 Sporting Goods Corporation"
            },
            {
              "Ticker": "BRPA",
              "Company": "Big Rock Partners Acquisition Corp."
            },
            {
              "Ticker": "BRPAR",
              "Company": "Big Rock Partners Acquisition Corp."
            },
            {
              "Ticker": "BRPAU",
              "Company": "Big Rock Partners Acquisition Corp."
            },
            {
              "Ticker": "BRPAW",
              "Company": "Big Rock Partners Acquisition Corp."
            },
            {
              "Ticker": "BILI",
              "Company": "Bilibili Inc."
            },
            {
              "Ticker": "BASI",
              "Company": "Bioanalytical Systems"
            },
            {
              "Ticker": "ORPN",
              "Company": "Bioblast Pharma Ltd."
            },
            {
              "Ticker": "BIOC",
              "Company": "Biocept"
            },
            {
              "Ticker": "BCRX",
              "Company": "BioCryst Pharmaceuticals"
            },
            {
              "Ticker": "BDSI",
              "Company": "BioDelivery Sciences International"
            },
            {
              "Ticker": "BFRA",
              "Company": "Biofrontera AG"
            },
            {
              "Ticker": "BIIB",
              "Company": "Biogen Inc."
            },
            {
              "Ticker": "BHTG",
              "Company": "BioHiTech Global"
            },
            {
              "Ticker": "BKYI",
              "Company": "BIO-key International"
            },
            {
              "Ticker": "BIOL",
              "Company": "Biolase"
            },
            {
              "Ticker": "BLFS",
              "Company": "BioLife Solutions"
            },
            {
              "Ticker": "BLRX",
              "Company": "BioLineRx Ltd."
            },
            {
              "Ticker": "BMRN",
              "Company": "BioMarin Pharmaceutical Inc."
            },
            {
              "Ticker": "BMRA",
              "Company": "Biomerica"
            },
            {
              "Ticker": "BNGO",
              "Company": "Bionano Genomics"
            },
            {
              "Ticker": "BNGOW",
              "Company": "Bionano Genomics"
            },
            {
              "Ticker": "BVXV",
              "Company": "BiondVax Pharmaceuticals Ltd."
            },
            {
              "Ticker": "BVXVW",
              "Company": "BiondVax Pharmaceuticals Ltd."
            },
            {
              "Ticker": "BPTH",
              "Company": "Bio-Path Holdings"
            },
            {
              "Ticker": "BIOS",
              "Company": "BioScrip"
            },
            {
              "Ticker": "BSGM",
              "Company": "BioSig Technologies"
            },
            {
              "Ticker": "BSTC",
              "Company": "BioSpecifics Technologies Corp"
            },
            {
              "Ticker": "TECH",
              "Company": "Bio-Techne Corp"
            },
            {
              "Ticker": "BEAT",
              "Company": "BioTelemetry"
            },
            {
              "Ticker": "BTAI",
              "Company": "BioXcel Therapeutics"
            },
            {
              "Ticker": "BCAC",
              "Company": "Bison Capital Acquisition Corp."
            },
            {
              "Ticker": "BCACR",
              "Company": "Bison Capital Acquisition Corp."
            },
            {
              "Ticker": "BCACU",
              "Company": "Bison Capital Acquisition Corp."
            },
            {
              "Ticker": "BCACW",
              "Company": "Bison Capital Acquisition Corp."
            },
            {
              "Ticker": "BJRI",
              "Company": "BJ&#39;s Restaurants"
            },
            {
              "Ticker": "BBOX",
              "Company": "Black Box Corporation"
            },
            {
              "Ticker": "BRAC",
              "Company": "Black Ridge Acquisition Corp."
            },
            {
              "Ticker": "BRACR",
              "Company": "Black Ridge Acquisition Corp."
            },
            {
              "Ticker": "BRACU",
              "Company": "Black Ridge Acquisition Corp."
            },
            {
              "Ticker": "BRACW",
              "Company": "Black Ridge Acquisition Corp."
            },
            {
              "Ticker": "BLKB",
              "Company": "Blackbaud"
            },
            {
              "Ticker": "BL",
              "Company": "BlackLine"
            },
            {
              "Ticker": "BKCC",
              "Company": "BlackRock Capital Investment Corporation"
            },
            {
              "Ticker": "TCPC",
              "Company": "BlackRock TCP Capital Corp."
            },
            {
              "Ticker": "BLNK",
              "Company": "Blink Charging Co."
            },
            {
              "Ticker": "BLNKW",
              "Company": "Blink Charging Co."
            },
            {
              "Ticker": "BLMN",
              "Company": "Bloomin&#39; Brands"
            },
            {
              "Ticker": "BCOR",
              "Company": "Blucora"
            },
            {
              "Ticker": "BLBD",
              "Company": "Blue Bird Corporation"
            },
            {
              "Ticker": "BHBK",
              "Company": "Blue Hills Bancorp"
            },
            {
              "Ticker": "BLUE",
              "Company": "bluebird bio"
            },
            {
              "Ticker": "BKEP",
              "Company": "Blueknight Energy Partners L.P."
            },
            {
              "Ticker": "BKEPP",
              "Company": "Blueknight Energy Partners L.P."
            },
            {
              "Ticker": "BPMC",
              "Company": "Blueprint Medicines Corporation"
            },
            {
              "Ticker": "ITEQ",
              "Company": "BlueStar Israel Technology ETF"
            },
            {
              "Ticker": "BMCH",
              "Company": "BMC Stock Holdings"
            },
            {
              "Ticker": "WIFI",
              "Company": "Boingo Wireless"
            },
            {
              "Ticker": "BOJA",
              "Company": "Bojangles&#39;"
            },
            {
              "Ticker": "BOKF",
              "Company": "BOK Financial Corporation"
            },
            {
              "Ticker": "BOKFL",
              "Company": "BOK Financial Corporation"
            },
            {
              "Ticker": "BNSO",
              "Company": "Bonso Electronics International"
            },
            {
              "Ticker": "BKNG",
              "Company": "Booking Holdings Inc."
            },
            {
              "Ticker": "BRQS",
              "Company": "Borqs Technologies"
            },
            {
              "Ticker": "BOMN",
              "Company": "Boston Omaha Corporation"
            },
            {
              "Ticker": "BPFH",
              "Company": "Boston Private Financial Holdings"
            },
            {
              "Ticker": "BPFHW",
              "Company": "Boston Private Financial Holdings"
            },
            {
              "Ticker": "EPAY",
              "Company": "Bottomline Technologies"
            },
            {
              "Ticker": "BOXL",
              "Company": "Boxlight Corporation"
            },
            {
              "Ticker": "BBRX",
              "Company": "Braeburn Pharmaceuticals"
            },
            {
              "Ticker": "BCLI",
              "Company": "Brainstorm Cell Therapeutics Inc."
            },
            {
              "Ticker": "BVNSC",
              "Company": "Brandes Investment Trust"
            },
            {
              "Ticker": "BDGE",
              "Company": "Bridge Bancorp"
            },
            {
              "Ticker": "BLIN",
              "Company": "Bridgeline Digital"
            },
            {
              "Ticker": "BWB",
              "Company": "Bridgewater Bancshares"
            },
            {
              "Ticker": "BRID",
              "Company": "Bridgford Foods Corporation"
            },
            {
              "Ticker": "BCOV",
              "Company": "Brightcove Inc."
            },
            {
              "Ticker": "BHF",
              "Company": "Brighthouse Financial"
            },
            {
              "Ticker": "BHFAL",
              "Company": "Brighthouse Financial"
            },
            {
              "Ticker": "AVGO",
              "Company": "Broadcom Inc."
            },
            {
              "Ticker": "BVSN",
              "Company": "BroadVision"
            },
            {
              "Ticker": "BYFC",
              "Company": "Broadway Financial Corporation"
            },
            {
              "Ticker": "BWEN",
              "Company": "Broadwind Energy"
            },
            {
              "Ticker": "BPY",
              "Company": "Brookfield Property Partners L.P."
            },
            {
              "Ticker": "BPR",
              "Company": "Brookfield Property REIT Inc."
            },
            {
              "Ticker": "BPRAP",
              "Company": "Brookfield Property REIT Inc."
            },
            {
              "Ticker": "BRKL",
              "Company": "Brookline Bancorp"
            },
            {
              "Ticker": "BRKS",
              "Company": "Brooks Automation"
            },
            {
              "Ticker": "DOOO",
              "Company": "BRP Inc."
            },
            {
              "Ticker": "BRKR",
              "Company": "Bruker Corporation"
            },
            {
              "Ticker": "BMTC",
              "Company": "Bryn Mawr Bank Corporation"
            },
            {
              "Ticker": "BLMT",
              "Company": "BSB Bancorp"
            },
            {
              "Ticker": "BSQR",
              "Company": "BSQUARE Corporation"
            },
            {
              "Ticker": "BLDR",
              "Company": "Builders FirstSource"
            },
            {
              "Ticker": "BFST",
              "Company": "Business First Bancshares"
            },
            {
              "Ticker": "CFFI",
              "Company": "C&F Financial Corporation"
            },
            {
              "Ticker": "CHRW",
              "Company": "C.H. Robinson Worldwide"
            },
            {
              "Ticker": "CA",
              "Company": "CA Inc."
            },
            {
              "Ticker": "CCMP",
              "Company": "Cabot Microelectronics Corporation"
            },
            {
              "Ticker": "CDNS",
              "Company": "Cadence Design Systems"
            },
            {
              "Ticker": "CDZI",
              "Company": "Cadiz"
            },
            {
              "Ticker": "CZR",
              "Company": "Caesars Entertainment Corporation"
            },
            {
              "Ticker": "CSTE",
              "Company": "Caesarstone Ltd."
            },
            {
              "Ticker": "PRSS",
              "Company": "CafePress Inc."
            },
            {
              "Ticker": "CLBS",
              "Company": "Caladrius Biosciences"
            },
            {
              "Ticker": "CHY",
              "Company": "Calamos Convertible and High Income Fund"
            },
            {
              "Ticker": "CHI",
              "Company": "Calamos Convertible Opportunities and Income Fund"
            },
            {
              "Ticker": "CCD",
              "Company": "Calamos Dynamic Convertible & Income Fund"
            },
            {
              "Ticker": "CHW",
              "Company": "Calamos Global Dynamic Income Fund"
            },
            {
              "Ticker": "CGO",
              "Company": "Calamos Global Total Return Fund"
            },
            {
              "Ticker": "CSQ",
              "Company": "Calamos Strategic Total Return Fund"
            },
            {
              "Ticker": "CAMP",
              "Company": "CalAmp Corp."
            },
            {
              "Ticker": "CVGW",
              "Company": "Calavo Growers"
            },
            {
              "Ticker": "CALA",
              "Company": "Calithera Biosciences"
            },
            {
              "Ticker": "CALM",
              "Company": "Cal-Maine Foods"
            },
            {
              "Ticker": "CLMT",
              "Company": "Calumet Specialty Products Partners"
            },
            {
              "Ticker": "CRUSC",
              "Company": "Calvert Management Series"
            },
            {
              "Ticker": "CLXT",
              "Company": "Calyxt"
            },
            {
              "Ticker": "ABCD",
              "Company": "Cambium Learning Group"
            },
            {
              "Ticker": "CATC",
              "Company": "Cambridge Bancorp"
            },
            {
              "Ticker": "CAC",
              "Company": "Camden National Corporation"
            },
            {
              "Ticker": "CAMT",
              "Company": "Camtek Ltd."
            },
            {
              "Ticker": "CSIQ",
              "Company": "Canadian Solar Inc."
            },
            {
              "Ticker": "CGIX",
              "Company": "Cancer Genetics"
            },
            {
              "Ticker": "CPHC",
              "Company": "Canterbury Park Holding Corporation"
            },
            {
              "Ticker": "CBNK",
              "Company": "Capital Bancorp"
            },
            {
              "Ticker": "CCBG",
              "Company": "Capital City Bank Group"
            },
            {
              "Ticker": "CPLP",
              "Company": "Capital Product Partners L.P."
            },
            {
              "Ticker": "CSWC",
              "Company": "Capital Southwest Corporation"
            },
            {
              "Ticker": "CSWCL",
              "Company": "Capital Southwest Corporation"
            },
            {
              "Ticker": "CPTA",
              "Company": "Capitala Finance Corp."
            },
            {
              "Ticker": "CPTAG",
              "Company": "Capitala Finance Corp."
            },
            {
              "Ticker": "CPTAL",
              "Company": "Capitala Finance Corp."
            },
            {
              "Ticker": "CFFN",
              "Company": "Capitol Federal Financial"
            },
            {
              "Ticker": "CAPR",
              "Company": "Capricor Therapeutics"
            },
            {
              "Ticker": "CSTR",
              "Company": "CapStar Financial Holdings"
            },
            {
              "Ticker": "CPST",
              "Company": "Capstone Turbine Corporation"
            },
            {
              "Ticker": "CARA",
              "Company": "Cara Therapeutics"
            },
            {
              "Ticker": "CBLK",
              "Company": "Carbon Black"
            },
            {
              "Ticker": "CARB",
              "Company": "Carbonite"
            },
            {
              "Ticker": "CSII",
              "Company": "Cardiovascular Systems"
            },
            {
              "Ticker": "CDLX",
              "Company": "Cardlytics"
            },
            {
              "Ticker": "CATM",
              "Company": "Cardtronics plc"
            },
            {
              "Ticker": "CDNA",
              "Company": "CareDx"
            },
            {
              "Ticker": "CECO",
              "Company": "Career Education Corporation"
            },
            {
              "Ticker": "CTRE",
              "Company": "CareTrust REIT"
            },
            {
              "Ticker": "CARG",
              "Company": "CarGurus"
            },
            {
              "Ticker": "CARO",
              "Company": "Carolina Financial Corporation"
            },
            {
              "Ticker": "CART",
              "Company": "Carolina Trust BancShares"
            },
            {
              "Ticker": "CRZO",
              "Company": "Carrizo Oil & Gas"
            },
            {
              "Ticker": "TAST",
              "Company": "Carrols Restaurant Group"
            },
            {
              "Ticker": "CARV",
              "Company": "Carver Bancorp"
            },
            {
              "Ticker": "CASM",
              "Company": "CAS Medical Systems"
            },
            {
              "Ticker": "CASA",
              "Company": "Casa Systems"
            },
            {
              "Ticker": "CWST",
              "Company": "Casella Waste Systems"
            },
            {
              "Ticker": "CASY",
              "Company": "Caseys General Stores"
            },
            {
              "Ticker": "CASI",
              "Company": "CASI Pharmaceuticals"
            },
            {
              "Ticker": "CASS",
              "Company": "Cass Information Systems"
            },
            {
              "Ticker": "CATB",
              "Company": "Catabasis Pharmaceuticals"
            },
            {
              "Ticker": "CBIO",
              "Company": "Catalyst Biosciences"
            },
            {
              "Ticker": "CPRX",
              "Company": "Catalyst Pharmaceuticals"
            },
            {
              "Ticker": "CATS",
              "Company": "Catasys"
            },
            {
              "Ticker": "CATY",
              "Company": "Cathay General Bancorp"
            },
            {
              "Ticker": "CATYW",
              "Company": "Cathay General Bancorp"
            },
            {
              "Ticker": "CGVIC",
              "Company": "Causeway ETMF Trust"
            },
            {
              "Ticker": "CIVEC",
              "Company": "Causeway ETMF Trust"
            },
            {
              "Ticker": "CVCO",
              "Company": "Cavco Industries"
            },
            {
              "Ticker": "CBFV",
              "Company": "CB Financial Services"
            },
            {
              "Ticker": "CBAK",
              "Company": "CBAK Energy Technology"
            },
            {
              "Ticker": "CBMB",
              "Company": "CBM Bancorp"
            },
            {
              "Ticker": "CBOE",
              "Company": "Cboe Global Markets"
            },
            {
              "Ticker": "CBTX",
              "Company": "CBTX"
            },
            {
              "Ticker": "CDK",
              "Company": "CDK Global"
            },
            {
              "Ticker": "CDTI",
              "Company": "CDTI Advanced Materials"
            },
            {
              "Ticker": "CDW",
              "Company": "CDW Corporation"
            },
            {
              "Ticker": "CECE",
              "Company": "CECO Environmental Corp."
            },
            {
              "Ticker": "CELC",
              "Company": "Celcuity Inc."
            },
            {
              "Ticker": "CELG",
              "Company": "Celgene Corporation"
            },
            {
              "Ticker": "CELGZ",
              "Company": "Celgene Corporation"
            },
            {
              "Ticker": "CLDX",
              "Company": "Celldex Therapeutics"
            },
            {
              "Ticker": "APOP",
              "Company": "Cellect Biotechnology Ltd."
            },
            {
              "Ticker": "APOPW",
              "Company": "Cellect Biotechnology Ltd."
            },
            {
              "Ticker": "CLRB",
              "Company": "Cellectar Biosciences"
            },
            {
              "Ticker": "CLRBW",
              "Company": "Cellectar Biosciences"
            },
            {
              "Ticker": "CLRBZ",
              "Company": "Cellectar Biosciences"
            },
            {
              "Ticker": "CLLS",
              "Company": "Cellectis S.A."
            },
            {
              "Ticker": "CBMG",
              "Company": "Cellular Biomedicine Group"
            },
            {
              "Ticker": "CLSN",
              "Company": "Celsion Corporation"
            },
            {
              "Ticker": "CELH",
              "Company": "Celsius Holdings"
            },
            {
              "Ticker": "CYAD",
              "Company": "Celyad SA"
            },
            {
              "Ticker": "CETX",
              "Company": "Cemtrex Inc."
            },
            {
              "Ticker": "CETXP",
              "Company": "Cemtrex Inc."
            },
            {
              "Ticker": "CETXW",
              "Company": "Cemtrex Inc."
            },
            {
              "Ticker": "CDEV",
              "Company": "Centennial Resource Development"
            },
            {
              "Ticker": "CSFL",
              "Company": "CenterState Bank Corporation"
            },
            {
              "Ticker": "CETV",
              "Company": "Central European Media Enterprises Ltd."
            },
            {
              "Ticker": "CFBK",
              "Company": "Central Federal Corporation"
            },
            {
              "Ticker": "CENT",
              "Company": "Central Garden & Pet Company"
            },
            {
              "Ticker": "CENTA",
              "Company": "Central Garden & Pet Company"
            },
            {
              "Ticker": "CVCY",
              "Company": "Central Valley Community Bancorp"
            },
            {
              "Ticker": "CENX",
              "Company": "Century Aluminum Company"
            },
            {
              "Ticker": "CNBKA",
              "Company": "Century Bancorp"
            },
            {
              "Ticker": "CNTY",
              "Company": "Century Casinos"
            },
            {
              "Ticker": "CRNT",
              "Company": "Ceragon Networks Ltd."
            },
            {
              "Ticker": "CERC",
              "Company": "Cerecor Inc."
            },
            {
              "Ticker": "CERCW",
              "Company": "Cerecor Inc."
            },
            {
              "Ticker": "CERN",
              "Company": "Cerner Corporation"
            },
            {
              "Ticker": "CERS",
              "Company": "Cerus Corporation"
            },
            {
              "Ticker": "KOOL",
              "Company": "Cesca Therapeutics Inc."
            },
            {
              "Ticker": "CEVA",
              "Company": "CEVA"
            },
            {
              "Ticker": "CSBR",
              "Company": "Champions Oncology"
            },
            {
              "Ticker": "CYOU",
              "Company": "Changyou.com Limited"
            },
            {
              "Ticker": "BURG",
              "Company": "Chanticleer Holdings"
            },
            {
              "Ticker": "CTHR",
              "Company": "Charles & Colvard Ltd."
            },
            {
              "Ticker": "GTLS",
              "Company": "Chart Industries"
            },
            {
              "Ticker": "CHTR",
              "Company": "Charter Communications"
            },
            {
              "Ticker": "CTACU",
              "Company": "ChaSerg Technology Acquisition Corp."
            },
            {
              "Ticker": "CHKP",
              "Company": "Check Point Software Technologies Ltd."
            },
            {
              "Ticker": "CHEK",
              "Company": "Check-Cap Ltd."
            },
            {
              "Ticker": "CHEKW",
              "Company": "Check-Cap Ltd."
            },
            {
              "Ticker": "CHEKZ",
              "Company": "Check-Cap Ltd."
            },
            {
              "Ticker": "CKPT",
              "Company": "Checkpoint Therapeutics"
            },
            {
              "Ticker": "CEMI",
              "Company": "Chembio Diagnostics"
            },
            {
              "Ticker": "CHFC",
              "Company": "Chemical Financial Corporation"
            },
            {
              "Ticker": "CCXI",
              "Company": "ChemoCentryx"
            },
            {
              "Ticker": "CHMG",
              "Company": "Chemung Financial Corp"
            },
            {
              "Ticker": "CHKE",
              "Company": "Cherokee Inc."
            },
            {
              "Ticker": "CHFS",
              "Company": "CHF Solutions"
            },
            {
              "Ticker": "CHMA",
              "Company": "Chiasma"
            },
            {
              "Ticker": "CSSE",
              "Company": "Chicken Soup for the Soul Entertainment"
            },
            {
              "Ticker": "CSSEP",
              "Company": "Chicken Soup for the Soul Entertainment"
            },
            {
              "Ticker": "PLCE",
              "Company": "Children&#39;s Place"
            },
            {
              "Ticker": "CMRX",
              "Company": "Chimerix"
            },
            {
              "Ticker": "CADC",
              "Company": "China Advanced Construction Materials Group"
            },
            {
              "Ticker": "CAAS",
              "Company": "China Automotive Systems"
            },
            {
              "Ticker": "CBPO",
              "Company": "China Biologic Products Holdings"
            },
            {
              "Ticker": "CCCL",
              "Company": "China Ceramics Co."
            },
            {
              "Ticker": "GLG",
              "Company": "China Commercial Credit"
            },
            {
              "Ticker": "CCRC",
              "Company": "China Customer Relations Centers"
            },
            {
              "Ticker": "JRJC",
              "Company": "China Finance Online Co. Limited"
            },
            {
              "Ticker": "HGSH",
              "Company": "China HGS Real Estate"
            },
            {
              "Ticker": "CIFS",
              "Company": "China Internet Nationwide Financial Services Inc."
            },
            {
              "Ticker": "CJJD",
              "Company": "China Jo-Jo Drugstores"
            },
            {
              "Ticker": "CLDC",
              "Company": "China Lending Corporation"
            },
            {
              "Ticker": "CHNR",
              "Company": "China Natural Resources"
            },
            {
              "Ticker": "CREG",
              "Company": "China Recycling Energy Corporation"
            },
            {
              "Ticker": "CNTF",
              "Company": "China TechFaith Wireless Communication Technology Limited"
            },
            {
              "Ticker": "CXDC",
              "Company": "China XD Plastics Company Limited"
            },
            {
              "Ticker": "CCIH",
              "Company": "ChinaCache International Holdings Ltd."
            },
            {
              "Ticker": "CNET",
              "Company": "ChinaNet Online Holdings"
            },
            {
              "Ticker": "IMOS",
              "Company": "ChipMOS TECHNOLOGIES INC."
            },
            {
              "Ticker": "CDXC",
              "Company": "ChromaDex Corporation"
            },
            {
              "Ticker": "CHSCL",
              "Company": "CHS Inc"
            },
            {
              "Ticker": "CHSCM",
              "Company": "CHS Inc"
            },
            {
              "Ticker": "CHSCN",
              "Company": "CHS Inc"
            },
            {
              "Ticker": "CHSCO",
              "Company": "CHS Inc"
            },
            {
              "Ticker": "CHSCP",
              "Company": "CHS Inc"
            },
            {
              "Ticker": "CHDN",
              "Company": "Churchill Downs"
            },
            {
              "Ticker": "CHUY",
              "Company": "Chuy&#39;s Holdings"
            },
            {
              "Ticker": "CDTX",
              "Company": "Cidara Therapeutics"
            },
            {
              "Ticker": "CMCT",
              "Company": "CIM Commercial Trust Corporation"
            },
            {
              "Ticker": "CMCTP",
              "Company": "CIM Commercial Trust Corporation"
            },
            {
              "Ticker": "CMPR",
              "Company": "Cimpress N.V"
            },
            {
              "Ticker": "CINF",
              "Company": "Cincinnati Financial Corporation"
            },
            {
              "Ticker": "CIDM",
              "Company": "Cinedigm Corp"
            },
            {
              "Ticker": "CTAS",
              "Company": "Cintas Corporation"
            },
            {
              "Ticker": "CRUS",
              "Company": "Cirrus Logic"
            },
            {
              "Ticker": "CSCO",
              "Company": "Cisco Systems"
            },
            {
              "Ticker": "CTRN",
              "Company": "Citi Trends"
            },
            {
              "Ticker": "CTXR",
              "Company": "Citius Pharmaceuticals"
            },
            {
              "Ticker": "CTXRW",
              "Company": "Citius Pharmaceuticals"
            },
            {
              "Ticker": "CZNC",
              "Company": "Citizens & Northern Corp"
            },
            {
              "Ticker": "CZWI",
              "Company": "Citizens Community Bancorp"
            },
            {
              "Ticker": "CZFC",
              "Company": "Citizens First Corporation"
            },
            {
              "Ticker": "CIZN",
              "Company": "Citizens Holding Company"
            },
            {
              "Ticker": "CTXS",
              "Company": "Citrix Systems"
            },
            {
              "Ticker": "CHCO",
              "Company": "City Holding Company"
            },
            {
              "Ticker": "CIVB",
              "Company": "Civista Bancshares"
            },
            {
              "Ticker": "CIVBP",
              "Company": "Civista Bancshares"
            },
            {
              "Ticker": "CLAR",
              "Company": "Clarus Corporation"
            },
            {
              "Ticker": "CLNE",
              "Company": "Clean Energy Fuels Corp."
            },
            {
              "Ticker": "CACG",
              "Company": "ClearBridge All Cap Growth ETF"
            },
            {
              "Ticker": "YLDE",
              "Company": "ClearBridge Dividend Strategy ESG ETF"
            },
            {
              "Ticker": "LRGE",
              "Company": "ClearBridge Large Cap Growth ESG ETF"
            },
            {
              "Ticker": "CLFD",
              "Company": "Clearfield"
            },
            {
              "Ticker": "CLRO",
              "Company": "ClearOne"
            },
            {
              "Ticker": "CLSD",
              "Company": "Clearside Biomedical"
            },
            {
              "Ticker": "CLIR",
              "Company": "ClearSign Combustion Corporation"
            },
            {
              "Ticker": "CLIRW",
              "Company": "ClearSign Combustion Corporation"
            },
            {
              "Ticker": "CMTA",
              "Company": "Clementia Pharmaceuticals Inc."
            },
            {
              "Ticker": "CBLI",
              "Company": "Cleveland BioLabs"
            },
            {
              "Ticker": "CLVS",
              "Company": "Clovis Oncology"
            },
            {
              "Ticker": "CLPS",
              "Company": "CLPS Incorporation"
            },
            {
              "Ticker": "CMFN",
              "Company": "CM Finance Inc"
            },
            {
              "Ticker": "CMFNL",
              "Company": "CM Finance Inc"
            },
            {
              "Ticker": "CMSS",
              "Company": "CM Seven Star Acquisition Corporation"
            },
            {
              "Ticker": "CMSSR",
              "Company": "CM Seven Star Acquisition Corporation"
            },
            {
              "Ticker": "CMSSU",
              "Company": "CM Seven Star Acquisition Corporation"
            },
            {
              "Ticker": "CMSSW",
              "Company": "CM Seven Star Acquisition Corporation"
            },
            {
              "Ticker": "CME",
              "Company": "CME Group Inc."
            },
            {
              "Ticker": "CCNE",
              "Company": "CNB Financial Corporation"
            },
            {
              "Ticker": "CCB",
              "Company": "Coastal Financial Corporation"
            },
            {
              "Ticker": "COKE",
              "Company": "Coca-Cola Bottling Co. Consolidated"
            },
            {
              "Ticker": "COCP",
              "Company": "Cocrystal Pharma"
            },
            {
              "Ticker": "CODA",
              "Company": "Coda Octopus Group"
            },
            {
              "Ticker": "CDXS",
              "Company": "Codexis"
            },
            {
              "Ticker": "CODX",
              "Company": "Co-Diagnostics"
            },
            {
              "Ticker": "CVLY",
              "Company": "Codorus Valley Bancorp"
            },
            {
              "Ticker": "JVA",
              "Company": "Coffee Holding Co."
            },
            {
              "Ticker": "CCOI",
              "Company": "Cogent Communications Holdings"
            },
            {
              "Ticker": "CGNX",
              "Company": "Cognex Corporation"
            },
            {
              "Ticker": "CTSH",
              "Company": "Cognizant Technology Solutions Corporation"
            },
            {
              "Ticker": "CWBR",
              "Company": "CohBar"
            },
            {
              "Ticker": "COHR",
              "Company": "Coherent"
            },
            {
              "Ticker": "CHRS",
              "Company": "Coherus BioSciences"
            },
            {
              "Ticker": "COHU",
              "Company": "Cohu"
            },
            {
              "Ticker": "CLCT",
              "Company": "Collectors Universe"
            },
            {
              "Ticker": "COLL",
              "Company": "Collegium Pharmaceutical"
            },
            {
              "Ticker": "CIGI",
              "Company": "Colliers International Group Inc."
            },
            {
              "Ticker": "CLGN",
              "Company": "CollPlant Holdings"
            },
            {
              "Ticker": "CBAN",
              "Company": "Colony Bankcorp"
            },
            {
              "Ticker": "COLB",
              "Company": "Columbia Banking System"
            },
            {
              "Ticker": "CLBK",
              "Company": "Columbia Financial"
            },
            {
              "Ticker": "COLM",
              "Company": "Columbia Sportswear Company"
            },
            {
              "Ticker": "CMCO",
              "Company": "Columbus McKinnon Corporation"
            },
            {
              "Ticker": "CMCSA",
              "Company": "Comcast Corporation"
            },
            {
              "Ticker": "CCNI",
              "Company": "Command Center"
            },
            {
              "Ticker": "CBSH",
              "Company": "Commerce Bancshares"
            },
            {
              "Ticker": "CBSHP",
              "Company": "Commerce Bancshares"
            },
            {
              "Ticker": "CVGI",
              "Company": "Commercial Vehicle Group"
            },
            {
              "Ticker": "COMM",
              "Company": "CommScope Holding Company"
            },
            {
              "Ticker": "JCS",
              "Company": "Communications Systems"
            },
            {
              "Ticker": "ESXB",
              "Company": "Community Bankers Trust Corporation."
            },
            {
              "Ticker": "CFBI",
              "Company": "Community First Bancshares"
            },
            {
              "Ticker": "CYHHZ",
              "Company": "Community Health Systems"
            },
            {
              "Ticker": "CTBI",
              "Company": "Community Trust Bancorp"
            },
            {
              "Ticker": "CWBC",
              "Company": "Community West Bancshares"
            },
            {
              "Ticker": "CVLT",
              "Company": "Commvault Systems"
            },
            {
              "Ticker": "CGEN",
              "Company": "Compugen Ltd."
            },
            {
              "Ticker": "CPSI",
              "Company": "Computer Programs and Systems"
            },
            {
              "Ticker": "CTG",
              "Company": "Computer Task Group"
            },
            {
              "Ticker": "SCOR",
              "Company": "comScore"
            },
            {
              "Ticker": "CHCI",
              "Company": "Comstock Holding Companies"
            },
            {
              "Ticker": "CMTL",
              "Company": "Comtech Telecommunications Corp."
            },
            {
              "Ticker": "CNAT",
              "Company": "Conatus Pharmaceuticals Inc."
            },
            {
              "Ticker": "CNCE",
              "Company": "Concert Pharmaceuticals"
            },
            {
              "Ticker": "CDOR",
              "Company": "Condor Hospitality Trust"
            },
            {
              "Ticker": "CFMS",
              "Company": "ConforMIS"
            },
            {
              "Ticker": "CNFR",
              "Company": "Conifer Holdings"
            },
            {
              "Ticker": "CNMD",
              "Company": "CONMED Corporation"
            },
            {
              "Ticker": "CTWS",
              "Company": "Connecticut Water Service"
            },
            {
              "Ticker": "CNOB",
              "Company": "ConnectOne Bancorp"
            },
            {
              "Ticker": "CONN",
              "Company": "Conn&#39;s"
            },
            {
              "Ticker": "CNSL",
              "Company": "Consolidated Communications Holdings"
            },
            {
              "Ticker": "CWCO",
              "Company": "Consolidated Water Co. Ltd."
            },
            {
              "Ticker": "CNAC",
              "Company": "Constellation Alpha Capital Corp."
            },
            {
              "Ticker": "CNACR",
              "Company": "Constellation Alpha Capital Corp."
            },
            {
              "Ticker": "CNACU",
              "Company": "Constellation Alpha Capital Corp."
            },
            {
              "Ticker": "CNACW",
              "Company": "Constellation Alpha Capital Corp."
            },
            {
              "Ticker": "CNST",
              "Company": "Constellation Pharmaceuticals"
            },
            {
              "Ticker": "ROAD",
              "Company": "Construction Partners"
            },
            {
              "Ticker": "CPSS",
              "Company": "Consumer Portfolio Services"
            },
            {
              "Ticker": "CFRX",
              "Company": "ContraFect Corporation"
            },
            {
              "Ticker": "CTRV",
              "Company": "ContraVir Pharmaceuticals Inc."
            },
            {
              "Ticker": "CTRL",
              "Company": "Control4 Corporation"
            },
            {
              "Ticker": "CVON",
              "Company": "ConvergeOne Holdings"
            },
            {
              "Ticker": "AWSM",
              "Company": "Cool Holdings Inc."
            },
            {
              "Ticker": "CPRT",
              "Company": "Copart"
            },
            {
              "Ticker": "CRBP",
              "Company": "Corbus Pharmaceuticals Holdings"
            },
            {
              "Ticker": "CORT",
              "Company": "Corcept Therapeutics Incorporated"
            },
            {
              "Ticker": "CORE",
              "Company": "Core-Mark Holding Company"
            },
            {
              "Ticker": "CORI",
              "Company": "Corium International"
            },
            {
              "Ticker": "CSOD",
              "Company": "Cornerstone OnDemand"
            },
            {
              "Ticker": "CORV",
              "Company": "Correvio Pharma Corp."
            },
            {
              "Ticker": "CRVL",
              "Company": "CorVel Corp."
            },
            {
              "Ticker": "CRVS",
              "Company": "Corvus Pharmaceuticals"
            },
            {
              "Ticker": "CSGP",
              "Company": "CoStar Group"
            },
            {
              "Ticker": "COST",
              "Company": "Costco Wholesale Corporation"
            },
            {
              "Ticker": "CPAH",
              "Company": "CounterPath Corporation"
            },
            {
              "Ticker": "ICBK",
              "Company": "County Bancorp"
            },
            {
              "Ticker": "COUP",
              "Company": "Coupa Software Incorporated"
            },
            {
              "Ticker": "CVTI",
              "Company": "Covenant Transportation Group"
            },
            {
              "Ticker": "COWN",
              "Company": "Cowen Inc."
            },
            {
              "Ticker": "COWNL",
              "Company": "Cowen Inc."
            },
            {
              "Ticker": "COWNZ",
              "Company": "Cowen Inc."
            },
            {
              "Ticker": "PMTS",
              "Company": "CPI Card Group Inc."
            },
            {
              "Ticker": "CPSH",
              "Company": "CPS Technologies Corp."
            },
            {
              "Ticker": "CRAI",
              "Company": "CRA International"
            },
            {
              "Ticker": "CBRL",
              "Company": "Cracker Barrel Old Country Store"
            },
            {
              "Ticker": "BREW",
              "Company": "Craft Brew Alliance"
            },
            {
              "Ticker": "CRAY",
              "Company": "Cray Inc"
            },
            {
              "Ticker": "CACC",
              "Company": "Credit Acceptance Corporation"
            },
            {
              "Ticker": "DGLD",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "DSLV",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "GLDI",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "SLVO",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "TVIX",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "UGLD",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "USLV",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "USOI",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "VIIX",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "ZIV",
              "Company": "Credit Suisse AG"
            },
            {
              "Ticker": "CREE",
              "Company": "Cree"
            },
            {
              "Ticker": "CRESY",
              "Company": "Cresud S.A.C.I.F. y A."
            },
            {
              "Ticker": "CRNX",
              "Company": "Crinetics Pharmaceuticals"
            },
            {
              "Ticker": "CRSP",
              "Company": "CRISPR Therapeutics AG"
            },
            {
              "Ticker": "CRTO",
              "Company": "Criteo S.A."
            },
            {
              "Ticker": "CROX",
              "Company": "Crocs"
            },
            {
              "Ticker": "CRON",
              "Company": "Cronos Group Inc."
            },
            {
              "Ticker": "CCRN",
              "Company": "Cross Country Healthcare"
            },
            {
              "Ticker": "CRWS",
              "Company": "Crown Crafts"
            },
            {
              "Ticker": "CYRX",
              "Company": "CryoPort"
            },
            {
              "Ticker": "CYRXW",
              "Company": "CryoPort"
            },
            {
              "Ticker": "CSGS",
              "Company": "CSG Systems International"
            },
            {
              "Ticker": "CCLP",
              "Company": "CSI Compressco LP"
            },
            {
              "Ticker": "CSPI",
              "Company": "CSP Inc."
            },
            {
              "Ticker": "CSWI",
              "Company": "CSW Industrials"
            },
            {
              "Ticker": "CSX",
              "Company": "CSX Corporation"
            },
            {
              "Ticker": "CTIC",
              "Company": "CTI BioPharma Corp."
            },
            {
              "Ticker": "CTIB",
              "Company": "CTI Industries Corporation"
            },
            {
              "Ticker": "CTRP",
              "Company": "Ctrip.com International"
            },
            {
              "Ticker": "CUE",
              "Company": "Cue Biopharma"
            },
            {
              "Ticker": "CUI",
              "Company": "CUI Global"
            },
            {
              "Ticker": "CPIX",
              "Company": "Cumberland Pharmaceuticals Inc."
            },
            {
              "Ticker": "CMLS",
              "Company": "Cumulus Media Inc."
            },
            {
              "Ticker": "CRIS",
              "Company": "Curis"
            },
            {
              "Ticker": "CUTR",
              "Company": "Cutera"
            },
            {
              "Ticker": "CVBF",
              "Company": "CVB Financial Corporation"
            },
            {
              "Ticker": "CVV",
              "Company": "CVD Equipment Corporation"
            },
            {
              "Ticker": "CYAN",
              "Company": "Cyanotech Corporation"
            },
            {
              "Ticker": "CYBR",
              "Company": "CyberArk Software Ltd."
            },
            {
              "Ticker": "CYBE",
              "Company": "CyberOptics Corporation"
            },
            {
              "Ticker": "CYCC",
              "Company": "Cyclacel Pharmaceuticals"
            },
            {
              "Ticker": "CYCCP",
              "Company": "Cyclacel Pharmaceuticals"
            },
            {
              "Ticker": "CBAY",
              "Company": "CymaBay Therapeutics Inc."
            },
            {
              "Ticker": "CY",
              "Company": "Cypress Semiconductor Corporation"
            },
            {
              "Ticker": "CYRN",
              "Company": "CYREN Ltd."
            },
            {
              "Ticker": "CONE",
              "Company": "CyrusOne Inc"
            },
            {
              "Ticker": "CYTK",
              "Company": "Cytokinetics"
            },
            {
              "Ticker": "CTMX",
              "Company": "CytomX Therapeutics"
            },
            {
              "Ticker": "CYTX",
              "Company": "Cytori Therapeutics Inc."
            },
            {
              "Ticker": "CYTXW",
              "Company": "Cytori Therapeutics Inc."
            },
            {
              "Ticker": "CYTXZ",
              "Company": "Cytori Therapeutics Inc."
            },
            {
              "Ticker": "CTSO",
              "Company": "Cytosorbents Corporation"
            },
            {
              "Ticker": "CYTR",
              "Company": "CytRx Corporation"
            },
            {
              "Ticker": "DJCO",
              "Company": "Daily Journal Corp. (S.C.)"
            },
            {
              "Ticker": "DAKT",
              "Company": "Daktronics"
            },
            {
              "Ticker": "DARE",
              "Company": "Dare Bioscience"
            },
            {
              "Ticker": "DRIO",
              "Company": "DarioHealth Corp."
            },
            {
              "Ticker": "DRIOW",
              "Company": "DarioHealth Corp."
            },
            {
              "Ticker": "DZSI",
              "Company": "DASAN Zhone Solutions"
            },
            {
              "Ticker": "DSKE",
              "Company": "Daseke"
            },
            {
              "Ticker": "DSKEW",
              "Company": "Daseke"
            },
            {
              "Ticker": "DAIO",
              "Company": "Data I/O Corporation"
            },
            {
              "Ticker": "DWCH",
              "Company": "Datawatch Corporation"
            },
            {
              "Ticker": "PLAY",
              "Company": "Dave & Buster&#39;s Entertainment"
            },
            {
              "Ticker": "DTEA",
              "Company": "DAVIDsTEA Inc."
            },
            {
              "Ticker": "DFNL",
              "Company": "Davis Select Financial ETF"
            },
            {
              "Ticker": "DINT",
              "Company": "Davis Select International ETF"
            },
            {
              "Ticker": "DUSA",
              "Company": "Davis Select U.S. Equity ETF"
            },
            {
              "Ticker": "DWLD",
              "Company": "Davis Select Worldwide ETF"
            },
            {
              "Ticker": "DWSN",
              "Company": "Dawson Geophysical Company"
            },
            {
              "Ticker": "DBVT",
              "Company": "DBV Technologies S.A."
            },
            {
              "Ticker": "DDMX",
              "Company": "DD3 Acquisition Corp."
            },
            {
              "Ticker": "DDMXU",
              "Company": "DD3 Acquisition Corp."
            },
            {
              "Ticker": "DCPH",
              "Company": "Deciphera Pharmaceuticals"
            },
            {
              "Ticker": "DFRG",
              "Company": "Del Frisco&#39;s Restaurant Group"
            },
            {
              "Ticker": "TACO",
              "Company": "Del Taco Restaurants"
            },
            {
              "Ticker": "TACOW",
              "Company": "Del Taco Restaurants"
            },
            {
              "Ticker": "DMPI",
              "Company": "DelMar Pharmaceuticals"
            },
            {
              "Ticker": "DELT",
              "Company": "Delta Technology Holdings Limited"
            },
            {
              "Ticker": "DNLI",
              "Company": "Denali Therapeutics Inc."
            },
            {
              "Ticker": "DENN",
              "Company": "Denny&#39;s Corporation"
            },
            {
              "Ticker": "XRAY",
              "Company": "DENTSPLY SIRONA Inc."
            },
            {
              "Ticker": "DDOC",
              "Company": "DERMAdoctor"
            },
            {
              "Ticker": "DERM",
              "Company": "Dermira"
            },
            {
              "Ticker": "DEST",
              "Company": "Destination Maternity Corporation"
            },
            {
              "Ticker": "DXLG",
              "Company": "Destination XL Group"
            },
            {
              "Ticker": "DSWL",
              "Company": "Deswell Industries"
            },
            {
              "Ticker": "DTRM",
              "Company": "Determine"
            },
            {
              "Ticker": "DXCM",
              "Company": "DexCom"
            },
            {
              "Ticker": "DFBH",
              "Company": "DFB Healthcare Acquisitions Corp."
            },
            {
              "Ticker": "DFBHU",
              "Company": "DFB Healthcare Acquisitions Corp."
            },
            {
              "Ticker": "DFBHW",
              "Company": "DFB Healthcare Acquisitions Corp."
            },
            {
              "Ticker": "DHXM",
              "Company": "DHX Media Ltd."
            },
            {
              "Ticker": "DHIL",
              "Company": "Diamond Hill Investment Group"
            },
            {
              "Ticker": "FANG",
              "Company": "Diamondback Energy"
            },
            {
              "Ticker": "DCIX",
              "Company": "Diana Containerships Inc."
            },
            {
              "Ticker": "DRNA",
              "Company": "Dicerna Pharmaceuticals"
            },
            {
              "Ticker": "DFBG",
              "Company": "Differential Brands Group Inc."
            },
            {
              "Ticker": "DFFN",
              "Company": "Diffusion Pharmaceuticals Inc."
            },
            {
              "Ticker": "DGII",
              "Company": "Digi International Inc."
            },
            {
              "Ticker": "DMRC",
              "Company": "Digimarc Corporation"
            },
            {
              "Ticker": "DRAD",
              "Company": "Digirad Corporation"
            },
            {
              "Ticker": "DGLY",
              "Company": "Digital Ally"
            },
            {
              "Ticker": "APPS",
              "Company": "Digital Turbine"
            },
            {
              "Ticker": "DCOM",
              "Company": "Dime Community Bancshares"
            },
            {
              "Ticker": "DIOD",
              "Company": "Diodes Incorporated"
            },
            {
              "Ticker": "DISCA",
              "Company": "Discovery"
            },
            {
              "Ticker": "DISCB",
              "Company": "Discovery"
            },
            {
              "Ticker": "DISCK",
              "Company": "Discovery"
            },
            {
              "Ticker": "DISH",
              "Company": "DISH Network Corporation"
            },
            {
              "Ticker": "DVCR",
              "Company": "Diversicare Healthcare Services Inc."
            },
            {
              "Ticker": "SAUC",
              "Company": "Diversified Restaurant Holdings"
            },
            {
              "Ticker": "DLHC",
              "Company": "DLH Holdings Corp."
            },
            {
              "Ticker": "BOOM",
              "Company": "DMC Global Inc."
            },
            {
              "Ticker": "DNBF",
              "Company": "DNB Financial Corp"
            },
            {
              "Ticker": "DOCU",
              "Company": "DocuSign"
            },
            {
              "Ticker": "DOGZ",
              "Company": "Dogness (International) Corporation"
            },
            {
              "Ticker": "DLTR",
              "Company": "Dollar Tree"
            },
            {
              "Ticker": "DLPN",
              "Company": "Dolphin Entertainment"
            },
            {
              "Ticker": "DLPNW",
              "Company": "Dolphin Entertainment"
            },
            {
              "Ticker": "DOMO",
              "Company": "Domo"
            },
            {
              "Ticker": "DGICA",
              "Company": "Donegal Group"
            },
            {
              "Ticker": "DGICB",
              "Company": "Donegal Group"
            },
            {
              "Ticker": "DMLP",
              "Company": "Dorchester Minerals"
            },
            {
              "Ticker": "DORM",
              "Company": "Dorman Products"
            },
            {
              "Ticker": "DOVA",
              "Company": "Dova Pharmaceuticals"
            },
            {
              "Ticker": "LYL",
              "Company": "Dragon Victory International Limited"
            },
            {
              "Ticker": "DOTA",
              "Company": "Draper Oakwood Technology Acquisition"
            },
            {
              "Ticker": "DOTAR",
              "Company": "Draper Oakwood Technology Acquisition"
            },
            {
              "Ticker": "DOTAU",
              "Company": "Draper Oakwood Technology Acquisition"
            },
            {
              "Ticker": "DOTAW",
              "Company": "Draper Oakwood Technology Acquisition"
            },
            {
              "Ticker": "DBX",
              "Company": "Dropbox"
            },
            {
              "Ticker": "DCAR",
              "Company": "DropCar"
            },
            {
              "Ticker": "DRYS",
              "Company": "DryShips Inc."
            },
            {
              "Ticker": "DSPG",
              "Company": "DSP Group"
            },
            {
              "Ticker": "DLTH",
              "Company": "Duluth Holdings Inc."
            },
            {
              "Ticker": "DNKN",
              "Company": "Dunkin&#39; Brands Group"
            },
            {
              "Ticker": "DRRX",
              "Company": "DURECT Corporation"
            },
            {
              "Ticker": "DXPE",
              "Company": "DXP Enterprises"
            },
            {
              "Ticker": "DYSL",
              "Company": "Dynasil Corporation of America"
            },
            {
              "Ticker": "DYNT",
              "Company": "Dynatronics Corporation"
            },
            {
              "Ticker": "DVAX",
              "Company": "Dynavax Technologies Corporation"
            },
            {
              "Ticker": "ETFC",
              "Company": "E*TRADE Financial Corporation"
            },
            {
              "Ticker": "SSP",
              "Company": "E.W. Scripps Company (The)"
            },
            {
              "Ticker": "EBMT",
              "Company": "Eagle Bancorp Montana"
            },
            {
              "Ticker": "EGBN",
              "Company": "Eagle Bancorp"
            },
            {
              "Ticker": "EGLE",
              "Company": "Eagle Bulk Shipping Inc."
            },
            {
              "Ticker": "EFBI",
              "Company": "Eagle Financial Bancorp"
            },
            {
              "Ticker": "EGRX",
              "Company": "Eagle Pharmaceuticals"
            },
            {
              "Ticker": "IGLE",
              "Company": "Eagleline Acquisition Corp."
            },
            {
              "Ticker": "EWBC",
              "Company": "East West Bancorp"
            },
            {
              "Ticker": "EACQ",
              "Company": "Easterly Acquisition Corp."
            },
            {
              "Ticker": "EACQU",
              "Company": "Easterly Acquisition Corp."
            },
            {
              "Ticker": "EACQW",
              "Company": "Easterly Acquisition Corp."
            },
            {
              "Ticker": "EML",
              "Company": "Eastern Company (The)"
            },
            {
              "Ticker": "EAST",
              "Company": "Eastside Distilling"
            },
            {
              "Ticker": "EVGBC",
              "Company": "Eaton Vance NextShares Trust"
            },
            {
              "Ticker": "EVSTC",
              "Company": "Eaton Vance NextShares Trust"
            },
            {
              "Ticker": "EVFTC",
              "Company": "Eaton Vance NextShares Trust II"
            },
            {
              "Ticker": "EVLMC",
              "Company": "Eaton Vance NextShares Trust II"
            },
            {
              "Ticker": "OKDCC",
              "Company": "Eaton Vance NextShares Trust II"
            },
            {
              "Ticker": "EBAY",
              "Company": "eBay Inc."
            },
            {
              "Ticker": "EBAYL",
              "Company": "eBay Inc."
            },
            {
              "Ticker": "EBIX",
              "Company": "Ebix"
            },
            {
              "Ticker": "ECHO",
              "Company": "Echo Global Logistics"
            },
            {
              "Ticker": "SATS",
              "Company": "EchoStar Corporation"
            },
            {
              "Ticker": "EEI",
              "Company": "Ecology and Environment"
            },
            {
              "Ticker": "ESES",
              "Company": "Eco-Stim Energy Solutions"
            },
            {
              "Ticker": "EDAP",
              "Company": "EDAP TMS S.A."
            },
            {
              "Ticker": "EDGE",
              "Company": "Edge Therapeutics"
            },
            {
              "Ticker": "EDGW",
              "Company": "Edgewater Technology"
            },
            {
              "Ticker": "EDNT",
              "Company": "Edison Nation"
            },
            {
              "Ticker": "EDIT",
              "Company": "Editas Medicine"
            },
            {
              "Ticker": "EDTXU",
              "Company": "EdtechX Holdings Acquisition Corp."
            },
            {
              "Ticker": "EDUC",
              "Company": "Educational Development Corporation"
            },
            {
              "Ticker": "EGAN",
              "Company": "eGain Corporation"
            },
            {
              "Ticker": "EHTH",
              "Company": "eHealth"
            },
            {
              "Ticker": "EIDX",
              "Company": "Eidos Therapeutics"
            },
            {
              "Ticker": "EIGR",
              "Company": "Eiger BioPharmaceuticals"
            },
            {
              "Ticker": "EKSO",
              "Company": "Ekso Bionics Holdings"
            },
            {
              "Ticker": "LOCO",
              "Company": "El Pollo Loco Holdings"
            },
            {
              "Ticker": "EMITF",
              "Company": "Elbit Imaging Ltd."
            },
            {
              "Ticker": "ESLT",
              "Company": "Elbit Systems Ltd."
            },
            {
              "Ticker": "ERI",
              "Company": "Eldorado Resorts"
            },
            {
              "Ticker": "SOLO",
              "Company": "Electrameccanica Vehicles Corp. Ltd."
            },
            {
              "Ticker": "SOLOW",
              "Company": "Electrameccanica Vehicles Corp. Ltd."
            },
            {
              "Ticker": "ESIO",
              "Company": "Electro Scientific Industries"
            },
            {
              "Ticker": "ECOR",
              "Company": "electroCore"
            },
            {
              "Ticker": "EA",
              "Company": "Electronic Arts Inc."
            },
            {
              "Ticker": "EFII",
              "Company": "Electronics for Imaging"
            },
            {
              "Ticker": "ELSE",
              "Company": "Electro-Sensors"
            },
            {
              "Ticker": "ESBK",
              "Company": "Elmira Savings Bank NY (The)"
            },
            {
              "Ticker": "ELOX",
              "Company": "Eloxx Pharmaceuticals"
            },
            {
              "Ticker": "ELTK",
              "Company": "Eltek Ltd."
            },
            {
              "Ticker": "EMCI",
              "Company": "EMC Insurance Group Inc."
            },
            {
              "Ticker": "EMCF",
              "Company": "Emclaire Financial Corp"
            },
            {
              "Ticker": "EMKR",
              "Company": "EMCORE Corporation"
            },
            {
              "Ticker": "EMMS",
              "Company": "Emmis Communications Corporation"
            },
            {
              "Ticker": "NYNY",
              "Company": "Empire Resorts"
            },
            {
              "Ticker": "ENTA",
              "Company": "Enanta Pharmaceuticals"
            },
            {
              "Ticker": "ECPG",
              "Company": "Encore Capital Group Inc"
            },
            {
              "Ticker": "WIRE",
              "Company": "Encore Wire Corporation"
            },
            {
              "Ticker": "ENDP",
              "Company": "Endo International plc"
            },
            {
              "Ticker": "ECYT",
              "Company": "Endocyte"
            },
            {
              "Ticker": "ELGX",
              "Company": "Endologix"
            },
            {
              "Ticker": "NDRA",
              "Company": "ENDRA Life Sciences Inc."
            },
            {
              "Ticker": "NDRAW",
              "Company": "ENDRA Life Sciences Inc."
            },
            {
              "Ticker": "EIGI",
              "Company": "Endurance International Group Holdings"
            },
            {
              "Ticker": "WATT",
              "Company": "Energous Corporation"
            },
            {
              "Ticker": "EFOI",
              "Company": "Energy Focus"
            },
            {
              "Ticker": "EHR",
              "Company": "Energy Hunter Resources"
            },
            {
              "Ticker": "ERII",
              "Company": "Energy Recovery"
            },
            {
              "Ticker": "EGC",
              "Company": "Energy XXI Gulf Coast"
            },
            {
              "Ticker": "ENG",
              "Company": "ENGlobal Corporation"
            },
            {
              "Ticker": "ENPH",
              "Company": "Enphase Energy"
            },
            {
              "Ticker": "ESGR",
              "Company": "Enstar Group Limited"
            },
            {
              "Ticker": "ESGRP",
              "Company": "Enstar Group Limited"
            },
            {
              "Ticker": "ETTX",
              "Company": "Entasis Therapeutics Holdings Inc."
            },
            {
              "Ticker": "ENFC",
              "Company": "Entegra Financial Corp."
            },
            {
              "Ticker": "ENTG",
              "Company": "Entegris"
            },
            {
              "Ticker": "ENTX",
              "Company": "Entera Bio Ltd."
            },
            {
              "Ticker": "ENTXW",
              "Company": "Entera Bio Ltd."
            },
            {
              "Ticker": "EBTC",
              "Company": "Enterprise Bancorp Inc"
            },
            {
              "Ticker": "EFSC",
              "Company": "Enterprise Financial Services Corporation"
            },
            {
              "Ticker": "EPZM",
              "Company": "Epizyme"
            },
            {
              "Ticker": "PLUS",
              "Company": "ePlus inc."
            },
            {
              "Ticker": "EQ",
              "Company": "Equillium"
            },
            {
              "Ticker": "EQIX",
              "Company": "Equinix"
            },
            {
              "Ticker": "EQBK",
              "Company": "Equity Bancshares"
            },
            {
              "Ticker": "ERIC",
              "Company": "Ericsson"
            },
            {
              "Ticker": "ERIE",
              "Company": "Erie Indemnity Company"
            },
            {
              "Ticker": "ERYP",
              "Company": "Erytech Pharma S.A."
            },
            {
              "Ticker": "ESCA",
              "Company": "Escalade"
            },
            {
              "Ticker": "ESPR",
              "Company": "Esperion Therapeutics"
            },
            {
              "Ticker": "ESQ",
              "Company": "Esquire Financial Holdings"
            },
            {
              "Ticker": "ESSA",
              "Company": "ESSA Bancorp"
            },
            {
              "Ticker": "EPIX",
              "Company": "ESSA Pharma Inc."
            },
            {
              "Ticker": "ESND",
              "Company": "Essendant Inc."
            },
            {
              "Ticker": "ESTA",
              "Company": "Establishment Labs Holdings Inc."
            },
            {
              "Ticker": "ESTR",
              "Company": "Estre Ambiental"
            },
            {
              "Ticker": "ESTRW",
              "Company": "Estre Ambiental"
            },
            {
              "Ticker": "VBND",
              "Company": "ETF Series Solutions Trust Vident Core U.S. Bond Strategy Fund"
            },
            {
              "Ticker": "VUSE",
              "Company": "ETF Series Solutions Trust Vident Core US Equity ETF"
            },
            {
              "Ticker": "VIDI",
              "Company": "ETF Series Solutions Trust Vident International Equity Fund"
            },
            {
              "Ticker": "ETSY",
              "Company": "Etsy"
            },
            {
              "Ticker": "CLWT",
              "Company": "Euro Tech Holdings Company Limited"
            },
            {
              "Ticker": "EDRY",
              "Company": "EuroDry Ltd."
            },
            {
              "Ticker": "EEFT",
              "Company": "Euronet Worldwide"
            },
            {
              "Ticker": "ESEA",
              "Company": "Euroseas Ltd."
            },
            {
              "Ticker": "EVLO",
              "Company": "Evelo Biosciences"
            },
            {
              "Ticker": "EVBG",
              "Company": "Everbridge"
            },
            {
              "Ticker": "EVK",
              "Company": "Ever-Glory International Group"
            },
            {
              "Ticker": "EVER",
              "Company": "EverQuote"
            },
            {
              "Ticker": "MRAM",
              "Company": "Everspin Technologies"
            },
            {
              "Ticker": "EVLV",
              "Company": "EVINE Live Inc."
            },
            {
              "Ticker": "EVOP",
              "Company": "EVO Payments"
            },
            {
              "Ticker": "EVFM",
              "Company": "Evofem Biosciences"
            },
            {
              "Ticker": "EVGN",
              "Company": "Evogene Ltd."
            },
            {
              "Ticker": "EVOK",
              "Company": "Evoke Pharma"
            },
            {
              "Ticker": "EOLS",
              "Company": "Evolus"
            },
            {
              "Ticker": "EVOL",
              "Company": "Evolving Systems"
            },
            {
              "Ticker": "EXAS",
              "Company": "Exact Sciences Corporation"
            },
            {
              "Ticker": "FLAG",
              "Company": "Exchange Traded Concepts Trust FLAG-Forensic Accounting Long-S"
            },
            {
              "Ticker": "ROBO",
              "Company": "Exchange Traded Concepts Trust ROBO Global Robotics and Automa"
            },
            {
              "Ticker": "XELA",
              "Company": "Exela Technologies"
            },
            {
              "Ticker": "EXEL",
              "Company": "Exelixis"
            },
            {
              "Ticker": "EXFO",
              "Company": "EXFO Inc"
            },
            {
              "Ticker": "EXLS",
              "Company": "ExlService Holdings"
            },
            {
              "Ticker": "EXPI",
              "Company": "eXp World Holdings"
            },
            {
              "Ticker": "EXPE",
              "Company": "Expedia Group"
            },
            {
              "Ticker": "EXPD",
              "Company": "Expeditors International of Washington"
            },
            {
              "Ticker": "EXPO",
              "Company": "Exponent"
            },
            {
              "Ticker": "ESRX",
              "Company": "Express Scripts Holding Company"
            },
            {
              "Ticker": "STAY",
              "Company": "Extended Stay America"
            },
            {
              "Ticker": "XOG",
              "Company": "Extraction Oil & Gas"
            },
            {
              "Ticker": "EXTR",
              "Company": "Extreme Networks"
            },
            {
              "Ticker": "EYEG",
              "Company": "Eyegate Pharmaceuticals"
            },
            {
              "Ticker": "EYEGW",
              "Company": "Eyegate Pharmaceuticals"
            },
            {
              "Ticker": "EYEN",
              "Company": "Eyenovia"
            },
            {
              "Ticker": "EYPT",
              "Company": "EyePoint Pharmaceuticals"
            },
            {
              "Ticker": "EZPW",
              "Company": "EZCORP"
            },
            {
              "Ticker": "FFIV",
              "Company": "F5 Networks"
            },
            {
              "Ticker": "FB",
              "Company": "Facebook"
            },
            {
              "Ticker": "FLMN",
              "Company": "Falcon Minerals Corporation"
            },
            {
              "Ticker": "FLMNW",
              "Company": "Falcon Minerals Corporation"
            },
            {
              "Ticker": "DAVE",
              "Company": "Famous Dave&#39;s of America"
            },
            {
              "Ticker": "FANH",
              "Company": "Fanhua Inc."
            },
            {
              "Ticker": "FARM",
              "Company": "Farmer Brothers Company"
            },
            {
              "Ticker": "FMAO",
              "Company": "Farmers & Merchants Bancorp"
            },
            {
              "Ticker": "FMNB",
              "Company": "Farmers National Banc Corp."
            },
            {
              "Ticker": "FAMI",
              "Company": "FARMMI"
            },
            {
              "Ticker": "FARO",
              "Company": "FARO Technologies"
            },
            {
              "Ticker": "FAST",
              "Company": "Fastenal Company"
            },
            {
              "Ticker": "FAT",
              "Company": "FAT Brands Inc."
            },
            {
              "Ticker": "FATE",
              "Company": "Fate Therapeutics"
            },
            {
              "Ticker": "FBSS",
              "Company": "Fauquier Bankshares"
            },
            {
              "Ticker": "FSAC",
              "Company": "Federal Street Acquisition Corp."
            },
            {
              "Ticker": "FSACU",
              "Company": "Federal Street Acquisition Corp."
            },
            {
              "Ticker": "FSACW",
              "Company": "Federal Street Acquisition Corp."
            },
            {
              "Ticker": "FNHC",
              "Company": "FedNat Holding Company"
            },
            {
              "Ticker": "FENC",
              "Company": "Fennec Pharmaceuticals Inc."
            },
            {
              "Ticker": "GSM",
              "Company": "Ferroglobe PLC"
            },
            {
              "Ticker": "FFBW",
              "Company": "FFBW"
            },
            {
              "Ticker": "FCSC",
              "Company": "Fibrocell Science Inc."
            },
            {
              "Ticker": "FGEN",
              "Company": "FibroGen"
            },
            {
              "Ticker": "FDBC",
              "Company": "Fidelity D & D Bancorp"
            },
            {
              "Ticker": "ONEQ",
              "Company": "Fidelity Nasdaq Composite Index Tracking Stock"
            },
            {
              "Ticker": "LION",
              "Company": "Fidelity Southern Corporation"
            },
            {
              "Ticker": "FDUS",
              "Company": "Fidus Investment Corporation"
            },
            {
              "Ticker": "FDUSL",
              "Company": "Fidus Investment Corporation"
            },
            {
              "Ticker": "FRGI",
              "Company": "Fiesta Restaurant Group"
            },
            {
              "Ticker": "FITB",
              "Company": "Fifth Third Bancorp"
            },
            {
              "Ticker": "FITBI",
              "Company": "Fifth Third Bancorp"
            },
            {
              "Ticker": "FISI",
              "Company": "Financial Institutions"
            },
            {
              "Ticker": "FNSR",
              "Company": "Finisar Corporation"
            },
            {
              "Ticker": "FNJN",
              "Company": "Finjan Holdings"
            },
            {
              "Ticker": "FEYE",
              "Company": "FireEye"
            },
            {
              "Ticker": "FBNC",
              "Company": "First Bancorp"
            },
            {
              "Ticker": "FNLC",
              "Company": "First Bancorp"
            },
            {
              "Ticker": "FRBA",
              "Company": "First Bank"
            },
            {
              "Ticker": "BUSE",
              "Company": "First Busey Corporation"
            },
            {
              "Ticker": "FBIZ",
              "Company": "First Business Financial Services"
            },
            {
              "Ticker": "FCAP",
              "Company": "First Capital"
            },
            {
              "Ticker": "FCBP",
              "Company": "First Choice Bancorp"
            },
            {
              "Ticker": "FCNCA",
              "Company": "First Citizens BancShares"
            },
            {
              "Ticker": "FCBC",
              "Company": "First Community Bankshares"
            },
            {
              "Ticker": "FCCO",
              "Company": "First Community Corporation"
            },
            {
              "Ticker": "FDEF",
              "Company": "First Defiance Financial Corp."
            },
            {
              "Ticker": "FFBC",
              "Company": "First Financial Bancorp."
            },
            {
              "Ticker": "FFBCW",
              "Company": "First Financial Bancorp."
            },
            {
              "Ticker": "FFIN",
              "Company": "First Financial Bankshares"
            },
            {
              "Ticker": "THFF",
              "Company": "First Financial Corporation Indiana"
            },
            {
              "Ticker": "FFNW",
              "Company": "First Financial Northwest"
            },
            {
              "Ticker": "FFWM",
              "Company": "First Foundation Inc."
            },
            {
              "Ticker": "FGBI",
              "Company": "First Guaranty Bancshares"
            },
            {
              "Ticker": "FHB",
              "Company": "First Hawaiian"
            },
            {
              "Ticker": "INBK",
              "Company": "First Internet Bancorp"
            },
            {
              "Ticker": "INBKL",
              "Company": "First Internet Bancorp"
            },
            {
              "Ticker": "FIBK",
              "Company": "First Interstate BancSystem"
            },
            {
              "Ticker": "FRME",
              "Company": "First Merchants Corporation"
            },
            {
              "Ticker": "FMBH",
              "Company": "First Mid-Illinois Bancshares"
            },
            {
              "Ticker": "FMBI",
              "Company": "First Midwest Bancorp"
            },
            {
              "Ticker": "FNWB",
              "Company": "First Northwest Bancorp"
            },
            {
              "Ticker": "FSFG",
              "Company": "First Savings Financial Group"
            },
            {
              "Ticker": "FSLR",
              "Company": "First Solar"
            },
            {
              "Ticker": "FAAR",
              "Company": "First Trust Alternative Absolute Return Strategy ETF"
            },
            {
              "Ticker": "FPA",
              "Company": "First Trust Asia Pacific Ex-Japan AlphaDEX Fund"
            },
            {
              "Ticker": "BICK",
              "Company": "First Trust BICK Index Fund"
            },
            {
              "Ticker": "FBZ",
              "Company": "First Trust Brazil AlphaDEX Fund"
            },
            {
              "Ticker": "FTHI",
              "Company": "First Trust BuyWrite Income ETF"
            },
            {
              "Ticker": "FCAL",
              "Company": "First Trust California Municipal High income ETF"
            },
            {
              "Ticker": "FCAN",
              "Company": "First Trust Canada AlphaDEX Fund"
            },
            {
              "Ticker": "FTCS",
              "Company": "First Trust Capital Strength ETF"
            },
            {
              "Ticker": "FCEF",
              "Company": "First Trust CEF Income Opportunity ETF"
            },
            {
              "Ticker": "FCA",
              "Company": "First Trust China AlphaDEX Fund"
            },
            {
              "Ticker": "SKYY",
              "Company": "First Trust Cloud Computing ETF"
            },
            {
              "Ticker": "RNDM",
              "Company": "First Trust Developed International Equity Select ETF"
            },
            {
              "Ticker": "FDT",
              "Company": "First Trust Developed Markets Ex-US AlphaDEX Fund"
            },
            {
              "Ticker": "FDTS",
              "Company": "First Trust Developed Markets ex-US Small Cap AlphaDEX Fund"
            },
            {
              "Ticker": "FVC",
              "Company": "First Trust Dorsey Wright Dynamic Focus 5 ETF"
            },
            {
              "Ticker": "FV",
              "Company": "First Trust Dorsey Wright Focus 5 ETF"
            },
            {
              "Ticker": "IFV",
              "Company": "First Trust Dorsey Wright International Focus 5 ETF"
            },
            {
              "Ticker": "DDIV",
              "Company": "First Trust Dorsey Wright Momentum & Dividend ETF"
            },
            {
              "Ticker": "DVOL",
              "Company": "First Trust Dorsey Wright Momentum & Low Volatility ETF"
            },
            {
              "Ticker": "DVLU",
              "Company": "First Trust Dorsey Wright Momentum & Value ETF"
            },
            {
              "Ticker": "DWPP",
              "Company": "First Trust Dorsey Wright People&#39;s Portfolio ETF"
            },
            {
              "Ticker": "DALI",
              "Company": "First Trust DorseyWright DALI 1 ETF"
            },
            {
              "Ticker": "FEM",
              "Company": "First Trust Emerging Markets AlphaDEX Fund"
            },
            {
              "Ticker": "RNEM",
              "Company": "First Trust Emerging Markets Equity Select ETF"
            },
            {
              "Ticker": "FEMB",
              "Company": "First Trust Emerging Markets Local Currency Bond ETF"
            },
            {
              "Ticker": "FEMS",
              "Company": "First Trust Emerging Markets Small Cap AlphaDEX Fund"
            },
            {
              "Ticker": "FTSM",
              "Company": "First Trust Enhanced Short Maturity ETF"
            },
            {
              "Ticker": "FEP",
              "Company": "First Trust Europe AlphaDEX Fund"
            },
            {
              "Ticker": "FEUZ",
              "Company": "First Trust Eurozone AlphaDEX ETF"
            },
            {
              "Ticker": "FGM",
              "Company": "First Trust Germany AlphaDEX Fund"
            },
            {
              "Ticker": "FTGC",
              "Company": "First Trust Global Tactical Commodity Strategy Fund"
            },
            {
              "Ticker": "FTLB",
              "Company": "First Trust Hedged BuyWrite Income ETF"
            },
            {
              "Ticker": "HYLS",
              "Company": "First Trust High Yield Long/Short ETF"
            },
            {
              "Ticker": "FHK",
              "Company": "First Trust Hong Kong AlphaDEX Fund"
            },
            {
              "Ticker": "NFTY",
              "Company": "First Trust India Nifty 50 Equal Weight ETF"
            },
            {
              "Ticker": "FTAG",
              "Company": "First Trust Indxx Global Agriculture ETF"
            },
            {
              "Ticker": "FTRI",
              "Company": "First Trust Indxx Global Natural Resources Income ETF"
            },
            {
              "Ticker": "LEGR",
              "Company": "First Trust Indxx Innovative Transaction & Process ETF"
            },
            {
              "Ticker": "FPXI",
              "Company": "First Trust International IPO ETF"
            },
            {
              "Ticker": "FPXE",
              "Company": "First Trust IPOX Europe Equity Opportunities ETF"
            },
            {
              "Ticker": "FJP",
              "Company": "First Trust Japan AlphaDEX Fund"
            },
            {
              "Ticker": "FEX",
              "Company": "First Trust Large Cap Core AlphaDEX Fund"
            },
            {
              "Ticker": "FTC",
              "Company": "First Trust Large Cap Growth AlphaDEX Fund"
            },
            {
              "Ticker": "RNLC",
              "Company": "First Trust Large Cap US Equity Select ETF"
            },
            {
              "Ticker": "FTA",
              "Company": "First Trust Large Cap Value AlphaDEX Fund"
            },
            {
              "Ticker": "FLN",
              "Company": "First Trust Latin America AlphaDEX Fund"
            },
            {
              "Ticker": "LMBS",
              "Company": "First Trust Low Duration Opportunities ETF"
            },
            {
              "Ticker": "FMB",
              "Company": "First Trust Managed Municipal ETF"
            },
            {
              "Ticker": "FMK",
              "Company": "First Trust Mega Cap AlphaDEX Fund"
            },
            {
              "Ticker": "FNX",
              "Company": "First Trust Mid Cap Core AlphaDEX Fund"
            },
            {
              "Ticker": "FNY",
              "Company": "First Trust Mid Cap Growth AlphaDEX Fund"
            },
            {
              "Ticker": "RNMC",
              "Company": "First Trust Mid Cap US Equity Select ETF"
            },
            {
              "Ticker": "FNK",
              "Company": "First Trust Mid Cap Value AlphaDEX Fund"
            },
            {
              "Ticker": "FAD",
              "Company": "First Trust Multi Cap Growth AlphaDEX Fund"
            },
            {
              "Ticker": "FAB",
              "Company": "First Trust Multi Cap Value AlphaDEX Fund"
            },
            {
              "Ticker": "MDIV",
              "Company": "First Trust Multi-Asset Diversified Income Index Fund"
            },
            {
              "Ticker": "MCEF",
              "Company": "First Trust Municipal CEF Income Opportunity ETF"
            },
            {
              "Ticker": "FMHI",
              "Company": "First Trust Municipal High Income ETF"
            },
            {
              "Ticker": "QABA",
              "Company": "First Trust NASDAQ ABA Community Bank Index Fund"
            },
            {
              "Ticker": "ROBT",
              "Company": "First Trust Nasdaq Artificial Intelligence and Robotics ETF"
            },
            {
              "Ticker": "FTXO",
              "Company": "First Trust Nasdaq Bank ETF"
            },
            {
              "Ticker": "QCLN",
              "Company": "First Trust NASDAQ Clean Edge Green Energy Index Fund"
            },
            {
              "Ticker": "GRID",
              "Company": "First Trust NASDAQ Clean Edge Smart Grid Infrastructure Index"
            },
            {
              "Ticker": "CIBR",
              "Company": "First Trust NASDAQ Cybersecurity ETF"
            },
            {
              "Ticker": "FTXG",
              "Company": "First Trust Nasdaq Food & Beverage ETF"
            },
            {
              "Ticker": "CARZ",
              "Company": "First Trust NASDAQ Global Auto Index Fund"
            },
            {
              "Ticker": "FTXN",
              "Company": "First Trust Nasdaq Oil & Gas ETF"
            },
            {
              "Ticker": "FTXH",
              "Company": "First Trust Nasdaq Pharmaceuticals ETF"
            },
            {
              "Ticker": "FTXD",
              "Company": "First Trust Nasdaq Retail ETF"
            },
            {
              "Ticker": "FTXL",
              "Company": "First Trust Nasdaq Semiconductor ETF"
            },
            {
              "Ticker": "FONE",
              "Company": "First Trust NASDAQ Smartphone Index Fund"
            },
            {
              "Ticker": "TDIV",
              "Company": "First Trust NASDAQ Technology Dividend Index Fund"
            },
            {
              "Ticker": "FTXR",
              "Company": "First Trust Nasdaq Transportation ETF"
            },
            {
              "Ticker": "QQEW",
              "Company": "First Trust NASDAQ-100 Equal Weighted Index Fund"
            },
            {
              "Ticker": "QQXT",
              "Company": "First Trust NASDAQ-100 Ex-Technology Sector Index Fund"
            },
            {
              "Ticker": "QTEC",
              "Company": "First Trust NASDAQ-100- Technology Index Fund"
            },
            {
              "Ticker": "AIRR",
              "Company": "First Trust RBA American Industrial Renaissance ETF"
            },
            {
              "Ticker": "RDVY",
              "Company": "First Trust Rising Dividend Achievers ETF"
            },
            {
              "Ticker": "RFAP",
              "Company": "First Trust RiverFront Dynamic Asia Pacific ETF"
            },
            {
              "Ticker": "RFDI",
              "Company": "First Trust RiverFront Dynamic Developed International ETF"
            },
            {
              "Ticker": "RFEM",
              "Company": "First Trust RiverFront Dynamic Emerging Markets ETF"
            },
            {
              "Ticker": "RFEU",
              "Company": "First Trust RiverFront Dynamic Europe ETF"
            },
            {
              "Ticker": "FID",
              "Company": "First Trust S&P International Dividend Aristocrats ETF"
            },
            {
              "Ticker": "FTSL",
              "Company": "First Trust Senior Loan Fund ETF"
            },
            {
              "Ticker": "FYX",
              "Company": "First Trust Small Cap Core AlphaDEX Fund"
            },
            {
              "Ticker": "FYC",
              "Company": "First Trust Small Cap Growth AlphaDEX Fund"
            },
            {
              "Ticker": "RNSC",
              "Company": "First Trust Small Cap US Equity Select ETF"
            },
            {
              "Ticker": "FYT",
              "Company": "First Trust Small Cap Value AlphaDEX Fund"
            },
            {
              "Ticker": "SDVY",
              "Company": "First Trust SMID Cap Rising Dividend Achievers ETF"
            },
            {
              "Ticker": "FKO",
              "Company": "First Trust South Korea AlphaDEX Fund"
            },
            {
              "Ticker": "FCVT",
              "Company": "First Trust SSI Strategic Convertible Securities ETF"
            },
            {
              "Ticker": "FDIV",
              "Company": "First Trust Strategic Income ETF"
            },
            {
              "Ticker": "FSZ",
              "Company": "First Trust Switzerland AlphaDEX Fund"
            },
            {
              "Ticker": "FIXD",
              "Company": "First Trust TCW Opportunistic Fixed Income ETF"
            },
            {
              "Ticker": "TUSA",
              "Company": "First Trust Total US Market AlphaDEX ETF"
            },
            {
              "Ticker": "FKU",
              "Company": "First Trust United Kingdom AlphaDEX Fund"
            },
            {
              "Ticker": "RNDV",
              "Company": "First Trust US Equity Dividend Select ETF"
            },
            {
              "Ticker": "FUNC",
              "Company": "First United Corporation"
            },
            {
              "Ticker": "FUSB",
              "Company": "First US Bancshares"
            },
            {
              "Ticker": "MYFW",
              "Company": "First Western Financial"
            },
            {
              "Ticker": "FCFS",
              "Company": "FirstCash"
            },
            {
              "Ticker": "SVVC",
              "Company": "Firsthand Technology Value Fund"
            },
            {
              "Ticker": "FSV",
              "Company": "FirstService Corporation"
            },
            {
              "Ticker": "FISV",
              "Company": "Fiserv"
            },
            {
              "Ticker": "FIVE",
              "Company": "Five Below"
            },
            {
              "Ticker": "FPRX",
              "Company": "Five Prime Therapeutics"
            },
            {
              "Ticker": "FVE",
              "Company": "Five Star Senior Living Inc."
            },
            {
              "Ticker": "FIVN",
              "Company": "Five9"
            },
            {
              "Ticker": "FLEX",
              "Company": "Flex Ltd."
            },
            {
              "Ticker": "FLKS",
              "Company": "Flex Pharma"
            },
            {
              "Ticker": "FLXN",
              "Company": "Flexion Therapeutics"
            },
            {
              "Ticker": "SKOR",
              "Company": "FlexShares Credit-Scored US Corporate Bond Index Fund"
            },
            {
              "Ticker": "LKOR",
              "Company": "FlexShares Credit-Scored US Long Corporate Bond Index Fund"
            },
            {
              "Ticker": "MBSD",
              "Company": "FlexShares Disciplined Duration MBS Index Fund"
            },
            {
              "Ticker": "ASET",
              "Company": "FlexShares Real Assets Allocation Index Fund"
            },
            {
              "Ticker": "ESGG",
              "Company": "FlexShares STOXX Global ESG Impact Index Fund"
            },
            {
              "Ticker": "ESG",
              "Company": "FlexShares STOXX US ESG Impact Index Fund"
            },
            {
              "Ticker": "QLC",
              "Company": "FlexShares US Quality Large Cap Index Fund"
            },
            {
              "Ticker": "FPAY",
              "Company": "FlexShopper"
            },
            {
              "Ticker": "FPAYW",
              "Company": "FlexShopper"
            },
            {
              "Ticker": "FLXS",
              "Company": "Flexsteel Industries"
            },
            {
              "Ticker": "FLIR",
              "Company": "FLIR Systems"
            },
            {
              "Ticker": "FLNT",
              "Company": "Fluent"
            },
            {
              "Ticker": "FLDM",
              "Company": "Fluidigm Corporation"
            },
            {
              "Ticker": "FFIC",
              "Company": "Flushing Financial Corporation"
            },
            {
              "Ticker": "FNCB",
              "Company": "FNCB Bancorp Inc."
            },
            {
              "Ticker": "FOMX",
              "Company": "Foamix Pharmaceuticals Ltd."
            },
            {
              "Ticker": "FOCS",
              "Company": "Focus Financial Partners Inc."
            },
            {
              "Ticker": "FONR",
              "Company": "Fonar Corporation"
            },
            {
              "Ticker": "FSCT",
              "Company": "ForeScout Technologies"
            },
            {
              "Ticker": "FRSX",
              "Company": "Foresight Autonomous Holdings Ltd."
            },
            {
              "Ticker": "FORM",
              "Company": "FormFactor"
            },
            {
              "Ticker": "FORTY",
              "Company": "Formula Systems (1985) Ltd."
            },
            {
              "Ticker": "FORR",
              "Company": "Forrester Research"
            },
            {
              "Ticker": "FRTA",
              "Company": "Forterra"
            },
            {
              "Ticker": "FTNT",
              "Company": "Fortinet"
            },
            {
              "Ticker": "FBIO",
              "Company": "Fortress Biotech"
            },
            {
              "Ticker": "FBIOP",
              "Company": "Fortress Biotech"
            },
            {
              "Ticker": "FTSV",
              "Company": "Forty Seven"
            },
            {
              "Ticker": "FMCI",
              "Company": "Forum Merger II Corporation"
            },
            {
              "Ticker": "FMCIU",
              "Company": "Forum Merger II Corporation"
            },
            {
              "Ticker": "FMCIW",
              "Company": "Forum Merger II Corporation"
            },
            {
              "Ticker": "FWRD",
              "Company": "Forward Air Corporation"
            },
            {
              "Ticker": "FORD",
              "Company": "Forward Industries"
            },
            {
              "Ticker": "FWP",
              "Company": "Forward Pharma A/S"
            },
            {
              "Ticker": "FOSL",
              "Company": "Fossil Group"
            },
            {
              "Ticker": "FOXF",
              "Company": "Fox Factory Holding Corp."
            },
            {
              "Ticker": "FRAN",
              "Company": "Francesca&#39;s Holdings Corporation"
            },
            {
              "Ticker": "FELE",
              "Company": "Franklin Electric Co."
            },
            {
              "Ticker": "FKLY",
              "Company": "Frankly"
            },
            {
              "Ticker": "FRED",
              "Company": "Fred&#39;s"
            },
            {
              "Ticker": "RAIL",
              "Company": "Freightcar America"
            },
            {
              "Ticker": "FEIM",
              "Company": "Frequency Electronics"
            },
            {
              "Ticker": "FRPT",
              "Company": "Freshpet"
            },
            {
              "Ticker": "FTDR",
              "Company": "frontdoor"
            },
            {
              "Ticker": "FTEO",
              "Company": "FRONTEO"
            },
            {
              "Ticker": "FTR",
              "Company": "Frontier Communications Corporation"
            },
            {
              "Ticker": "FRPH",
              "Company": "FRP Holdings"
            },
            {
              "Ticker": "FSBW",
              "Company": "FS Bancorp"
            },
            {
              "Ticker": "FSBC",
              "Company": "FSB Bancorp"
            },
            {
              "Ticker": "FTD",
              "Company": "FTD Companies"
            },
            {
              "Ticker": "FTEK",
              "Company": "Fuel Tech"
            },
            {
              "Ticker": "FCEL",
              "Company": "FuelCell Energy"
            },
            {
              "Ticker": "FLGT",
              "Company": "Fulgent Genetics"
            },
            {
              "Ticker": "FORK",
              "Company": "Fuling Global Inc."
            },
            {
              "Ticker": "FLL",
              "Company": "Full House Resorts"
            },
            {
              "Ticker": "FMAX",
              "Company": "Full Spectrum Inc."
            },
            {
              "Ticker": "FULT",
              "Company": "Fulton Financial Corporation"
            },
            {
              "Ticker": "FNKO",
              "Company": "Funko"
            },
            {
              "Ticker": "FSNN",
              "Company": "Fusion Connect"
            },
            {
              "Ticker": "FTFT",
              "Company": "Future FinTech Group Inc."
            },
            {
              "Ticker": "FFHL",
              "Company": "Fuwei Films (Holdings) Co."
            },
            {
              "Ticker": "FVCB",
              "Company": "FVCBankcorp"
            },
            {
              "Ticker": "WILC",
              "Company": "G. Willi-Food International"
            },
            {
              "Ticker": "GTHX",
              "Company": "G1 Therapeutics"
            },
            {
              "Ticker": "FOANC",
              "Company": "Gabelli NextShares Trust"
            },
            {
              "Ticker": "GRBIC",
              "Company": "Gabelli NextShares Trust"
            },
            {
              "Ticker": "MOGLC",
              "Company": "Gabelli NextShares Trust"
            },
            {
              "Ticker": "PETZC",
              "Company": "Gabelli NextShares Trust"
            },
            {
              "Ticker": "GAIA",
              "Company": "Gaia"
            },
            {
              "Ticker": "GLPG",
              "Company": "Galapagos NV"
            },
            {
              "Ticker": "GALT",
              "Company": "Galectin Therapeutics Inc."
            },
            {
              "Ticker": "GLMD",
              "Company": "Galmed Pharmaceuticals Ltd."
            },
            {
              "Ticker": "GLPI",
              "Company": "Gaming and Leisure Properties"
            },
            {
              "Ticker": "GPIC",
              "Company": "Gaming Partners International Corporation"
            },
            {
              "Ticker": "GRMN",
              "Company": "Garmin Ltd."
            },
            {
              "Ticker": "GARS",
              "Company": "Garrison Capital Inc."
            },
            {
              "Ticker": "GLIBA",
              "Company": "GCI Liberty"
            },
            {
              "Ticker": "GLIBP",
              "Company": "GCI Liberty"
            },
            {
              "Ticker": "GDS",
              "Company": "GDS Holdings Limited"
            },
            {
              "Ticker": "GEMP",
              "Company": "Gemphire Therapeutics Inc."
            },
            {
              "Ticker": "GENC",
              "Company": "Gencor Industries Inc."
            },
            {
              "Ticker": "GFN",
              "Company": "General Finance Corporation"
            },
            {
              "Ticker": "GFNCP",
              "Company": "General Finance Corporation"
            },
            {
              "Ticker": "GFNSL",
              "Company": "General Finance Corporation"
            },
            {
              "Ticker": "GENE",
              "Company": "Genetic Technologies Ltd"
            },
            {
              "Ticker": "GNUS",
              "Company": "Genius Brands International"
            },
            {
              "Ticker": "GNMK",
              "Company": "GenMark Diagnostics"
            },
            {
              "Ticker": "GNCA",
              "Company": "Genocea Biosciences"
            },
            {
              "Ticker": "GHDX",
              "Company": "Genomic Health"
            },
            {
              "Ticker": "GNPX",
              "Company": "Genprex"
            },
            {
              "Ticker": "GNST",
              "Company": "GenSight Biologics S.A."
            },
            {
              "Ticker": "GNTX",
              "Company": "Gentex Corporation"
            },
            {
              "Ticker": "THRM",
              "Company": "Gentherm Inc"
            },
            {
              "Ticker": "GEOS",
              "Company": "Geospace Technologies Corporation"
            },
            {
              "Ticker": "GABC",
              "Company": "German American Bancorp"
            },
            {
              "Ticker": "GERN",
              "Company": "Geron Corporation"
            },
            {
              "Ticker": "GEVO",
              "Company": "Gevo"
            },
            {
              "Ticker": "ROCK",
              "Company": "Gibraltar Industries"
            },
            {
              "Ticker": "GIGM",
              "Company": "GigaMedia Limited"
            },
            {
              "Ticker": "GIII",
              "Company": "G-III Apparel Group"
            },
            {
              "Ticker": "GILT",
              "Company": "Gilat Satellite Networks Ltd."
            },
            {
              "Ticker": "GILD",
              "Company": "Gilead Sciences"
            },
            {
              "Ticker": "GBCI",
              "Company": "Glacier Bancorp"
            },
            {
              "Ticker": "GLAD",
              "Company": "Gladstone Capital Corporation"
            },
            {
              "Ticker": "GLADN",
              "Company": "Gladstone Capital Corporation"
            },
            {
              "Ticker": "GOOD",
              "Company": "Gladstone Commercial Corporation"
            },
            {
              "Ticker": "GOODM",
              "Company": "Gladstone Commercial Corporation"
            },
            {
              "Ticker": "GOODO",
              "Company": "Gladstone Commercial Corporation"
            },
            {
              "Ticker": "GOODP",
              "Company": "Gladstone Commercial Corporation"
            },
            {
              "Ticker": "GAIN",
              "Company": "Gladstone Investment Corporation"
            },
            {
              "Ticker": "GAINL",
              "Company": "Gladstone Investment Corporation"
            },
            {
              "Ticker": "GAINM",
              "Company": "Gladstone Investment Corporation"
            },
            {
              "Ticker": "LAND",
              "Company": "Gladstone Land Corporation"
            },
            {
              "Ticker": "LANDP",
              "Company": "Gladstone Land Corporation"
            },
            {
              "Ticker": "GLBZ",
              "Company": "Glen Burnie Bancorp"
            },
            {
              "Ticker": "GBT",
              "Company": "Global Blood Therapeutics"
            },
            {
              "Ticker": "ENT",
              "Company": "Global Eagle Entertainment Inc."
            },
            {
              "Ticker": "GBLI",
              "Company": "Global Indemnity Limited"
            },
            {
              "Ticker": "GBLIL",
              "Company": "Global Indemnity Limited"
            },
            {
              "Ticker": "GBLIZ",
              "Company": "Global Indemnity Limited"
            },
            {
              "Ticker": "SELF",
              "Company": "Global Self Storage"
            },
            {
              "Ticker": "GWRS",
              "Company": "Global Water Resources"
            },
            {
              "Ticker": "DRIV",
              "Company": "Global X Autonomous & Electric Vehicles ETF"
            },
            {
              "Ticker": "KRMA",
              "Company": "Global X Conscious Companies ETF"
            },
            {
              "Ticker": "FINX",
              "Company": "Global X FinTech ETF"
            },
            {
              "Ticker": "AIQ",
              "Company": "Global X Future Analytics Tech ETF"
            },
            {
              "Ticker": "BFIT",
              "Company": "Global X Health & Wellness Thematic ETF"
            },
            {
              "Ticker": "SNSR",
              "Company": "Global X Internet of Things ETF"
            },
            {
              "Ticker": "LNGR",
              "Company": "Global X Longevity Thematic ETF"
            },
            {
              "Ticker": "MILN",
              "Company": "Global X Millennials Thematic ETF"
            },
            {
              "Ticker": "EFAS",
              "Company": "Global X MSCI SuperDividend EAFE ETF"
            },
            {
              "Ticker": "QQQC",
              "Company": "Global X NASDAQ China Technology ETF"
            },
            {
              "Ticker": "BOTZ",
              "Company": "Global X Robotics & Artificial Intelligence ETF"
            },
            {
              "Ticker": "CATH",
              "Company": "Global X S&P 500 Catholic Values ETF"
            },
            {
              "Ticker": "SOCL",
              "Company": "Global X Social Media ETF"
            },
            {
              "Ticker": "ALTY",
              "Company": "Global X SuperDividend Alternatives ETF"
            },
            {
              "Ticker": "SRET",
              "Company": "Global X SuperDividend REIT ETF"
            },
            {
              "Ticker": "YLCO",
              "Company": "Global X Yieldco Index ETF"
            },
            {
              "Ticker": "GLBS",
              "Company": "Globus Maritime Limited"
            },
            {
              "Ticker": "GLUU",
              "Company": "Glu Mobile Inc."
            },
            {
              "Ticker": "GLYC",
              "Company": "GlycoMimetics"
            },
            {
              "Ticker": "GOGO",
              "Company": "Gogo Inc."
            },
            {
              "Ticker": "GLNG",
              "Company": "Golar LNG Limited"
            },
            {
              "Ticker": "GMLP",
              "Company": "Golar LNG Partners LP"
            },
            {
              "Ticker": "GMLPP",
              "Company": "Golar LNG Partners LP"
            },
            {
              "Ticker": "DNJR",
              "Company": "GOLDEN BULL LIMITED"
            },
            {
              "Ticker": "GDEN",
              "Company": "Golden Entertainment"
            },
            {
              "Ticker": "GOGL",
              "Company": "Golden Ocean Group Limited"
            },
            {
              "Ticker": "GBDC",
              "Company": "Golub Capital BDC"
            },
            {
              "Ticker": "GTIM",
              "Company": "Good Times Restaurants Inc."
            },
            {
              "Ticker": "GBLK",
              "Company": "GoodBulk Ltd."
            },
            {
              "Ticker": "GSHD",
              "Company": "Goosehead Insurance"
            },
            {
              "Ticker": "GPRO",
              "Company": "GoPro"
            },
            {
              "Ticker": "GPAQ",
              "Company": "Gordon Pointe Acquisition Corp."
            },
            {
              "Ticker": "GPAQU",
              "Company": "Gordon Pointe Acquisition Corp."
            },
            {
              "Ticker": "GPAQW",
              "Company": "Gordon Pointe Acquisition Corp."
            },
            {
              "Ticker": "GSHT",
              "Company": "Gores Holdings II"
            },
            {
              "Ticker": "GSHTU",
              "Company": "Gores Holdings II"
            },
            {
              "Ticker": "GSHTW",
              "Company": "Gores Holdings II"
            },
            {
              "Ticker": "GRSHU",
              "Company": "Gores Holdings III"
            },
            {
              "Ticker": "GOV",
              "Company": "Government Properties Income Trust"
            },
            {
              "Ticker": "GOVNI",
              "Company": "Government Properties Income Trust"
            },
            {
              "Ticker": "LOPE",
              "Company": "Grand Canyon Education"
            },
            {
              "Ticker": "GRVY",
              "Company": "GRAVITY Co."
            },
            {
              "Ticker": "GECC",
              "Company": "Great Elm Capital Corp."
            },
            {
              "Ticker": "GECCL",
              "Company": "Great Elm Capital Corp."
            },
            {
              "Ticker": "GECCM",
              "Company": "Great Elm Capital Corp."
            },
            {
              "Ticker": "GEC",
              "Company": "Great Elm Capital Group"
            },
            {
              "Ticker": "GLDD",
              "Company": "Great Lakes Dredge & Dock Corporation"
            },
            {
              "Ticker": "GSBC",
              "Company": "Great Southern Bancorp"
            },
            {
              "Ticker": "GNBC",
              "Company": "Green Bancorp"
            },
            {
              "Ticker": "GRBK",
              "Company": "Green Brick Partners"
            },
            {
              "Ticker": "GPP",
              "Company": "Green Plains Partners LP"
            },
            {
              "Ticker": "GPRE",
              "Company": "Green Plains"
            },
            {
              "Ticker": "GCBC",
              "Company": "Greene County Bancorp"
            },
            {
              "Ticker": "GLAC",
              "Company": "Greenland Acquisition Corporation"
            },
            {
              "Ticker": "GLACR",
              "Company": "Greenland Acquisition Corporation"
            },
            {
              "Ticker": "GLACU",
              "Company": "Greenland Acquisition Corporation"
            },
            {
              "Ticker": "GLACW",
              "Company": "Greenland Acquisition Corporation"
            },
            {
              "Ticker": "GLRE",
              "Company": "Greenlight Reinsurance"
            },
            {
              "Ticker": "GRNQ",
              "Company": "Greenpro Capital Corp."
            },
            {
              "Ticker": "GSKY",
              "Company": "GreenSky"
            },
            {
              "Ticker": "GSUM",
              "Company": "Gridsum Holding Inc."
            },
            {
              "Ticker": "GRIF",
              "Company": "Griffin Industrial Realty"
            },
            {
              "Ticker": "GRFS",
              "Company": "Grifols"
            },
            {
              "Ticker": "GRIN",
              "Company": "Grindrod Shipping Holdings Ltd."
            },
            {
              "Ticker": "GRTS",
              "Company": "Gritstone Oncology"
            },
            {
              "Ticker": "GRPN",
              "Company": "Groupon"
            },
            {
              "Ticker": "OMAB",
              "Company": "Grupo Aeroportuario del Centro Norte S.A.B. de C.V."
            },
            {
              "Ticker": "GGAL",
              "Company": "Grupo Financiero Galicia S.A."
            },
            {
              "Ticker": "GVP",
              "Company": "GSE Systems"
            },
            {
              "Ticker": "GSIT",
              "Company": "GSI Technology"
            },
            {
              "Ticker": "GSVC",
              "Company": "GSV Capital Corp"
            },
            {
              "Ticker": "GTXI",
              "Company": "GTx"
            },
            {
              "Ticker": "GTYH",
              "Company": "GTY Technology Holdings"
            },
            {
              "Ticker": "GTYHU",
              "Company": "GTY Technology Holdings"
            },
            {
              "Ticker": "GTYHW",
              "Company": "GTY Technology Holdings"
            },
            {
              "Ticker": "GBNK",
              "Company": "Guaranty Bancorp"
            },
            {
              "Ticker": "GNTY",
              "Company": "Guaranty Bancshares"
            },
            {
              "Ticker": "GFED",
              "Company": "Guaranty Federal Bancshares"
            },
            {
              "Ticker": "GH",
              "Company": "Guardant Health"
            },
            {
              "Ticker": "GIFI",
              "Company": "Gulf Island Fabrication"
            },
            {
              "Ticker": "GURE",
              "Company": "Gulf Resources"
            },
            {
              "Ticker": "GPOR",
              "Company": "Gulfport Energy Corporation"
            },
            {
              "Ticker": "GWPH",
              "Company": "GW Pharmaceuticals Plc"
            },
            {
              "Ticker": "GWGH",
              "Company": "GWG Holdings"
            },
            {
              "Ticker": "GYRO",
              "Company": "Gyrodyne"
            },
            {
              "Ticker": "HEES",
              "Company": "H&E Equipment Services"
            },
            {
              "Ticker": "HLG",
              "Company": "Hailiang Education Group Inc."
            },
            {
              "Ticker": "HNRG",
              "Company": "Hallador Energy Company"
            },
            {
              "Ticker": "HALL",
              "Company": "Hallmark Financial Services"
            },
            {
              "Ticker": "HALO",
              "Company": "Halozyme Therapeutics"
            },
            {
              "Ticker": "HBK",
              "Company": "Hamilton Bancorp"
            },
            {
              "Ticker": "HLNE",
              "Company": "Hamilton Lane Incorporated"
            },
            {
              "Ticker": "HJLI",
              "Company": "Hancock Jaffe Laboratories"
            },
            {
              "Ticker": "HJLIW",
              "Company": "Hancock Jaffe Laboratories"
            },
            {
              "Ticker": "HWC",
              "Company": "Hancock Whitney Corporation"
            },
            {
              "Ticker": "HWCPL",
              "Company": "Hancock Whitney Corporation"
            },
            {
              "Ticker": "HAFC",
              "Company": "Hanmi Financial Corporation"
            },
            {
              "Ticker": "HQCL",
              "Company": "Hanwha Q CELLS Co."
            },
            {
              "Ticker": "HONE",
              "Company": "HarborOne Bancorp"
            },
            {
              "Ticker": "HLIT",
              "Company": "Harmonic Inc."
            },
            {
              "Ticker": "HFGIC",
              "Company": "Hartford Funds NextShares Trust"
            },
            {
              "Ticker": "HBIO",
              "Company": "Harvard Bioscience"
            },
            {
              "Ticker": "HCAP",
              "Company": "Harvest Capital Credit Corporation"
            },
            {
              "Ticker": "HCAPZ",
              "Company": "Harvest Capital Credit Corporation"
            },
            {
              "Ticker": "HAS",
              "Company": "Hasbro"
            },
            {
              "Ticker": "HA",
              "Company": "Hawaiian Holdings"
            },
            {
              "Ticker": "HWKN",
              "Company": "Hawkins"
            },
            {
              "Ticker": "HWBK",
              "Company": "Hawthorn Bancshares"
            },
            {
              "Ticker": "HYAC",
              "Company": "Haymaker Acquisition Corp."
            },
            {
              "Ticker": "HYACU",
              "Company": "Haymaker Acquisition Corp."
            },
            {
              "Ticker": "HYACW",
              "Company": "Haymaker Acquisition Corp."
            },
            {
              "Ticker": "HAYN",
              "Company": "Haynes International"
            },
            {
              "Ticker": "HDS",
              "Company": "HD Supply Holdings"
            },
            {
              "Ticker": "HIIQ",
              "Company": "Health Insurance Innovations"
            },
            {
              "Ticker": "HCSG",
              "Company": "Healthcare Services Group"
            },
            {
              "Ticker": "HQY",
              "Company": "HealthEquity"
            },
            {
              "Ticker": "HSTM",
              "Company": "HealthStream"
            },
            {
              "Ticker": "HTLD",
              "Company": "Heartland Express"
            },
            {
              "Ticker": "HTLF",
              "Company": "Heartland Financial USA"
            },
            {
              "Ticker": "HTBX",
              "Company": "Heat Biologics"
            },
            {
              "Ticker": "HEBT",
              "Company": "Hebron Technology Co."
            },
            {
              "Ticker": "HSII",
              "Company": "Heidrick & Struggles International"
            },
            {
              "Ticker": "HELE",
              "Company": "Helen of Troy Limited"
            },
            {
              "Ticker": "HMNY",
              "Company": "Helios and Matheson Analytics Inc"
            },
            {
              "Ticker": "HSDT",
              "Company": "Helius Medical Technologies"
            },
            {
              "Ticker": "HMTV",
              "Company": "Hemisphere Media Group"
            },
            {
              "Ticker": "HNNA",
              "Company": "Hennessy Advisors"
            },
            {
              "Ticker": "HSIC",
              "Company": "Henry Schein"
            },
            {
              "Ticker": "HTBK",
              "Company": "Heritage Commerce Corp"
            },
            {
              "Ticker": "HFWA",
              "Company": "Heritage Financial Corporation"
            },
            {
              "Ticker": "HCCI",
              "Company": "Heritage-Crystal Clean"
            },
            {
              "Ticker": "MLHR",
              "Company": "Herman Miller"
            },
            {
              "Ticker": "HRTX",
              "Company": "Heron Therapeutics"
            },
            {
              "Ticker": "HSKA",
              "Company": "Heska Corporation"
            },
            {
              "Ticker": "HX",
              "Company": "Hexindai Inc."
            },
            {
              "Ticker": "HFFG",
              "Company": "HF Foods Group Inc."
            },
            {
              "Ticker": "HIBB",
              "Company": "Hibbett Sports"
            },
            {
              "Ticker": "SNLN",
              "Company": "Highland/iBoxx Senior Loan ETF"
            },
            {
              "Ticker": "HPJ",
              "Company": "Highpower International Inc"
            },
            {
              "Ticker": "HIHO",
              "Company": "Highway Holdings Limited"
            },
            {
              "Ticker": "HIMX",
              "Company": "Himax Technologies"
            },
            {
              "Ticker": "HIFS",
              "Company": "Hingham Institution for Savings"
            },
            {
              "Ticker": "HSGX",
              "Company": "Histogenics Corporation"
            },
            {
              "Ticker": "HCCH",
              "Company": "HL Acquisitions Corp."
            },
            {
              "Ticker": "HCCHR",
              "Company": "HL Acquisitions Corp."
            },
            {
              "Ticker": "HCCHU",
              "Company": "HL Acquisitions Corp."
            },
            {
              "Ticker": "HCCHW",
              "Company": "HL Acquisitions Corp."
            },
            {
              "Ticker": "HMNF",
              "Company": "HMN Financial"
            },
            {
              "Ticker": "HMSY",
              "Company": "HMS Holdings Corp"
            },
            {
              "Ticker": "HOLI",
              "Company": "Hollysys Automation Technologies"
            },
            {
              "Ticker": "HOLX",
              "Company": "Hologic"
            },
            {
              "Ticker": "HBCP",
              "Company": "Home Bancorp"
            },
            {
              "Ticker": "HOMB",
              "Company": "Home BancShares"
            },
            {
              "Ticker": "HFBL",
              "Company": "Home Federal Bancorp"
            },
            {
              "Ticker": "HMST",
              "Company": "HomeStreet"
            },
            {
              "Ticker": "HMTA",
              "Company": "HomeTown Bankshares Corporation"
            },
            {
              "Ticker": "HTBI",
              "Company": "HomeTrust Bancshares"
            },
            {
              "Ticker": "FIXX",
              "Company": "Homology Medicines"
            },
            {
              "Ticker": "HOFT",
              "Company": "Hooker Furniture Corporation"
            },
            {
              "Ticker": "HOPE",
              "Company": "Hope Bancorp"
            },
            {
              "Ticker": "HFBC",
              "Company": "HopFed Bancorp"
            },
            {
              "Ticker": "HBNC",
              "Company": "Horizon Bancorp"
            },
            {
              "Ticker": "HZNP",
              "Company": "Horizon Pharma plc"
            },
            {
              "Ticker": "HRZN",
              "Company": "Horizon Technology Finance Corporation"
            },
            {
              "Ticker": "DAX",
              "Company": "Horizons DAX Germany ETF"
            },
            {
              "Ticker": "QYLD",
              "Company": "Horizons NASDAQ-100 Covered Call ETF"
            },
            {
              "Ticker": "HDP",
              "Company": "Hortonworks"
            },
            {
              "Ticker": "HPT",
              "Company": "Hospitality Properties Trust"
            },
            {
              "Ticker": "TWNK",
              "Company": "Hostess Brands"
            },
            {
              "Ticker": "TWNKW",
              "Company": "Hostess Brands"
            },
            {
              "Ticker": "HMHC",
              "Company": "Houghton Mifflin Harcourt Company"
            },
            {
              "Ticker": "HWCC",
              "Company": "Houston Wire & Cable Company"
            },
            {
              "Ticker": "HOVNP",
              "Company": "Hovnanian Enterprises Inc"
            },
            {
              "Ticker": "HBMD",
              "Company": "Howard Bancorp"
            },
            {
              "Ticker": "HTGM",
              "Company": "HTG Molecular Diagnostics"
            },
            {
              "Ticker": "HTHT",
              "Company": "Huazhu Group Limited"
            },
            {
              "Ticker": "HUBG",
              "Company": "Hub Group"
            },
            {
              "Ticker": "HSON",
              "Company": "Hudson Global"
            },
            {
              "Ticker": "HDSN",
              "Company": "Hudson Technologies"
            },
            {
              "Ticker": "HUNT",
              "Company": "Hunter Maritime Acquisition Corp."
            },
            {
              "Ticker": "HUNTU",
              "Company": "Hunter Maritime Acquisition Corp."
            },
            {
              "Ticker": "HUNTW",
              "Company": "Hunter Maritime Acquisition Corp."
            },
            {
              "Ticker": "HBAN",
              "Company": "Huntington Bancshares Incorporated"
            },
            {
              "Ticker": "HBANN",
              "Company": "Huntington Bancshares Incorporated"
            },
            {
              "Ticker": "HBANO",
              "Company": "Huntington Bancshares Incorporated"
            },
            {
              "Ticker": "HURC",
              "Company": "Hurco Companies"
            },
            {
              "Ticker": "HURN",
              "Company": "Huron Consulting Group Inc."
            },
            {
              "Ticker": "HCM",
              "Company": "Hutchison China MediTech Limited"
            },
            {
              "Ticker": "HBP",
              "Company": "Huttig Building Products"
            },
            {
              "Ticker": "HVBC",
              "Company": "HV Bancorp"
            },
            {
              "Ticker": "HYGS",
              "Company": "Hydrogenics Corporation"
            },
            {
              "Ticker": "HYRE",
              "Company": "HyreCar Inc."
            },
            {
              "Ticker": "IDSY",
              "Company": "I.D. Systems"
            },
            {
              "Ticker": "IIIV",
              "Company": "i3 Verticals"
            },
            {
              "Ticker": "IAC",
              "Company": "IAC/InterActiveCorp"
            },
            {
              "Ticker": "IAM",
              "Company": "I-AM Capital Acquisition Company"
            },
            {
              "Ticker": "IAMXR",
              "Company": "I-AM Capital Acquisition Company"
            },
            {
              "Ticker": "IAMXW",
              "Company": "I-AM Capital Acquisition Company"
            },
            {
              "Ticker": "IBKC",
              "Company": "IBERIABANK Corporation"
            },
            {
              "Ticker": "IBKCO",
              "Company": "IBERIABANK Corporation"
            },
            {
              "Ticker": "IBKCP",
              "Company": "IBERIABANK Corporation"
            },
            {
              "Ticker": "IBEX",
              "Company": "IBEX Holdings Limited"
            },
            {
              "Ticker": "ICAD",
              "Company": "icad inc."
            },
            {
              "Ticker": "IEP",
              "Company": "Icahn Enterprises L.P."
            },
            {
              "Ticker": "ICCH",
              "Company": "ICC Holdings"
            },
            {
              "Ticker": "ICFI",
              "Company": "ICF International"
            },
            {
              "Ticker": "ICHR",
              "Company": "Ichor Holdings"
            },
            {
              "Ticker": "ICLK",
              "Company": "iClick Interactive Asia Group Limited"
            },
            {
              "Ticker": "ICLR",
              "Company": "ICON plc"
            },
            {
              "Ticker": "ICON",
              "Company": "Iconix Brand Group"
            },
            {
              "Ticker": "ICUI",
              "Company": "ICU Medical"
            },
            {
              "Ticker": "IPWR",
              "Company": "Ideal Power Inc."
            },
            {
              "Ticker": "INVE",
              "Company": "Identiv"
            },
            {
              "Ticker": "IDRA",
              "Company": "Idera Pharmaceuticals"
            },
            {
              "Ticker": "IDXX",
              "Company": "IDEXX Laboratories"
            },
            {
              "Ticker": "IESC",
              "Company": "IES Holdings"
            },
            {
              "Ticker": "IROQ",
              "Company": "IF Bancorp"
            },
            {
              "Ticker": "IFMK",
              "Company": "iFresh Inc."
            },
            {
              "Ticker": "INFO",
              "Company": "IHS Markit Ltd."
            },
            {
              "Ticker": "IIVI",
              "Company": "II-VI Incorporated"
            },
            {
              "Ticker": "KANG",
              "Company": "iKang Healthcare Group"
            },
            {
              "Ticker": "IKNX",
              "Company": "Ikonics Corporation"
            },
            {
              "Ticker": "ILMN",
              "Company": "Illumina"
            },
            {
              "Ticker": "ISNS",
              "Company": "Image Sensing Systems"
            },
            {
              "Ticker": "IMMR",
              "Company": "Immersion Corporation"
            },
            {
              "Ticker": "ICCC",
              "Company": "ImmuCell Corporation"
            },
            {
              "Ticker": "IMDZ",
              "Company": "Immune Design Corp."
            },
            {
              "Ticker": "IMGN",
              "Company": "ImmunoGen"
            },
            {
              "Ticker": "IMMU",
              "Company": "Immunomedics"
            },
            {
              "Ticker": "IMRN",
              "Company": "Immuron Limited"
            },
            {
              "Ticker": "IMRNW",
              "Company": "Immuron Limited"
            },
            {
              "Ticker": "IMMP",
              "Company": "Immutep Limited"
            },
            {
              "Ticker": "IMPV",
              "Company": "Imperva"
            },
            {
              "Ticker": "PI",
              "Company": "Impinj"
            },
            {
              "Ticker": "IMMY",
              "Company": "Imprimis Pharmaceuticals"
            },
            {
              "Ticker": "IMV",
              "Company": "IMV Inc."
            },
            {
              "Ticker": "INCY",
              "Company": "Incyte Corporation"
            },
            {
              "Ticker": "INDB",
              "Company": "Independent Bank Corp."
            },
            {
              "Ticker": "IBCP",
              "Company": "Independent Bank Corporation"
            },
            {
              "Ticker": "IBTX",
              "Company": "Independent Bank Group"
            },
            {
              "Ticker": "INDU",
              "Company": "Industrea Acquisition Corp."
            },
            {
              "Ticker": "INDUU",
              "Company": "Industrea Acquisition Corp."
            },
            {
              "Ticker": "INDUW",
              "Company": "Industrea Acquisition Corp."
            },
            {
              "Ticker": "ILPT",
              "Company": "Industrial Logistics Properties Trust"
            },
            {
              "Ticker": "IDSA",
              "Company": "Industrial Services of America"
            },
            {
              "Ticker": "INFN",
              "Company": "Infinera Corporation"
            },
            {
              "Ticker": "INFI",
              "Company": "Infinity Pharmaceuticals"
            },
            {
              "Ticker": "IFRX",
              "Company": "InflaRx N.V."
            },
            {
              "Ticker": "III",
              "Company": "Information Services Group"
            },
            {
              "Ticker": "IEA",
              "Company": "Infrastructure and Energy Alternatives"
            },
            {
              "Ticker": "IEAWW",
              "Company": "Infrastructure and Energy Alternatives"
            },
            {
              "Ticker": "IMKTA",
              "Company": "Ingles Markets"
            },
            {
              "Ticker": "INWK",
              "Company": "InnerWorkings"
            },
            {
              "Ticker": "INOD",
              "Company": "Innodata Inc."
            },
            {
              "Ticker": "IPHS",
              "Company": "Innophos Holdings"
            },
            {
              "Ticker": "IOSP",
              "Company": "Innospec Inc."
            },
            {
              "Ticker": "INNT",
              "Company": "Innovate Biopharmaceuticals"
            },
            {
              "Ticker": "ISSC",
              "Company": "Innovative Solutions and Support"
            },
            {
              "Ticker": "INVA",
              "Company": "Innoviva"
            },
            {
              "Ticker": "INGN",
              "Company": "Inogen"
            },
            {
              "Ticker": "INOV",
              "Company": "Inovalon Holdings"
            },
            {
              "Ticker": "INO",
              "Company": "Inovio Pharmaceuticals"
            },
            {
              "Ticker": "INPX",
              "Company": "Inpixon"
            },
            {
              "Ticker": "INSG",
              "Company": "Inseego Corp."
            },
            {
              "Ticker": "NSIT",
              "Company": "Insight Enterprises"
            },
            {
              "Ticker": "ISIG",
              "Company": "Insignia Systems"
            },
            {
              "Ticker": "INSM",
              "Company": "Insmed"
            },
            {
              "Ticker": "INSE",
              "Company": "Inspired Entertainment"
            },
            {
              "Ticker": "IIIN",
              "Company": "Insteel Industries"
            },
            {
              "Ticker": "PODD",
              "Company": "Insulet Corporation"
            },
            {
              "Ticker": "INSY",
              "Company": "Insys Therapeutics"
            },
            {
              "Ticker": "NTEC",
              "Company": "Intec Pharma Ltd."
            },
            {
              "Ticker": "IART",
              "Company": "Integra LifeSciences Holdings Corporation"
            },
            {
              "Ticker": "IDTI",
              "Company": "Integrated Device Technology"
            },
            {
              "Ticker": "IMTE",
              "Company": "Integrated Media Technology Limited"
            },
            {
              "Ticker": "INTC",
              "Company": "Intel Corporation"
            },
            {
              "Ticker": "NTLA",
              "Company": "Intellia Therapeutics"
            },
            {
              "Ticker": "IPCI",
              "Company": "Intellipharmaceutics International Inc."
            },
            {
              "Ticker": "IPAR",
              "Company": "Inter Parfums"
            },
            {
              "Ticker": "ICPT",
              "Company": "Intercept Pharmaceuticals"
            },
            {
              "Ticker": "IDCC",
              "Company": "InterDigital"
            },
            {
              "Ticker": "TILE",
              "Company": "Interface"
            },
            {
              "Ticker": "LINK",
              "Company": "Interlink Electronics"
            },
            {
              "Ticker": "IMI",
              "Company": "Intermolecular"
            },
            {
              "Ticker": "INAP",
              "Company": "Internap Corporation"
            },
            {
              "Ticker": "IBOC",
              "Company": "International Bancshares Corporation"
            },
            {
              "Ticker": "IMXI",
              "Company": "International Money Express"
            },
            {
              "Ticker": "IMXIW",
              "Company": "International Money Express"
            },
            {
              "Ticker": "ISCA",
              "Company": "International Speedway Corporation"
            },
            {
              "Ticker": "IGLD",
              "Company": "Internet Gold Golden Lines Ltd."
            },
            {
              "Ticker": "IIJI",
              "Company": "Internet Initiative Japan"
            },
            {
              "Ticker": "IDXG",
              "Company": "Interpace Diagnostics Group"
            },
            {
              "Ticker": "XENT",
              "Company": "Intersect ENT"
            },
            {
              "Ticker": "INTX",
              "Company": "Intersections"
            },
            {
              "Ticker": "IVAC",
              "Company": "Intevac"
            },
            {
              "Ticker": "INTL",
              "Company": "INTL FCStone Inc."
            },
            {
              "Ticker": "ITCI",
              "Company": "Intra-Cellular Therapies Inc."
            },
            {
              "Ticker": "XON",
              "Company": "Intrexon Corporation"
            },
            {
              "Ticker": "IIN",
              "Company": "IntriCon Corporation"
            },
            {
              "Ticker": "INTU",
              "Company": "Intuit Inc."
            },
            {
              "Ticker": "ISRG",
              "Company": "Intuitive Surgical"
            },
            {
              "Ticker": "PLW",
              "Company": "Invesco 1-30 Laddered Treasury ETF"
            },
            {
              "Ticker": "ADRA",
              "Company": "Invesco BLDRS Asia 50 ADR Index Fund"
            },
            {
              "Ticker": "ADRD",
              "Company": "Invesco BLDRS Developed Markets 100 ADR Index Fund"
            },
            {
              "Ticker": "ADRE",
              "Company": "Invesco BLDRS Emerging Markets 50 ADR Index Fund"
            },
            {
              "Ticker": "ADRU",
              "Company": "Invesco BLDRS Europe Select ADR Index Fund"
            },
            {
              "Ticker": "PKW",
              "Company": "Invesco BuyBack Achievers ETF"
            },
            {
              "Ticker": "PFM",
              "Company": "Invesco Dividend Achievers ETF"
            },
            {
              "Ticker": "PYZ",
              "Company": "Invesco DWA Basic Materials Momentum ETF"
            },
            {
              "Ticker": "PEZ",
              "Company": "Invesco DWA Consumer Cyclicals Momentum ETF"
            },
            {
              "Ticker": "PSL",
              "Company": "Invesco DWA Consumer Staples Momentum ETF"
            },
            {
              "Ticker": "PIZ",
              "Company": "Invesco DWA Developed Markets Momentum ETF"
            },
            {
              "Ticker": "PIE",
              "Company": "Invesco DWA Emerging Markets Momentum ETF"
            },
            {
              "Ticker": "PXI",
              "Company": "Invesco DWA Energy Momentum ETF"
            },
            {
              "Ticker": "PFI",
              "Company": "Invesco DWA Financial Momentum ETF"
            },
            {
              "Ticker": "PTH",
              "Company": "Invesco DWA Healthcare Momentum ETF"
            },
            {
              "Ticker": "PRN",
              "Company": "Invesco DWA Industrials Momentum ETF"
            },
            {
              "Ticker": "DWLV",
              "Company": "Invesco DWA Momentum & Low Volatility Rotation ETF"
            },
            {
              "Ticker": "PDP",
              "Company": "Invesco DWA Momentum ETF"
            },
            {
              "Ticker": "DWAQ",
              "Company": "Invesco DWA NASDAQ Momentum ETF"
            },
            {
              "Ticker": "DWAS",
              "Company": "Invesco DWA SmallCap Momentum ETF"
            },
            {
              "Ticker": "DWIN",
              "Company": "Invesco DWA Tactical Multi-Asset Income ETF"
            },
            {
              "Ticker": "DWTR",
              "Company": "Invesco DWA Tactical Sector Rotation ETF"
            },
            {
              "Ticker": "PTF",
              "Company": "Invesco DWA Technology Momentum ETF"
            },
            {
              "Ticker": "PUI",
              "Company": "Invesco DWA Utilities Momentum ETF"
            },
            {
              "Ticker": "IDLB",
              "Company": "Invesco FTSE International Low Beta Equal Weight ETF"
            },
            {
              "Ticker": "PRFZ",
              "Company": "Invesco FTSE RAFI US 1500 Small-Mid ETF"
            },
            {
              "Ticker": "PAGG",
              "Company": "Invesco Global Agriculture ETF"
            },
            {
              "Ticker": "PSAU",
              "Company": "Invesco Global Gold and Precious Metals ETF"
            },
            {
              "Ticker": "PIO",
              "Company": "Invesco Global Water ETF"
            },
            {
              "Ticker": "PGJ",
              "Company": "Invesco Golden Dragon China ETF"
            },
            {
              "Ticker": "PEY",
              "Company": "Invesco High Yield Equity Dividend Achievers ETF"
            },
            {
              "Ticker": "IPKW",
              "Company": "Invesco International BuyBack Achievers ETF"
            },
            {
              "Ticker": "PID",
              "Company": "Invesco International Dividend Achievers ETF"
            },
            {
              "Ticker": "KBWB",
              "Company": "Invesco KBW Bank ETF"
            },
            {
              "Ticker": "KBWD",
              "Company": "Invesco KBW High Dividend Yield Financial ETF"
            },
            {
              "Ticker": "KBWY",
              "Company": "Invesco KBW Premium Yield Equity REIT ETF"
            },
            {
              "Ticker": "KBWP",
              "Company": "Invesco KBW Property & Casualty Insurance ETF"
            },
            {
              "Ticker": "KBWR",
              "Company": "Invesco KBW Regional Banking ETF"
            },
            {
              "Ticker": "LDRI",
              "Company": "Invesco LadderRite 0-5 Year Corporate Bond ETF"
            },
            {
              "Ticker": "LALT",
              "Company": "Invesco Multi-Strategy Alternative ETF"
            },
            {
              "Ticker": "PNQI",
              "Company": "Invesco Nasdaq Internet ETF"
            },
            {
              "Ticker": "PDBC",
              "Company": "Invesco Optimum Yield Diversified Commodity Strategy No K-1 ET"
            },
            {
              "Ticker": "QQQ",
              "Company": "Invesco QQQ Trust"
            },
            {
              "Ticker": "USLB",
              "Company": "Invesco Russell 1000 Low Beta Equal Weight ETF"
            },
            {
              "Ticker": "PSCD",
              "Company": "Invesco S&P SmallCap Consumer Discretionary ETF"
            },
            {
              "Ticker": "PSCC",
              "Company": "Invesco S&P SmallCap Consumer Staples ETF"
            },
            {
              "Ticker": "PSCE",
              "Company": "Invesco S&P SmallCap Energy ETF"
            },
            {
              "Ticker": "PSCF",
              "Company": "Invesco S&P SmallCap Financials ETF"
            },
            {
              "Ticker": "PSCH",
              "Company": "Invesco S&P SmallCap Health Care ETF"
            },
            {
              "Ticker": "PSCI",
              "Company": "Invesco S&P SmallCap Industrials ETF"
            },
            {
              "Ticker": "PSCT",
              "Company": "Invesco S&P SmallCap Information Technology ETF"
            },
            {
              "Ticker": "PSCM",
              "Company": "Invesco S&P SmallCap Materials ETF"
            },
            {
              "Ticker": "PSCU",
              "Company": "Invesco S&P SmallCap Utilities ETF"
            },
            {
              "Ticker": "ISDX",
              "Company": "Invesco Strategic Developed ex-US ETF"
            },
            {
              "Ticker": "ISDS",
              "Company": "Invesco Strategic Developed ex-US Small Company ETF"
            },
            {
              "Ticker": "ISEM",
              "Company": "Invesco Strategic Emerging Markets ETF"
            },
            {
              "Ticker": "IUS",
              "Company": "Invesco Strategic US ETF"
            },
            {
              "Ticker": "IUSS",
              "Company": "Invesco Strategic US Small Company ETF"
            },
            {
              "Ticker": "VRIG",
              "Company": "Invesco Variable Rate Investment Grade ETF"
            },
            {
              "Ticker": "PHO",
              "Company": "Invesco Water Resources ETF"
            },
            {
              "Ticker": "ISTR",
              "Company": "Investar Holding Corporation"
            },
            {
              "Ticker": "ISBC",
              "Company": "Investors Bancorp"
            },
            {
              "Ticker": "ITIC",
              "Company": "Investors Title Company"
            },
            {
              "Ticker": "NVIV",
              "Company": "InVivo Therapeutics Holdings Corp."
            },
            {
              "Ticker": "IVTY",
              "Company": "Invuity"
            },
            {
              "Ticker": "IONS",
              "Company": "Ionis Pharmaceuticals"
            },
            {
              "Ticker": "IOVA",
              "Company": "Iovance Biotherapeutics"
            },
            {
              "Ticker": "IPAS",
              "Company": "iPass Inc."
            },
            {
              "Ticker": "IPGP",
              "Company": "IPG Photonics Corporation"
            },
            {
              "Ticker": "IPIC",
              "Company": "iPic Entertainment Inc."
            },
            {
              "Ticker": "CLRG",
              "Company": "IQ Chaikin U.S. Large Cap ETF"
            },
            {
              "Ticker": "CSML",
              "Company": "IQ Chaikin U.S. Small Cap ETF"
            },
            {
              "Ticker": "IQ",
              "Company": "iQIYI"
            },
            {
              "Ticker": "IRMD",
              "Company": "iRadimed Corporation"
            },
            {
              "Ticker": "IRTC",
              "Company": "iRhythm Technologies"
            },
            {
              "Ticker": "IRIX",
              "Company": "IRIDEX Corporation"
            },
            {
              "Ticker": "IRDM",
              "Company": "Iridium Communications Inc"
            },
            {
              "Ticker": "IRDMB",
              "Company": "Iridium Communications Inc"
            },
            {
              "Ticker": "IRBT",
              "Company": "iRobot Corporation"
            },
            {
              "Ticker": "IRWD",
              "Company": "Ironwood Pharmaceuticals"
            },
            {
              "Ticker": "IRCP",
              "Company": "IRSA Propiedades Comerciales S.A."
            },
            {
              "Ticker": "SLQD",
              "Company": "iShares 0-5 Year Investment Grade Corporate Bond ETF"
            },
            {
              "Ticker": "ISHG",
              "Company": "iShares 1-3 Year International Treasury Bond ETF"
            },
            {
              "Ticker": "SHY",
              "Company": "iShares 1-3 Year Treasury Bond ETF"
            },
            {
              "Ticker": "TLT",
              "Company": "iShares 20+ Year Treasury Bond ETF"
            },
            {
              "Ticker": "IEI",
              "Company": "iShares 3-7 Year Treasury Bond ETF"
            },
            {
              "Ticker": "IEF",
              "Company": "iShares 7-10 Year Treasury Bond ETF"
            },
            {
              "Ticker": "AIA",
              "Company": "iShares Asia 50 ETF"
            },
            {
              "Ticker": "USIG",
              "Company": "iShares Broad USD Investment Grade Corporate Bond ETF"
            },
            {
              "Ticker": "COMT",
              "Company": "iShares Commodities Select Strategy ETF"
            },
            {
              "Ticker": "ISTB",
              "Company": "iShares Core 1-5 Year USD Bond ETF"
            },
            {
              "Ticker": "IXUS",
              "Company": "iShares Core MSCI Total International Stock ETF"
            },
            {
              "Ticker": "IUSG",
              "Company": "iShares Core S&P U.S. Growth ETF"
            },
            {
              "Ticker": "IUSV",
              "Company": "iShares Core S&P U.S. Value ETF"
            },
            {
              "Ticker": "IUSB",
              "Company": "iShares Core Total USD Bond Market ETF"
            },
            {
              "Ticker": "HEWG",
              "Company": "iShares Currency Hedged MSCI Germany ETF"
            },
            {
              "Ticker": "SUSB",
              "Company": "iShares ESG 1-5 Year USD Corporate Bond ETF"
            },
            {
              "Ticker": "SUSC",
              "Company": "iShares ESG USD Corporate Bond ETF"
            },
            {
              "Ticker": "XT",
              "Company": "iShares Exponential Technologies ETF"
            },
            {
              "Ticker": "FALN",
              "Company": "iShares Fallen Angels USD Bond ETF"
            },
            {
              "Ticker": "IFEU",
              "Company": "iShares FTSE EPRA/NAREIT Europe Index Fund"
            },
            {
              "Ticker": "IFGL",
              "Company": "iShares FTSE EPRA/NAREIT Global Real Estate ex-U.S. Index Fund"
            },
            {
              "Ticker": "IGF",
              "Company": "iShares Global Infrastructure ETF"
            },
            {
              "Ticker": "GNMA",
              "Company": "iShares GNMA Bond ETF"
            },
            {
              "Ticker": "HYXE",
              "Company": "iShares iBoxx $ High Yield ex Oil & Gas Corporate Bond ETF"
            },
            {
              "Ticker": "IGIB",
              "Company": "iShares Intermediate-Term Corporate Bond ETF"
            },
            {
              "Ticker": "IGOV",
              "Company": "iShares International Treasury Bond ETF"
            },
            {
              "Ticker": "EMB",
              "Company": "iShares J.P. Morgan USD Emerging Markets Bond ETF"
            },
            {
              "Ticker": "MBB",
              "Company": "iShares MBS ETF"
            },
            {
              "Ticker": "JKI",
              "Company": "iShares Morningstar Mid-Cap ETF"
            },
            {
              "Ticker": "ACWX",
              "Company": "iShares MSCI ACWI ex US Index Fund"
            },
            {
              "Ticker": "ACWI",
              "Company": "iShares MSCI ACWI Index Fund"
            },
            {
              "Ticker": "AAXJ",
              "Company": "iShares MSCI All Country Asia ex Japan Index Fund"
            },
            {
              "Ticker": "EWZS",
              "Company": "iShares MSCI Brazil Small-Cap ETF"
            },
            {
              "Ticker": "MCHI",
              "Company": "iShares MSCI China ETF"
            },
            {
              "Ticker": "ESGD",
              "Company": "iShares MSCI EAFE ESG Optimized ETF"
            },
            {
              "Ticker": "SCZ",
              "Company": "iShares MSCI EAFE Small-Cap ETF"
            },
            {
              "Ticker": "ESGE",
              "Company": "iShares MSCI EM ESG Optimized ETF"
            },
            {
              "Ticker": "EEMA",
              "Company": "iShares MSCI Emerging Markets Asia ETF"
            },
            {
              "Ticker": "EMXC",
              "Company": "iShares MSCI Emerging Markets ex China ETF"
            },
            {
              "Ticker": "EUFN",
              "Company": "iShares MSCI Europe Financials Sector Index Fund"
            },
            {
              "Ticker": "IEUS",
              "Company": "iShares MSCI Europe Small-Cap ETF"
            },
            {
              "Ticker": "RING",
              "Company": "iShares MSCI Global Gold Miners ETF"
            },
            {
              "Ticker": "MPCT",
              "Company": "iShares MSCI Global Impact ETF"
            },
            {
              "Ticker": "ENZL",
              "Company": "iShares MSCI New Zealand ETF"
            },
            {
              "Ticker": "QAT",
              "Company": "iShares MSCI Qatar ETF"
            },
            {
              "Ticker": "TUR",
              "Company": "iShares MSCI Turkey ETF"
            },
            {
              "Ticker": "UAE",
              "Company": "iShares MSCI UAE ETF"
            },
            {
              "Ticker": "ESGU",
              "Company": "iShares MSCI USA ESG Optimized ETF"
            },
            {
              "Ticker": "IBB",
              "Company": "iShares Nasdaq Biotechnology Index Fund"
            },
            {
              "Ticker": "SOXX",
              "Company": "iShares PHLX SOX Semiconductor Sector Index Fund"
            },
            {
              "Ticker": "AMCA",
              "Company": "iShares Russell 1000 Pure U.S. Revenue ETF"
            },
            {
              "Ticker": "EMIF",
              "Company": "iShares S&P Emerging Markets Infrastructure Index Fund"
            },
            {
              "Ticker": "ICLN",
              "Company": "iShares S&P Global Clean Energy Index Fund"
            },
            {
              "Ticker": "WOOD",
              "Company": "iShares S&P Global Timber & Forestry Index Fund"
            },
            {
              "Ticker": "INDY",
              "Company": "iShares S&P India Nifty 50 Index Fund"
            },
            {
              "Ticker": "IJT",
              "Company": "iShares S&P Small-Cap 600 Growth ETF"
            },
            {
              "Ticker": "DVY",
              "Company": "iShares Select Dividend ETF"
            },
            {
              "Ticker": "SHV",
              "Company": "iShares Short Treasury Bond ETF"
            },
            {
              "Ticker": "IGSB",
              "Company": "iShares Short-Term Corporate Bond ETF"
            },
            {
              "Ticker": "PFF",
              "Company": "iShares U.S. Preferred Stock ETF"
            },
            {
              "Ticker": "ISRL",
              "Company": "Isramco"
            },
            {
              "Ticker": "ITI",
              "Company": "Iteris"
            },
            {
              "Ticker": "ITRM",
              "Company": "Iterum Therapeutics plc"
            },
            {
              "Ticker": "ITRI",
              "Company": "Itron"
            },
            {
              "Ticker": "ITRN",
              "Company": "Ituran Location and Control Ltd."
            },
            {
              "Ticker": "IVENC",
              "Company": "Ivy NextShares"
            },
            {
              "Ticker": "IVFGC",
              "Company": "Ivy NextShares"
            },
            {
              "Ticker": "IVFVC",
              "Company": "Ivy NextShares"
            },
            {
              "Ticker": "IZEA",
              "Company": "IZEA Worldwide"
            },
            {
              "Ticker": "JJSF",
              "Company": "J & J Snack Foods Corp."
            },
            {
              "Ticker": "MAYS",
              "Company": "J. W. Mays"
            },
            {
              "Ticker": "JBHT",
              "Company": "J.B. Hunt Transport Services"
            },
            {
              "Ticker": "JCOM",
              "Company": "j2 Global"
            },
            {
              "Ticker": "JKHY",
              "Company": "Jack Henry & Associates"
            },
            {
              "Ticker": "JACK",
              "Company": "Jack In The Box Inc."
            },
            {
              "Ticker": "JAGX",
              "Company": "Jaguar Health"
            },
            {
              "Ticker": "JAKK",
              "Company": "JAKKS Pacific"
            },
            {
              "Ticker": "JRVR",
              "Company": "James River Group Holdings"
            },
            {
              "Ticker": "JSML",
              "Company": "Janus Henderson Small Cap Growth Alpha ETF"
            },
            {
              "Ticker": "JSMD",
              "Company": "Janus Henderson Small/Mid Cap Growth Alpha ETF"
            },
            {
              "Ticker": "JASN",
              "Company": "Jason Industries"
            },
            {
              "Ticker": "JASNW",
              "Company": "Jason Industries"
            },
            {
              "Ticker": "JAZZ",
              "Company": "Jazz Pharmaceuticals plc"
            },
            {
              "Ticker": "JD",
              "Company": "JD.com"
            },
            {
              "Ticker": "JSYN",
              "Company": "Jensyn Acquistion Corp."
            },
            {
              "Ticker": "JSYNR",
              "Company": "Jensyn Acquistion Corp."
            },
            {
              "Ticker": "JSYNU",
              "Company": "Jensyn Acquistion Corp."
            },
            {
              "Ticker": "JSYNW",
              "Company": "Jensyn Acquistion Corp."
            },
            {
              "Ticker": "JRSH",
              "Company": "Jerash Holdings (US)"
            },
            {
              "Ticker": "JBLU",
              "Company": "JetBlue Airways Corporation"
            },
            {
              "Ticker": "JTPY",
              "Company": "JetPay Corporation"
            },
            {
              "Ticker": "JCTCF",
              "Company": "Jewett-Cameron Trading Company"
            },
            {
              "Ticker": "JMU",
              "Company": "JMU Limited"
            },
            {
              "Ticker": "JBSS",
              "Company": "John B. Sanfilippo & Son"
            },
            {
              "Ticker": "JOUT",
              "Company": "Johnson Outdoors Inc."
            },
            {
              "Ticker": "JNCE",
              "Company": "Jounce Therapeutics"
            },
            {
              "Ticker": "KTWO",
              "Company": "K2M Group Holdings"
            },
            {
              "Ticker": "KALU",
              "Company": "Kaiser Aluminum Corporation"
            },
            {
              "Ticker": "KALA",
              "Company": "Kala Pharmaceuticals"
            },
            {
              "Ticker": "KALV",
              "Company": "KalVista Pharmaceuticals"
            },
            {
              "Ticker": "KMDA",
              "Company": "Kamada Ltd."
            },
            {
              "Ticker": "KNDI",
              "Company": "Kandi Technologies Group"
            },
            {
              "Ticker": "KPTI",
              "Company": "Karyopharm Therapeutics Inc."
            },
            {
              "Ticker": "KAAC",
              "Company": "Kayne Anderson Acquisition Corp."
            },
            {
              "Ticker": "KAACU",
              "Company": "Kayne Anderson Acquisition Corp."
            },
            {
              "Ticker": "KAACW",
              "Company": "Kayne Anderson Acquisition Corp."
            },
            {
              "Ticker": "KZIA",
              "Company": "Kazia Therapeutics Limited"
            },
            {
              "Ticker": "KBLM",
              "Company": "KBL Merger Corp. IV"
            },
            {
              "Ticker": "KBLMR",
              "Company": "KBL Merger Corp. IV"
            },
            {
              "Ticker": "KBLMU",
              "Company": "KBL Merger Corp. IV"
            },
            {
              "Ticker": "KBLMW",
              "Company": "KBL Merger Corp. IV"
            },
            {
              "Ticker": "KBSF",
              "Company": "KBS Fashion Group Limited"
            },
            {
              "Ticker": "KCAP",
              "Company": "KCAP Financial"
            },
            {
              "Ticker": "KCAPL",
              "Company": "KCAP Financial"
            },
            {
              "Ticker": "KRNY",
              "Company": "Kearny Financial"
            },
            {
              "Ticker": "KELYA",
              "Company": "Kelly Services"
            },
            {
              "Ticker": "KELYB",
              "Company": "Kelly Services"
            },
            {
              "Ticker": "KMPH",
              "Company": "KemPharm"
            },
            {
              "Ticker": "KFFB",
              "Company": "Kentucky First Federal Bancorp"
            },
            {
              "Ticker": "KERX",
              "Company": "Keryx Biopharmaceuticals"
            },
            {
              "Ticker": "KEQU",
              "Company": "Kewaunee Scientific Corporation"
            },
            {
              "Ticker": "KTCC",
              "Company": "Key Tronic Corporation"
            },
            {
              "Ticker": "KZR",
              "Company": "Kezar Life Sciences"
            },
            {
              "Ticker": "KFRC",
              "Company": "Kforce"
            },
            {
              "Ticker": "KE",
              "Company": "Kimball Electronics"
            },
            {
              "Ticker": "KBAL",
              "Company": "Kimball International"
            },
            {
              "Ticker": "KIN",
              "Company": "Kindred Biosciences"
            },
            {
              "Ticker": "KGJI",
              "Company": "Kingold Jewelry Inc."
            },
            {
              "Ticker": "KINS",
              "Company": "Kingstone Companies"
            },
            {
              "Ticker": "KNSA",
              "Company": "Kiniksa Pharmaceuticals"
            },
            {
              "Ticker": "KNSL",
              "Company": "Kinsale Capital Group"
            },
            {
              "Ticker": "KIRK",
              "Company": "Kirkland&#39;s"
            },
            {
              "Ticker": "KTOV",
              "Company": "Kitov Pharma Ltd."
            },
            {
              "Ticker": "KTOVW",
              "Company": "Kitov Pharma Ltd."
            },
            {
              "Ticker": "KLAC",
              "Company": "KLA-Tencor Corporation"
            },
            {
              "Ticker": "KLXE",
              "Company": "KLX Energy Services Holdings"
            },
            {
              "Ticker": "KOD",
              "Company": "Kodiak Sciences Inc"
            },
            {
              "Ticker": "KONA",
              "Company": "Kona Grill"
            },
            {
              "Ticker": "KOPN",
              "Company": "Kopin Corporation"
            },
            {
              "Ticker": "KRNT",
              "Company": "Kornit Digital Ltd."
            },
            {
              "Ticker": "KOSS",
              "Company": "Koss Corporation"
            },
            {
              "Ticker": "KWEB",
              "Company": "KraneShares Trust KraneShares CSI China Internet ETF"
            },
            {
              "Ticker": "KTOS",
              "Company": "Kratos Defense & Security Solutions"
            },
            {
              "Ticker": "KRYS",
              "Company": "Krystal Biotech"
            },
            {
              "Ticker": "KLIC",
              "Company": "Kulicke and Soffa Industries"
            },
            {
              "Ticker": "KURA",
              "Company": "Kura Oncology"
            },
            {
              "Ticker": "KVHI",
              "Company": "KVH Industries"
            },
            {
              "Ticker": "FSTR",
              "Company": "L.B. Foster Company"
            },
            {
              "Ticker": "LJPC",
              "Company": "La Jolla Pharmaceutical Company"
            },
            {
              "Ticker": "LSBK",
              "Company": "Lake Shore Bancorp"
            },
            {
              "Ticker": "LBAI",
              "Company": "Lakeland Bancorp"
            },
            {
              "Ticker": "LKFN",
              "Company": "Lakeland Financial Corporation"
            },
            {
              "Ticker": "LAKE",
              "Company": "Lakeland Industries"
            },
            {
              "Ticker": "LRCX",
              "Company": "Lam Research Corporation"
            },
            {
              "Ticker": "LAMR",
              "Company": "Lamar Advertising Company"
            },
            {
              "Ticker": "LANC",
              "Company": "Lancaster Colony Corporation"
            },
            {
              "Ticker": "LCA",
              "Company": "Landcadia Holdings"
            },
            {
              "Ticker": "LCAHU",
              "Company": "Landcadia Holdings"
            },
            {
              "Ticker": "LCAHW",
              "Company": "Landcadia Holdings"
            },
            {
              "Ticker": "LNDC",
              "Company": "Landec Corporation"
            },
            {
              "Ticker": "LARK",
              "Company": "Landmark Bancorp Inc."
            },
            {
              "Ticker": "LMRK",
              "Company": "Landmark Infrastructure Partners LP"
            },
            {
              "Ticker": "LMRKN",
              "Company": "Landmark Infrastructure Partners LP"
            },
            {
              "Ticker": "LMRKO",
              "Company": "Landmark Infrastructure Partners LP"
            },
            {
              "Ticker": "LMRKP",
              "Company": "Landmark Infrastructure Partners LP"
            },
            {
              "Ticker": "LE",
              "Company": "Lands&#39; End"
            },
            {
              "Ticker": "LSTR",
              "Company": "Landstar System"
            },
            {
              "Ticker": "LNTH",
              "Company": "Lantheus Holdings"
            },
            {
              "Ticker": "LTRX",
              "Company": "Lantronix"
            },
            {
              "Ticker": "LSCC",
              "Company": "Lattice Semiconductor Corporation"
            },
            {
              "Ticker": "LAUR",
              "Company": "Laureate Education"
            },
            {
              "Ticker": "LAWS",
              "Company": "Lawson Products"
            },
            {
              "Ticker": "LAZY",
              "Company": "Lazydays Holdings"
            },
            {
              "Ticker": "LCNB",
              "Company": "LCNB Corporation"
            },
            {
              "Ticker": "LPTX",
              "Company": "LEAP THERAPEUTICS"
            },
            {
              "Ticker": "LGCY",
              "Company": "Legacy Reserves Inc."
            },
            {
              "Ticker": "LTXB",
              "Company": "LegacyTexas Financial Group"
            },
            {
              "Ticker": "DDBI",
              "Company": "Legg Mason Developed EX-US Diversified Core ETF"
            },
            {
              "Ticker": "EDBI",
              "Company": "Legg Mason Emerging Markets Diversified Core ETF"
            },
            {
              "Ticker": "INFR",
              "Company": "Legg Mason Global Infrastructure ETF"
            },
            {
              "Ticker": "LVHD",
              "Company": "Legg Mason Low Volatility High Dividend ETF"
            },
            {
              "Ticker": "SQLV",
              "Company": "Legg Mason Small-Cap Quality Value ETF"
            },
            {
              "Ticker": "UDBI",
              "Company": "Legg Mason US Diversified Core ETF"
            },
            {
              "Ticker": "LACQ",
              "Company": "Leisure Acquisition Corp."
            },
            {
              "Ticker": "LACQU",
              "Company": "Leisure Acquisition Corp."
            },
            {
              "Ticker": "LACQW",
              "Company": "Leisure Acquisition Corp."
            },
            {
              "Ticker": "LMAT",
              "Company": "LeMaitre Vascular"
            },
            {
              "Ticker": "TREE",
              "Company": "LendingTree"
            },
            {
              "Ticker": "LEVL",
              "Company": "Level One Bancorp"
            },
            {
              "Ticker": "LXRX",
              "Company": "Lexicon Pharmaceuticals"
            },
            {
              "Ticker": "LX",
              "Company": "LexinFintech Holdings Ltd."
            },
            {
              "Ticker": "LFAC",
              "Company": "LF Capital Acquistion Corp."
            },
            {
              "Ticker": "LFACU",
              "Company": "LF Capital Acquistion Corp."
            },
            {
              "Ticker": "LFACW",
              "Company": "LF Capital Acquistion Corp."
            },
            {
              "Ticker": "LGIH",
              "Company": "LGI Homes"
            },
            {
              "Ticker": "LHCG",
              "Company": "LHC Group"
            },
            {
              "Ticker": "LLIT",
              "Company": "Lianluo Smart Limited"
            },
            {
              "Ticker": "LBRDA",
              "Company": "Liberty Broadband Corporation"
            },
            {
              "Ticker": "LBRDK",
              "Company": "Liberty Broadband Corporation"
            },
            {
              "Ticker": "LEXEA",
              "Company": "Liberty Expedia Holdings"
            },
            {
              "Ticker": "LEXEB",
              "Company": "Liberty Expedia Holdings"
            },
            {
              "Ticker": "LBTYA",
              "Company": "Liberty Global plc"
            },
            {
              "Ticker": "LBTYB",
              "Company": "Liberty Global plc"
            },
            {
              "Ticker": "LBTYK",
              "Company": "Liberty Global plc"
            },
            {
              "Ticker": "LILA",
              "Company": "Liberty Latin America Ltd."
            },
            {
              "Ticker": "LILAK",
              "Company": "Liberty Latin America Ltd."
            },
            {
              "Ticker": "BATRA",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "BATRK",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "FWONA",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "FWONK",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "LSXMA",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "LSXMB",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "LSXMK",
              "Company": "Liberty Media Corporation"
            },
            {
              "Ticker": "LTRPA",
              "Company": "Liberty TripAdvisor Holdings"
            },
            {
              "Ticker": "LTRPB",
              "Company": "Liberty TripAdvisor Holdings"
            },
            {
              "Ticker": "LPNT",
              "Company": "LifePoint Health"
            },
            {
              "Ticker": "LCUT",
              "Company": "Lifetime Brands"
            },
            {
              "Ticker": "LFVN",
              "Company": "Lifevantage Corporation"
            },
            {
              "Ticker": "LWAY",
              "Company": "Lifeway Foods"
            },
            {
              "Ticker": "LGND",
              "Company": "Ligand Pharmaceuticals Incorporated"
            },
            {
              "Ticker": "LTBR",
              "Company": "Lightbridge Corporation"
            },
            {
              "Ticker": "LPTH",
              "Company": "LightPath Technologies"
            },
            {
              "Ticker": "LLEX",
              "Company": "Lilis Energy"
            },
            {
              "Ticker": "LMB",
              "Company": "Limbach Holdings"
            },
            {
              "Ticker": "LLNW",
              "Company": "Limelight Networks"
            },
            {
              "Ticker": "LMST",
              "Company": "Limestone Bancorp"
            },
            {
              "Ticker": "LMNR",
              "Company": "Limoneira Co"
            },
            {
              "Ticker": "LINC",
              "Company": "Lincoln Educational Services Corporation"
            },
            {
              "Ticker": "LECO",
              "Company": "Lincoln Electric Holdings"
            },
            {
              "Ticker": "LIND",
              "Company": "Lindblad Expeditions Holdings Inc."
            },
            {
              "Ticker": "LINDW",
              "Company": "Lindblad Expeditions Holdings Inc."
            },
            {
              "Ticker": "LPCN",
              "Company": "Lipocine Inc."
            },
            {
              "Ticker": "YVR",
              "Company": "Liquid Media Group Ltd."
            },
            {
              "Ticker": "LQDA",
              "Company": "Liquidia Technologies"
            },
            {
              "Ticker": "LQDT",
              "Company": "Liquidity Services"
            },
            {
              "Ticker": "LFUS",
              "Company": "Littelfuse"
            },
            {
              "Ticker": "LIVN",
              "Company": "LivaNova PLC"
            },
            {
              "Ticker": "LOB",
              "Company": "Live Oak Bancshares"
            },
            {
              "Ticker": "LIVE",
              "Company": "Live Ventures Incorporated"
            },
            {
              "Ticker": "LPSN",
              "Company": "LivePerson"
            },
            {
              "Ticker": "LIVX",
              "Company": "LiveXLive Media"
            },
            {
              "Ticker": "LKQ",
              "Company": "LKQ Corporation"
            },
            {
              "Ticker": "LMFA",
              "Company": "LM Funding America"
            },
            {
              "Ticker": "LMFAW",
              "Company": "LM Funding America"
            },
            {
              "Ticker": "LOGI",
              "Company": "Logitech International S.A."
            },
            {
              "Ticker": "LOGM",
              "Company": "LogMein"
            },
            {
              "Ticker": "CNCR",
              "Company": "Loncar Cancer Immunotherapy ETF"
            },
            {
              "Ticker": "CHNA",
              "Company": "Loncar China BioPharma ETF"
            },
            {
              "Ticker": "LONE",
              "Company": "Lonestar Resources US Inc."
            },
            {
              "Ticker": "LOACU",
              "Company": "Longevity Acquisition Corporation"
            },
            {
              "Ticker": "LOOP",
              "Company": "Loop Industries"
            },
            {
              "Ticker": "LORL",
              "Company": "Loral Space and Communications"
            },
            {
              "Ticker": "LOXO",
              "Company": "Loxo Oncology"
            },
            {
              "Ticker": "LPLA",
              "Company": "LPL Financial Holdings Inc."
            },
            {
              "Ticker": "LRAD",
              "Company": "LRAD Corporation"
            },
            {
              "Ticker": "LYTS",
              "Company": "LSI Industries Inc."
            },
            {
              "Ticker": "LULU",
              "Company": "lululemon athletica inc."
            },
            {
              "Ticker": "LITE",
              "Company": "Lumentum Holdings Inc."
            },
            {
              "Ticker": "LMNX",
              "Company": "Luminex Corporation"
            },
            {
              "Ticker": "LUNA",
              "Company": "Luna Innovations Incorporated"
            },
            {
              "Ticker": "LBC",
              "Company": "Luther Burbank Corporation"
            },
            {
              "Ticker": "MBTF",
              "Company": "M B T Financial Corp"
            },
            {
              "Ticker": "MCBC",
              "Company": "Macatawa Bank Corporation"
            },
            {
              "Ticker": "MFNC",
              "Company": "Mackinac Financial Corporation"
            },
            {
              "Ticker": "MTSI",
              "Company": "MACOM Technology Solutions Holdings"
            },
            {
              "Ticker": "MGNX",
              "Company": "MacroGenics"
            },
            {
              "Ticker": "MDGL",
              "Company": "Madrigal Pharmaceuticals"
            },
            {
              "Ticker": "MAGS",
              "Company": "Magal Security Systems Ltd."
            },
            {
              "Ticker": "MGLN",
              "Company": "Magellan Health"
            },
            {
              "Ticker": "MGTA",
              "Company": "Magenta Therapeutics"
            },
            {
              "Ticker": "MGIC",
              "Company": "Magic Software Enterprises Ltd."
            },
            {
              "Ticker": "CALL",
              "Company": "magicJack VocalTec Ltd"
            },
            {
              "Ticker": "MNGA",
              "Company": "MagneGas Corporation"
            },
            {
              "Ticker": "MGYR",
              "Company": "Magyar Bancorp"
            },
            {
              "Ticker": "MHLD",
              "Company": "Maiden Holdings"
            },
            {
              "Ticker": "MMYT",
              "Company": "MakeMyTrip Limited"
            },
            {
              "Ticker": "MBUU",
              "Company": "Malibu Boats"
            },
            {
              "Ticker": "MLVF",
              "Company": "Malvern Bancorp"
            },
            {
              "Ticker": "MAMS",
              "Company": "MAM Software Group"
            },
            {
              "Ticker": "TUSK",
              "Company": "Mammoth Energy Services"
            },
            {
              "Ticker": "RPIBC",
              "Company": "Managed Portfolio Series"
            },
            {
              "Ticker": "MANH",
              "Company": "Manhattan Associates"
            },
            {
              "Ticker": "LOAN",
              "Company": "Manhattan Bridge Capital"
            },
            {
              "Ticker": "MNTX",
              "Company": "Manitex International"
            },
            {
              "Ticker": "MTEX",
              "Company": "Mannatech"
            },
            {
              "Ticker": "MNKD",
              "Company": "MannKind Corporation"
            },
            {
              "Ticker": "MANT",
              "Company": "ManTech International Corporation"
            },
            {
              "Ticker": "MAPI",
              "Company": "Mapi - Pharma Ltd."
            },
            {
              "Ticker": "MARA",
              "Company": "Marathon Patent Group"
            },
            {
              "Ticker": "MCHX",
              "Company": "Marchex"
            },
            {
              "Ticker": "MRIN",
              "Company": "Marin Software Incorporated"
            },
            {
              "Ticker": "MARPS",
              "Company": "Marine Petroleum Trust"
            },
            {
              "Ticker": "MRNS",
              "Company": "Marinus Pharmaceuticals"
            },
            {
              "Ticker": "MKTX",
              "Company": "MarketAxess Holdings"
            },
            {
              "Ticker": "MRLN",
              "Company": "Marlin Business Services Corp."
            },
            {
              "Ticker": "MAR",
              "Company": "Marriott International"
            },
            {
              "Ticker": "MBII",
              "Company": "Marrone Bio Innovations"
            },
            {
              "Ticker": "MRTN",
              "Company": "Marten Transport"
            },
            {
              "Ticker": "MMLP",
              "Company": "Martin Midstream Partners L.P."
            },
            {
              "Ticker": "MRVL",
              "Company": "Marvell Technology Group Ltd."
            },
            {
              "Ticker": "MASI",
              "Company": "Masimo Corporation"
            },
            {
              "Ticker": "MTCH",
              "Company": "Match Group"
            },
            {
              "Ticker": "MTLS",
              "Company": "Materialise NV"
            },
            {
              "Ticker": "MPAC",
              "Company": "Matlin & Partners Acquisition Corporation"
            },
            {
              "Ticker": "MPACU",
              "Company": "Matlin & Partners Acquisition Corporation"
            },
            {
              "Ticker": "MPACW",
              "Company": "Matlin & Partners Acquisition Corporation"
            },
            {
              "Ticker": "MTRX",
              "Company": "Matrix Service Company"
            },
            {
              "Ticker": "MAT",
              "Company": "Mattel"
            },
            {
              "Ticker": "MATW",
              "Company": "Matthews International Corporation"
            },
            {
              "Ticker": "MXIM",
              "Company": "Maxim Integrated Products"
            },
            {
              "Ticker": "MXWL",
              "Company": "Maxwell Technologies"
            },
            {
              "Ticker": "MZOR",
              "Company": "Mazor Robotics Ltd."
            },
            {
              "Ticker": "MBFI",
              "Company": "MB Financial Inc."
            },
            {
              "Ticker": "MBFIO",
              "Company": "MB Financial Inc."
            },
            {
              "Ticker": "MCFT",
              "Company": "MCBC Holdings"
            },
            {
              "Ticker": "MGRC",
              "Company": "McGrath RentCorp"
            },
            {
              "Ticker": "MDCA",
              "Company": "MDC Partners Inc."
            },
            {
              "Ticker": "MFIN",
              "Company": "Medallion Financial Corp."
            },
            {
              "Ticker": "MFINL",
              "Company": "Medallion Financial Corp."
            },
            {
              "Ticker": "MTBC",
              "Company": "Medical Transcription Billing"
            },
            {
              "Ticker": "MTBCP",
              "Company": "Medical Transcription Billing"
            },
            {
              "Ticker": "MNOV",
              "Company": "MediciNova"
            },
            {
              "Ticker": "MDSO",
              "Company": "Medidata Solutions"
            },
            {
              "Ticker": "MDGS",
              "Company": "Medigus Ltd."
            },
            {
              "Ticker": "MDGSW",
              "Company": "Medigus Ltd."
            },
            {
              "Ticker": "MDWD",
              "Company": "MediWound Ltd."
            },
            {
              "Ticker": "MEDP",
              "Company": "Medpace Holdings"
            },
            {
              "Ticker": "MEIP",
              "Company": "MEI Pharma"
            },
            {
              "Ticker": "MGTX",
              "Company": "MeiraGTx Holdings plc"
            },
            {
              "Ticker": "MLCO",
              "Company": "Melco Resorts & Entertainment Limited"
            },
            {
              "Ticker": "MLNT",
              "Company": "Melinta Therapeutics"
            },
            {
              "Ticker": "MLNX",
              "Company": "Mellanox Technologies"
            },
            {
              "Ticker": "MELR",
              "Company": "Melrose Bancorp"
            },
            {
              "Ticker": "MNLO",
              "Company": "Menlo Therapeutics Inc."
            },
            {
              "Ticker": "MTSL",
              "Company": "MER Telemanagement Solutions Ltd."
            },
            {
              "Ticker": "MELI",
              "Company": "MercadoLibre"
            },
            {
              "Ticker": "MBNAA",
              "Company": "Mercantil Bank Holding Corporation"
            },
            {
              "Ticker": "MBNAB",
              "Company": "Mercantil Bank Holding Corporation"
            },
            {
              "Ticker": "MBWM",
              "Company": "Mercantile Bank Corporation"
            },
            {
              "Ticker": "MERC",
              "Company": "Mercer International Inc."
            },
            {
              "Ticker": "MBIN",
              "Company": "Merchants Bancorp"
            },
            {
              "Ticker": "MRCY",
              "Company": "Mercury Systems Inc"
            },
            {
              "Ticker": "MREO",
              "Company": "Mereo BioPharma Group plc"
            },
            {
              "Ticker": "EBSB",
              "Company": "Meridian Bancorp"
            },
            {
              "Ticker": "VIVO",
              "Company": "Meridian Bioscience Inc."
            },
            {
              "Ticker": "MRBK",
              "Company": "Meridian Corporation"
            },
            {
              "Ticker": "MMSI",
              "Company": "Merit Medical Systems"
            },
            {
              "Ticker": "MACK",
              "Company": "Merrimack Pharmaceuticals"
            },
            {
              "Ticker": "MRSN",
              "Company": "Mersana Therapeutics"
            },
            {
              "Ticker": "MRUS",
              "Company": "Merus N.V."
            },
            {
              "Ticker": "MESA",
              "Company": "Mesa Air Group"
            },
            {
              "Ticker": "MLAB",
              "Company": "Mesa Laboratories"
            },
            {
              "Ticker": "MESO",
              "Company": "Mesoblast Limited"
            },
            {
              "Ticker": "CASH",
              "Company": "Meta Financial Group"
            },
            {
              "Ticker": "MEOH",
              "Company": "Methanex Corporation"
            },
            {
              "Ticker": "MGEE",
              "Company": "MGE Energy Inc."
            },
            {
              "Ticker": "MGPI",
              "Company": "MGP Ingredients"
            },
            {
              "Ticker": "MBOT",
              "Company": "Microbot Medical Inc."
            },
            {
              "Ticker": "MCHP",
              "Company": "Microchip Technology Incorporated"
            },
            {
              "Ticker": "MU",
              "Company": "Micron Technology"
            },
            {
              "Ticker": "MSFT",
              "Company": "Microsoft Corporation"
            },
            {
              "Ticker": "MSTR",
              "Company": "MicroStrategy Incorporated"
            },
            {
              "Ticker": "MVIS",
              "Company": "Microvision"
            },
            {
              "Ticker": "MICT",
              "Company": "MICT"
            },
            {
              "Ticker": "MPB",
              "Company": "Mid Penn Bancorp"
            },
            {
              "Ticker": "MTP",
              "Company": "Midatech Pharma PLC"
            },
            {
              "Ticker": "MCEP",
              "Company": "Mid-Con Energy Partners"
            },
            {
              "Ticker": "MBCN",
              "Company": "Middlefield Banc Corp."
            },
            {
              "Ticker": "MSEX",
              "Company": "Middlesex Water Company"
            },
            {
              "Ticker": "MSBI",
              "Company": "Midland States Bancorp"
            },
            {
              "Ticker": "MSVB",
              "Company": "Mid-Southern Bancorp"
            },
            {
              "Ticker": "MOFG",
              "Company": "MidWestOne Financial Group"
            },
            {
              "Ticker": "MIME",
              "Company": "Mimecast Limited"
            },
            {
              "Ticker": "MDXG",
              "Company": "MiMedx Group"
            },
            {
              "Ticker": "MNDO",
              "Company": "MIND C.T.I. Ltd."
            },
            {
              "Ticker": "MB",
              "Company": "MINDBODY"
            },
            {
              "Ticker": "NERV",
              "Company": "Minerva Neurosciences"
            },
            {
              "Ticker": "MGEN",
              "Company": "Miragen Therapeutics"
            },
            {
              "Ticker": "MRTX",
              "Company": "Mirati Therapeutics"
            },
            {
              "Ticker": "MSON",
              "Company": "MISONIX"
            },
            {
              "Ticker": "MIND",
              "Company": "Mitcham Industries"
            },
            {
              "Ticker": "MINDP",
              "Company": "Mitcham Industries"
            },
            {
              "Ticker": "MITK",
              "Company": "Mitek Systems"
            },
            {
              "Ticker": "MITL",
              "Company": "Mitel Networks Corporation"
            },
            {
              "Ticker": "MKSI",
              "Company": "MKS Instruments"
            },
            {
              "Ticker": "MMAC",
              "Company": "MMA Capital Management"
            },
            {
              "Ticker": "MINI",
              "Company": "Mobile Mini"
            },
            {
              "Ticker": "MOBL",
              "Company": "MobileIron"
            },
            {
              "Ticker": "MMDM",
              "Company": "Modern Media Acquisition Corp."
            },
            {
              "Ticker": "MMDMR",
              "Company": "Modern Media Acquisition Corp."
            },
            {
              "Ticker": "MMDMU",
              "Company": "Modern Media Acquisition Corp."
            },
            {
              "Ticker": "MMDMW",
              "Company": "Modern Media Acquisition Corp."
            },
            {
              "Ticker": "MOGO",
              "Company": "Mogo Finance Technology Inc."
            },
            {
              "Ticker": "MTEM",
              "Company": "Molecular Templates"
            },
            {
              "Ticker": "MBRX",
              "Company": "Moleculin Biotech"
            },
            {
              "Ticker": "MNTA",
              "Company": "Momenta Pharmaceuticals"
            },
            {
              "Ticker": "MOMO",
              "Company": "Momo Inc."
            },
            {
              "Ticker": "MKGI",
              "Company": "Monaker Group"
            },
            {
              "Ticker": "MCRI",
              "Company": "Monarch Casino & Resort"
            },
            {
              "Ticker": "MDLZ",
              "Company": "Mondelez International"
            },
            {
              "Ticker": "MGI",
              "Company": "Moneygram International"
            },
            {
              "Ticker": "MDB",
              "Company": "MongoDB"
            },
            {
              "Ticker": "MPWR",
              "Company": "Monolithic Power Systems"
            },
            {
              "Ticker": "TYPE",
              "Company": "Monotype Imaging Holdings Inc."
            },
            {
              "Ticker": "MNRO",
              "Company": "Monro"
            },
            {
              "Ticker": "MRCC",
              "Company": "Monroe Capital Corporation"
            },
            {
              "Ticker": "MRCCL",
              "Company": "Monroe Capital Corporation"
            },
            {
              "Ticker": "MNST",
              "Company": "Monster Beverage Corporation"
            },
            {
              "Ticker": "MORN",
              "Company": "Morningstar"
            },
            {
              "Ticker": "MOR",
              "Company": "MorphoSys AG"
            },
            {
              "Ticker": "MOSY",
              "Company": "MoSys"
            },
            {
              "Ticker": "MOTA",
              "Company": "Mota Group"
            },
            {
              "Ticker": "MTFB",
              "Company": "Motif Bio plc"
            },
            {
              "Ticker": "MTFBW",
              "Company": "Motif Bio plc"
            },
            {
              "Ticker": "MPAA",
              "Company": "Motorcar Parts of America"
            },
            {
              "Ticker": "MOTS",
              "Company": "Motus GI Holdings"
            },
            {
              "Ticker": "MPVD",
              "Company": "Mountain Province Diamonds Inc."
            },
            {
              "Ticker": "MOXC",
              "Company": "Moxian"
            },
            {
              "Ticker": "COOP",
              "Company": "Mr. Cooper Group Inc."
            },
            {
              "Ticker": "MRIC",
              "Company": "MRI Interventions Inc"
            },
            {
              "Ticker": "MSBF",
              "Company": "MSB Financial Corp."
            },
            {
              "Ticker": "MTEC",
              "Company": "MTech Acquisition Corp."
            },
            {
              "Ticker": "MTECU",
              "Company": "MTech Acquisition Corp."
            },
            {
              "Ticker": "MTECW",
              "Company": "MTech Acquisition Corp."
            },
            {
              "Ticker": "MTSC",
              "Company": "MTS Systems Corporation"
            },
            {
              "Ticker": "MUDS",
              "Company": "Mudrick Capital Acquisition Corporation"
            },
            {
              "Ticker": "MUDSU",
              "Company": "Mudrick Capital Acquisition Corporation"
            },
            {
              "Ticker": "MUDSW",
              "Company": "Mudrick Capital Acquisition Corporation"
            },
            {
              "Ticker": "LABL",
              "Company": "Multi-Color Corporation"
            },
            {
              "Ticker": "MBIO",
              "Company": "Mustang Bio"
            },
            {
              "Ticker": "MFSF",
              "Company": "MutualFirst Financial Inc."
            },
            {
              "Ticker": "MVBF",
              "Company": "MVB Financial Corp."
            },
            {
              "Ticker": "MYSZ",
              "Company": "My Size"
            },
            {
              "Ticker": "MYL",
              "Company": "Mylan N.V."
            },
            {
              "Ticker": "MYND",
              "Company": "MYnd Analytics"
            },
            {
              "Ticker": "MYNDW",
              "Company": "MYnd Analytics"
            },
            {
              "Ticker": "MYOK",
              "Company": "MyoKardia"
            },
            {
              "Ticker": "MYOS",
              "Company": "MYOS RENS Technology Inc."
            },
            {
              "Ticker": "MYRG",
              "Company": "MYR Group"
            },
            {
              "Ticker": "MYGN",
              "Company": "Myriad Genetics"
            },
            {
              "Ticker": "NBRV",
              "Company": "Nabriva Therapeutics plc"
            },
            {
              "Ticker": "NAKD",
              "Company": "Naked Brand Group Limited"
            },
            {
              "Ticker": "NNDM",
              "Company": "Nano Dimension Ltd."
            },
            {
              "Ticker": "NANO",
              "Company": "Nanometrics Incorporated"
            },
            {
              "Ticker": "NSTG",
              "Company": "NanoString Technologies"
            },
            {
              "Ticker": "NAOV",
              "Company": "NanoVibronix"
            },
            {
              "Ticker": "NH",
              "Company": "NantHealth"
            },
            {
              "Ticker": "NK",
              "Company": "NantKwest"
            },
            {
              "Ticker": "NSSC",
              "Company": "NAPCO Security Technologies"
            },
            {
              "Ticker": "NDAQ",
              "Company": "Nasdaq"
            },
            {
              "Ticker": "NTRA",
              "Company": "Natera"
            },
            {
              "Ticker": "NATH",
              "Company": "Nathan&#39;s Famous"
            },
            {
              "Ticker": "NAUH",
              "Company": "National American University Holdings"
            },
            {
              "Ticker": "NKSH",
              "Company": "National Bankshares"
            },
            {
              "Ticker": "FIZZ",
              "Company": "National Beverage Corp."
            },
            {
              "Ticker": "NCMI",
              "Company": "National CineMedia"
            },
            {
              "Ticker": "NCOM",
              "Company": "National Commerce Corporation"
            },
            {
              "Ticker": "NESR",
              "Company": "National Energy Services Reunited Corp."
            },
            {
              "Ticker": "NESRW",
              "Company": "National Energy Services Reunited Corp."
            },
            {
              "Ticker": "NGHC",
              "Company": "National General Holdings Corp"
            },
            {
              "Ticker": "NGHCN",
              "Company": "National General Holdings Corp"
            },
            {
              "Ticker": "NGHCO",
              "Company": "National General Holdings Corp"
            },
            {
              "Ticker": "NGHCP",
              "Company": "National General Holdings Corp"
            },
            {
              "Ticker": "NGHCZ",
              "Company": "National General Holdings Corp"
            },
            {
              "Ticker": "NHLD",
              "Company": "National Holdings Corporation"
            },
            {
              "Ticker": "NHLDW",
              "Company": "National Holdings Corporation"
            },
            {
              "Ticker": "NATI",
              "Company": "National Instruments Corporation"
            },
            {
              "Ticker": "NRC",
              "Company": "National Research Corporation"
            },
            {
              "Ticker": "NSEC",
              "Company": "National Security Group"
            },
            {
              "Ticker": "EYE",
              "Company": "National Vision Holdings"
            },
            {
              "Ticker": "NWLI",
              "Company": "National Western Life Group"
            },
            {
              "Ticker": "NAII",
              "Company": "Natural Alternatives International"
            },
            {
              "Ticker": "NHTC",
              "Company": "Natural Health Trends Corp."
            },
            {
              "Ticker": "NATR",
              "Company": "Nature&#39;s Sunshine Products"
            },
            {
              "Ticker": "BABY",
              "Company": "Natus Medical Incorporated"
            },
            {
              "Ticker": "JSM",
              "Company": "Navient Corporation"
            },
            {
              "Ticker": "NAVI",
              "Company": "Navient Corporation"
            },
            {
              "Ticker": "NMCI",
              "Company": "Navios Maritime Containers L.P."
            },
            {
              "Ticker": "NBCP",
              "Company": "NB Capital Acquisition Corp."
            },
            {
              "Ticker": "NBTB",
              "Company": "NBT Bancorp Inc."
            },
            {
              "Ticker": "NCSM",
              "Company": "NCS Multistage Holdings"
            },
            {
              "Ticker": "NEBU",
              "Company": "Nebula Acquisition Corporation"
            },
            {
              "Ticker": "NEBUU",
              "Company": "Nebula Acquisition Corporation"
            },
            {
              "Ticker": "NEBUW",
              "Company": "Nebula Acquisition Corporation"
            },
            {
              "Ticker": "NKTR",
              "Company": "Nektar Therapeutics"
            },
            {
              "Ticker": "NMRD",
              "Company": "Nemaura Medical Inc."
            },
            {
              "Ticker": "NEOG",
              "Company": "Neogen Corporation"
            },
            {
              "Ticker": "NEO",
              "Company": "NeoGenomics"
            },
            {
              "Ticker": "NTGN",
              "Company": "Neon Therapeutics"
            },
            {
              "Ticker": "NEON",
              "Company": "Neonode Inc."
            },
            {
              "Ticker": "NEOS",
              "Company": "Neos Therapeutics"
            },
            {
              "Ticker": "NVCN",
              "Company": "Neovasc Inc."
            },
            {
              "Ticker": "NEPT",
              "Company": "Neptune Wellness Solutions Inc."
            },
            {
              "Ticker": "UEPS",
              "Company": "Net 1 UEPS Technologies"
            },
            {
              "Ticker": "NETE",
              "Company": "Net Element"
            },
            {
              "Ticker": "NTAP",
              "Company": "NetApp"
            },
            {
              "Ticker": "NTES",
              "Company": "NetEase"
            },
            {
              "Ticker": "NFLX",
              "Company": "Netflix"
            },
            {
              "Ticker": "NTGR",
              "Company": "NETGEAR"
            },
            {
              "Ticker": "NTCT",
              "Company": "NetScout Systems"
            },
            {
              "Ticker": "NTWK",
              "Company": "NetSol Technologies Inc."
            },
            {
              "Ticker": "CUR",
              "Company": "Neuralstem"
            },
            {
              "Ticker": "NBIX",
              "Company": "Neurocrine Biosciences"
            },
            {
              "Ticker": "NURO",
              "Company": "NeuroMetrix"
            },
            {
              "Ticker": "NUROW",
              "Company": "NeuroMetrix"
            },
            {
              "Ticker": "STIM",
              "Company": "Neuronetics"
            },
            {
              "Ticker": "NTRP",
              "Company": "Neurotrope"
            },
            {
              "Ticker": "NBEV",
              "Company": "New Age Beverages Corporation"
            },
            {
              "Ticker": "NYMT",
              "Company": "New York Mortgage Trust"
            },
            {
              "Ticker": "NYMTN",
              "Company": "New York Mortgage Trust"
            },
            {
              "Ticker": "NYMTO",
              "Company": "New York Mortgage Trust"
            },
            {
              "Ticker": "NYMTP",
              "Company": "New York Mortgage Trust"
            },
            {
              "Ticker": "NEWA",
              "Company": "Newater Technology"
            },
            {
              "Ticker": "NLNK",
              "Company": "NewLink Genetics Corporation"
            },
            {
              "Ticker": "NMRK",
              "Company": "Newmark Group"
            },
            {
              "Ticker": "NWS",
              "Company": "News Corporation"
            },
            {
              "Ticker": "NWSA",
              "Company": "News Corporation"
            },
            {
              "Ticker": "NEWT",
              "Company": "Newtek Business Services Corp."
            },
            {
              "Ticker": "NEWTI",
              "Company": "Newtek Business Services Corp."
            },
            {
              "Ticker": "NEWTZ",
              "Company": "Newtek Business Services Corp."
            },
            {
              "Ticker": "NXEO",
              "Company": "Nexeo Solutions"
            },
            {
              "Ticker": "NXEOU",
              "Company": "Nexeo Solutions"
            },
            {
              "Ticker": "NXEOW",
              "Company": "Nexeo Solutions"
            },
            {
              "Ticker": "NXMD",
              "Company": "Nexeon Medsystems"
            },
            {
              "Ticker": "NXST",
              "Company": "Nexstar Media Group"
            },
            {
              "Ticker": "NEXT",
              "Company": "NextDecade Corporation"
            },
            {
              "Ticker": "NXGN",
              "Company": "NextGen Healthcare"
            },
            {
              "Ticker": "NFEC",
              "Company": "NF Energy Saving Corporation"
            },
            {
              "Ticker": "NODK",
              "Company": "NI Holdings"
            },
            {
              "Ticker": "EGOV",
              "Company": "NIC Inc."
            },
            {
              "Ticker": "NICE",
              "Company": "NICE Ltd"
            },
            {
              "Ticker": "NICK",
              "Company": "Nicholas Financial"
            },
            {
              "Ticker": "NCBS",
              "Company": "Nicolet Bankshares Inc."
            },
            {
              "Ticker": "NITE",
              "Company": "Nightstar Therapeutics plc"
            },
            {
              "Ticker": "NIHD",
              "Company": "NII Holdings"
            },
            {
              "Ticker": "LASR",
              "Company": "nLIGHT"
            },
            {
              "Ticker": "NMIH",
              "Company": "NMI Holdings Inc"
            },
            {
              "Ticker": "NNBR",
              "Company": "NN"
            },
            {
              "Ticker": "NDLS",
              "Company": "Noodles & Company"
            },
            {
              "Ticker": "NDSN",
              "Company": "Nordson Corporation"
            },
            {
              "Ticker": "NSYS",
              "Company": "Nortech Systems Incorporated"
            },
            {
              "Ticker": "NBN",
              "Company": "Northeast Bancorp"
            },
            {
              "Ticker": "NTIC",
              "Company": "Northern Technologies International Corporation"
            },
            {
              "Ticker": "NTRS",
              "Company": "Northern Trust Corporation"
            },
            {
              "Ticker": "NTRSP",
              "Company": "Northern Trust Corporation"
            },
            {
              "Ticker": "NFBK",
              "Company": "Northfield Bancorp"
            },
            {
              "Ticker": "NRIM",
              "Company": "Northrim BanCorp Inc"
            },
            {
              "Ticker": "NWBI",
              "Company": "Northwest Bancshares"
            },
            {
              "Ticker": "NWPX",
              "Company": "Northwest Pipe Company"
            },
            {
              "Ticker": "NCLH",
              "Company": "Norwegian Cruise Line Holdings Ltd."
            },
            {
              "Ticker": "NWFL",
              "Company": "Norwood Financial Corp."
            },
            {
              "Ticker": "NVFY",
              "Company": "Nova Lifestyle"
            },
            {
              "Ticker": "NVMI",
              "Company": "Nova Measuring Instruments Ltd."
            },
            {
              "Ticker": "NOVN",
              "Company": "Novan"
            },
            {
              "Ticker": "NOVT",
              "Company": "Novanta Inc."
            },
            {
              "Ticker": "NVAX",
              "Company": "Novavax"
            },
            {
              "Ticker": "NVLN",
              "Company": "Novelion Therapeutics Inc."
            },
            {
              "Ticker": "NVCR",
              "Company": "NovoCure Limited"
            },
            {
              "Ticker": "NVMM",
              "Company": "Novume Solutions"
            },
            {
              "Ticker": "NVUS",
              "Company": "Novus Therapeutics"
            },
            {
              "Ticker": "NUAN",
              "Company": "Nuance Communications"
            },
            {
              "Ticker": "NCNA",
              "Company": "NuCana plc"
            },
            {
              "Ticker": "NTNX",
              "Company": "Nutanix"
            },
            {
              "Ticker": "NTRI",
              "Company": "NutriSystem Inc"
            },
            {
              "Ticker": "NUVA",
              "Company": "NuVasive"
            },
            {
              "Ticker": "NVTR",
              "Company": "Nuvectra Corporation"
            },
            {
              "Ticker": "QQQX",
              "Company": "Nuveen NASDAQ 100 Dynamic Overwrite Fund"
            },
            {
              "Ticker": "NVEE",
              "Company": "NV5 Global"
            },
            {
              "Ticker": "NVEC",
              "Company": "NVE Corporation"
            },
            {
              "Ticker": "NVDA",
              "Company": "NVIDIA Corporation"
            },
            {
              "Ticker": "NXPI",
              "Company": "NXP Semiconductors N.V."
            },
            {
              "Ticker": "NXTM",
              "Company": "NxStage Medical"
            },
            {
              "Ticker": "NXTD",
              "Company": "NXT-ID Inc."
            },
            {
              "Ticker": "NXTDW",
              "Company": "NXT-ID Inc."
            },
            {
              "Ticker": "NYMX",
              "Company": "Nymox Pharmaceutical Corporation"
            },
            {
              "Ticker": "OIIM",
              "Company": "O2Micro International Limited"
            },
            {
              "Ticker": "OVLY",
              "Company": "Oak Valley Bancorp (CA)"
            },
            {
              "Ticker": "OCSL",
              "Company": "Oaktree Specialty Lending Corporation"
            },
            {
              "Ticker": "OCSLL",
              "Company": "Oaktree Specialty Lending Corporation"
            },
            {
              "Ticker": "OCSI",
              "Company": "Oaktree Strategic Income Corporation"
            },
            {
              "Ticker": "OASM",
              "Company": "Oasmia Pharmaceutical AB"
            },
            {
              "Ticker": "OBLN",
              "Company": "Obalon Therapeutics"
            },
            {
              "Ticker": "OBSV",
              "Company": "ObsEva SA"
            },
            {
              "Ticker": "OBCI",
              "Company": "Ocean Bio-Chem"
            },
            {
              "Ticker": "OPTT",
              "Company": "Ocean Power Technologies"
            },
            {
              "Ticker": "ORIG",
              "Company": "Ocean Rig UDW Inc."
            },
            {
              "Ticker": "OCFC",
              "Company": "OceanFirst Financial Corp."
            },
            {
              "Ticker": "OCLR",
              "Company": "Oclaro"
            },
            {
              "Ticker": "OFED",
              "Company": "Oconee Federal Financial Corp."
            },
            {
              "Ticker": "OCUL",
              "Company": "Ocular Therapeutix"
            },
            {
              "Ticker": "ODT",
              "Company": "Odonate Therapeutics"
            },
            {
              "Ticker": "OMEX",
              "Company": "Odyssey Marine Exploration"
            },
            {
              "Ticker": "ODP",
              "Company": "Office Depot"
            },
            {
              "Ticker": "OFS",
              "Company": "OFS Capital Corporation"
            },
            {
              "Ticker": "OFSSL",
              "Company": "OFS Capital Corporation"
            },
            {
              "Ticker": "OCCI",
              "Company": "OFS Credit Company"
            },
            {
              "Ticker": "OHAI",
              "Company": "OHA Investment Corporation"
            },
            {
              "Ticker": "OVBC",
              "Company": "Ohio Valley Banc Corp."
            },
            {
              "Ticker": "OHRP",
              "Company": "Ohr Pharmaceutical"
            },
            {
              "Ticker": "OKTA",
              "Company": "Okta"
            },
            {
              "Ticker": "ODFL",
              "Company": "Old Dominion Freight Line"
            },
            {
              "Ticker": "OLBK",
              "Company": "Old Line Bancshares"
            },
            {
              "Ticker": "ONB",
              "Company": "Old National Bancorp"
            },
            {
              "Ticker": "OPOF",
              "Company": "Old Point Financial Corporation"
            },
            {
              "Ticker": "OSBC",
              "Company": "Old Second Bancorp"
            },
            {
              "Ticker": "OSBCP",
              "Company": "Old Second Bancorp"
            },
            {
              "Ticker": "OLLI",
              "Company": "Ollie&#39;s Bargain Outlet Holdings"
            },
            {
              "Ticker": "ZEUS",
              "Company": "Olympic Steel"
            },
            {
              "Ticker": "OFLX",
              "Company": "Omega Flex"
            },
            {
              "Ticker": "OMER",
              "Company": "Omeros Corporation"
            },
            {
              "Ticker": "OMCL",
              "Company": "Omnicell"
            },
            {
              "Ticker": "ON",
              "Company": "ON Semiconductor Corporation"
            },
            {
              "Ticker": "OTIV",
              "Company": "On Track Innovations Ltd"
            },
            {
              "Ticker": "ONS",
              "Company": "Oncobiologics"
            },
            {
              "Ticker": "ONSIW",
              "Company": "Oncobiologics"
            },
            {
              "Ticker": "ONCY",
              "Company": "Oncolytics Biotech Inc."
            },
            {
              "Ticker": "OMED",
              "Company": "OncoMed Pharmaceuticals"
            },
            {
              "Ticker": "ONTX",
              "Company": "Onconova Therapeutics"
            },
            {
              "Ticker": "ONTXW",
              "Company": "Onconova Therapeutics"
            },
            {
              "Ticker": "ONCS",
              "Company": "OncoSec Medical Incorporated"
            },
            {
              "Ticker": "OHGI",
              "Company": "One Horizon Group"
            },
            {
              "Ticker": "OSS",
              "Company": "One Stop Systems"
            },
            {
              "Ticker": "OSPN",
              "Company": "OneSpan Inc."
            },
            {
              "Ticker": "OPBK",
              "Company": "OP Bancorp"
            },
            {
              "Ticker": "OTEX",
              "Company": "Open Text Corporation"
            },
            {
              "Ticker": "OPRA",
              "Company": "Opera Limited"
            },
            {
              "Ticker": "OPES",
              "Company": "Opes Acquisition Corp."
            },
            {
              "Ticker": "OPESU",
              "Company": "Opes Acquisition Corp."
            },
            {
              "Ticker": "OPESW",
              "Company": "Opes Acquisition Corp."
            },
            {
              "Ticker": "OPGN",
              "Company": "OpGen"
            },
            {
              "Ticker": "OPGNW",
              "Company": "OpGen"
            },
            {
              "Ticker": "OPHT",
              "Company": "Ophthotech Corporation"
            },
            {
              "Ticker": "OPNT",
              "Company": "Opiant Pharmaceuticals"
            },
            {
              "Ticker": "OPK",
              "Company": "Opko Health"
            },
            {
              "Ticker": "OBAS",
              "Company": "Optibase Ltd."
            },
            {
              "Ticker": "OCC",
              "Company": "Optical Cable Corporation"
            },
            {
              "Ticker": "OPRX",
              "Company": "OptimizeRx Corporation"
            },
            {
              "Ticker": "OPHC",
              "Company": "OptimumBank Holdings"
            },
            {
              "Ticker": "OPTN",
              "Company": "OptiNose"
            },
            {
              "Ticker": "OPB",
              "Company": "Opus Bank"
            },
            {
              "Ticker": "ORMP",
              "Company": "Oramed Pharmaceuticals Inc."
            },
            {
              "Ticker": "OSUR",
              "Company": "OraSure Technologies"
            },
            {
              "Ticker": "ORBC",
              "Company": "ORBCOMM Inc."
            },
            {
              "Ticker": "ORBK",
              "Company": "Orbotech Ltd."
            },
            {
              "Ticker": "ORLY",
              "Company": "O&#39;Reilly Automotive"
            },
            {
              "Ticker": "ONVO",
              "Company": "Organovo Holdings"
            },
            {
              "Ticker": "ORGS",
              "Company": "Orgenesis Inc."
            },
            {
              "Ticker": "SEED",
              "Company": "Origin Agritech Limited"
            },
            {
              "Ticker": "OBNK",
              "Company": "Origin Bancorp"
            },
            {
              "Ticker": "OESX",
              "Company": "Orion Energy Systems"
            },
            {
              "Ticker": "ORIT",
              "Company": "Oritani Financial Corp."
            },
            {
              "Ticker": "ORRF",
              "Company": "Orrstown Financial Services Inc"
            },
            {
              "Ticker": "OFIX",
              "Company": "Orthofix Medical Inc."
            },
            {
              "Ticker": "KIDS",
              "Company": "OrthoPediatrics Corp."
            },
            {
              "Ticker": "OSIS",
              "Company": "OSI Systems"
            },
            {
              "Ticker": "OSIR",
              "Company": "Osiris Therapeutics"
            },
            {
              "Ticker": "OSMT",
              "Company": "Osmotica Pharmaceuticals plc"
            },
            {
              "Ticker": "OSN",
              "Company": "Ossen Innovation Co."
            },
            {
              "Ticker": "OTEL",
              "Company": "Otelco Inc."
            },
            {
              "Ticker": "OTG",
              "Company": "OTG EXP"
            },
            {
              "Ticker": "OTIC",
              "Company": "Otonomy"
            },
            {
              "Ticker": "OTTW",
              "Company": "Ottawa Bancorp"
            },
            {
              "Ticker": "OTTR",
              "Company": "Otter Tail Corporation"
            },
            {
              "Ticker": "OVAS",
              "Company": "OvaScience Inc."
            },
            {
              "Ticker": "OSTK",
              "Company": "Overstock.com"
            },
            {
              "Ticker": "OVID",
              "Company": "Ovid Therapeutics Inc."
            },
            {
              "Ticker": "OXBR",
              "Company": "Oxbridge Re Holdings Limited"
            },
            {
              "Ticker": "OXBRW",
              "Company": "Oxbridge Re Holdings Limited"
            },
            {
              "Ticker": "OXFD",
              "Company": "Oxford Immunotec Global PLC"
            },
            {
              "Ticker": "OXLC",
              "Company": "Oxford Lane Capital Corp."
            },
            {
              "Ticker": "OXLCM",
              "Company": "Oxford Lane Capital Corp."
            },
            {
              "Ticker": "OXLCO",
              "Company": "Oxford Lane Capital Corp."
            },
            {
              "Ticker": "OXSQ",
              "Company": "Oxford Square Capital Corp."
            },
            {
              "Ticker": "OXSQL",
              "Company": "Oxford Square Capital Corp."
            },
            {
              "Ticker": "PFIN",
              "Company": "P & F Industries"
            },
            {
              "Ticker": "PTSI",
              "Company": "P.A.M. Transportation Services"
            },
            {
              "Ticker": "PCAR",
              "Company": "PACCAR Inc."
            },
            {
              "Ticker": "VETS",
              "Company": "Pacer Military Times Best Employers ETF"
            },
            {
              "Ticker": "PACB",
              "Company": "Pacific Biosciences of California"
            },
            {
              "Ticker": "PCB",
              "Company": "Pacific City Financial Corporation"
            },
            {
              "Ticker": "PEIX",
              "Company": "Pacific Ethanol"
            },
            {
              "Ticker": "PMBC",
              "Company": "Pacific Mercantile Bancorp"
            },
            {
              "Ticker": "PPBI",
              "Company": "Pacific Premier Bancorp Inc"
            },
            {
              "Ticker": "PCRX",
              "Company": "Pacira Pharmaceuticals"
            },
            {
              "Ticker": "PACW",
              "Company": "PacWest Bancorp"
            },
            {
              "Ticker": "PTIE",
              "Company": "Pain Therapeutics"
            },
            {
              "Ticker": "PAAS",
              "Company": "Pan American Silver Corp."
            },
            {
              "Ticker": "PANL",
              "Company": "Pangaea Logistics Solutions Ltd."
            },
            {
              "Ticker": "PZZA",
              "Company": "Papa John&#39;s International"
            },
            {
              "Ticker": "FRSH",
              "Company": "Papa Murphy&#39;s Holdings"
            },
            {
              "Ticker": "PRTK",
              "Company": "Paratek Pharmaceuticals"
            },
            {
              "Ticker": "PNRL",
              "Company": "Paringa Resources Limited"
            },
            {
              "Ticker": "PCYG",
              "Company": "Park City Group"
            },
            {
              "Ticker": "PKBK",
              "Company": "Parke Bancorp"
            },
            {
              "Ticker": "PKOH",
              "Company": "Park-Ohio Holdings Corp."
            },
            {
              "Ticker": "PTNR",
              "Company": "Partner Communications Company Ltd."
            },
            {
              "Ticker": "PBHC",
              "Company": "Pathfinder Bancorp"
            },
            {
              "Ticker": "PATK",
              "Company": "Patrick Industries"
            },
            {
              "Ticker": "PNBK",
              "Company": "Patriot National Bancorp Inc."
            },
            {
              "Ticker": "PATI",
              "Company": "Patriot Transportation Holding"
            },
            {
              "Ticker": "PEGI",
              "Company": "Pattern Energy Group Inc."
            },
            {
              "Ticker": "PDCO",
              "Company": "Patterson Companies"
            },
            {
              "Ticker": "PTEN",
              "Company": "Patterson-UTI Energy"
            },
            {
              "Ticker": "PAVM",
              "Company": "PAVmed Inc."
            },
            {
              "Ticker": "PAVMW",
              "Company": "PAVmed Inc."
            },
            {
              "Ticker": "PAVMZ",
              "Company": "PAVmed Inc."
            },
            {
              "Ticker": "PAYX",
              "Company": "Paychex"
            },
            {
              "Ticker": "PCTY",
              "Company": "Paylocity Holding Corporation"
            },
            {
              "Ticker": "PYDS",
              "Company": "Payment Data Systems"
            },
            {
              "Ticker": "PYPL",
              "Company": "PayPal Holdings"
            },
            {
              "Ticker": "PBBI",
              "Company": "PB Bancorp"
            },
            {
              "Ticker": "CNXN",
              "Company": "PC Connection"
            },
            {
              "Ticker": "PCMI",
              "Company": "PCM"
            },
            {
              "Ticker": "PCSB",
              "Company": "PCSB Financial Corporation"
            },
            {
              "Ticker": "PCTI",
              "Company": "PC-Tel"
            },
            {
              "Ticker": "PDCE",
              "Company": "PDC Energy"
            },
            {
              "Ticker": "PDFS",
              "Company": "PDF Solutions"
            },
            {
              "Ticker": "PDLI",
              "Company": "PDL BioPharma"
            },
            {
              "Ticker": "PDLB",
              "Company": "PDL Community Bancorp"
            },
            {
              "Ticker": "PDVW",
              "Company": "pdvWireless"
            },
            {
              "Ticker": "SKIS",
              "Company": "Peak Resorts"
            },
            {
              "Ticker": "PGC",
              "Company": "Peapack-Gladstone Financial Corporation"
            },
            {
              "Ticker": "PEGA",
              "Company": "Pegasystems Inc."
            },
            {
              "Ticker": "PENN",
              "Company": "Penn National Gaming"
            },
            {
              "Ticker": "PVAC",
              "Company": "Penn Virginia Corporation"
            },
            {
              "Ticker": "PFLT",
              "Company": "PennantPark Floating Rate Capital Ltd."
            },
            {
              "Ticker": "PNNT",
              "Company": "PennantPark Investment Corporation"
            },
            {
              "Ticker": "PWOD",
              "Company": "Penns Woods Bancorp"
            },
            {
              "Ticker": "WRLS",
              "Company": "Pensare Acquisition Corp."
            },
            {
              "Ticker": "WRLSR",
              "Company": "Pensare Acquisition Corp."
            },
            {
              "Ticker": "WRLSU",
              "Company": "Pensare Acquisition Corp."
            },
            {
              "Ticker": "WRLSW",
              "Company": "Pensare Acquisition Corp."
            },
            {
              "Ticker": "PEBO",
              "Company": "Peoples Bancorp Inc."
            },
            {
              "Ticker": "PEBK",
              "Company": "Peoples Bancorp of North Carolina"
            },
            {
              "Ticker": "PFIS",
              "Company": "Peoples Financial Services Corp."
            },
            {
              "Ticker": "PBCT",
              "Company": "People&#39;s United Financial"
            },
            {
              "Ticker": "PBCTP",
              "Company": "People&#39;s United Financial"
            },
            {
              "Ticker": "PUB",
              "Company": "People&#39;s Utah Bancorp"
            },
            {
              "Ticker": "KPFS",
              "Company": "Pepper Food Service Co."
            },
            {
              "Ticker": "PEP",
              "Company": "Pepsico"
            },
            {
              "Ticker": "PRCP",
              "Company": "Perceptron"
            },
            {
              "Ticker": "PRFT",
              "Company": "Perficient"
            },
            {
              "Ticker": "PFMT",
              "Company": "Performant Financial Corporation"
            },
            {
              "Ticker": "PERI",
              "Company": "Perion Network Ltd"
            },
            {
              "Ticker": "PESI",
              "Company": "Perma-Fix Environmental Services"
            },
            {
              "Ticker": "PPIH",
              "Company": "Perma-Pipe International Holdings"
            },
            {
              "Ticker": "PTX",
              "Company": "Pernix Therapeutics Holdings"
            },
            {
              "Ticker": "PERY",
              "Company": "Perry Ellis International Inc."
            },
            {
              "Ticker": "PGLC",
              "Company": "Pershing Gold Corporation"
            },
            {
              "Ticker": "PETQ",
              "Company": "PetIQ"
            },
            {
              "Ticker": "PETS",
              "Company": "PetMed Express"
            },
            {
              "Ticker": "PFSW",
              "Company": "PFSweb"
            },
            {
              "Ticker": "PGTI",
              "Company": "PGT Innovations"
            },
            {
              "Ticker": "PHII",
              "Company": "PHI"
            },
            {
              "Ticker": "PHIIK",
              "Company": "PHI"
            },
            {
              "Ticker": "PAHC",
              "Company": "Phibro Animal Health Corporation"
            },
            {
              "Ticker": "PLAB",
              "Company": "Photronics"
            },
            {
              "Ticker": "PICO",
              "Company": "PICO Holdings Inc."
            },
            {
              "Ticker": "PLLL",
              "Company": "Piedmont Lithium Limited"
            },
            {
              "Ticker": "PIRS",
              "Company": "Pieris Pharmaceuticals"
            },
            {
              "Ticker": "PPC",
              "Company": "Pilgrim&#39;s Pride Corporation"
            },
            {
              "Ticker": "PDD",
              "Company": "Pinduoduo Inc."
            },
            {
              "Ticker": "PME",
              "Company": "Pingtan Marine Enterprise Ltd."
            },
            {
              "Ticker": "PNK",
              "Company": "Pinnacle Entertainment"
            },
            {
              "Ticker": "PNFP",
              "Company": "Pinnacle Financial Partners"
            },
            {
              "Ticker": "PPSI",
              "Company": "Pioneer Power Solutions"
            },
            {
              "Ticker": "PXLW",
              "Company": "Pixelworks"
            },
            {
              "Ticker": "EAGL",
              "Company": "Platinum Eagle Acquisition Corp."
            },
            {
              "Ticker": "EAGLU",
              "Company": "Platinum Eagle Acquisition Corp."
            },
            {
              "Ticker": "EAGLW",
              "Company": "Platinum Eagle Acquisition Corp."
            },
            {
              "Ticker": "PLYA",
              "Company": "Playa Hotels & Resorts N.V."
            },
            {
              "Ticker": "PLXS",
              "Company": "Plexus Corp."
            },
            {
              "Ticker": "PLUG",
              "Company": "Plug Power"
            },
            {
              "Ticker": "PLBC",
              "Company": "Plumas Bancorp"
            },
            {
              "Ticker": "PS",
              "Company": "Pluralsight"
            },
            {
              "Ticker": "PSTI",
              "Company": "Pluristem Therapeutics"
            },
            {
              "Ticker": "PLXP",
              "Company": "PLx Pharma Inc."
            },
            {
              "Ticker": "PBSK",
              "Company": "Poage Bankshares"
            },
            {
              "Ticker": "PNTR",
              "Company": "Pointer Telocation Ltd."
            },
            {
              "Ticker": "PCOM",
              "Company": "Points International"
            },
            {
              "Ticker": "POLA",
              "Company": "Polar Power"
            },
            {
              "Ticker": "PTE",
              "Company": "PolarityTE"
            },
            {
              "Ticker": "POLY",
              "Company": "PolyPid Ltd."
            },
            {
              "Ticker": "POOL",
              "Company": "Pool Corporation"
            },
            {
              "Ticker": "POPE",
              "Company": "Pope Resources"
            },
            {
              "Ticker": "BPOP",
              "Company": "Popular"
            },
            {
              "Ticker": "BPOPM",
              "Company": "Popular"
            },
            {
              "Ticker": "BPOPN",
              "Company": "Popular"
            },
            {
              "Ticker": "PTLA",
              "Company": "Portola Pharmaceuticals"
            },
            {
              "Ticker": "PBPB",
              "Company": "Potbelly Corporation"
            },
            {
              "Ticker": "PCH",
              "Company": "PotlatchDeltic Corporation"
            },
            {
              "Ticker": "POWL",
              "Company": "Powell Industries"
            },
            {
              "Ticker": "POWI",
              "Company": "Power Integrations"
            },
            {
              "Ticker": "PRAA",
              "Company": "PRA Group"
            },
            {
              "Ticker": "PRAH",
              "Company": "PRA Health Sciences"
            },
            {
              "Ticker": "PRAN",
              "Company": "Prana Biotechnology Ltd"
            },
            {
              "Ticker": "PRPO",
              "Company": "Precipio"
            },
            {
              "Ticker": "AIPT",
              "Company": "Precision Therapeutics Inc."
            },
            {
              "Ticker": "PFBC",
              "Company": "Preferred Bank"
            },
            {
              "Ticker": "PLPC",
              "Company": "Preformed Line Products Company"
            },
            {
              "Ticker": "PFBI",
              "Company": "Premier Financial Bancorp"
            },
            {
              "Ticker": "PINC",
              "Company": "Premier"
            },
            {
              "Ticker": "LENS",
              "Company": "Presbia PLC"
            },
            {
              "Ticker": "PSDO",
              "Company": "Presidio"
            },
            {
              "Ticker": "PBIO",
              "Company": "Pressure BioSciences"
            },
            {
              "Ticker": "PRGX",
              "Company": "PRGX Global"
            },
            {
              "Ticker": "PSMT",
              "Company": "PriceSmart"
            },
            {
              "Ticker": "PNRG",
              "Company": "PrimeEnergy Corporation"
            },
            {
              "Ticker": "PRMW",
              "Company": "Primo Water Corporation"
            },
            {
              "Ticker": "PRIM",
              "Company": "Primoris Services Corporation"
            },
            {
              "Ticker": "PVAL",
              "Company": "Principal Contrarian Value Index ETF"
            },
            {
              "Ticker": "PFG",
              "Company": "Principal Financial Group Inc"
            },
            {
              "Ticker": "BTEC",
              "Company": "Principal Healthcare Innovators Index ETF"
            },
            {
              "Ticker": "PXUS",
              "Company": "Principal International Multi-Factor Index ETF"
            },
            {
              "Ticker": "GENY",
              "Company": "Principal Millennials Index ETF"
            },
            {
              "Ticker": "PSET",
              "Company": "Principal Price Setters Index ETF"
            },
            {
              "Ticker": "PY",
              "Company": "Principal Shareholder Yield Index ETF"
            },
            {
              "Ticker": "PMOM",
              "Company": "Principal Sustainable Momentum Index ETF"
            },
            {
              "Ticker": "USMC",
              "Company": "Principal U.S. Mega-Cap Multi-Factor Index ETF"
            },
            {
              "Ticker": "PSC",
              "Company": "Principal U.S. Small-Cap Multi-Factor Index ETF"
            },
            {
              "Ticker": "PRNB",
              "Company": "Principia Biopharma Inc."
            },
            {
              "Ticker": "PRTH",
              "Company": "Priority Technology Holdings"
            },
            {
              "Ticker": "PRTHU",
              "Company": "Priority Technology Holdings"
            },
            {
              "Ticker": "PRTHW",
              "Company": "Priority Technology Holdings"
            },
            {
              "Ticker": "PDEX",
              "Company": "Pro-Dex"
            },
            {
              "Ticker": "IPDN",
              "Company": "Professional Diversity Network"
            },
            {
              "Ticker": "PFIE",
              "Company": "Profire Energy"
            },
            {
              "Ticker": "PGNX",
              "Company": "Progenics Pharmaceuticals Inc."
            },
            {
              "Ticker": "PRGS",
              "Company": "Progress Software Corporation"
            },
            {
              "Ticker": "LUNG",
              "Company": "ProLung"
            },
            {
              "Ticker": "PFPT",
              "Company": "Proofpoint"
            },
            {
              "Ticker": "PRPH",
              "Company": "ProPhase Labs"
            },
            {
              "Ticker": "PRQR",
              "Company": "ProQR Therapeutics N.V."
            },
            {
              "Ticker": "EQRR",
              "Company": "ProShares Equities for Rising Rates ETF"
            },
            {
              "Ticker": "BIB",
              "Company": "ProShares Ultra Nasdaq Biotechnology"
            },
            {
              "Ticker": "UBIO",
              "Company": "Proshares UltraPro Nasdaq Biotechnology"
            },
            {
              "Ticker": "TQQQ",
              "Company": "ProShares UltraPro QQQ"
            },
            {
              "Ticker": "ZBIO",
              "Company": "ProShares UltraPro Short NASDAQ Biotechnology"
            },
            {
              "Ticker": "SQQQ",
              "Company": "ProShares UltraPro Short QQQ"
            },
            {
              "Ticker": "BIS",
              "Company": "ProShares UltraShort Nasdaq Biotechnology"
            },
            {
              "Ticker": "PSEC",
              "Company": "Prospect Capital Corporation"
            },
            {
              "Ticker": "PTGX",
              "Company": "Protagonist Therapeutics"
            },
            {
              "Ticker": "PTVCA",
              "Company": "Protective Insurance Corporation"
            },
            {
              "Ticker": "PTVCB",
              "Company": "Protective Insurance Corporation"
            },
            {
              "Ticker": "PRTO",
              "Company": "Proteon Therapeutics"
            },
            {
              "Ticker": "PTI",
              "Company": "Proteostasis Therapeutics"
            },
            {
              "Ticker": "PRTA",
              "Company": "Prothena Corporation plc"
            },
            {
              "Ticker": "PRVB",
              "Company": "Provention Bio"
            },
            {
              "Ticker": "PVBC",
              "Company": "Provident Bancorp"
            },
            {
              "Ticker": "PROV",
              "Company": "Provident Financial Holdings"
            },
            {
              "Ticker": "PBIP",
              "Company": "Prudential Bancorp"
            },
            {
              "Ticker": "PMD",
              "Company": "Psychemedics Corporation"
            },
            {
              "Ticker": "PTC",
              "Company": "PTC Inc."
            },
            {
              "Ticker": "PTCT",
              "Company": "PTC Therapeutics"
            },
            {
              "Ticker": "PULM",
              "Company": "Pulmatrix"
            },
            {
              "Ticker": "PLSE",
              "Company": "Pulse Biosciences"
            },
            {
              "Ticker": "PBYI",
              "Company": "Puma Biotechnology Inc"
            },
            {
              "Ticker": "PACQ",
              "Company": "Pure Acquisition Corp."
            },
            {
              "Ticker": "PACQU",
              "Company": "Pure Acquisition Corp."
            },
            {
              "Ticker": "PACQW",
              "Company": "Pure Acquisition Corp."
            },
            {
              "Ticker": "PCYO",
              "Company": "Pure Cycle Corporation"
            },
            {
              "Ticker": "PRPL",
              "Company": "Purple Innovation"
            },
            {
              "Ticker": "PXS",
              "Company": "Pyxis Tankers Inc."
            },
            {
              "Ticker": "QADA",
              "Company": "QAD Inc."
            },
            {
              "Ticker": "QADB",
              "Company": "QAD Inc."
            },
            {
              "Ticker": "QCRH",
              "Company": "QCR Holdings"
            },
            {
              "Ticker": "QGEN",
              "Company": "Qiagen N.V."
            },
            {
              "Ticker": "QIWI",
              "Company": "QIWI plc"
            },
            {
              "Ticker": "QRVO",
              "Company": "Qorvo"
            },
            {
              "Ticker": "QCOM",
              "Company": "QUALCOMM Incorporated"
            },
            {
              "Ticker": "QBAK",
              "Company": "Qualstar Corporation"
            },
            {
              "Ticker": "QLYS",
              "Company": "Qualys"
            },
            {
              "Ticker": "QTNA",
              "Company": "Quantenna Communications"
            },
            {
              "Ticker": "QTRX",
              "Company": "Quanterix Corporation"
            },
            {
              "Ticker": "QTRH",
              "Company": "Quarterhill Inc."
            },
            {
              "Ticker": "QRHC",
              "Company": "Quest Resource Holding Corporation."
            },
            {
              "Ticker": "QUIK",
              "Company": "QuickLogic Corporation"
            },
            {
              "Ticker": "QDEL",
              "Company": "Quidel Corporation"
            },
            {
              "Ticker": "QNST",
              "Company": "QuinStreet"
            },
            {
              "Ticker": "QUMU",
              "Company": "Qumu Corporation"
            },
            {
              "Ticker": "QTNT",
              "Company": "Quotient Limited"
            },
            {
              "Ticker": "QRTEA",
              "Company": "Qurate Retail"
            },
            {
              "Ticker": "QRTEB",
              "Company": "Qurate Retail"
            },
            {
              "Ticker": "QTT",
              "Company": "Qutoutiao Inc."
            },
            {
              "Ticker": "RRD",
              "Company": "R.R. Donnelley & Sons Company"
            },
            {
              "Ticker": "RCM",
              "Company": "R1 RCM Inc."
            },
            {
              "Ticker": "RARX",
              "Company": "Ra Pharmaceuticals"
            },
            {
              "Ticker": "RADA",
              "Company": "RADA Electronic Industries Ltd."
            },
            {
              "Ticker": "RDCM",
              "Company": "Radcom Ltd."
            },
            {
              "Ticker": "RSYS",
              "Company": "RadiSys Corporation"
            },
            {
              "Ticker": "RDUS",
              "Company": "Radius Health"
            },
            {
              "Ticker": "RDNT",
              "Company": "RadNet"
            },
            {
              "Ticker": "RDWR",
              "Company": "Radware Ltd."
            },
            {
              "Ticker": "METC",
              "Company": "Ramaco Resources"
            },
            {
              "Ticker": "RMBS",
              "Company": "Rambus"
            },
            {
              "Ticker": "RAND",
              "Company": "Rand Capital Corporation"
            },
            {
              "Ticker": "GOLD",
              "Company": "Randgold Resources Limited"
            },
            {
              "Ticker": "RNDB",
              "Company": "Randolph Bancorp"
            },
            {
              "Ticker": "RPD",
              "Company": "Rapid7"
            },
            {
              "Ticker": "RAVE",
              "Company": "Rave Restaurant Group"
            },
            {
              "Ticker": "RAVN",
              "Company": "Raven Industries"
            },
            {
              "Ticker": "RBB",
              "Company": "RBB Bancorp"
            },
            {
              "Ticker": "ROLL",
              "Company": "RBC Bearings Incorporated"
            },
            {
              "Ticker": "RICK",
              "Company": "RCI Hospitality Holdings"
            },
            {
              "Ticker": "RCMT",
              "Company": "RCM Technologies"
            },
            {
              "Ticker": "RDI",
              "Company": "Reading International Inc"
            },
            {
              "Ticker": "RDIB",
              "Company": "Reading International Inc"
            },
            {
              "Ticker": "RGSE",
              "Company": "Real Goods Solar"
            },
            {
              "Ticker": "BCNA",
              "Company": "Reality Shares Nasdaq NexGen Economy China ETF"
            },
            {
              "Ticker": "BLCN",
              "Company": "Reality Shares Nasdaq NextGen Economy ETF"
            },
            {
              "Ticker": "RLM",
              "Company": "Realm Therapeutics plc"
            },
            {
              "Ticker": "RNWK",
              "Company": "RealNetworks"
            },
            {
              "Ticker": "RP",
              "Company": "RealPage"
            },
            {
              "Ticker": "RETA",
              "Company": "Reata Pharmaceuticals"
            },
            {
              "Ticker": "RCON",
              "Company": "Recon Technology"
            },
            {
              "Ticker": "REPH",
              "Company": "Recro Pharma"
            },
            {
              "Ticker": "RRGB",
              "Company": "Red Robin Gourmet Burgers"
            },
            {
              "Ticker": "RRR",
              "Company": "Red Rock Resorts"
            },
            {
              "Ticker": "RDVT",
              "Company": "Red Violet"
            },
            {
              "Ticker": "RDFN",
              "Company": "Redfin Corporation"
            },
            {
              "Ticker": "RDHL",
              "Company": "Redhill Biopharma Ltd."
            },
            {
              "Ticker": "REGN",
              "Company": "Regeneron Pharmaceuticals"
            },
            {
              "Ticker": "RGNX",
              "Company": "REGENXBIO Inc."
            },
            {
              "Ticker": "RGLS",
              "Company": "Regulus Therapeutics Inc."
            },
            {
              "Ticker": "REIS",
              "Company": "Reis"
            },
            {
              "Ticker": "RBNC",
              "Company": "Reliant Bancorp"
            },
            {
              "Ticker": "RELV",
              "Company": "Reliv&#39; International"
            },
            {
              "Ticker": "MARK",
              "Company": "Remark Holdings"
            },
            {
              "Ticker": "RRI",
              "Company": "Remora Royalties"
            },
            {
              "Ticker": "RNST",
              "Company": "Renasant Corporation"
            },
            {
              "Ticker": "REGI",
              "Company": "Renewable Energy Group"
            },
            {
              "Ticker": "ABAC",
              "Company": "Renmin Tianli Group"
            },
            {
              "Ticker": "RCII",
              "Company": "Rent-A-Center Inc."
            },
            {
              "Ticker": "RGEN",
              "Company": "Repligen Corporation"
            },
            {
              "Ticker": "REPL",
              "Company": "Replimune Group"
            },
            {
              "Ticker": "RBCAA",
              "Company": "Republic Bancorp"
            },
            {
              "Ticker": "FRBK",
              "Company": "Republic First Bancorp"
            },
            {
              "Ticker": "REFR",
              "Company": "Research Frontiers Incorporated"
            },
            {
              "Ticker": "RSLS",
              "Company": "ReShape Lifesciences Inc."
            },
            {
              "Ticker": "RESN",
              "Company": "Resonant Inc."
            },
            {
              "Ticker": "RECN",
              "Company": "Resources Connection"
            },
            {
              "Ticker": "HAIR",
              "Company": "Restoration Robotics"
            },
            {
              "Ticker": "TORC",
              "Company": "resTORbio"
            },
            {
              "Ticker": "ROIC",
              "Company": "Retail Opportunity Investments Corp."
            },
            {
              "Ticker": "RETO",
              "Company": "ReTo Eco-Solutions"
            },
            {
              "Ticker": "RTRX",
              "Company": "Retrophin"
            },
            {
              "Ticker": "RVNC",
              "Company": "Revance Therapeutics"
            },
            {
              "Ticker": "RVEN",
              "Company": "Reven Housing REIT"
            },
            {
              "Ticker": "RBIO",
              "Company": "rEVO Biologics"
            },
            {
              "Ticker": "RVLT",
              "Company": "Revolution Lighting Technologies"
            },
            {
              "Ticker": "RWLK",
              "Company": "ReWalk Robotics Ltd"
            },
            {
              "Ticker": "RFIL",
              "Company": "RF Industries"
            },
            {
              "Ticker": "RGCO",
              "Company": "RGC Resources Inc."
            },
            {
              "Ticker": "RYTM",
              "Company": "Rhythm Pharmaceuticals"
            },
            {
              "Ticker": "RBBN",
              "Company": "Ribbon Communications Inc."
            },
            {
              "Ticker": "RIBT",
              "Company": "RiceBran Technologies"
            },
            {
              "Ticker": "RIBTW",
              "Company": "RiceBran Technologies"
            },
            {
              "Ticker": "RELL",
              "Company": "Richardson Electronics"
            },
            {
              "Ticker": "RIGL",
              "Company": "Rigel Pharmaceuticals"
            },
            {
              "Ticker": "RNET",
              "Company": "RigNet"
            },
            {
              "Ticker": "RMNI",
              "Company": "Rimini Street"
            },
            {
              "Ticker": "RIOT",
              "Company": "Riot Blockchain"
            },
            {
              "Ticker": "REDU",
              "Company": "RISE Education Cayman Ltd"
            },
            {
              "Ticker": "RTTR",
              "Company": "Ritter Pharmaceuticals"
            },
            {
              "Ticker": "RVSB",
              "Company": "Riverview Bancorp Inc"
            },
            {
              "Ticker": "RIVE",
              "Company": "Riverview Financial Corporation"
            },
            {
              "Ticker": "RLJE",
              "Company": "RLJ Entertainment"
            },
            {
              "Ticker": "RCKT",
              "Company": "Rocket Pharmaceuticals"
            },
            {
              "Ticker": "RMTI",
              "Company": "Rockwell Medical"
            },
            {
              "Ticker": "RCKY",
              "Company": "Rocky Brands"
            },
            {
              "Ticker": "RMCF",
              "Company": "Rocky Mountain Chocolate Factory"
            },
            {
              "Ticker": "ROKU",
              "Company": "Roku"
            },
            {
              "Ticker": "ROSE",
              "Company": "Rosehill Resources Inc."
            },
            {
              "Ticker": "ROSEU",
              "Company": "Rosehill Resources Inc."
            },
            {
              "Ticker": "ROSEW",
              "Company": "Rosehill Resources Inc."
            },
            {
              "Ticker": "ROST",
              "Company": "Ross Stores"
            },
            {
              "Ticker": "RGLD",
              "Company": "Royal Gold"
            },
            {
              "Ticker": "RTIX",
              "Company": "RTI Surgical"
            },
            {
              "Ticker": "RBCN",
              "Company": "Rubicon Technology"
            },
            {
              "Ticker": "RUBY",
              "Company": "Rubius Therapeutics"
            },
            {
              "Ticker": "RMBL",
              "Company": "RumbleOn"
            },
            {
              "Ticker": "RUSHA",
              "Company": "Rush Enterprises"
            },
            {
              "Ticker": "RUSHB",
              "Company": "Rush Enterprises"
            },
            {
              "Ticker": "RUTH",
              "Company": "Ruth&#39;s Hospitality Group"
            },
            {
              "Ticker": "RXII",
              "Company": "RXi Pharmaceuticals Corporation"
            },
            {
              "Ticker": "RXIIW",
              "Company": "RXi Pharmaceuticals Corporation"
            },
            {
              "Ticker": "RYAAY",
              "Company": "Ryanair Holdings plc"
            },
            {
              "Ticker": "STBA",
              "Company": "S&T Bancorp"
            },
            {
              "Ticker": "SANW",
              "Company": "S&W Seed Company"
            },
            {
              "Ticker": "SCAC",
              "Company": "Saban Capital Acquisition Corp."
            },
            {
              "Ticker": "SCACU",
              "Company": "Saban Capital Acquisition Corp."
            },
            {
              "Ticker": "SCACW",
              "Company": "Saban Capital Acquisition Corp."
            },
            {
              "Ticker": "SBRA",
              "Company": "Sabra Health Care REIT"
            },
            {
              "Ticker": "SABR",
              "Company": "Sabre Corporation"
            },
            {
              "Ticker": "SAEX",
              "Company": "SAExploration Holdings"
            },
            {
              "Ticker": "SFET",
              "Company": "Safe-T Group Ltd."
            },
            {
              "Ticker": "SAFT",
              "Company": "Safety Insurance Group"
            },
            {
              "Ticker": "SGA",
              "Company": "Saga Communications"
            },
            {
              "Ticker": "SAGE",
              "Company": "Sage Therapeutics"
            },
            {
              "Ticker": "SAIA",
              "Company": "Saia"
            },
            {
              "Ticker": "SALM",
              "Company": "Salem Media Group"
            },
            {
              "Ticker": "SAL",
              "Company": "Salisbury Bancorp"
            },
            {
              "Ticker": "SAFM",
              "Company": "Sanderson Farms"
            },
            {
              "Ticker": "SASR",
              "Company": "Sandy Spring Bancorp"
            },
            {
              "Ticker": "SGMO",
              "Company": "Sangamo Therapeutics"
            },
            {
              "Ticker": "SANM",
              "Company": "Sanmina Corporation"
            },
            {
              "Ticker": "GCVRZ",
              "Company": "Sanofi"
            },
            {
              "Ticker": "SPNS",
              "Company": "Sapiens International Corporation N.V."
            },
            {
              "Ticker": "SRPT",
              "Company": "Sarepta Therapeutics"
            },
            {
              "Ticker": "SVRA",
              "Company": "Savara"
            },
            {
              "Ticker": "SBFG",
              "Company": "SB Financial Group"
            },
            {
              "Ticker": "SBFGP",
              "Company": "SB Financial Group"
            },
            {
              "Ticker": "SBBX",
              "Company": "SB One Bancorp"
            },
            {
              "Ticker": "SBAC",
              "Company": "SBA Communications Corporation"
            },
            {
              "Ticker": "SCSC",
              "Company": "ScanSource"
            },
            {
              "Ticker": "SMIT",
              "Company": "Schmitt Industries"
            },
            {
              "Ticker": "SCHN",
              "Company": "Schnitzer Steel Industries"
            },
            {
              "Ticker": "SRRK",
              "Company": "Scholar Rock Holding Corporation"
            },
            {
              "Ticker": "SCHL",
              "Company": "Scholastic Corporation"
            },
            {
              "Ticker": "SGMS",
              "Company": "Scientific Games Corp"
            },
            {
              "Ticker": "SCPH",
              "Company": "scPharmaceuticals Inc."
            },
            {
              "Ticker": "SCYX",
              "Company": "SCYNEXIS"
            },
            {
              "Ticker": "SEAC",
              "Company": "SeaChange International"
            },
            {
              "Ticker": "SBCF",
              "Company": "Seacoast Banking Corporation of Florida"
            },
            {
              "Ticker": "STX",
              "Company": "Seagate Technology PLC"
            },
            {
              "Ticker": "SHIP",
              "Company": "Seanergy Maritime Holdings Corp"
            },
            {
              "Ticker": "SHIPW",
              "Company": "Seanergy Maritime Holdings Corp"
            },
            {
              "Ticker": "SHLD",
              "Company": "Sears Holdings Corporation"
            },
            {
              "Ticker": "SHLDW",
              "Company": "Sears Holdings Corporation"
            },
            {
              "Ticker": "SHOS",
              "Company": "Sears Hometown and Outlet Stores"
            },
            {
              "Ticker": "SPNE",
              "Company": "SeaSpine Holdings Corporation"
            },
            {
              "Ticker": "SGEN",
              "Company": "Seattle Genetics"
            },
            {
              "Ticker": "EYES",
              "Company": "Second Sight Medical Products"
            },
            {
              "Ticker": "EYESW",
              "Company": "Second Sight Medical Products"
            },
            {
              "Ticker": "SECO",
              "Company": "Secoo Holding Limited"
            },
            {
              "Ticker": "SCWX",
              "Company": "SecureWorks Corp."
            },
            {
              "Ticker": "SNFCA",
              "Company": "Security National Financial Corporation"
            },
            {
              "Ticker": "SEIC",
              "Company": "SEI Investments Company"
            },
            {
              "Ticker": "SLCT",
              "Company": "Select Bancorp"
            },
            {
              "Ticker": "SIR",
              "Company": "Select Income REIT"
            },
            {
              "Ticker": "SIC",
              "Company": "Select Interior Concepts"
            },
            {
              "Ticker": "SELB",
              "Company": "Selecta Biosciences"
            },
            {
              "Ticker": "SIGI",
              "Company": "Selective Insurance Group"
            },
            {
              "Ticker": "SLS",
              "Company": "SELLAS Life Sciences Group"
            },
            {
              "Ticker": "LEDS",
              "Company": "SemiLEDS Corporation"
            },
            {
              "Ticker": "SMTC",
              "Company": "Semtech Corporation"
            },
            {
              "Ticker": "SENEA",
              "Company": "Seneca Foods Corp."
            },
            {
              "Ticker": "SENEB",
              "Company": "Seneca Foods Corp."
            },
            {
              "Ticker": "SNES",
              "Company": "SenesTech"
            },
            {
              "Ticker": "SNH",
              "Company": "Senior Housing Properties Trust"
            },
            {
              "Ticker": "SNHNI",
              "Company": "Senior Housing Properties Trust"
            },
            {
              "Ticker": "SNHNL",
              "Company": "Senior Housing Properties Trust"
            },
            {
              "Ticker": "AIHS",
              "Company": "Senmiao Technology Limited"
            },
            {
              "Ticker": "SNMX",
              "Company": "Senomyx"
            },
            {
              "Ticker": "SRTS",
              "Company": "Sensus Healthcare"
            },
            {
              "Ticker": "SRTSW",
              "Company": "Sensus Healthcare"
            },
            {
              "Ticker": "STNL",
              "Company": "Sentinel Energy Services Inc."
            },
            {
              "Ticker": "STNLU",
              "Company": "Sentinel Energy Services Inc."
            },
            {
              "Ticker": "STNLW",
              "Company": "Sentinel Energy Services Inc."
            },
            {
              "Ticker": "SQBG",
              "Company": "Sequential Brands Group"
            },
            {
              "Ticker": "MCRB",
              "Company": "Seres Therapeutics"
            },
            {
              "Ticker": "SREV",
              "Company": "ServiceSource International"
            },
            {
              "Ticker": "SFBS",
              "Company": "ServisFirst Bancshares"
            },
            {
              "Ticker": "SESN",
              "Company": "Sesen Bio"
            },
            {
              "Ticker": "SSC",
              "Company": "Seven Stars Cloud Group"
            },
            {
              "Ticker": "SVBI",
              "Company": "Severn Bancorp Inc"
            },
            {
              "Ticker": "SGBX",
              "Company": "SG Blocks"
            },
            {
              "Ticker": "SGOC",
              "Company": "SGOCO Group"
            },
            {
              "Ticker": "SEII",
              "Company": "Sharing Economy International Inc."
            },
            {
              "Ticker": "SMED",
              "Company": "Sharps Compliance Corp."
            },
            {
              "Ticker": "SHSP",
              "Company": "SharpSpring"
            },
            {
              "Ticker": "SHEN",
              "Company": "Shenandoah Telecommunications Co"
            },
            {
              "Ticker": "PIXY",
              "Company": "ShiftPixy"
            },
            {
              "Ticker": "SHLO",
              "Company": "Shiloh Industries"
            },
            {
              "Ticker": "SCCI",
              "Company": "Shimmick Construction Company"
            },
            {
              "Ticker": "TYHT",
              "Company": "Shineco"
            },
            {
              "Ticker": "SHPG",
              "Company": "Shire plc"
            },
            {
              "Ticker": "SCVL",
              "Company": "Shoe Carnival"
            },
            {
              "Ticker": "SHBI",
              "Company": "Shore Bancshares Inc"
            },
            {
              "Ticker": "SSTI",
              "Company": "ShotSpotter"
            },
            {
              "Ticker": "SFLY",
              "Company": "Shutterfly"
            },
            {
              "Ticker": "SIFI",
              "Company": "SI Financial Group"
            },
            {
              "Ticker": "SIEB",
              "Company": "Siebert Financial Corp."
            },
            {
              "Ticker": "SNNA",
              "Company": "Sienna Biopharmaceuticals"
            },
            {
              "Ticker": "SIEN",
              "Company": "Sientra"
            },
            {
              "Ticker": "BSRR",
              "Company": "Sierra Bancorp"
            },
            {
              "Ticker": "SRRA",
              "Company": "Sierra Oncology"
            },
            {
              "Ticker": "SWIR",
              "Company": "Sierra Wireless"
            },
            {
              "Ticker": "SIFY",
              "Company": "Sify Technologies Limited"
            },
            {
              "Ticker": "SIGA",
              "Company": "SIGA Technologies Inc."
            },
            {
              "Ticker": "SGLB",
              "Company": "Sigma Labs"
            },
            {
              "Ticker": "SGLBW",
              "Company": "Sigma Labs"
            },
            {
              "Ticker": "SGMA",
              "Company": "SigmaTron International"
            },
            {
              "Ticker": "SBNY",
              "Company": "Signature Bank"
            },
            {
              "Ticker": "SBNYW",
              "Company": "Signature Bank"
            },
            {
              "Ticker": "SLGN",
              "Company": "Silgan Holdings Inc."
            },
            {
              "Ticker": "SILC",
              "Company": "Silicom Ltd"
            },
            {
              "Ticker": "SLAB",
              "Company": "Silicon Laboratories"
            },
            {
              "Ticker": "SIMO",
              "Company": "Silicon Motion Technology Corporation"
            },
            {
              "Ticker": "SAMG",
              "Company": "Silvercrest Asset Management Group Inc."
            },
            {
              "Ticker": "SSNT",
              "Company": "SilverSun Technologies"
            },
            {
              "Ticker": "SFNC",
              "Company": "Simmons First National Corporation"
            },
            {
              "Ticker": "SLP",
              "Company": "Simulations Plus"
            },
            {
              "Ticker": "SINA",
              "Company": "Sina Corporation"
            },
            {
              "Ticker": "SBGI",
              "Company": "Sinclair Broadcast Group"
            },
            {
              "Ticker": "SINO",
              "Company": "Sino-Global Shipping America"
            },
            {
              "Ticker": "SVA",
              "Company": "Sinovac Biotech"
            },
            {
              "Ticker": "SIRI",
              "Company": "Sirius XM Holdings Inc."
            },
            {
              "Ticker": "SRVA",
              "Company": "SIRVA"
            },
            {
              "Ticker": "SITO",
              "Company": "SITO Mobile"
            },
            {
              "Ticker": "SKYS",
              "Company": "Sky Solar Holdings"
            },
            {
              "Ticker": "SKYW",
              "Company": "SkyWest"
            },
            {
              "Ticker": "SWKS",
              "Company": "Skyworks Solutions"
            },
            {
              "Ticker": "SNBR",
              "Company": "Sleep Number Corporation"
            },
            {
              "Ticker": "SLM",
              "Company": "SLM Corporation"
            },
            {
              "Ticker": "SLMBP",
              "Company": "SLM Corporation"
            },
            {
              "Ticker": "SGH",
              "Company": "SMART Global Holdings"
            },
            {
              "Ticker": "SND",
              "Company": "Smart Sand"
            },
            {
              "Ticker": "SMBK",
              "Company": "SmartFinancial"
            },
            {
              "Ticker": "SMSI",
              "Company": "Smith Micro Software"
            },
            {
              "Ticker": "SMTX",
              "Company": "SMTC Corporation"
            },
            {
              "Ticker": "SRAX",
              "Company": "Social Reality"
            },
            {
              "Ticker": "SCKT",
              "Company": "Socket Mobile"
            },
            {
              "Ticker": "SODA",
              "Company": "SodaStream International Ltd."
            },
            {
              "Ticker": "SOHU",
              "Company": "Sohu.com Limited"
            },
            {
              "Ticker": "SLRC",
              "Company": "Solar Capital Ltd."
            },
            {
              "Ticker": "SUNS",
              "Company": "Solar Senior Capital Ltd."
            },
            {
              "Ticker": "SEDG",
              "Company": "SolarEdge Technologies"
            },
            {
              "Ticker": "SLNO",
              "Company": "Soleno Therapeutics"
            },
            {
              "Ticker": "SLNOW",
              "Company": "Soleno Therapeutics"
            },
            {
              "Ticker": "SLGL",
              "Company": "Sol-Gel Technologies Ltd."
            },
            {
              "Ticker": "SLDB",
              "Company": "Solid Biosciences Inc."
            },
            {
              "Ticker": "SNGX",
              "Company": "Soligenix"
            },
            {
              "Ticker": "SNGXW",
              "Company": "Soligenix"
            },
            {
              "Ticker": "SONC",
              "Company": "Sonic Corp."
            },
            {
              "Ticker": "SOFO",
              "Company": "Sonic Foundry"
            },
            {
              "Ticker": "SNOA",
              "Company": "Sonoma Pharmaceuticals"
            },
            {
              "Ticker": "SNOAW",
              "Company": "Sonoma Pharmaceuticals"
            },
            {
              "Ticker": "SONO",
              "Company": "Sonos"
            },
            {
              "Ticker": "SPHS",
              "Company": "Sophiris Bio"
            },
            {
              "Ticker": "SORL",
              "Company": "SORL Auto Parts"
            },
            {
              "Ticker": "SRNE",
              "Company": "Sorrento Therapeutics"
            },
            {
              "Ticker": "SOHO",
              "Company": "Sotherly Hotels Inc."
            },
            {
              "Ticker": "SOHOB",
              "Company": "Sotherly Hotels Inc."
            },
            {
              "Ticker": "SOHOO",
              "Company": "Sotherly Hotels Inc."
            },
            {
              "Ticker": "SOHOK",
              "Company": "Sotherly Hotels LP"
            },
            {
              "Ticker": "SFBC",
              "Company": "Sound Financial Bancorp"
            },
            {
              "Ticker": "SSB",
              "Company": "South State Corporation"
            },
            {
              "Ticker": "SFST",
              "Company": "Southern First Bancshares"
            },
            {
              "Ticker": "SMBC",
              "Company": "Southern Missouri Bancorp"
            },
            {
              "Ticker": "SONA",
              "Company": "Southern National Bancorp of Virginia"
            },
            {
              "Ticker": "SBSI",
              "Company": "Southside Bancshares"
            },
            {
              "Ticker": "SP",
              "Company": "SP Plus Corporation"
            },
            {
              "Ticker": "SGRP",
              "Company": "SPAR Group"
            },
            {
              "Ticker": "SPKE",
              "Company": "Spark Energy"
            },
            {
              "Ticker": "SPKEP",
              "Company": "Spark Energy"
            },
            {
              "Ticker": "ONCE",
              "Company": "Spark Therapeutics"
            },
            {
              "Ticker": "SPAR",
              "Company": "Spartan Motors"
            },
            {
              "Ticker": "SPTN",
              "Company": "SpartanNash Company"
            },
            {
              "Ticker": "DWFI",
              "Company": "SPDR Dorsey Wright Fixed Income Allocation ETF"
            },
            {
              "Ticker": "SPPI",
              "Company": "Spectrum Pharmaceuticals"
            },
            {
              "Ticker": "SPRO",
              "Company": "Spero Therapeutics"
            },
            {
              "Ticker": "ANY",
              "Company": "Sphere 3D Corp."
            },
            {
              "Ticker": "SPEX",
              "Company": "Spherix Incorporated"
            },
            {
              "Ticker": "SPI",
              "Company": "SPI Energy Co."
            },
            {
              "Ticker": "SAVE",
              "Company": "Spirit Airlines"
            },
            {
              "Ticker": "STXB",
              "Company": "Spirit of Texas Bancshares"
            },
            {
              "Ticker": "SPLK",
              "Company": "Splunk Inc."
            },
            {
              "Ticker": "SPOK",
              "Company": "Spok Holdings"
            },
            {
              "Ticker": "SPWH",
              "Company": "Sportsman&#39;s Warehouse Holdings"
            },
            {
              "Ticker": "SBPH",
              "Company": "Spring Bank Pharmaceuticals"
            },
            {
              "Ticker": "FUND",
              "Company": "Sprott Focus Trust"
            },
            {
              "Ticker": "SFM",
              "Company": "Sprouts Farmers Market"
            },
            {
              "Ticker": "SPSC",
              "Company": "SPS Commerce"
            },
            {
              "Ticker": "SSNC",
              "Company": "SS&C Technologies Holdings"
            },
            {
              "Ticker": "SSLJ",
              "Company": "SSLJ.com Limited"
            },
            {
              "Ticker": "SSRM",
              "Company": "SSR Mining Inc."
            },
            {
              "Ticker": "STAA",
              "Company": "STAAR Surgical Company"
            },
            {
              "Ticker": "STAF",
              "Company": "Staffing 360 Solutions"
            },
            {
              "Ticker": "STMP",
              "Company": "Stamps.com Inc."
            },
            {
              "Ticker": "STND",
              "Company": "Standard AVB Financial Corp."
            },
            {
              "Ticker": "SBLK",
              "Company": "Star Bulk Carriers Corp."
            },
            {
              "Ticker": "SBLKZ",
              "Company": "Star Bulk Carriers Corp."
            },
            {
              "Ticker": "SBUX",
              "Company": "Starbucks Corporation"
            },
            {
              "Ticker": "STFC",
              "Company": "State Auto Financial Corporation"
            },
            {
              "Ticker": "STBZ",
              "Company": "State Bank Financial Corporation."
            },
            {
              "Ticker": "GASS",
              "Company": "StealthGas"
            },
            {
              "Ticker": "STCN",
              "Company": "Steel Connect"
            },
            {
              "Ticker": "STLD",
              "Company": "Steel Dynamics"
            },
            {
              "Ticker": "SMRT",
              "Company": "Stein Mart"
            },
            {
              "Ticker": "STLR",
              "Company": "Stellar Acquisition III Inc."
            },
            {
              "Ticker": "STLRU",
              "Company": "Stellar Acquisition III Inc."
            },
            {
              "Ticker": "STLRW",
              "Company": "Stellar Acquisition III Inc."
            },
            {
              "Ticker": "SBOT",
              "Company": "Stellar Biotechnologies"
            },
            {
              "Ticker": "STML",
              "Company": "Stemline Therapeutics"
            },
            {
              "Ticker": "SRCL",
              "Company": "Stericycle"
            },
            {
              "Ticker": "SBT",
              "Company": "Sterling Bancorp"
            },
            {
              "Ticker": "STRL",
              "Company": "Sterling Construction Company Inc"
            },
            {
              "Ticker": "SHOO",
              "Company": "Steven Madden"
            },
            {
              "Ticker": "SSFN",
              "Company": "Stewardship Financial Corp"
            },
            {
              "Ticker": "SFIX",
              "Company": "Stitch Fix"
            },
            {
              "Ticker": "SYBT",
              "Company": "Stock Yards Bancorp"
            },
            {
              "Ticker": "BANX",
              "Company": "StoneCastle Financial Corp"
            },
            {
              "Ticker": "SSKN",
              "Company": "Strata Skin Sciences"
            },
            {
              "Ticker": "SSYS",
              "Company": "Stratasys"
            },
            {
              "Ticker": "STRA",
              "Company": "Strategic Education"
            },
            {
              "Ticker": "HNDL",
              "Company": "Strategy Shares Nasdaq 7HANDL Index ETF"
            },
            {
              "Ticker": "STRT",
              "Company": "Strattec Security Corporation"
            },
            {
              "Ticker": "STRS",
              "Company": "Stratus Properties Inc."
            },
            {
              "Ticker": "STRM",
              "Company": "Streamline Health Solutions"
            },
            {
              "Ticker": "SBBP",
              "Company": "Strongbridge Biopharma plc"
            },
            {
              "Ticker": "SUMR",
              "Company": "Summer Infant"
            },
            {
              "Ticker": "SMMF",
              "Company": "Summit Financial Group"
            },
            {
              "Ticker": "SSBI",
              "Company": "Summit State Bank"
            },
            {
              "Ticker": "SMMT",
              "Company": "Summit Therapeutics plc"
            },
            {
              "Ticker": "WISA",
              "Company": "Summit Wireless Technologies"
            },
            {
              "Ticker": "SNHY",
              "Company": "Sun Hydraulics Corporation"
            },
            {
              "Ticker": "SNDE",
              "Company": "Sundance Energy Australia Limited"
            },
            {
              "Ticker": "SNSS",
              "Company": "Sunesis Pharmaceuticals"
            },
            {
              "Ticker": "STKL",
              "Company": "SunOpta"
            },
            {
              "Ticker": "SPWR",
              "Company": "SunPower Corporation"
            },
            {
              "Ticker": "RUN",
              "Company": "Sunrun Inc."
            },
            {
              "Ticker": "SUNW",
              "Company": "Sunworks"
            },
            {
              "Ticker": "SPCB",
              "Company": "SuperCom"
            },
            {
              "Ticker": "SCON",
              "Company": "Superconductor Technologies Inc."
            },
            {
              "Ticker": "SGC",
              "Company": "Superior Group of Companies"
            },
            {
              "Ticker": "SUPN",
              "Company": "Supernus Pharmaceuticals"
            },
            {
              "Ticker": "SPRT",
              "Company": "support.com"
            },
            {
              "Ticker": "SURF",
              "Company": "Surface Oncology"
            },
            {
              "Ticker": "SGRY",
              "Company": "Surgery Partners"
            },
            {
              "Ticker": "SRDX",
              "Company": "Surmodics"
            },
            {
              "Ticker": "STRO",
              "Company": "Sutro Biopharma"
            },
            {
              "Ticker": "SIVB",
              "Company": "SVB Financial Group"
            },
            {
              "Ticker": "SVMK",
              "Company": "SVMK Inc."
            },
            {
              "Ticker": "SYKE",
              "Company": "Sykes Enterprises"
            },
            {
              "Ticker": "SYMC",
              "Company": "Symantec Corporation"
            },
            {
              "Ticker": "SYNC",
              "Company": "Synacor"
            },
            {
              "Ticker": "SYNL",
              "Company": "Synalloy Corporation"
            },
            {
              "Ticker": "SYNA",
              "Company": "Synaptics Incorporated"
            },
            {
              "Ticker": "SNCR",
              "Company": "Synchronoss Technologies"
            },
            {
              "Ticker": "SNDX",
              "Company": "Syndax Pharmaceuticals"
            },
            {
              "Ticker": "SYNH",
              "Company": "Syneos Health"
            },
            {
              "Ticker": "SGYP",
              "Company": "Synergy Pharmaceuticals"
            },
            {
              "Ticker": "SYBX",
              "Company": "Synlogic"
            },
            {
              "Ticker": "SNPS",
              "Company": "Synopsys"
            },
            {
              "Ticker": "SES",
              "Company": "Synthesis Energy Systems"
            },
            {
              "Ticker": "SYPR",
              "Company": "Sypris Solutions"
            },
            {
              "Ticker": "SYRS",
              "Company": "Syros Pharmaceuticals"
            },
            {
              "Ticker": "TROW",
              "Company": "T. Rowe Price Group"
            },
            {
              "Ticker": "TTOO",
              "Company": "T2 Biosystems"
            },
            {
              "Ticker": "TRHC",
              "Company": "Tabula Rasa HealthCare"
            },
            {
              "Ticker": "TCMD",
              "Company": "Tactile Systems Technology"
            },
            {
              "Ticker": "TAIT",
              "Company": "Taitron Components Incorporated"
            },
            {
              "Ticker": "TLC",
              "Company": "Taiwan Liposome Company"
            },
            {
              "Ticker": "TTWO",
              "Company": "Take-Two Interactive Software"
            },
            {
              "Ticker": "TLND",
              "Company": "Talend S.A."
            },
            {
              "Ticker": "TNDM",
              "Company": "Tandem Diabetes Care"
            },
            {
              "Ticker": "TLF",
              "Company": "Tandy Leather Factory"
            },
            {
              "Ticker": "TANH",
              "Company": "Tantech Holdings Ltd."
            },
            {
              "Ticker": "TAOP",
              "Company": "Taoping Inc."
            },
            {
              "Ticker": "TPIV",
              "Company": "TapImmune Inc."
            },
            {
              "Ticker": "TEDU",
              "Company": "Tarena International"
            },
            {
              "Ticker": "TATT",
              "Company": "TAT Technologies Ltd."
            },
            {
              "Ticker": "TAYD",
              "Company": "Taylor Devices"
            },
            {
              "Ticker": "CGBD",
              "Company": "TCG BDC"
            },
            {
              "Ticker": "AMTD",
              "Company": "TD Ameritrade Holding Corporation"
            },
            {
              "Ticker": "PETZ",
              "Company": "TDH Holdings"
            },
            {
              "Ticker": "TECD",
              "Company": "Tech Data Corporation"
            },
            {
              "Ticker": "TCCO",
              "Company": "Technical Communications Corporation"
            },
            {
              "Ticker": "TTGT",
              "Company": "TechTarget"
            },
            {
              "Ticker": "TGLS",
              "Company": "Tecnoglass Inc."
            },
            {
              "Ticker": "TGEN",
              "Company": "Tecogen Inc."
            },
            {
              "Ticker": "TNAV",
              "Company": "Telenav"
            },
            {
              "Ticker": "TLGT",
              "Company": "Teligent"
            },
            {
              "Ticker": "TELL",
              "Company": "Tellurian Inc."
            },
            {
              "Ticker": "TENB",
              "Company": "Tenable Holdings"
            },
            {
              "Ticker": "TENX",
              "Company": "Tenax Therapeutics"
            },
            {
              "Ticker": "TZACU",
              "Company": "Tenzing Acquisition Corp."
            },
            {
              "Ticker": "TERP",
              "Company": "TerraForm Power"
            },
            {
              "Ticker": "TRTL",
              "Company": "Terrapin 4 Acquisition Corporation"
            },
            {
              "Ticker": "TBNK",
              "Company": "Territorial Bancorp Inc."
            },
            {
              "Ticker": "TSRO",
              "Company": "TESARO"
            },
            {
              "Ticker": "TSLA",
              "Company": "Tesla"
            },
            {
              "Ticker": "TESS",
              "Company": "TESSCO Technologies Incorporated"
            },
            {
              "Ticker": "TTEK",
              "Company": "Tetra Tech"
            },
            {
              "Ticker": "TTPH",
              "Company": "Tetraphase Pharmaceuticals"
            },
            {
              "Ticker": "TCBI",
              "Company": "Texas Capital Bancshares"
            },
            {
              "Ticker": "TCBIL",
              "Company": "Texas Capital Bancshares"
            },
            {
              "Ticker": "TCBIP",
              "Company": "Texas Capital Bancshares"
            },
            {
              "Ticker": "TCBIW",
              "Company": "Texas Capital Bancshares"
            },
            {
              "Ticker": "TXN",
              "Company": "Texas Instruments Incorporated"
            },
            {
              "Ticker": "TXRH",
              "Company": "Texas Roadhouse"
            },
            {
              "Ticker": "TFIG",
              "Company": "TFI TAB Gida Yatirimlari A.S."
            },
            {
              "Ticker": "TFSL",
              "Company": "TFS Financial Corporation"
            },
            {
              "Ticker": "TGTX",
              "Company": "TG Therapeutics"
            },
            {
              "Ticker": "ANDE",
              "Company": "The Andersons"
            },
            {
              "Ticker": "TBBK",
              "Company": "The Bancorp"
            },
            {
              "Ticker": "BPRN",
              "Company": "The Bank of Princeton"
            },
            {
              "Ticker": "CG",
              "Company": "The Carlyle Group L.P."
            },
            {
              "Ticker": "TCGP",
              "Company": "The Carlyle Group L.P."
            },
            {
              "Ticker": "CAKE",
              "Company": "The Cheesecake Factory Incorporated"
            },
            {
              "Ticker": "CHEF",
              "Company": "The Chefs&#39; Warehouse"
            },
            {
              "Ticker": "TCFC",
              "Company": "The Community Financial Corporation"
            },
            {
              "Ticker": "DSGX",
              "Company": "The Descartes Systems Group Inc."
            },
            {
              "Ticker": "DXYN",
              "Company": "The Dixie Group"
            },
            {
              "Ticker": "ENSG",
              "Company": "The Ensign Group"
            },
            {
              "Ticker": "XONE",
              "Company": "The ExOne Company"
            },
            {
              "Ticker": "FBMS",
              "Company": "The First Bancshares"
            },
            {
              "Ticker": "FLIC",
              "Company": "The First of Long Island Corporation"
            },
            {
              "Ticker": "GT",
              "Company": "The Goodyear Tire & Rubber Company"
            },
            {
              "Ticker": "HABT",
              "Company": "The Habit Restaurants"
            },
            {
              "Ticker": "HCKT",
              "Company": "The Hackett Group"
            },
            {
              "Ticker": "HAIN",
              "Company": "The Hain Celestial Group"
            },
            {
              "Ticker": "CUBA",
              "Company": "The Herzfeld Caribbean Basin Fund"
            },
            {
              "Ticker": "INTG",
              "Company": "The Intergroup Corporation"
            },
            {
              "Ticker": "JYNT",
              "Company": "The Joint Corp."
            },
            {
              "Ticker": "KEYW",
              "Company": "The KEYW Holding Corporation"
            },
            {
              "Ticker": "KHC",
              "Company": "The Kraft Heinz Company"
            },
            {
              "Ticker": "OLD",
              "Company": "The Long-Term Care ETF"
            },
            {
              "Ticker": "LOVE",
              "Company": "The Lovesac Company"
            },
            {
              "Ticker": "MSG",
              "Company": "The Madison Square Garden Company"
            },
            {
              "Ticker": "MDCO",
              "Company": "The Medicines Company"
            },
            {
              "Ticker": "MEET",
              "Company": "The Meet Group"
            },
            {
              "Ticker": "MIK",
              "Company": "The Michaels Companies"
            },
            {
              "Ticker": "MIDD",
              "Company": "The Middleby Corporation"
            },
            {
              "Ticker": "NAVG",
              "Company": "The Navigators Group"
            },
            {
              "Ticker": "SLIM",
              "Company": "The Obesity ETF"
            },
            {
              "Ticker": "STKS",
              "Company": "The ONE Group Hospitality"
            },
            {
              "Ticker": "ORG",
              "Company": "The Organics ETF"
            },
            {
              "Ticker": "PRSC",
              "Company": "The Providence Service Corporation"
            },
            {
              "Ticker": "RMR",
              "Company": "The RMR Group Inc."
            },
            {
              "Ticker": "SMPL",
              "Company": "The Simply Good Foods Company"
            },
            {
              "Ticker": "SMPLW",
              "Company": "The Simply Good Foods Company"
            },
            {
              "Ticker": "TSG",
              "Company": "The Stars Group Inc."
            },
            {
              "Ticker": "TTD",
              "Company": "The Trade Desk"
            },
            {
              "Ticker": "ULTI",
              "Company": "The Ultimate Software Group"
            },
            {
              "Ticker": "YORW",
              "Company": "The York Water Company"
            },
            {
              "Ticker": "NCTY",
              "Company": "The9 Limited"
            },
            {
              "Ticker": "TXMD",
              "Company": "TherapeuticsMD"
            },
            {
              "Ticker": "TRPX",
              "Company": "Therapix Biosciences Ltd."
            },
            {
              "Ticker": "TBPH",
              "Company": "Theravance Biopharma"
            },
            {
              "Ticker": "TST",
              "Company": "TheStreet"
            },
            {
              "Ticker": "TCRD",
              "Company": "THL Credit"
            },
            {
              "Ticker": "TBRG",
              "Company": "Thunder Bridge Acquisition"
            },
            {
              "Ticker": "TBRGU",
              "Company": "Thunder Bridge Acquisition"
            },
            {
              "Ticker": "TBRGW",
              "Company": "Thunder Bridge Acquisition"
            },
            {
              "Ticker": "TIBR",
              "Company": "Tiberius Acquisition Corporation"
            },
            {
              "Ticker": "TIBRU",
              "Company": "Tiberius Acquisition Corporation"
            },
            {
              "Ticker": "TIBRW",
              "Company": "Tiberius Acquisition Corporation"
            },
            {
              "Ticker": "TTS",
              "Company": "Tile Shop Hldgs"
            },
            {
              "Ticker": "TLRY",
              "Company": "Tilray"
            },
            {
              "Ticker": "TSBK",
              "Company": "Timberland Bancorp"
            },
            {
              "Ticker": "TIPT",
              "Company": "Tiptree Inc."
            },
            {
              "Ticker": "TITN",
              "Company": "Titan Machinery Inc."
            },
            {
              "Ticker": "TMDI",
              "Company": "Titan Medical Inc."
            },
            {
              "Ticker": "TTNP",
              "Company": "Titan Pharmaceuticals"
            },
            {
              "Ticker": "TVTY",
              "Company": "Tivity Health"
            },
            {
              "Ticker": "TIVO",
              "Company": "TiVo Corporation"
            },
            {
              "Ticker": "TKKS",
              "Company": "TKK Symphony Acquisition Corporation"
            },
            {
              "Ticker": "TKKSR",
              "Company": "TKK Symphony Acquisition Corporation"
            },
            {
              "Ticker": "TKKSU",
              "Company": "TKK Symphony Acquisition Corporation"
            },
            {
              "Ticker": "TKKSW",
              "Company": "TKK Symphony Acquisition Corporation"
            },
            {
              "Ticker": "TMUS",
              "Company": "T-Mobile US"
            },
            {
              "Ticker": "TMSR",
              "Company": "TMSR Holding Company Limited"
            },
            {
              "Ticker": "TOCA",
              "Company": "Tocagen Inc."
            },
            {
              "Ticker": "TNXP",
              "Company": "Tonix Pharmaceuticals Holding Corp."
            },
            {
              "Ticker": "TISA",
              "Company": "Top Image Systems"
            },
            {
              "Ticker": "TOPS",
              "Company": "TOP Ships Inc."
            },
            {
              "Ticker": "TRCH",
              "Company": "Torchlight Energy Resources"
            },
            {
              "Ticker": "TRMD",
              "Company": "TORM plc"
            },
            {
              "Ticker": "TOTA",
              "Company": "Tottenham Acquisition I Limited"
            },
            {
              "Ticker": "TOTAR",
              "Company": "Tottenham Acquisition I Limited"
            },
            {
              "Ticker": "TOTAU",
              "Company": "Tottenham Acquisition I Limited"
            },
            {
              "Ticker": "TOTAW",
              "Company": "Tottenham Acquisition I Limited"
            },
            {
              "Ticker": "TBLT",
              "Company": "ToughBuilt Industries"
            },
            {
              "Ticker": "TBLTU",
              "Company": "ToughBuilt Industries"
            },
            {
              "Ticker": "TSEM",
              "Company": "Tower Semiconductor Ltd."
            },
            {
              "Ticker": "CLUB",
              "Company": "Town Sports International Holdings"
            },
            {
              "Ticker": "TOWN",
              "Company": "Towne Bank"
            },
            {
              "Ticker": "TPIC",
              "Company": "TPI Composites"
            },
            {
              "Ticker": "TCON",
              "Company": "TRACON Pharmaceuticals"
            },
            {
              "Ticker": "TSCO",
              "Company": "Tractor Supply Company"
            },
            {
              "Ticker": "TWMC",
              "Company": "Trans World Entertainment Corp."
            },
            {
              "Ticker": "TACT",
              "Company": "TransAct Technologies Incorporated"
            },
            {
              "Ticker": "TRNS",
              "Company": "Transcat"
            },
            {
              "Ticker": "TGA",
              "Company": "TransGlobe Energy Corporation"
            },
            {
              "Ticker": "TBIO",
              "Company": "Translate Bio"
            },
            {
              "Ticker": "TA",
              "Company": "TravelCenters of America LLC"
            },
            {
              "Ticker": "TANNI",
              "Company": "TravelCenters of America LLC"
            },
            {
              "Ticker": "TANNL",
              "Company": "TravelCenters of America LLC"
            },
            {
              "Ticker": "TANNZ",
              "Company": "TravelCenters of America LLC"
            },
            {
              "Ticker": "TZOO",
              "Company": "Travelzoo"
            },
            {
              "Ticker": "TRMT",
              "Company": "Tremont Mortgage Trust"
            },
            {
              "Ticker": "TRVN",
              "Company": "Trevena"
            },
            {
              "Ticker": "TPCO",
              "Company": "Tribune Publishing Company"
            },
            {
              "Ticker": "TCDA",
              "Company": "Tricida"
            },
            {
              "Ticker": "TCBK",
              "Company": "TriCo Bancshares"
            },
            {
              "Ticker": "TDAC",
              "Company": "Trident Acquisitions Corp."
            },
            {
              "Ticker": "TDACU",
              "Company": "Trident Acquisitions Corp."
            },
            {
              "Ticker": "TDACW",
              "Company": "Trident Acquisitions Corp."
            },
            {
              "Ticker": "TRIL",
              "Company": "Trillium Therapeutics Inc."
            },
            {
              "Ticker": "TRS",
              "Company": "TriMas Corporation"
            },
            {
              "Ticker": "TRMB",
              "Company": "Trimble Inc."
            },
            {
              "Ticker": "TRIB",
              "Company": "Trinity Biotech plc"
            },
            {
              "Ticker": "TMCX",
              "Company": "Trinity Merger Corp."
            },
            {
              "Ticker": "TMCXU",
              "Company": "Trinity Merger Corp."
            },
            {
              "Ticker": "TMCXW",
              "Company": "Trinity Merger Corp."
            },
            {
              "Ticker": "TRIP",
              "Company": "TripAdvisor"
            },
            {
              "Ticker": "TSC",
              "Company": "TriState Capital Holdings"
            },
            {
              "Ticker": "TSCAP",
              "Company": "TriState Capital Holdings"
            },
            {
              "Ticker": "TBK",
              "Company": "Triumph Bancorp"
            },
            {
              "Ticker": "TRVG",
              "Company": "trivago N.V."
            },
            {
              "Ticker": "TROV",
              "Company": "TrovaGene"
            },
            {
              "Ticker": "TRUE",
              "Company": "TrueCar"
            },
            {
              "Ticker": "THST",
              "Company": "Truett-Hurst"
            },
            {
              "Ticker": "TRUP",
              "Company": "Trupanion"
            },
            {
              "Ticker": "TRST",
              "Company": "TrustCo Bank Corp NY"
            },
            {
              "Ticker": "TRMK",
              "Company": "Trustmark Corporation"
            },
            {
              "Ticker": "TSRI",
              "Company": "TSR"
            },
            {
              "Ticker": "TTEC",
              "Company": "TTEC Holdings"
            },
            {
              "Ticker": "TTMI",
              "Company": "TTM Technologies"
            },
            {
              "Ticker": "TCX",
              "Company": "Tucows Inc."
            },
            {
              "Ticker": "TUES",
              "Company": "Tuesday Morning Corp."
            },
            {
              "Ticker": "TOUR",
              "Company": "Tuniu Corporation"
            },
            {
              "Ticker": "HEAR",
              "Company": "Turtle Beach Corporation"
            },
            {
              "Ticker": "TWLV",
              "Company": "Twelve Seas Investment Company"
            },
            {
              "Ticker": "TWLVR",
              "Company": "Twelve Seas Investment Company"
            },
            {
              "Ticker": "TWLVU",
              "Company": "Twelve Seas Investment Company"
            },
            {
              "Ticker": "TWLVW",
              "Company": "Twelve Seas Investment Company"
            },
            {
              "Ticker": "FOX",
              "Company": "Twenty-First Century Fox"
            },
            {
              "Ticker": "FOXA",
              "Company": "Twenty-First Century Fox"
            },
            {
              "Ticker": "TWIN",
              "Company": "Twin Disc"
            },
            {
              "Ticker": "TRCB",
              "Company": "Two River Bancorp"
            },
            {
              "Ticker": "TYME",
              "Company": "Tyme Technologies"
            },
            {
              "Ticker": "USCR",
              "Company": "U S Concrete"
            },
            {
              "Ticker": "PRTS",
              "Company": "U.S. Auto Parts Network"
            },
            {
              "Ticker": "USEG",
              "Company": "U.S. Energy Corp."
            },
            {
              "Ticker": "GROW",
              "Company": "U.S. Global Investors"
            },
            {
              "Ticker": "USAU",
              "Company": "U.S. Gold Corp."
            },
            {
              "Ticker": "UBNT",
              "Company": "Ubiquiti Networks"
            },
            {
              "Ticker": "UFPT",
              "Company": "UFP Technologies"
            },
            {
              "Ticker": "ULTA",
              "Company": "Ulta Beauty"
            },
            {
              "Ticker": "UCTT",
              "Company": "Ultra Clean Holdings"
            },
            {
              "Ticker": "UPL",
              "Company": "Ultra Petroleum Corp."
            },
            {
              "Ticker": "RARE",
              "Company": "Ultragenyx Pharmaceutical Inc."
            },
            {
              "Ticker": "ULBI",
              "Company": "Ultralife Corporation"
            },
            {
              "Ticker": "UMBF",
              "Company": "UMB Financial Corporation"
            },
            {
              "Ticker": "UMPQ",
              "Company": "Umpqua Holdings Corporation"
            },
            {
              "Ticker": "UNAM",
              "Company": "Unico American Corporation"
            },
            {
              "Ticker": "UBSH",
              "Company": "Union Bankshares Corporation"
            },
            {
              "Ticker": "UNB",
              "Company": "Union Bankshares"
            },
            {
              "Ticker": "QURE",
              "Company": "uniQure N.V."
            },
            {
              "Ticker": "UBCP",
              "Company": "United Bancorp"
            },
            {
              "Ticker": "UBOH",
              "Company": "United Bancshares"
            },
            {
              "Ticker": "UBSI",
              "Company": "United Bankshares"
            },
            {
              "Ticker": "UCBI",
              "Company": "United Community Banks"
            },
            {
              "Ticker": "UCFC",
              "Company": "United Community Financial Corp."
            },
            {
              "Ticker": "UAL",
              "Company": "United Continental Holdings"
            },
            {
              "Ticker": "UBNK",
              "Company": "United Financial Bancorp"
            },
            {
              "Ticker": "UFCS",
              "Company": "United Fire Group"
            },
            {
              "Ticker": "UIHC",
              "Company": "United Insurance Holdings Corp."
            },
            {
              "Ticker": "UNFI",
              "Company": "United Natural Foods"
            },
            {
              "Ticker": "UBFO",
              "Company": "United Security Bancshares"
            },
            {
              "Ticker": "USLM",
              "Company": "United States Lime & Minerals"
            },
            {
              "Ticker": "UTHR",
              "Company": "United Therapeutics Corporation"
            },
            {
              "Ticker": "UG",
              "Company": "United-Guardian"
            },
            {
              "Ticker": "UNIT",
              "Company": "Uniti Group Inc."
            },
            {
              "Ticker": "UNTY",
              "Company": "Unity Bancorp"
            },
            {
              "Ticker": "UBX",
              "Company": "Unity Biotechnology"
            },
            {
              "Ticker": "OLED",
              "Company": "Universal Display Corporation"
            },
            {
              "Ticker": "UEIC",
              "Company": "Universal Electronics Inc."
            },
            {
              "Ticker": "UFPI",
              "Company": "Universal Forest Products"
            },
            {
              "Ticker": "ULH",
              "Company": "Universal Logistics Holdings"
            },
            {
              "Ticker": "USAP",
              "Company": "Universal Stainless & Alloy Products"
            },
            {
              "Ticker": "UVSP",
              "Company": "Univest Corporation of Pennsylvania"
            },
            {
              "Ticker": "UMRX",
              "Company": "Unum Therapeutics Inc."
            },
            {
              "Ticker": "UPLD",
              "Company": "Upland Software"
            },
            {
              "Ticker": "UPWK",
              "Company": "Upwork Inc."
            },
            {
              "Ticker": "UONE",
              "Company": "Urban One"
            },
            {
              "Ticker": "UONEK",
              "Company": "Urban One"
            },
            {
              "Ticker": "URBN",
              "Company": "Urban Outfitters"
            },
            {
              "Ticker": "URGN",
              "Company": "UroGen Pharma Ltd."
            },
            {
              "Ticker": "UROV",
              "Company": "Urovant Sciences Ltd."
            },
            {
              "Ticker": "ECOL",
              "Company": "US Ecology"
            },
            {
              "Ticker": "USAT",
              "Company": "USA Technologies"
            },
            {
              "Ticker": "USATP",
              "Company": "USA Technologies"
            },
            {
              "Ticker": "USAK",
              "Company": "USA Truck"
            },
            {
              "Ticker": "UTMD",
              "Company": "Utah Medical Products"
            },
            {
              "Ticker": "UTSI",
              "Company": "UTStarcom Holdings Corp"
            },
            {
              "Ticker": "UXIN",
              "Company": "Uxin Limited"
            },
            {
              "Ticker": "VCNX",
              "Company": "Vaccinex"
            },
            {
              "Ticker": "VLRX",
              "Company": "Valeritas Holdings"
            },
            {
              "Ticker": "VALX",
              "Company": "Validea Market Legends ETF"
            },
            {
              "Ticker": "VLY",
              "Company": "Valley National Bancorp"
            },
            {
              "Ticker": "VLYPO",
              "Company": "Valley National Bancorp"
            },
            {
              "Ticker": "VLYPP",
              "Company": "Valley National Bancorp"
            },
            {
              "Ticker": "VLYWW",
              "Company": "Valley National Bancorp"
            },
            {
              "Ticker": "VALU",
              "Company": "Value Line"
            },
            {
              "Ticker": "VNDA",
              "Company": "Vanda Pharmaceuticals Inc."
            },
            {
              "Ticker": "BBH",
              "Company": "VanEck Vectors Biotech ETF"
            },
            {
              "Ticker": "GNRX",
              "Company": "VanEck Vectors Generic Drugs ETF"
            },
            {
              "Ticker": "PPH",
              "Company": "VanEck Vectors Pharmaceutical ETF"
            },
            {
              "Ticker": "VWOB",
              "Company": "Vanguard Emerging Markets Government Bond ETF"
            },
            {
              "Ticker": "VNQI",
              "Company": "Vanguard Global ex-U.S. Real Estate ETF"
            },
            {
              "Ticker": "VCIT",
              "Company": "Vanguard Intermediate-Term Corporate Bond ETF"
            },
            {
              "Ticker": "VGIT",
              "Company": "Vanguard Intermediate-Term Treasury ETF"
            },
            {
              "Ticker": "VIGI",
              "Company": "Vanguard International Dividend Appreciation ETF"
            },
            {
              "Ticker": "VYMI",
              "Company": "Vanguard International High Dividend Yield ETF"
            },
            {
              "Ticker": "VCLT",
              "Company": "Vanguard Long-Term Corporate Bond ETF"
            },
            {
              "Ticker": "VGLT",
              "Company": "Vanguard Long-Treasury ETF"
            },
            {
              "Ticker": "VMBS",
              "Company": "Vanguard Mortgage-Backed Securities ETF"
            },
            {
              "Ticker": "VONE",
              "Company": "Vanguard Russell 1000 ETF"
            },
            {
              "Ticker": "VONG",
              "Company": "Vanguard Russell 1000 Growth ETF"
            },
            {
              "Ticker": "VONV",
              "Company": "Vanguard Russell 1000 Value ETF"
            },
            {
              "Ticker": "VTWO",
              "Company": "Vanguard Russell 2000 ETF"
            },
            {
              "Ticker": "VTWG",
              "Company": "Vanguard Russell 2000 Growth ETF"
            },
            {
              "Ticker": "VTWV",
              "Company": "Vanguard Russell 2000 Value ETF"
            },
            {
              "Ticker": "VTHR",
              "Company": "Vanguard Russell 3000 ETF"
            },
            {
              "Ticker": "VCSH",
              "Company": "Vanguard Short-Term Corporate Bond ETF"
            },
            {
              "Ticker": "VTIP",
              "Company": "Vanguard Short-Term Inflation-Protected Securities Index Fund"
            },
            {
              "Ticker": "VGSH",
              "Company": "Vanguard Short-Term Treasury ETF"
            },
            {
              "Ticker": "BND",
              "Company": "Vanguard Total Bond Market ETF"
            },
            {
              "Ticker": "VTC",
              "Company": "Vanguard Total Corporate Bond ETF"
            },
            {
              "Ticker": "BNDX",
              "Company": "Vanguard Total International Bond ETF"
            },
            {
              "Ticker": "VXUS",
              "Company": "Vanguard Total International Stock ETF"
            },
            {
              "Ticker": "BNDW",
              "Company": "Vanguard Total World Bond ETF"
            },
            {
              "Ticker": "VEAC",
              "Company": "Vantage Energy Acquisition Corp."
            },
            {
              "Ticker": "VEACU",
              "Company": "Vantage Energy Acquisition Corp."
            },
            {
              "Ticker": "VEACW",
              "Company": "Vantage Energy Acquisition Corp."
            },
            {
              "Ticker": "VREX",
              "Company": "Varex Imaging Corporation"
            },
            {
              "Ticker": "VRNS",
              "Company": "Varonis Systems"
            },
            {
              "Ticker": "VBLT",
              "Company": "Vascular Biogenics Ltd."
            },
            {
              "Ticker": "VXRT",
              "Company": "Vaxart"
            },
            {
              "Ticker": "VBIV",
              "Company": "VBI Vaccines"
            },
            {
              "Ticker": "VTIQ",
              "Company": "VectoIQ Acquisition Corp."
            },
            {
              "Ticker": "VTIQU",
              "Company": "VectoIQ Acquisition Corp."
            },
            {
              "Ticker": "VTIQW",
              "Company": "VectoIQ Acquisition Corp."
            },
            {
              "Ticker": "VECO",
              "Company": "Veeco Instruments Inc."
            },
            {
              "Ticker": "VEON",
              "Company": "VEON Ltd."
            },
            {
              "Ticker": "VRA",
              "Company": "Vera Bradley"
            },
            {
              "Ticker": "VCYT",
              "Company": "Veracyte"
            },
            {
              "Ticker": "VSTM",
              "Company": "Verastem"
            },
            {
              "Ticker": "VCEL",
              "Company": "Vericel Corporation"
            },
            {
              "Ticker": "VRNT",
              "Company": "Verint Systems Inc."
            },
            {
              "Ticker": "VRSN",
              "Company": "VeriSign"
            },
            {
              "Ticker": "VRSK",
              "Company": "Verisk Analytics"
            },
            {
              "Ticker": "VBTX",
              "Company": "Veritex Holdings"
            },
            {
              "Ticker": "VERI",
              "Company": "Veritone"
            },
            {
              "Ticker": "VRML",
              "Company": "Vermillion"
            },
            {
              "Ticker": "VRNA",
              "Company": "Verona Pharma plc"
            },
            {
              "Ticker": "VRCA",
              "Company": "Verrica Pharmaceuticals Inc."
            },
            {
              "Ticker": "VSAR",
              "Company": "Versartis"
            },
            {
              "Ticker": "VTNR",
              "Company": "Vertex Energy"
            },
            {
              "Ticker": "VRTX",
              "Company": "Vertex Pharmaceuticals Incorporated"
            },
            {
              "Ticker": "VERU",
              "Company": "Veru Inc."
            },
            {
              "Ticker": "VIA",
              "Company": "Viacom Inc."
            },
            {
              "Ticker": "VIAB",
              "Company": "Viacom Inc."
            },
            {
              "Ticker": "VMET",
              "Company": "Viamet Pharmaceuticals Corp."
            },
            {
              "Ticker": "VSAT",
              "Company": "ViaSat"
            },
            {
              "Ticker": "VIAV",
              "Company": "Viavi Solutions Inc."
            },
            {
              "Ticker": "VICL",
              "Company": "Vical Incorporated"
            },
            {
              "Ticker": "VICR",
              "Company": "Vicor Corporation"
            },
            {
              "Ticker": "VCTR",
              "Company": "Victory Capital Holdings"
            },
            {
              "Ticker": "CIZ",
              "Company": "VictoryShares Developed Enhanced Volatility Wtd ETF"
            },
            {
              "Ticker": "VSDA",
              "Company": "VictoryShares Dividend Accelerator ETF"
            },
            {
              "Ticker": "CEY",
              "Company": "VictoryShares Emerging Market High Div Volatility Wtd ETF"
            },
            {
              "Ticker": "CEZ",
              "Company": "VictoryShares Emerging Market Volatility Wtd ETF"
            },
            {
              "Ticker": "CID",
              "Company": "VictoryShares International High Div Volatility Wtd ETF"
            },
            {
              "Ticker": "CIL",
              "Company": "VictoryShares International Volatility Wtd ETF"
            },
            {
              "Ticker": "CFO",
              "Company": "VictoryShares US 500 Enhanced Volatility Wtd ETF"
            },
            {
              "Ticker": "CFA",
              "Company": "VictoryShares US 500 Volatility Wtd ETF"
            },
            {
              "Ticker": "CSF",
              "Company": "VictoryShares US Discovery Enhanced Volatility Wtd ETF"
            },
            {
              "Ticker": "CDC",
              "Company": "VictoryShares US EQ Income Enhanced Volatility Wtd ETF"
            },
            {
              "Ticker": "CDL",
              "Company": "VictoryShares US Large Cap High Div Volatility Wtd ETF"
            },
            {
              "Ticker": "VSMV",
              "Company": "VictoryShares US Multi-Factor Minimum Volatility ETF"
            },
            {
              "Ticker": "CSB",
              "Company": "VictoryShares US Small Cap High Div Volatility Wtd ETF"
            },
            {
              "Ticker": "CSA",
              "Company": "VictoryShares US Small Cap Volatility Wtd ETF"
            },
            {
              "Ticker": "VRAY",
              "Company": "ViewRay"
            },
            {
              "Ticker": "VKTX",
              "Company": "Viking Therapeutics"
            },
            {
              "Ticker": "VKTXW",
              "Company": "Viking Therapeutics"
            },
            {
              "Ticker": "VBFC",
              "Company": "Village Bank and Trust Financial Corp."
            },
            {
              "Ticker": "VLGEA",
              "Company": "Village Super Market"
            },
            {
              "Ticker": "VIOT",
              "Company": "Viomi Technology Co."
            },
            {
              "Ticker": "VNOM",
              "Company": "Viper Energy Partners LP"
            },
            {
              "Ticker": "VIRC",
              "Company": "Virco Manufacturing Corporation"
            },
            {
              "Ticker": "VTSI",
              "Company": "VirTra"
            },
            {
              "Ticker": "VIRT",
              "Company": "Virtu Financial"
            },
            {
              "Ticker": "VRTS",
              "Company": "Virtus Investment Partners"
            },
            {
              "Ticker": "VRTSP",
              "Company": "Virtus Investment Partners"
            },
            {
              "Ticker": "BBC",
              "Company": "Virtus LifeSci Biotech Clinical Trials ETF"
            },
            {
              "Ticker": "BBP",
              "Company": "Virtus LifeSci Biotech Products ETF"
            },
            {
              "Ticker": "VRTU",
              "Company": "Virtusa Corporation"
            },
            {
              "Ticker": "VTGN",
              "Company": "VistaGen Therapeutics"
            },
            {
              "Ticker": "VC",
              "Company": "Visteon Corporation"
            },
            {
              "Ticker": "VIST",
              "Company": "Visterra"
            },
            {
              "Ticker": "VTL",
              "Company": "Vital Therapies"
            },
            {
              "Ticker": "VIVE",
              "Company": "Viveve Medical"
            },
            {
              "Ticker": "VVPR",
              "Company": "VivoPower International PLC"
            },
            {
              "Ticker": "VVUS",
              "Company": "VIVUS"
            },
            {
              "Ticker": "VOD",
              "Company": "Vodafone Group Plc"
            },
            {
              "Ticker": "VOXX",
              "Company": "VOXX International Corporation"
            },
            {
              "Ticker": "VYGR",
              "Company": "Voyager Therapeutics"
            },
            {
              "Ticker": "VSEC",
              "Company": "VSE Corporation"
            },
            {
              "Ticker": "VTVT",
              "Company": "vTv Therapeutics Inc."
            },
            {
              "Ticker": "VUZI",
              "Company": "Vuzix Corporation"
            },
            {
              "Ticker": "WBA",
              "Company": "Walgreens Boots Alliance"
            },
            {
              "Ticker": "WAFD",
              "Company": "Washington Federal"
            },
            {
              "Ticker": "WAFDW",
              "Company": "Washington Federal"
            },
            {
              "Ticker": "WASH",
              "Company": "Washington Trust Bancorp"
            },
            {
              "Ticker": "WSBF",
              "Company": "Waterstone Financial"
            },
            {
              "Ticker": "WVE",
              "Company": "WAVE Life Sciences Ltd."
            },
            {
              "Ticker": "WNFM",
              "Company": "Wayne Farms"
            },
            {
              "Ticker": "WSTG",
              "Company": "Wayside Technology Group"
            },
            {
              "Ticker": "WCFB",
              "Company": "WCF Bancorp"
            },
            {
              "Ticker": "WDFC",
              "Company": "WD-40 Company"
            },
            {
              "Ticker": "WB",
              "Company": "Weibo Corporation"
            },
            {
              "Ticker": "WEBK",
              "Company": "Wellesley Bancorp"
            },
            {
              "Ticker": "WEN",
              "Company": "Wendy&#39;s Company (The)"
            },
            {
              "Ticker": "WERN",
              "Company": "Werner Enterprises"
            },
            {
              "Ticker": "WSBC",
              "Company": "WesBanco"
            },
            {
              "Ticker": "WTBA",
              "Company": "West Bancorporation"
            },
            {
              "Ticker": "WABC",
              "Company": "Westamerica Bancorporation"
            },
            {
              "Ticker": "WSTL",
              "Company": "Westell Technologies"
            },
            {
              "Ticker": "WBND",
              "Company": "Western Asset Total Return ETF"
            },
            {
              "Ticker": "WDC",
              "Company": "Western Digital Corporation"
            },
            {
              "Ticker": "WNEB",
              "Company": "Western New England Bancorp"
            },
            {
              "Ticker": "WPRT",
              "Company": "Westport Fuel Systems Inc"
            },
            {
              "Ticker": "WWR",
              "Company": "Westwater Resources"
            },
            {
              "Ticker": "WEYS",
              "Company": "Weyco Group"
            },
            {
              "Ticker": "WHLR",
              "Company": "Wheeler Real Estate Investment Trust"
            },
            {
              "Ticker": "WHLRD",
              "Company": "Wheeler Real Estate Investment Trust"
            },
            {
              "Ticker": "WHLRP",
              "Company": "Wheeler Real Estate Investment Trust"
            },
            {
              "Ticker": "WHLRW",
              "Company": "Wheeler Real Estate Investment Trust"
            },
            {
              "Ticker": "WHF",
              "Company": "WhiteHorse Finance"
            },
            {
              "Ticker": "WHLM",
              "Company": "Wilhelmina International"
            },
            {
              "Ticker": "WVVI",
              "Company": "Willamette Valley Vineyards"
            },
            {
              "Ticker": "WVVIP",
              "Company": "Willamette Valley Vineyards"
            },
            {
              "Ticker": "WLDN",
              "Company": "Willdan Group"
            },
            {
              "Ticker": "WLFC",
              "Company": "Willis Lease Finance Corporation"
            },
            {
              "Ticker": "WLTW",
              "Company": "Willis Towers Watson Public Limited Company"
            },
            {
              "Ticker": "WSC",
              "Company": "WillScot Corporation"
            },
            {
              "Ticker": "WIN",
              "Company": "Windstream Holdings"
            },
            {
              "Ticker": "WING",
              "Company": "Wingstop Inc."
            },
            {
              "Ticker": "WINA",
              "Company": "Winmark Corporation"
            },
            {
              "Ticker": "WINS",
              "Company": "Wins Finance Holdings Inc."
            },
            {
              "Ticker": "WTFC",
              "Company": "Wintrust Financial Corporation"
            },
            {
              "Ticker": "WTFCM",
              "Company": "Wintrust Financial Corporation"
            },
            {
              "Ticker": "WTFCW",
              "Company": "Wintrust Financial Corporation"
            },
            {
              "Ticker": "AGND",
              "Company": "WisdomTree Barclays Negative Duration U.S. Aggregate Bond Fund"
            },
            {
              "Ticker": "CXSE",
              "Company": "WisdomTree China ex-State-Owned Enterprises Fund"
            },
            {
              "Ticker": "EMCG",
              "Company": "WisdomTree Emerging Markets Consumer Growth Fund"
            },
            {
              "Ticker": "EMCB",
              "Company": "WisdomTree Emerging Markets Corporate Bond Fund"
            },
            {
              "Ticker": "DGRE",
              "Company": "WisdomTree Emerging Markets Quality Dividend Growth Fund"
            },
            {
              "Ticker": "DXGE",
              "Company": "WisdomTree Germany Hedged Equity Fund"
            },
            {
              "Ticker": "HYZD",
              "Company": "WisdomTree Interest Rate Hedged High Yield Bond Fund"
            },
            {
              "Ticker": "AGZD",
              "Company": "WisdomTree Interest Rate Hedged U.S. Aggregate Bond Fund"
            },
            {
              "Ticker": "WETF",
              "Company": "WisdomTree Investments"
            },
            {
              "Ticker": "DXJS",
              "Company": "WisdomTree Japan Hedged SmallCap Equity Fund"
            },
            {
              "Ticker": "GULF",
              "Company": "WisdomTree Middle East Dividend Fund"
            },
            {
              "Ticker": "HYND",
              "Company": "WisdomTree Negative Duration High Yield Bond Fund"
            },
            {
              "Ticker": "DGRW",
              "Company": "WisdomTree U.S. Quality Dividend Growth Fund"
            },
            {
              "Ticker": "DGRS",
              "Company": "WisdomTree U.S. SmallCap Quality Dividend Growth Fund"
            },
            {
              "Ticker": "WIX",
              "Company": "Wix.com Ltd."
            },
            {
              "Ticker": "WWD",
              "Company": "Woodward"
            },
            {
              "Ticker": "WDAY",
              "Company": "Workday"
            },
            {
              "Ticker": "WKHS",
              "Company": "Workhorse Group"
            },
            {
              "Ticker": "WRLD",
              "Company": "World Acceptance Corporation"
            },
            {
              "Ticker": "WMGI",
              "Company": "Wright Medical Group N.V."
            },
            {
              "Ticker": "WMGIZ",
              "Company": "Wright Medical Group N.V."
            },
            {
              "Ticker": "WSFS",
              "Company": "WSFS Financial Corporation"
            },
            {
              "Ticker": "WSCI",
              "Company": "WSI Industries Inc."
            },
            {
              "Ticker": "WVFC",
              "Company": "WVS Financial Corp."
            },
            {
              "Ticker": "WYNN",
              "Company": "Wynn Resorts"
            },
            {
              "Ticker": "XBIT",
              "Company": "XBiotech Inc."
            },
            {
              "Ticker": "XELB",
              "Company": "Xcel Brands"
            },
            {
              "Ticker": "XEL",
              "Company": "Xcel Energy Inc."
            },
            {
              "Ticker": "XNCR",
              "Company": "Xencor"
            },
            {
              "Ticker": "XBIO",
              "Company": "Xenetic Biosciences"
            },
            {
              "Ticker": "XENE",
              "Company": "Xenon Pharmaceuticals Inc."
            },
            {
              "Ticker": "XERS",
              "Company": "Xeris Pharmaceuticals"
            },
            {
              "Ticker": "XGTI",
              "Company": "XG Technology"
            },
            {
              "Ticker": "XLNX",
              "Company": "Xilinx"
            },
            {
              "Ticker": "XOMA",
              "Company": "XOMA Corporation"
            },
            {
              "Ticker": "XPER",
              "Company": "Xperi Corporation"
            },
            {
              "Ticker": "XSPA",
              "Company": "XpresSpa Group"
            },
            {
              "Ticker": "XTLB",
              "Company": "XTL Biopharmaceuticals Ltd."
            },
            {
              "Ticker": "XNET",
              "Company": "Xunlei Limited"
            },
            {
              "Ticker": "YNDX",
              "Company": "Yandex N.V."
            },
            {
              "Ticker": "YRIV",
              "Company": "Yangtze River Port and Logistics Limited"
            },
            {
              "Ticker": "YTRA",
              "Company": "Yatra Online"
            },
            {
              "Ticker": "YTEN",
              "Company": "Yield10 Bioscience"
            },
            {
              "Ticker": "YIN",
              "Company": "Yintech Investment Holdings Limited"
            },
            {
              "Ticker": "YMAB",
              "Company": "Y-mAbs Therapeutics"
            },
            {
              "Ticker": "YOGA",
              "Company": "YogaWorks"
            },
            {
              "Ticker": "YGYI",
              "Company": "Youngevity International"
            },
            {
              "Ticker": "YRCW",
              "Company": "YRC Worldwide"
            },
            {
              "Ticker": "YECO",
              "Company": "Yulong Eco-Materials Limited"
            },
            {
              "Ticker": "YY",
              "Company": "YY Inc."
            },
            {
              "Ticker": "ZFGN",
              "Company": "Zafgen"
            },
            {
              "Ticker": "ZAGG",
              "Company": "ZAGG Inc"
            },
            {
              "Ticker": "ZLAB",
              "Company": "Zai Lab Limited"
            },
            {
              "Ticker": "ZEAL",
              "Company": "Zealand Pharma A/S"
            },
            {
              "Ticker": "ZBRA",
              "Company": "Zebra Technologies Corporation"
            },
            {
              "Ticker": "Z",
              "Company": "Zillow Group"
            },
            {
              "Ticker": "ZG",
              "Company": "Zillow Group"
            },
            {
              "Ticker": "ZN",
              "Company": "Zion Oil & Gas Inc"
            },
            {
              "Ticker": "ZNWAA",
              "Company": "Zion Oil & Gas Inc"
            },
            {
              "Ticker": "ZION",
              "Company": "Zions Bancorporation N.A."
            },
            {
              "Ticker": "ZIONW",
              "Company": "Zions Bancorporation N.A."
            },
            {
              "Ticker": "ZIONZ",
              "Company": "Zions Bancorporation N.A."
            },
            {
              "Ticker": "ZIOP",
              "Company": "ZIOPHARM Oncology Inc"
            },
            {
              "Ticker": "ZIXI",
              "Company": "Zix Corporation"
            },
            {
              "Ticker": "ZKIN",
              "Company": "ZK International Group Co."
            },
            {
              "Ticker": "ZGNX",
              "Company": "Zogenix"
            },
            {
              "Ticker": "ZSAN",
              "Company": "Zosano Pharma Corporation"
            },
            {
              "Ticker": "ZS",
              "Company": "Zscaler"
            },
            {
              "Ticker": "ZUMZ",
              "Company": "Zumiez Inc."
            },
            {
              "Ticker": "ZYNE",
              "Company": "Zynerba Pharmaceuticals"
            },
            {
              "Ticker": "ZNGA",
              "Company": "Zynga Inc."
            },{
                "Ticker": "A",
                "Company": "Agilent Technologies"
              },
              {
                "Ticker": "AA",
                "Company": "Alcoa Corp"
              },
              {
                "Ticker": "AAC",
                "Company": "Aac Holdings Inc"
              },
              {
                "Ticker": "AAN",
                "Company": "Aaron's Inc"
              },
              {
                "Ticker": "AAP",
                "Company": "Advance Auto Parts Inc"
              },
              {
                "Ticker": "AAT",
                "Company": "American Assets Trust"
              },
              {
                "Ticker": "AAV",
                "Company": "Advantage Oil & Gas Ltd"
              },
              {
                "Ticker": "AB",
                "Company": "Alliancebernstein Holding LP"
              },
              {
                "Ticker": "ABB",
                "Company": "Abb Ltd"
              },
              {
                "Ticker": "ABBV",
                "Company": "Abbvie Inc"
              },
              {
                "Ticker": "ABC",
                "Company": "Amerisourcebergen Corp"
              },
              {
                "Ticker": "ABEV",
                "Company": "Ambev S.A."
              },
              {
                "Ticker": "ABG",
                "Company": "Asbury Automotive Group Inc"
              },
              {
                "Ticker": "ABM",
                "Company": "ABM Industries Incorporated"
              },
              {
                "Ticker": "ABR",
                "Company": "Arbor Realty Trust"
              },
              {
                "Ticker": "ABR-A",
                "Company": "Arbor Realty Trust Inc"
              },
              {
                "Ticker": "ABR-B",
                "Company": "Arbor Realty Trust Inc"
              },
              {
                "Ticker": "ABR-C",
                "Company": "Arbor Realty Trust"
              },
              {
                "Ticker": "ABT",
                "Company": "Abbott Laboratories"
              },
              {
                "Ticker": "ABX",
                "Company": "Barrick Gold Corp"
              },
              {
                "Ticker": "AC",
                "Company": "Associated Capital Group Inc"
              },
              {
                "Ticker": "ACC",
                "Company": "American Campus Communities Inc"
              },
              {
                "Ticker": "ACCO",
                "Company": "Acco Brands Corp"
              },
              {
                "Ticker": "ACH",
                "Company": "Aluminum Corporation of China Ltd"
              },
              {
                "Ticker": "ACM",
                "Company": "Aecom Technology Corp"
              },
              {
                "Ticker": "ACN",
                "Company": "Accenture Plc"
              },
              {
                "Ticker": "ACP",
                "Company": "Avenue Income Credit Strategies"
              },
              {
                "Ticker": "ACRE",
                "Company": "Ares Commercial Real Estate Cor"
              },
              {
                "Ticker": "ACV",
                "Company": "Allianzgi Diversified Income &"
              },
              {
                "Ticker": "ADC",
                "Company": "Agree Realty Corp"
              },
              {
                "Ticker": "ADM",
                "Company": "Archer Daniels Midland Company"
              },
              {
                "Ticker": "ADNT",
                "Company": "Adient Plc"
              },
              {
                "Ticker": "ADS",
                "Company": "Alliance Data Systems Corp"
              },
              {
                "Ticker": "ADSW",
                "Company": "Advanced Disposal Services Inc"
              },
              {
                "Ticker": "ADT",
                "Company": "ADT Inc"
              },
              {
                "Ticker": "ADX",
                "Company": "Adams Express Company"
              },
              {
                "Ticker": "AEB",
                "Company": "Aegon N.V. Perp Cap Secs Floating Rate [Ne]"
              },
              {
                "Ticker": "AED",
                "Company": "Aegon N.V. Perp Cap Secs [Ne]"
              },
              {
                "Ticker": "AEE",
                "Company": "Ameren Corp"
              },
              {
                "Ticker": "AEG",
                "Company": "Aegon N.V."
              },
              {
                "Ticker": "AEH",
                "Company": "Aegon N.V. Perp Cap Secs"
              },
              {
                "Ticker": "AEL",
                "Company": "American Equity Investment Life"
              },
              {
                "Ticker": "AEM",
                "Company": "Agnico-Eagle Mines Ltd"
              },
              {
                "Ticker": "AEO",
                "Company": "American Eagle Outfitters"
              },
              {
                "Ticker": "AEP",
                "Company": "American Electric Power Company"
              },
              {
                "Ticker": "AER",
                "Company": "Aercap Holdings N.V."
              },
              {
                "Ticker": "AES",
                "Company": "The Aes Corp"
              },
              {
                "Ticker": "AET",
                "Company": "Aetna Inc"
              },
              {
                "Ticker": "AFB",
                "Company": "Alliance National Municipal"
              },
              {
                "Ticker": "AFC",
                "Company": "Allied Capital Corp"
              },
              {
                "Ticker": "AFG",
                "Company": "American Financial Group"
              },
              {
                "Ticker": "AFGE",
                "Company": "American Financial Group Inc"
              },
              {
                "Ticker": "AFGH",
                "Company": "American Financial Group Inc"
              },
              {
                "Ticker": "AFI",
                "Company": "Armstrong Flooring Inc"
              },
              {
                "Ticker": "AFL",
                "Company": "Aflac Incorporated"
              },
              {
                "Ticker": "AFS-A",
                "Company": "Amtrust Financial Services Inc"
              },
              {
                "Ticker": "AFS-B",
                "Company": "Amtrust Financial Services Dep Pfd"
              },
              {
                "Ticker": "AFS-C",
                "Company": "Amtrust Financial Services Series C"
              },
              {
                "Ticker": "AFS-D",
                "Company": "Amtrust Financial Services Dep Pfd"
              },
              {
                "Ticker": "AFS-E",
                "Company": "Amtrust Financial Services Inc Prf"
              },
              {
                "Ticker": "AFS-F",
                "Company": "Amtrust Financial Services Inc"
              },
              {
                "Ticker": "AFSS",
                "Company": "Amtrust Financial Services Inc"
              },
              {
                "Ticker": "AFST",
                "Company": "Amtrust Financial Services Inc"
              },
              {
                "Ticker": "AFT",
                "Company": "Apollo Senior Floating Rate Fund Inc"
              },
              {
                "Ticker": "AG",
                "Company": "First Majestic Silver"
              },
              {
                "Ticker": "AGCO",
                "Company": "Agco Corp"
              },
              {
                "Ticker": "AGD",
                "Company": "Alpine Global Dynamic Dividend Fund"
              },
              {
                "Ticker": "AGI",
                "Company": "Alamos Gold Inc"
              },
              {
                "Ticker": "AGM",
                "Company": "Federal Agricultural Mortgage Corp"
              },
              {
                "Ticker": "AGM-A",
                "Company": "Federal Agricultural Mortgage"
              },
              {
                "Ticker": "AGM-B",
                "Company": "Federal Ag"
              },
              {
                "Ticker": "AGM-C",
                "Company": "Federal Agricultural Mortgage"
              },
              {
                "Ticker": "AGM.A",
                "Company": "Federal Agricultural Mortgage Corp"
              },
              {
                "Ticker": "AGN",
                "Company": "Allergan Plc"
              },
              {
                "Ticker": "AGO",
                "Company": "Assured Guaranty Ltd"
              },
              {
                "Ticker": "AGO-B",
                "Company": "Assured Guaranty Ltd [B]"
              },
              {
                "Ticker": "AGO-E",
                "Company": "Assured Guaranty Ltd [E]"
              },
              {
                "Ticker": "AGO-F",
                "Company": "Assured Guaranty Ltd [F]"
              },
              {
                "Ticker": "AGR",
                "Company": "Avangrid Inc"
              },
              {
                "Ticker": "AGRO",
                "Company": "Adecoagro S.A."
              },
              {
                "Ticker": "AGS",
                "Company": "Playags Inc"
              },
              {
                "Ticker": "AGX",
                "Company": "Argan Inc"
              },
              {
                "Ticker": "AHC",
                "Company": "A.H. Belo Corp"
              },
              {
                "Ticker": "AHH",
                "Company": "Armada Hoffler Properties Inc"
              },
              {
                "Ticker": "AHL",
                "Company": "Aspen Insurance Holdings"
              },
              {
                "Ticker": "AHL-C",
                "Company": "Aspen Ins Pfd Inc"
              },
              {
                "Ticker": "AHL-D",
                "Company": "Aspen Insurance Holdings Ltd"
              },
              {
                "Ticker": "AHT",
                "Company": "Ashford Hospitality Trust Inc"
              },
              {
                "Ticker": "AHT-D",
                "Company": "Ashford Hosp D Pfd"
              },
              {
                "Ticker": "AHT-F",
                "Company": "Ashford Hospitality Trust Inc"
              },
              {
                "Ticker": "AHT-G",
                "Company": "Ashford Hospitality Trust Inc"
              },
              {
                "Ticker": "AHT-H",
                "Company": "Ashford Hospitality Trust Inc Cum Pfd Ser H"
              },
              {
                "Ticker": "AHT-I",
                "Company": "Ashford Hospitality Trust Inc. 7.50% Series I Pf"
              },
              {
                "Ticker": "AI",
                "Company": "Arlington Asset Investment Corp"
              },
              {
                "Ticker": "AI-B",
                "Company": "Arlington Asset 7.00% Series B Pfd"
              },
              {
                "Ticker": "AIC",
                "Company": "Arlington Asset Investment Cor"
              },
              {
                "Ticker": "AIF",
                "Company": "Apollo Tactical Income Fund Inc"
              },
              {
                "Ticker": "AIG",
                "Company": "American International Group"
              },
              {
                "Ticker": "AIG.W",
                "Company": "American International Group"
              },
              {
                "Ticker": "AIN",
                "Company": "Albany International Corp"
              },
              {
                "Ticker": "AIR",
                "Company": "AAR Corp"
              },
              {
                "Ticker": "AIT",
                "Company": "Applied Industrial Technologies"
              },
              {
                "Ticker": "AIV",
                "Company": "Apartment Investment and Management"
              },
              {
                "Ticker": "AIV-A",
                "Company": "Apartment Investment and Manag"
              },
              {
                "Ticker": "AIW",
                "Company": "Arlington Asset Investment Cor"
              },
              {
                "Ticker": "AIY",
                "Company": "Apollo Investment Corp"
              },
              {
                "Ticker": "AIZ",
                "Company": "Assurant Inc"
              },
              {
                "Ticker": "AIZP",
                "Company": "Assurant Inc. 6.50% Series D Mandatory Converti"
              },
              {
                "Ticker": "AJG",
                "Company": "Arthur J. Gallagher & Co"
              },
              {
                "Ticker": "AJRD",
                "Company": "Aerojet Rocketdyne Holdings"
              },
              {
                "Ticker": "AJX",
                "Company": "Great Ajax Corp"
              },
              {
                "Ticker": "AJXA",
                "Company": "Great Ajax Corp 7.25% Convertible Senior Notes"
              },
              {
                "Ticker": "AKO.A",
                "Company": "Embotell Andina Sa Cl A"
              },
              {
                "Ticker": "AKO.B",
                "Company": "Embotell Andna Sa Cl B"
              },
              {
                "Ticker": "AKP",
                "Company": "Alliance California Muni"
              },
              {
                "Ticker": "AKR",
                "Company": "Acadia Realty Trust"
              },
              {
                "Ticker": "AKS",
                "Company": "AK Steel Holding Corp"
              },
              {
                "Ticker": "AL",
                "Company": "Air Lease Corporation Class A C"
              },
              {
                "Ticker": "ALB",
                "Company": "Albemarle Corp"
              },
              {
                "Ticker": "ALE",
                "Company": "Allete Inc"
              },
              {
                "Ticker": "ALEX",
                "Company": "Alexander and Baldwin Inc"
              },
              {
                "Ticker": "ALG",
                "Company": "Alamo Group"
              },
              {
                "Ticker": "ALK",
                "Company": "Alaska Air Group"
              },
              {
                "Ticker": "ALL",
                "Company": "Allstate Corp"
              },
              {
                "Ticker": "ALL-A",
                "Company": "Allstate Corporation Pfd"
              },
              {
                "Ticker": "ALL-B",
                "Company": "Ally Financial Inc Fixed Rate F"
              },
              {
                "Ticker": "ALL-C",
                "Company": "The Allstate Corp"
              },
              {
                "Ticker": "ALL-D",
                "Company": "Allstate Corp"
              },
              {
                "Ticker": "ALL-E",
                "Company": "The Allstate Corp"
              },
              {
                "Ticker": "ALL-F",
                "Company": "The Allstate Corp"
              },
              {
                "Ticker": "ALL-G",
                "Company": "Allstate Corp Dep Shs Repstg 1/1000Th Int Non-Cu"
              },
              {
                "Ticker": "ALL-Y",
                "Company": "GMAC Capital Trust I Fixed Rate"
              },
              {
                "Ticker": "ALLE",
                "Company": "Allegion Plc Ordinary Shares Wh"
              },
              {
                "Ticker": "ALLY",
                "Company": "Ally Financial"
              },
              {
                "Ticker": "ALP-Q",
                "Company": "Alabama Power Co. Pfd"
              },
              {
                "Ticker": "ALSN",
                "Company": "Allison Transmission Holdings"
              },
              {
                "Ticker": "ALV",
                "Company": "Autoliv Inc"
              },
              {
                "Ticker": "ALX",
                "Company": "Alexander's Inc"
              },
              {
                "Ticker": "AM",
                "Company": "Antero Resources Midstream Llc"
              },
              {
                "Ticker": "AMBR",
                "Company": "Amber Road Inc"
              },
              {
                "Ticker": "AMC",
                "Company": "Amc Entertainment Holdings Inc"
              },
              {
                "Ticker": "AME",
                "Company": "Amtek Inc"
              },
              {
                "Ticker": "AMG",
                "Company": "Affiliated Managers Group"
              },
              {
                "Ticker": "AMGP",
                "Company": "Antero Midstream Gp LP"
              },
              {
                "Ticker": "AMH",
                "Company": "American Homes 4 Rent"
              },
              {
                "Ticker": "AMH-D",
                "Company": "American Homes 4 Rent"
              },
              {
                "Ticker": "AMH-E",
                "Company": "American Homes 4 Rent 6.35% Ser"
              },
              {
                "Ticker": "AMH-F",
                "Company": "American Homes 4 Rent Cum Red Perp Pfd Shs"
              },
              {
                "Ticker": "AMH-G",
                "Company": "American Homes 4 Rent Series G Pfd"
              },
              {
                "Ticker": "AMH-H",
                "Company": "American Homes 4 Rent Perp Cum Red Pfd Shs Ser H"
              },
              {
                "Ticker": "AMID",
                "Company": "American Midstreampartners LP"
              },
              {
                "Ticker": "AMN",
                "Company": "Amn Healthcare Services Inc"
              },
              {
                "Ticker": "AMOV",
                "Company": "America Movil A ADR"
              },
              {
                "Ticker": "AMP",
                "Company": "Ameriprise Financial Services"
              },
              {
                "Ticker": "AMRC",
                "Company": "Ameresco Inc"
              },
              {
                "Ticker": "AMRX",
                "Company": "Amneal Pharmaceuticals Inc"
              },
              {
                "Ticker": "AMT",
                "Company": "American Tower Corp"
              },
              {
                "Ticker": "AMX",
                "Company": "America Movil S.A.B. De C.V."
              },
              {
                "Ticker": "AN",
                "Company": "Autonation Inc"
              },
              {
                "Ticker": "ANDV",
                "Company": "Andeavor"
              },
              {
                "Ticker": "ANDX",
                "Company": "Andeavor Logistics LP"
              },
              {
                "Ticker": "ANET",
                "Company": "Arista Networks Inc"
              },
              {
                "Ticker": "ANF",
                "Company": "Abercrombie & Fitch Company"
              },
              {
                "Ticker": "ANFI",
                "Company": "Amira Nature Foods Ltd"
              },
              {
                "Ticker": "ANH",
                "Company": "Anworth Mortgage Asset Corp"
              },
              {
                "Ticker": "ANH-A",
                "Company": "Anworth Mtg Pfd A"
              },
              {
                "Ticker": "ANH-B",
                "Company": "Anworth 6.25 Pr S B"
              },
              {
                "Ticker": "ANH-C",
                "Company": "Anworth Mortgage Asset Corpora"
              },
              {
                "Ticker": "ANTM",
                "Company": "Anthem Inc"
              },
              {
                "Ticker": "ANW",
                "Company": "Aegean Marine Petroleum Network"
              },
              {
                "Ticker": "AOD",
                "Company": "Alpine Total Dynamic Dividend"
              },
              {
                "Ticker": "AON",
                "Company": "AON Plc"
              },
              {
                "Ticker": "AOS",
                "Company": "Smith [A.O.] Corp"
              },
              {
                "Ticker": "AP",
                "Company": "Ampco-Pittsburgh Corp"
              },
              {
                "Ticker": "APA",
                "Company": "Apache Corp"
              },
              {
                "Ticker": "APAM",
                "Company": "Artisan Partners Asset Manageme"
              },
              {
                "Ticker": "APB",
                "Company": "Asia Pacific Fund Inc"
              },
              {
                "Ticker": "APC",
                "Company": "Anadarko Petroleum Corp"
              },
              {
                "Ticker": "APD",
                "Company": "Air Products and Chemicals"
              },
              {
                "Ticker": "APF",
                "Company": "Morgan Stanley Asia Pacific Fund Inc"
              },
              {
                "Ticker": "APH",
                "Company": "Amphenol Corp"
              },
              {
                "Ticker": "APLE",
                "Company": "Apple Hospitality REIT Inc"
              },
              {
                "Ticker": "APO",
                "Company": "Apollo Global Management Llc C"
              },
              {
                "Ticker": "APO-A",
                "Company": "Apollo Global Management Llc Pfd Ser A"
              },
              {
                "Ticker": "APO-B",
                "Company": "Apollo Global Management Llc Pfd Ser B"
              },
              {
                "Ticker": "APRN",
                "Company": "Blue Apron Holdings Inc"
              },
              {
                "Ticker": "APTS",
                "Company": "Preferred Apartment Communities"
              },
              {
                "Ticker": "APTV",
                "Company": "Aptiv Plc"
              },
              {
                "Ticker": "APU",
                "Company": "Amerigas Partners LP"
              },
              {
                "Ticker": "APY",
                "Company": "Apergy Corp"
              },
              {
                "Ticker": "AQ",
                "Company": "Aquantia Corp"
              },
              {
                "Ticker": "AQN",
                "Company": "Algonquin Pwr & Util"
              },
              {
                "Ticker": "AQUA",
                "Company": "Evoqua Water Technologies Corp"
              },
              {
                "Ticker": "AR",
                "Company": "Antero Resources Corp"
              },
              {
                "Ticker": "ARA",
                "Company": "American Renal Associates Holdi"
              },
              {
                "Ticker": "ARC",
                "Company": "American Reprographics Company"
              },
              {
                "Ticker": "ARCH",
                "Company": "Arch Coal Inc"
              },
              {
                "Ticker": "ARCO",
                "Company": "Arcos Dorados Holdings Inc"
              },
              {
                "Ticker": "ARD",
                "Company": "Ardagh Group S.A."
              },
              {
                "Ticker": "ARDC",
                "Company": "Ares Dynamic Credit Allocation"
              },
              {
                "Ticker": "ARE",
                "Company": "Alexandria Real Estate Equities"
              },
              {
                "Ticker": "ARE-A",
                "Company": "Alexandria Real Estate Equities"
              },
              {
                "Ticker": "ARE-D",
                "Company": "Alexandria Real Estate Equitie"
              },
              {
                "Ticker": "ARES",
                "Company": "Ares Management LP"
              },
              {
                "Ticker": "ARGD",
                "Company": "Argo Grp Itl Snr NTS"
              },
              {
                "Ticker": "ARGO",
                "Company": "Argo Group Intl Hlds"
              },
              {
                "Ticker": "ARI",
                "Company": "Apollo Commercial Real Estate"
              },
              {
                "Ticker": "ARI-C",
                "Company": "Apollo Commercial 8% Cum. Perp. Pfd. Series C"
              },
              {
                "Ticker": "ARL",
                "Company": "American Realty Investors"
              },
              {
                "Ticker": "ARLO",
                "Company": "Arlo Technologies Inc"
              },
              {
                "Ticker": "ARMK",
                "Company": "Aramark Holdings Corp"
              },
              {
                "Ticker": "ARNC",
                "Company": "Arconic Inc"
              },
              {
                "Ticker": "AROC",
                "Company": "Archrock Inc"
              },
              {
                "Ticker": "ARR",
                "Company": "Armour Residential R"
              },
              {
                "Ticker": "ARR-A",
                "Company": "Armour Residential REIT Inc"
              },
              {
                "Ticker": "ARR-B",
                "Company": "Armour Residential REIT Inc"
              },
              {
                "Ticker": "ARW",
                "Company": "Arrow Electronics"
              },
              {
                "Ticker": "ASA",
                "Company": "ASA Gold and Precious Metals"
              },
              {
                "Ticker": "ASB",
                "Company": "Associated Banc-Corp"
              },
              {
                "Ticker": "ASB-C",
                "Company": "Associated Banc-Corp Depositary"
              },
              {
                "Ticker": "ASB-D",
                "Company": "Associated Banc-Corp"
              },
              {
                "Ticker": "ASB-E",
                "Company": "Associated Banc-Corp Depositary Shs"
              },
              {
                "Ticker": "ASC",
                "Company": "Ardmore Shipping Corp"
              },
              {
                "Ticker": "ASG",
                "Company": "Liberty All-Star Growth Fund"
              },
              {
                "Ticker": "ASGN",
                "Company": "On Assignment"
              },
              {
                "Ticker": "ASH",
                "Company": "Ashland Global Holdings Inc"
              },
              {
                "Ticker": "ASIX",
                "Company": "Advansix Inc"
              },
              {
                "Ticker": "ASPN",
                "Company": "Aspen Aerogels Inc"
              },
              {
                "Ticker": "ASR",
                "Company": "Grupo Aeroportuario Del Sureste"
              },
              {
                "Ticker": "ASX",
                "Company": "Ase Industrial Holding Co. Ltd"
              },
              {
                "Ticker": "AT",
                "Company": "Atlantic Power Corp"
              },
              {
                "Ticker": "ATEN",
                "Company": "A10 Networks Inc"
              },
              {
                "Ticker": "ATGE",
                "Company": "Adtalem Global Education Inc"
              },
              {
                "Ticker": "ATH",
                "Company": "Athene Holding Ltd"
              },
              {
                "Ticker": "ATHM",
                "Company": "Autohome Inc"
              },
              {
                "Ticker": "ATI",
                "Company": "Allegheny Technologies Inc"
              },
              {
                "Ticker": "ATKR",
                "Company": "Atkore International Group"
              },
              {
                "Ticker": "ATO",
                "Company": "Atmos Energy Corp"
              },
              {
                "Ticker": "ATR",
                "Company": "Aptargroup"
              },
              {
                "Ticker": "ATTO",
                "Company": "Atento S.A."
              },
              {
                "Ticker": "ATU",
                "Company": "Actuant Corp"
              },
              {
                "Ticker": "ATUS",
                "Company": "Altice USA Inc Class A"
              },
              {
                "Ticker": "ATV",
                "Company": "Acorn International"
              },
              {
                "Ticker": "AU",
                "Company": "Anglogold Ashanti Ltd"
              },
              {
                "Ticker": "AUO",
                "Company": "Au Optronics Corp"
              },
              {
                "Ticker": "AUY",
                "Company": "Yamana Gold"
              },
              {
                "Ticker": "AVA",
                "Company": "Avista Corp"
              },
              {
                "Ticker": "AVAL",
                "Company": "Grupo Aval Acciones Y Valores S"
              },
              {
                "Ticker": "AVB",
                "Company": "Avalonbay Communities"
              },
              {
                "Ticker": "AVD",
                "Company": "American Vanguard Corp"
              },
              {
                "Ticker": "AVH",
                "Company": "Avianca Holdings S.A."
              },
              {
                "Ticker": "AVK",
                "Company": "Advent Claymore Convertible Securities"
              },
              {
                "Ticker": "AVLR",
                "Company": "Avalara Inc"
              },
              {
                "Ticker": "AVNS",
                "Company": "Avanos Medical Inc"
              },
              {
                "Ticker": "AVP",
                "Company": "Avon Products"
              },
              {
                "Ticker": "AVX",
                "Company": "Avx Corp"
              },
              {
                "Ticker": "AVY",
                "Company": "Avery Dennison Corp"
              },
              {
                "Ticker": "AVYA",
                "Company": "Avaya Holdings Corp"
              },
              {
                "Ticker": "AWF",
                "Company": "Alliancebernstein Global High Income Fund"
              },
              {
                "Ticker": "AWI",
                "Company": "Armstrong World Industries Inc"
              },
              {
                "Ticker": "AWK",
                "Company": "American Water Works"
              },
              {
                "Ticker": "AWP",
                "Company": "Alpine Global Premier Propertie"
              },
              {
                "Ticker": "AWR",
                "Company": "American States Water Company"
              },
              {
                "Ticker": "AX",
                "Company": "Axos Financial Inc."
              },
              {
                "Ticker": "AXE",
                "Company": "Anixter International Inc"
              },
              {
                "Ticker": "AXL",
                "Company": "American Axle & Manufacturing"
              },
              {
                "Ticker": "AXO",
                "Company": "Axos Financial Inc."
              },
              {
                "Ticker": "AXP",
                "Company": "American Express Company"
              },
              {
                "Ticker": "AXR",
                "Company": "Amrep Corp"
              },
              {
                "Ticker": "AXS",
                "Company": "Axis Capital Holdings"
              },
              {
                "Ticker": "AXS-D",
                "Company": "Axis Capital Holdings Ltd"
              },
              {
                "Ticker": "AXS-E",
                "Company": "Axis Capital Holdings Ltd"
              },
              {
                "Ticker": "AXTA",
                "Company": "Axalta Coating Systems Ltd"
              },
              {
                "Ticker": "AYI",
                "Company": "Acuity Brands Inc"
              },
              {
                "Ticker": "AYR",
                "Company": "Aircastle Ltd"
              },
              {
                "Ticker": "AYX",
                "Company": "Alteryx Inc"
              },
              {
                "Ticker": "AZN",
                "Company": "Astrazeneca Plc"
              },
              {
                "Ticker": "AZO",
                "Company": "Autozone"
              },
              {
                "Ticker": "AZRE",
                "Company": "Azure Power Global Ltd"
              },
              {
                "Ticker": "AZUL",
                "Company": "Azul S.A. ADR"
              },
              {
                "Ticker": "AZZ",
                "Company": "Azz Inc"
              },
              {
                "Ticker": "B",
                "Company": "Barnes Group"
              },
              {
                "Ticker": "BA",
                "Company": "Boeing Company"
              },
              {
                "Ticker": "BABA",
                "Company": "Alibaba Group Holding Ltd"
              },
              {
                "Ticker": "BAC",
                "Company": "Bank of America Corp"
              },
              {
                "Ticker": "BAC-A",
                "Company": "Bank of America Corp Pfd A"
              },
              {
                "Ticker": "BAC-B",
                "Company": "Bank of America Corp. Dep Shs Repstg 1/1000Th In"
              },
              {
                "Ticker": "BAC-C",
                "Company": "Bank of America Corp Pfd C"
              },
              {
                "Ticker": "BAC-E",
                "Company": "Bank of America Corp Dep R"
              },
              {
                "Ticker": "BAC-K",
                "Company": "Bank of America Corp Dep Shs Repstg 1/1000Th Int"
              },
              {
                "Ticker": "BAC-L",
                "Company": "Bank of America Corp Pfd L"
              },
              {
                "Ticker": "BAC-W",
                "Company": "Bank of America Corp Pfd W"
              },
              {
                "Ticker": "BAC-Y",
                "Company": "Bank of America Corp Pfd Y"
              },
              {
                "Ticker": "BAC.A",
                "Company": "Bank of America Corp Cl A"
              },
              {
                "Ticker": "BAC.B",
                "Company": "Bank of America Corp Cl B"
              },
              {
                "Ticker": "BAF",
                "Company": "Blackrock Income Inv Quality Trust"
              },
              {
                "Ticker": "BAH",
                "Company": "Booz Allen Hamilton Holding Corp"
              },
              {
                "Ticker": "BAK",
                "Company": "Braskem S.A."
              },
              {
                "Ticker": "BAM",
                "Company": "Brookfield Asset Management Inc"
              },
              {
                "Ticker": "BAN-D",
                "Company": "Bank of California Inc Pref Share Series D"
              },
              {
                "Ticker": "BAN-E",
                "Company": "Banc of California Inc"
              },
              {
                "Ticker": "BANC",
                "Company": "First Pactrust Bancorp"
              },
              {
                "Ticker": "BAP",
                "Company": "Credicorp Ltd"
              },
              {
                "Ticker": "BAS",
                "Company": "Basic Energy Services"
              },
              {
                "Ticker": "BAX",
                "Company": "Baxter International Inc"
              },
              {
                "Ticker": "BB",
                "Company": "Blackberry Ltd"
              },
              {
                "Ticker": "BBD",
                "Company": "Banco Bradesco S.A."
              },
              {
                "Ticker": "BBDC",
                "Company": "Barings Bdc Inc"
              },
              {
                "Ticker": "BBDO",
                "Company": "Banco Bradesco S.A."
              },
              {
                "Ticker": "BBF",
                "Company": "Blackrock Muni Income Trust"
              },
              {
                "Ticker": "BBK",
                "Company": "Blackrock Muni Trust"
              },
              {
                "Ticker": "BBL",
                "Company": "Bhp Billiton Plc"
              },
              {
                "Ticker": "BBN",
                "Company": "Balckrock Build America Trust"
              },
              {
                "Ticker": "BBT",
                "Company": "BB&T Corp"
              },
              {
                "Ticker": "BBT-D",
                "Company": "BB&T Corp"
              },
              {
                "Ticker": "BBT-E",
                "Company": "BB&T Corp"
              },
              {
                "Ticker": "BBT-F",
                "Company": "BB&T Corp"
              },
              {
                "Ticker": "BBT-G",
                "Company": "BB&T Corporation Ser G"
              },
              {
                "Ticker": "BBT-H",
                "Company": "BB&T Corp"
              },
              {
                "Ticker": "BBU",
                "Company": "Brookfield Business Partners LP"
              },
              {
                "Ticker": "BBVA",
                "Company": "Banco Bilbao Viscaya Argentaria S.A."
              },
              {
                "Ticker": "BBW",
                "Company": "Build-A-Bear Workshop"
              },
              {
                "Ticker": "BBX",
                "Company": "Bbx Capital Corp"
              },
              {
                "Ticker": "BBY",
                "Company": "Best Buy Co"
              },
              {
                "Ticker": "BC",
                "Company": "Brunswick Corp"
              },
              {
                "Ticker": "BC-A",
                "Company": "Brunswick Corp 6.500% Sr Notes Due 2048"
              },
              {
                "Ticker": "BCC",
                "Company": "Boise Cascade L.L.C."
              },
              {
                "Ticker": "BCE",
                "Company": "BCE Inc"
              },
              {
                "Ticker": "BCEI",
                "Company": "Bonanza Creek Energy Inc"
              },
              {
                "Ticker": "BCH",
                "Company": "Banco De Chile"
              },
              {
                "Ticker": "BCO",
                "Company": "Brink's Company"
              },
              {
                "Ticker": "BCRH",
                "Company": "Blue Capital Reinsurance Holdi"
              },
              {
                "Ticker": "BCS",
                "Company": "Barclays Plc"
              },
              {
                "Ticker": "BCS-D",
                "Company": "Barclays Bank Plc"
              },
              {
                "Ticker": "BCX",
                "Company": "Blackrock Resources"
              },
              {
                "Ticker": "BDC",
                "Company": "Belden Inc"
              },
              {
                "Ticker": "BDC-B",
                "Company": "Belden Inc"
              },
              {
                "Ticker": "BDJ",
                "Company": "Blackrock Enhanced Dividend Achievers"
              },
              {
                "Ticker": "BDN",
                "Company": "Brandywine Realty Trust"
              },
              {
                "Ticker": "BDX",
                "Company": "Becton Dickinson and Company"
              },
              {
                "Ticker": "BDXA",
                "Company": "Becton Dickinson & Co"
              },
              {
                "Ticker": "BE",
                "Company": "Bloom Energy Corporation Class A"
              },
              {
                "Ticker": "BEDU",
                "Company": "Bright Scholar Education Holdings Ltd"
              },
              {
                "Ticker": "BEL",
                "Company": "Belmond Ltd"
              },
              {
                "Ticker": "BEN",
                "Company": "Franklin Resources"
              },
              {
                "Ticker": "BEP",
                "Company": "Brookfield Renewable"
              },
              {
                "Ticker": "BERY",
                "Company": "Berry Global Group"
              },
              {
                "Ticker": "BF.A",
                "Company": "Brown Forman Inc Cl A"
              },
              {
                "Ticker": "BF.B",
                "Company": "Brown Forman Inc Cl B"
              },
              {
                "Ticker": "BFAM",
                "Company": "Bright Horizons Family Solutions Inc"
              },
              {
                "Ticker": "BFK",
                "Company": "Blackrock Muni Income Trust"
              },
              {
                "Ticker": "BFO",
                "Company": "Blackrock Florida Muni 2020 Trust"
              },
              {
                "Ticker": "BFR",
                "Company": "Bbva Banco Frances S.A."
              },
              {
                "Ticker": "BFS",
                "Company": "Saul Centers"
              },
              {
                "Ticker": "BFS-C",
                "Company": "Saul Centers Inc"
              },
              {
                "Ticker": "BFS-D",
                "Company": "Saul Centers Inc Dep Shs Repstg 1/100Th Pfd Ser"
              },
              {
                "Ticker": "BFY",
                "Company": "Blackrock New York Muni Trust II"
              },
              {
                "Ticker": "BFZ",
                "Company": "Blackrock California Muni Trust"
              },
              {
                "Ticker": "BG",
                "Company": "Bunge Ltd"
              },
              {
                "Ticker": "BGB",
                "Company": "Blackstone / Gso Strategic Cre"
              },
              {
                "Ticker": "BGG",
                "Company": "Briggs & Stratton Corp"
              },
              {
                "Ticker": "BGH",
                "Company": "Babson Capital Global Short Du"
              },
              {
                "Ticker": "BGIO",
                "Company": "Blackrock 2022 Global Income Opportunity Trust"
              },
              {
                "Ticker": "BGR",
                "Company": "Blackrock Energy and Resources Trust"
              },
              {
                "Ticker": "BGS",
                "Company": "B&G Foods Holdings"
              },
              {
                "Ticker": "BGT",
                "Company": "Blackrock Global"
              },
              {
                "Ticker": "BGX",
                "Company": "Blackstone Gso Long Short Credit Fund"
              },
              {
                "Ticker": "BGY",
                "Company": "Blackrock International"
              },
              {
                "Ticker": "BH",
                "Company": "Biglari Holdings Inc"
              },
              {
                "Ticker": "BH.A",
                "Company": "Biglari Holdings Inc. Class A"
              },
              {
                "Ticker": "BHC",
                "Company": "Bausch Health Companies Inc"
              },
              {
                "Ticker": "BHE",
                "Company": "Benchmark Electronics"
              },
              {
                "Ticker": "BHGE",
                "Company": "Baker Hughes A Ge Co. Cl. A"
              },
              {
                "Ticker": "BHK",
                "Company": "Blackrock Core Trust"
              },
              {
                "Ticker": "BHLB",
                "Company": "Berkshire Hills Bancorp"
              },
              {
                "Ticker": "BHP",
                "Company": "Bhp Billiton Ltd"
              },
              {
                "Ticker": "BHR",
                "Company": "Braemar Hotels & Resorts Inc"
              },
              {
                "Ticker": "BHR-B",
                "Company": "Braemar Hotels & Resorts Inc. Pfd B"
              },
              {
                "Ticker": "BHV",
                "Company": "Blackrock Virginia Muni Trust"
              },
              {
                "Ticker": "BHVN",
                "Company": "Biohaven Pharmaceutical Holding Company Ltd"
              },
              {
                "Ticker": "BID",
                "Company": "Sotheby's Holdings"
              },
              {
                "Ticker": "BIF",
                "Company": "Boulder Growth & Income Fund Inc"
              },
              {
                "Ticker": "BIG",
                "Company": "Big Lots"
              },
              {
                "Ticker": "BIO",
                "Company": "Bio-Rad Laboratories"
              },
              {
                "Ticker": "BIO.B",
                "Company": "Bio Rad Labs Cl B"
              },
              {
                "Ticker": "BIP",
                "Company": "Brookfield Infrastructure Partners LP"
              },
              {
                "Ticker": "BIT",
                "Company": "Blackrock Multi-Sector Income T"
              },
              {
                "Ticker": "BITA",
                "Company": "Bitauto Holdings Ltd"
              },
              {
                "Ticker": "BJ",
                "Company": "Bj's Wholesale Club Holdings Inc"
              },
              {
                "Ticker": "BJZ",
                "Company": "Blackrock California Muni 2018 Trust"
              },
              {
                "Ticker": "BK",
                "Company": "Bank of New York Mellon Corp"
              },
              {
                "Ticker": "BK-C",
                "Company": "The Bank of New York Mellon Co"
              },
              {
                "Ticker": "BKD",
                "Company": "Brookdale Senior Living Inc"
              },
              {
                "Ticker": "BKE",
                "Company": "Buckle Inc"
              },
              {
                "Ticker": "BKH",
                "Company": "Black Hills Corp"
              },
              {
                "Ticker": "BKHU",
                "Company": "Black Hills Corp"
              },
              {
                "Ticker": "BKI",
                "Company": "Black Knight Inc"
              },
              {
                "Ticker": "BKK",
                "Company": "Blackrock Muni 2020 Trust"
              },
              {
                "Ticker": "BKN",
                "Company": "Blackrock Investment Quality Municipal"
              },
              {
                "Ticker": "BKS",
                "Company": "Barnes & Noble"
              },
              {
                "Ticker": "BKT",
                "Company": "Blackrock Income Trust Inc"
              },
              {
                "Ticker": "BKU",
                "Company": "BankUnited Inc"
              },
              {
                "Ticker": "BLD",
                "Company": "Topbuild Corp"
              },
              {
                "Ticker": "BLE",
                "Company": "Blackrock Muni Income Trust II"
              },
              {
                "Ticker": "BLH",
                "Company": "Blackrock New York Muni 2018 Trust"
              },
              {
                "Ticker": "BLK",
                "Company": "Blackrock"
              },
              {
                "Ticker": "BLL",
                "Company": "Ball Corp"
              },
              {
                "Ticker": "BLW",
                "Company": "Blackrock Limited Duration Income Trust"
              },
              {
                "Ticker": "BLX",
                "Company": "Banco Latinoamericano De Comercio"
              },
              {
                "Ticker": "BMA",
                "Company": "Banco Macro S.A."
              },
              {
                "Ticker": "BME",
                "Company": "Blackrock Health Sciences Trust"
              },
              {
                "Ticker": "BMI",
                "Company": "Badger Meter"
              },
              {
                "Ticker": "BML-G",
                "Company": "Bank America Dep G"
              },
              {
                "Ticker": "BML-H",
                "Company": "Bank America Dep H"
              },
              {
                "Ticker": "BML-J",
                "Company": "Bank America Dep J"
              },
              {
                "Ticker": "BML-L",
                "Company": "Bank America Dep L"
              },
              {
                "Ticker": "BMO",
                "Company": "Bank of Montreal"
              },
              {
                "Ticker": "BMS",
                "Company": "Bemis Company"
              },
              {
                "Ticker": "BMY",
                "Company": "Bristol-Myers Squibb Company"
              },
              {
                "Ticker": "BNED",
                "Company": "Barnes & Noble Education Inc C"
              },
              {
                "Ticker": "BNS",
                "Company": "Bank of Nova Scotia"
              },
              {
                "Ticker": "BNY",
                "Company": "Blackrock New York Muni Trust Inc"
              },
              {
                "Ticker": "BOE",
                "Company": "Blackrock Global"
              },
              {
                "Ticker": "BOH",
                "Company": "Bank of Hawaii Corp"
              },
              {
                "Ticker": "BOOT",
                "Company": "Boot Barn Holdings Inc"
              },
              {
                "Ticker": "BORN",
                "Company": "China New Borun Corp"
              },
              {
                "Ticker": "BOX",
                "Company": "Box Inc"
              },
              {
                "Ticker": "BP",
                "Company": "BP Plc"
              },
              {
                "Ticker": "BPI",
                "Company": "Bridgepoint Education"
              },
              {
                "Ticker": "BPK",
                "Company": "Blackrock Muni 2018 Trust"
              },
              {
                "Ticker": "BPL",
                "Company": "Buckeye Partners LP"
              },
              {
                "Ticker": "BPMP",
                "Company": "BP Midstream Partners LP"
              },
              {
                "Ticker": "BPT",
                "Company": "BP Prudhoe Bay Royalty Trust"
              },
              {
                "Ticker": "BQH",
                "Company": "Blackrock New York Muni Trust"
              },
              {
                "Ticker": "BR",
                "Company": "Broadridge Financial Solutions Llc"
              },
              {
                "Ticker": "BRC",
                "Company": "Brady Corp"
              },
              {
                "Ticker": "BRFS",
                "Company": "Brf-Brasil Foods S.A."
              },
              {
                "Ticker": "BRK.A",
                "Company": "Berkshire Hath Hld Cl A"
              },
              {
                "Ticker": "BRK.B",
                "Company": "Berkshire Hath Hld Cl B"
              },
              {
                "Ticker": "BRO",
                "Company": "Brown & Brown"
              },
              {
                "Ticker": "BRS",
                "Company": "Bristow Group Inc"
              },
              {
                "Ticker": "BRSS",
                "Company": "Global Brass and Copper Holdin"
              },
              {
                "Ticker": "BRT",
                "Company": "BRT Realty Trust"
              },
              {
                "Ticker": "BRX",
                "Company": "Brixmor Property Group Inc"
              },
              {
                "Ticker": "BSA",
                "Company": "Brightsphere Investment Group Plc"
              },
              {
                "Ticker": "BSAC",
                "Company": "Banco Santander Chile ADR"
              },
              {
                "Ticker": "BSBR",
                "Company": "Banco Santander Brasil S.A."
              },
              {
                "Ticker": "BSD",
                "Company": "Blackrock Strategic Muni Trust Inc"
              },
              {
                "Ticker": "BSE",
                "Company": "Blackrock New York Muni Income Trust"
              },
              {
                "Ticker": "BSIG",
                "Company": "Brightsphere Investment Group Plc"
              },
              {
                "Ticker": "BSL",
                "Company": "Blackstone Gso Senior Floating Rate"
              },
              {
                "Ticker": "BSM",
                "Company": "Black Stone Minerals LP"
              },
              {
                "Ticker": "BSMX",
                "Company": "Grupo Financiero Santander Mexico"
              },
              {
                "Ticker": "BST",
                "Company": "Blackrock Science and Technolo"
              },
              {
                "Ticker": "BSTI",
                "Company": "Best Inc ADR"
              },
              {
                "Ticker": "BSX",
                "Company": "Boston Scientific Corp"
              },
              {
                "Ticker": "BT",
                "Company": "Bt Group Plc"
              },
              {
                "Ticker": "BTA",
                "Company": "Blackrock Long-Term Muni Advantage Trust"
              },
              {
                "Ticker": "BTE",
                "Company": "Baytex Energy Corp"
              },
              {
                "Ticker": "BTI",
                "Company": "British American Tobacco Industries"
              },
              {
                "Ticker": "BTO",
                "Company": "John Hancock Bank and Thrift Fund"
              },
              {
                "Ticker": "BTT",
                "Company": "Blackrock Municipal Target Term"
              },
              {
                "Ticker": "BTU",
                "Company": "Peabody Energy Corp"
              },
              {
                "Ticker": "BTZ",
                "Company": "Blackrock Preferred"
              },
              {
                "Ticker": "BUD",
                "Company": "Anheuser-Busch Inbev S.A."
              },
              {
                "Ticker": "BUI",
                "Company": "Blackrock Utility and Infrastr"
              },
              {
                "Ticker": "BURL",
                "Company": "Burlington Stores Inc"
              },
              {
                "Ticker": "BV",
                "Company": "Brightview Holdings Inc"
              },
              {
                "Ticker": "BVN",
                "Company": "Compania Mina Buenaventura S.A."
              },
              {
                "Ticker": "BW",
                "Company": "Babcock & Wilcox Enterprises I"
              },
              {
                "Ticker": "BWA",
                "Company": "Borgwarner Inc"
              },
              {
                "Ticker": "BWG",
                "Company": "Legg Mason Bw Global Income Op"
              },
              {
                "Ticker": "BWXT",
                "Company": "Bwx Technologies Inc"
              },
              {
                "Ticker": "BX",
                "Company": "The Blackstone Group LP"
              },
              {
                "Ticker": "BXC",
                "Company": "Bluelinx Holdings Inc"
              },
              {
                "Ticker": "BXE",
                "Company": "Bellatrix Exploration Ltd"
              },
              {
                "Ticker": "BXG",
                "Company": "Bluegreen Vacations Corporation"
              },
              {
                "Ticker": "BXMT",
                "Company": "Blackstone Mortgage Trust Inc Cl A"
              },
              {
                "Ticker": "BXMX",
                "Company": "Nuveen Equity Premium"
              },
              {
                "Ticker": "BXP",
                "Company": "Boston Properties"
              },
              {
                "Ticker": "BXP-B",
                "Company": "Boston Properties Inc"
              },
              {
                "Ticker": "BXS",
                "Company": "Bancorpsouth Inc"
              },
              {
                "Ticker": "BY",
                "Company": "Byline Bancorp Inc"
              },
              {
                "Ticker": "BYD",
                "Company": "Boyd Gaming Corp"
              },
              {
                "Ticker": "BYM",
                "Company": "Blackrock Muni Income Quality Trust"
              },
              {
                "Ticker": "BZH",
                "Company": "Beazer Homes USA"
              },
              {
                "Ticker": "BZM",
                "Company": "Blackrock Maryland Muni Trust"
              },
              {
                "Ticker": "C",
                "Company": "Citigroup Inc"
              },
              {
                "Ticker": "C-C",
                "Company": "Citigroup Inc Prfd C 5.8 P12/31/49 +C"
              },
              {
                "Ticker": "C-J",
                "Company": "Citigroup Inc Prfd C V7.125 P12/31/49 J"
              },
              {
                "Ticker": "C-K",
                "Company": "Citigroup Inc Prfd C V6.875 P12/31/49 K"
              },
              {
                "Ticker": "C-L",
                "Company": "Citigroup Inc Prfd C 6.875 P12/31/49 L"
              },
              {
                "Ticker": "C-N",
                "Company": "Citigroup Cap Prfd C V7.875 10/30/40"
              },
              {
                "Ticker": "C-S",
                "Company": "Citigroup Inc Prfd C 6.3"
              },
              {
                "Ticker": "C.A",
                "Company": "Citigroup Inc Wrnt 'A'"
              },
              {
                "Ticker": "CAAP",
                "Company": "Corporacion America Airports Sa"
              },
              {
                "Ticker": "CABO",
                "Company": "Cable One Inc"
              },
              {
                "Ticker": "CACI",
                "Company": "Caci International"
              },
              {
                "Ticker": "CADE",
                "Company": "Cadence Bancorporation Class A"
              },
              {
                "Ticker": "CAE",
                "Company": "Cae Inc"
              },
              {
                "Ticker": "CAF",
                "Company": "Morgan Stanley China A Share Fund Inc"
              },
              {
                "Ticker": "CAG",
                "Company": "Conagra Brands Inc"
              },
              {
                "Ticker": "CAH",
                "Company": "Cardinal Health"
              },
              {
                "Ticker": "CAI",
                "Company": "Cai International"
              },
              {
                "Ticker": "CAI-A",
                "Company": "Cai International Inc Red Perp Pfd Ser A Fixed/F"
              },
              {
                "Ticker": "CAI-B",
                "Company": "Cai International Inc 8.50% Red Perp Pfd Ser B F"
              },
              {
                "Ticker": "CAJ",
                "Company": "Canon Inc"
              },
              {
                "Ticker": "CAL",
                "Company": "Caleres Inc"
              },
              {
                "Ticker": "CALX",
                "Company": "Calix Inc"
              },
              {
                "Ticker": "CANG",
                "Company": "Cango Inc. ADR"
              },
              {
                "Ticker": "CAPL",
                "Company": "Crossamerica Partners LP"
              },
              {
                "Ticker": "CARS",
                "Company": "Cars.com Inc"
              },
              {
                "Ticker": "CAT",
                "Company": "Caterpillar Inc"
              },
              {
                "Ticker": "CATO",
                "Company": "Cato Corp"
              },
              {
                "Ticker": "CB",
                "Company": "Chubb Ltd"
              },
              {
                "Ticker": "CBA",
                "Company": "Clearbridge American Energy ML"
              },
              {
                "Ticker": "CBB",
                "Company": "Cincinnati Bell Inc"
              },
              {
                "Ticker": "CBB-B",
                "Company": "Cincinnati Bell Pr B"
              },
              {
                "Ticker": "CBD",
                "Company": "Companhia Brasileira De Distribuicao"
              },
              {
                "Ticker": "CBH",
                "Company": "Allianzgi Convertible Income 2024 Target Term Fu"
              },
              {
                "Ticker": "CBK",
                "Company": "Christopher & Banks Corp"
              },
              {
                "Ticker": "CBL",
                "Company": "Cbl & Associates Properties"
              },
              {
                "Ticker": "CBL-D",
                "Company": "Cbl Pfd D"
              },
              {
                "Ticker": "CBL-E",
                "Company": "Cbl & Associates Properties I"
              },
              {
                "Ticker": "CBM",
                "Company": "Cambrex Corp"
              },
              {
                "Ticker": "CBO",
                "Company": "Cbo Common Stock"
              },
              {
                "Ticker": "CBPX",
                "Company": "Continental Building Products"
              },
              {
                "Ticker": "CBRE",
                "Company": "CBRE Group Inc"
              },
              {
                "Ticker": "CBS",
                "Company": "CBS Corp"
              },
              {
                "Ticker": "CBS.A",
                "Company": "CBS Corp"
              },
              {
                "Ticker": "CBT",
                "Company": "Cabot Corp"
              },
              {
                "Ticker": "CBU",
                "Company": "Community Bank System"
              },
              {
                "Ticker": "CBZ",
                "Company": "Cbiz Inc"
              },
              {
                "Ticker": "CC",
                "Company": "Chemours Company"
              },
              {
                "Ticker": "CCC.U",
                "Company": "Churchill Capital Corp"
              },
              {
                "Ticker": "CCE",
                "Company": "Coca Cola European Partners"
              },
              {
                "Ticker": "CCI",
                "Company": "Crown Castle International Corp"
              },
              {
                "Ticker": "CCI-A",
                "Company": "Crown Castle International Corp"
              },
              {
                "Ticker": "CCJ",
                "Company": "Cameco Corp"
              },
              {
                "Ticker": "CCK",
                "Company": "Crown Cork & Seal Company"
              },
              {
                "Ticker": "CCL",
                "Company": "Carnival Corp"
              },
              {
                "Ticker": "CCM",
                "Company": "Concord Medical Services"
              },
              {
                "Ticker": "CCO",
                "Company": "Clear Channel Outdoor Holdings"
              },
              {
                "Ticker": "CCR",
                "Company": "Consol Coal Resources LP"
              },
              {
                "Ticker": "CCS",
                "Company": "Century Communities Inc"
              },
              {
                "Ticker": "CCT",
                "Company": "Corporate Capital Trust Inc"
              },
              {
                "Ticker": "CCU",
                "Company": "Compania Cervecerias Unidas S.A."
              },
              {
                "Ticker": "CCZ",
                "Company": "Comcast Corp"
              },
              {
                "Ticker": "CDAY",
                "Company": "Ceridian Hcm Holding Inc"
              },
              {
                "Ticker": "CDE",
                "Company": "Coeur Mining Inc"
              },
              {
                "Ticker": "CDR",
                "Company": "Cedar Shopping Centers Inc"
              },
              {
                "Ticker": "CDR-B",
                "Company": "Cedar Realty Trust Inc"
              },
              {
                "Ticker": "CDR-C",
                "Company": "Cedar Realty Trust Inc"
              },
              {
                "Ticker": "CE",
                "Company": "Celanese Corp"
              },
              {
                "Ticker": "CEA",
                "Company": "China Eastern Airlines Corp Ltd"
              },
              {
                "Ticker": "CEE",
                "Company": "Central Europe and Russia Fund"
              },
              {
                "Ticker": "CEIX",
                "Company": "Consol Energy Inc"
              },
              {
                "Ticker": "CEL",
                "Company": "Cellcom Israel"
              },
              {
                "Ticker": "CELP",
                "Company": "Cypress Energy Partners LP"
              },
              {
                "Ticker": "CEM",
                "Company": "Clearbridge Energy MLP Fund Inc"
              },
              {
                "Ticker": "CEN",
                "Company": "Center Coast MLP & Infrastructure"
              },
              {
                "Ticker": "CEO",
                "Company": "Cnooc Ltd"
              },
              {
                "Ticker": "CEPU",
                "Company": "Central Puerto S.A. ADR"
              },
              {
                "Ticker": "CEQP",
                "Company": "Crestwood Equity Partners LP"
              },
              {
                "Ticker": "CF",
                "Company": "Cf Industries Holdings"
              },
              {
                "Ticker": "CFG",
                "Company": "Citizens Financial Group Inc/Ri"
              },
              {
                "Ticker": "CFR",
                "Company": "Cullen/Frost Bankers"
              },
              {
                "Ticker": "CFR-A",
                "Company": "Cullen/Frost Bankers Inc"
              },
              {
                "Ticker": "CFX",
                "Company": "Colfax Corp"
              },
              {
                "Ticker": "CGA",
                "Company": "China Green Agriculture"
              },
              {
                "Ticker": "CGC",
                "Company": "Canopy Growth Corp"
              },
              {
                "Ticker": "CGG",
                "Company": "Compagnie Generale De Gephysqu"
              },
              {
                "Ticker": "CHA",
                "Company": "China Telecom Corp Ltd"
              },
              {
                "Ticker": "CHAP",
                "Company": "Chaparral Energy Inc"
              },
              {
                "Ticker": "CHCT",
                "Company": "Community Healthcare Trust Inc"
              },
              {
                "Ticker": "CHD",
                "Company": "Church & Dwight Company"
              },
              {
                "Ticker": "CHE",
                "Company": "Chemed Inc"
              },
              {
                "Ticker": "CHGG",
                "Company": "Chegg Inc"
              },
              {
                "Ticker": "CHH",
                "Company": "Choice Hotels International"
              },
              {
                "Ticker": "CHK",
                "Company": "Chesapeake Energy Corp"
              },
              {
                "Ticker": "CHK-D",
                "Company": "Chesapeake En Cv Pfd"
              },
              {
                "Ticker": "CHKR",
                "Company": "Chesapeake Granite Wash Trust"
              },
              {
                "Ticker": "CHL",
                "Company": "China Mobile [Hong Kong] Ltd"
              },
              {
                "Ticker": "CHM-A",
                "Company": "Cherry Hill Mortgage Investment Corp"
              },
              {
                "Ticker": "CHMI",
                "Company": "Cherry Hill Mortgage Investmen"
              },
              {
                "Ticker": "CHN",
                "Company": "China Fund"
              },
              {
                "Ticker": "CHRA",
                "Company": "Charah Solutions Inc"
              },
              {
                "Ticker": "CHS",
                "Company": "Chico's Fas"
              },
              {
                "Ticker": "CHSP",
                "Company": "Chesapeake Lodging Trust"
              },
              {
                "Ticker": "CHT",
                "Company": "Chunghwa Telecom Co Ltd"
              },
              {
                "Ticker": "CHU",
                "Company": "China Unicom [Hong Kong] Ltd"
              },
              {
                "Ticker": "CI",
                "Company": "Cigna Corp"
              },
              {
                "Ticker": "CIA",
                "Company": "Citizens Inc"
              },
              {
                "Ticker": "CIB",
                "Company": "Bancolombia S.A."
              },
              {
                "Ticker": "CIC",
                "Company": "Capitol Investment Corp IV"
              },
              {
                "Ticker": "CIC.U",
                "Company": "Capitol Investment Corp IV Units"
              },
              {
                "Ticker": "CIC.W",
                "Company": "Capitol Investment Corp IV Wrnt"
              },
              {
                "Ticker": "CIEN",
                "Company": "Ciena Corp"
              },
              {
                "Ticker": "CIF",
                "Company": "Colonial Intermediate High"
              },
              {
                "Ticker": "CIG",
                "Company": "Comp En De Mn Cemig ADR"
              },
              {
                "Ticker": "CIG.C",
                "Company": "Comp En De Mn Cemig Class C ADR"
              },
              {
                "Ticker": "CII",
                "Company": "Blackrock Capital and Income Strategies"
              },
              {
                "Ticker": "CIM",
                "Company": "Chimera Investment Corp"
              },
              {
                "Ticker": "CIM-A",
                "Company": "Chimera Investment Corp"
              },
              {
                "Ticker": "CIM-B",
                "Company": "Chimera Investment Corp"
              },
              {
                "Ticker": "CIM-C",
                "Company": "Chimera Investment Corp Pfd Ser C"
              },
              {
                "Ticker": "CINR",
                "Company": "Ciner Resources LP"
              },
              {
                "Ticker": "CIO",
                "Company": "City Office REIT Inc"
              },
              {
                "Ticker": "CIO-A",
                "Company": "City Office REIT Inc"
              },
              {
                "Ticker": "CIR",
                "Company": "Circor International"
              },
              {
                "Ticker": "CISN",
                "Company": "Cision Ltd"
              },
              {
                "Ticker": "CIT",
                "Company": "Cit Group Inc [Del]"
              },
              {
                "Ticker": "CIVI",
                "Company": "Civitas Solutions Inc"
              },
              {
                "Ticker": "CJ",
                "Company": "C&J Energy Services Inc"
              },
              {
                "Ticker": "CKH",
                "Company": "Seacor Smit Inc"
              },
              {
                "Ticker": "CL",
                "Company": "Colgate-Palmolive Company"
              },
              {
                "Ticker": "CLB",
                "Company": "Core Laboratories N.V."
              },
              {
                "Ticker": "CLD",
                "Company": "Cloud Peak Energy Inc"
              },
              {
                "Ticker": "CLDR",
                "Company": "Cloudera Inc"
              },
              {
                "Ticker": "CLDT",
                "Company": "Chatham Lodging Trust [Reit]"
              },
              {
                "Ticker": "CLF",
                "Company": "Cleveland-Cliffs Inc"
              },
              {
                "Ticker": "CLGX",
                "Company": "Corelogic"
              },
              {
                "Ticker": "CLH",
                "Company": "Clean Harbors"
              },
              {
                "Ticker": "CLI",
                "Company": "Mack-Cali Realty Corp"
              },
              {
                "Ticker": "CLN-B",
                "Company": "Colony Financial Inc Perp Pfd"
              },
              {
                "Ticker": "CLN-E",
                "Company": "Colony Northstar [Clnspe]"
              },
              {
                "Ticker": "CLN-G",
                "Company": "Colony Northstar [Clnspg]"
              },
              {
                "Ticker": "CLN-H",
                "Company": "Colony Northstar [Clnsph]"
              },
              {
                "Ticker": "CLN-I",
                "Company": "Colony Northstar Inc. 7.15% Series I Pfd"
              },
              {
                "Ticker": "CLN-J",
                "Company": "Colony Northstar Inc Cum Red Perp Pfd Ser J"
              },
              {
                "Ticker": "CLNC",
                "Company": "Colony Northstar Credit Real Estate Inc. Class"
              },
              {
                "Ticker": "CLNY",
                "Company": "Colony Capital Inc"
              },
              {
                "Ticker": "CLPR",
                "Company": "Clipper Realty Inc"
              },
              {
                "Ticker": "CLR",
                "Company": "Continental Resources"
              },
              {
                "Ticker": "CLS",
                "Company": "Celestica Inc"
              },
              {
                "Ticker": "CLW",
                "Company": "Clearwater Paper Corp"
              },
              {
                "Ticker": "CLX",
                "Company": "Clorox Company"
              },
              {
                "Ticker": "CM",
                "Company": "Canadian Imperial Bank of Commerce"
              },
              {
                "Ticker": "CMA",
                "Company": "Comerica Inc"
              },
              {
                "Ticker": "CMA.W",
                "Company": "Comerica Inc"
              },
              {
                "Ticker": "CMC",
                "Company": "Commercial Metals Company"
              },
              {
                "Ticker": "CMCM",
                "Company": "Cheetah Mobile Inc"
              },
              {
                "Ticker": "CMD",
                "Company": "Cantel Medical"
              },
              {
                "Ticker": "CMG",
                "Company": "Chipotle Mexican Grill"
              },
              {
                "Ticker": "CMI",
                "Company": "Cummins Inc"
              },
              {
                "Ticker": "CMO",
                "Company": "Capstead Mortgage Corp"
              },
              {
                "Ticker": "CMO-E",
                "Company": "Capstead Mortgage Corp"
              },
              {
                "Ticker": "CMP",
                "Company": "Compass Minerals Intl Inc"
              },
              {
                "Ticker": "CMR-B",
                "Company": "Costamare Inc Perpetual Prefer"
              },
              {
                "Ticker": "CMR-C",
                "Company": "Costamare Inc Perpetual Prefer"
              },
              {
                "Ticker": "CMR-D",
                "Company": "Costamare Inc 8.75% Series D Cum Perp Pref"
              },
              {
                "Ticker": "CMR-E",
                "Company": "Costamare Inc. Pfd"
              },
              {
                "Ticker": "CMRE",
                "Company": "Costamare Inc"
              },
              {
                "Ticker": "CMS",
                "Company": "Cms Energy Corp"
              },
              {
                "Ticker": "CMS-B",
                "Company": "Consumers Engry 4.50"
              },
              {
                "Ticker": "CMSA",
                "Company": "Cms Energy Corporation 5.625% Junior Subordinate"
              },
              {
                "Ticker": "CMSC",
                "Company": "Cms Energy Corporation"
              },
              {
                "Ticker": "CMU",
                "Company": "Colonial Muni Income Trust"
              },
              {
                "Ticker": "CNA",
                "Company": "Cna Financial Corp"
              },
              {
                "Ticker": "CNC",
                "Company": "Centene Corp"
              },
              {
                "Ticker": "CNDT",
                "Company": "Conduent Inc"
              },
              {
                "Ticker": "CNHI",
                "Company": "CNH Industrial N.V."
              },
              {
                "Ticker": "CNI",
                "Company": "Canadian National Railway"
              },
              {
                "Ticker": "CNK",
                "Company": "Cinemark Holdings Inc"
              },
              {
                "Ticker": "CNNE",
                "Company": "Cannae Holdings Inc"
              },
              {
                "Ticker": "CNO",
                "Company": "Cno Financial Group"
              },
              {
                "Ticker": "CNP",
                "Company": "Centerpoint Energy Inc"
              },
              {
                "Ticker": "CNP-B",
                "Company": "Centerpoint Energy Inc Dep Shs Repstg 1/20Th Pfd"
              },
              {
                "Ticker": "CNQ",
                "Company": "Canadian Natural Resources"
              },
              {
                "Ticker": "CNS",
                "Company": "Cohn & Steers Inc"
              },
              {
                "Ticker": "CNX",
                "Company": "CNX Resources Corp"
              },
              {
                "Ticker": "CNXM",
                "Company": "CNX Midstream Partners LP"
              },
              {
                "Ticker": "CO",
                "Company": "Global Cord Blood Corp"
              },
              {
                "Ticker": "COD-A",
                "Company": "Compass Diversified Holdings Pfd Ser A"
              },
              {
                "Ticker": "COD-B",
                "Company": "Compass Diversified Holdings Fixed/Fltg Rate Cum"
              },
              {
                "Ticker": "CODI",
                "Company": "Compass Diversified Holdings"
              },
              {
                "Ticker": "COE",
                "Company": "China Online Education Group"
              },
              {
                "Ticker": "COF",
                "Company": "Capital One Financial Corp"
              },
              {
                "Ticker": "COF-C",
                "Company": "Capital One Financial Corporat"
              },
              {
                "Ticker": "COF-D",
                "Company": "Capital One Financial Corporat"
              },
              {
                "Ticker": "COF-F",
                "Company": "Capital One Financial Corporat"
              },
              {
                "Ticker": "COF-G",
                "Company": "Capital One Financial Corp"
              },
              {
                "Ticker": "COF-H",
                "Company": "Capital One Financial Corp Pfd"
              },
              {
                "Ticker": "COF-P",
                "Company": "Capital One Financial Corp Pfd"
              },
              {
                "Ticker": "COF.W",
                "Company": "Capital One Financial Corp"
              },
              {
                "Ticker": "COG",
                "Company": "Cabot Oil & Gas Corp"
              },
              {
                "Ticker": "COL",
                "Company": "Rockwell Collins"
              },
              {
                "Ticker": "COLD",
                "Company": "Americold Realty Trust"
              },
              {
                "Ticker": "COO",
                "Company": "Cooper Companies"
              },
              {
                "Ticker": "COP",
                "Company": "Conocophillips"
              },
              {
                "Ticker": "COR",
                "Company": "Coresite Realty Corp"
              },
              {
                "Ticker": "COR-Z",
                "Company": "Corenergy Infrastructure Trust Inc Dep. Pfd"
              },
              {
                "Ticker": "CORR",
                "Company": "Corenergy Infrastructure Trust Inc"
              },
              {
                "Ticker": "COT",
                "Company": "Cott Corp"
              },
              {
                "Ticker": "COTY",
                "Company": "Coty Inc"
              },
              {
                "Ticker": "CP",
                "Company": "Canadian Pacific Railway"
              },
              {
                "Ticker": "CPA",
                "Company": "Copa Holdings S.A."
              },
              {
                "Ticker": "CPAC",
                "Company": "Cementos Pacasmayo S.A.A"
              },
              {
                "Ticker": "CPB",
                "Company": "Campbell Soup Company"
              },
              {
                "Ticker": "CPE",
                "Company": "Callon Petroleum Company"
              },
              {
                "Ticker": "CPE-A",
                "Company": "Callon Petroleum Company Prefer"
              },
              {
                "Ticker": "CPF",
                "Company": "Central Pacific Financial Co"
              },
              {
                "Ticker": "CPG",
                "Company": "Crescent Pt Energy"
              },
              {
                "Ticker": "CPK",
                "Company": "Chesapeake Utilities Corp"
              },
              {
                "Ticker": "CPL",
                "Company": "Cpfl Energia S.A."
              },
              {
                "Ticker": "CPLG",
                "Company": "Corepoint Lodging Inc"
              },
              {
                "Ticker": "CPS",
                "Company": "Cooper Std Hldg Inc"
              },
              {
                "Ticker": "CPT",
                "Company": "Camden Property Trust"
              },
              {
                "Ticker": "CR",
                "Company": "Crane Company"
              },
              {
                "Ticker": "CRC",
                "Company": "California Resources Corporatio"
              },
              {
                "Ticker": "CRCM",
                "Company": "Care.com Inc"
              },
              {
                "Ticker": "CRD.A",
                "Company": "Crawford Co Cl A"
              },
              {
                "Ticker": "CRD.B",
                "Company": "Crawford Co Cl B"
              },
              {
                "Ticker": "CRH",
                "Company": "CRH Plc"
              },
              {
                "Ticker": "CRI",
                "Company": "Carter's Inc"
              },
              {
                "Ticker": "CRK",
                "Company": "Comstock Resources"
              },
              {
                "Ticker": "CRL",
                "Company": "Charles River Laboratories Intl"
              },
              {
                "Ticker": "CRM",
                "Company": "Salesforce.com Inc"
              },
              {
                "Ticker": "CRR",
                "Company": "Carbo Ceramics"
              },
              {
                "Ticker": "CRS",
                "Company": "Carpenter Technology Corp"
              },
              {
                "Ticker": "CRT",
                "Company": "Cross Timbers Royalty Trust"
              },
              {
                "Ticker": "CRY",
                "Company": "Cryolife"
              },
              {
                "Ticker": "CS",
                "Company": "Credit Suisse Group"
              },
              {
                "Ticker": "CSL",
                "Company": "Carlisle Companies Inc"
              },
              {
                "Ticker": "CSLT",
                "Company": "Castlight Health Inc"
              },
              {
                "Ticker": "CSS",
                "Company": "Css Industries"
              },
              {
                "Ticker": "CSTM",
                "Company": "Constellium N.V."
              },
              {
                "Ticker": "CSU",
                "Company": "Capital Senior Living Corp"
              },
              {
                "Ticker": "CSV",
                "Company": "Carriage Services"
              },
              {
                "Ticker": "CTAA",
                "Company": "Qwest Corp"
              },
              {
                "Ticker": "CTB",
                "Company": "Cooper Tire & Rubber Company"
              },
              {
                "Ticker": "CTBB",
                "Company": "Qwest Corp"
              },
              {
                "Ticker": "CTDD",
                "Company": "Qwest Corporation 6.75% Notes Due 2057"
              },
              {
                "Ticker": "CTK",
                "Company": "Cootek [Cayman] Inc."
              },
              {
                "Ticker": "CTL",
                "Company": "Centurylink"
              },
              {
                "Ticker": "CTLT",
                "Company": "Catalent Inc"
              },
              {
                "Ticker": "CTR",
                "Company": "Clearbridge Energy MLP Fund In"
              },
              {
                "Ticker": "CTS",
                "Company": "Cts Corp"
              },
              {
                "Ticker": "CTT",
                "Company": "Catchmark Timber Trust Inc"
              },
              {
                "Ticker": "CTV",
                "Company": "Qwest Corp"
              },
              {
                "Ticker": "CTY",
                "Company": "Qwest Corp"
              },
              {
                "Ticker": "CTZ",
                "Company": "Qwest Corporation 6.625% Notes"
              },
              {
                "Ticker": "CUB",
                "Company": "Cubic Corp"
              },
              {
                "Ticker": "CUB-C",
                "Company": "Customers Bancorp Inc Perp Pref Series C"
              },
              {
                "Ticker": "CUB-D",
                "Company": "Customers Bancorp Inc"
              },
              {
                "Ticker": "CUB-E",
                "Company": "Customers Bancorp Inc"
              },
              {
                "Ticker": "CUB-F",
                "Company": "Customers Bancorp Inc Prf"
              },
              {
                "Ticker": "CUBE",
                "Company": "Cubesmart"
              },
              {
                "Ticker": "CUBI",
                "Company": "Customers Bancorp"
              },
              {
                "Ticker": "CUK",
                "Company": "Carnival Plc ADR"
              },
              {
                "Ticker": "CULP",
                "Company": "Culp Inc"
              },
              {
                "Ticker": "CURO",
                "Company": "Curo Group Holdings Corp"
              },
              {
                "Ticker": "CUZ",
                "Company": "Cousins Properties Inc"
              },
              {
                "Ticker": "CVA",
                "Company": "Covanta Holding Corp"
              },
              {
                "Ticker": "CVE",
                "Company": "Cenovus Energy Inc"
              },
              {
                "Ticker": "CVEO",
                "Company": "Civeo Corp"
              },
              {
                "Ticker": "CVG",
                "Company": "Convergys Corp"
              },
              {
                "Ticker": "CVI",
                "Company": "Cvr Energy Inc"
              },
              {
                "Ticker": "CVIA",
                "Company": "Covia Holdings Corp"
              },
              {
                "Ticker": "CVNA",
                "Company": "Carvana Co. Class A"
              },
              {
                "Ticker": "CVRR",
                "Company": "Cvr Refining LP"
              },
              {
                "Ticker": "CVS",
                "Company": "CVS Corp"
              },
              {
                "Ticker": "CVX",
                "Company": "Chevron Corp"
              },
              {
                "Ticker": "CW",
                "Company": "Curtiss-Wright Corp"
              },
              {
                "Ticker": "CWE.A",
                "Company": "Clearway Energy Inc. Cl. A"
              },
              {
                "Ticker": "CWEN",
                "Company": "Clearway Energy Inc. Cl. C"
              },
              {
                "Ticker": "CWH",
                "Company": "Camping World Holdings Inc"
              },
              {
                "Ticker": "CWK",
                "Company": "Cushman & Wakefield Plc"
              },
              {
                "Ticker": "CWT",
                "Company": "California Water Service Group Holding"
              },
              {
                "Ticker": "CX",
                "Company": "Cemex S.A.B. De C.V."
              },
              {
                "Ticker": "CXE",
                "Company": "Colonial High Income Muni Trust"
              },
              {
                "Ticker": "CXH",
                "Company": "Colonial Investment Grade Muni Trust"
              },
              {
                "Ticker": "CXO",
                "Company": "Concho Resources Inc"
              },
              {
                "Ticker": "CXP",
                "Company": "Columbia Property Trust Inc"
              },
              {
                "Ticker": "CXW",
                "Company": "Corecivic Inc"
              },
              {
                "Ticker": "CYD",
                "Company": "China Yuchai International"
              },
              {
                "Ticker": "CYH",
                "Company": "Community Health Systems"
              },
              {
                "Ticker": "CZZ",
                "Company": "Cosan Ltd"
              },
              {
                "Ticker": "D",
                "Company": "Dominion Resources"
              },
              {
                "Ticker": "DAC",
                "Company": "Danaos Corp"
              },
              {
                "Ticker": "DAL",
                "Company": "Delta Air Lines Inc"
              },
              {
                "Ticker": "DAN",
                "Company": "Dana Inc"
              },
              {
                "Ticker": "DAR",
                "Company": "Darling International Inc"
              },
              {
                "Ticker": "DATA",
                "Company": "Tableau Software Inc Class A"
              },
              {
                "Ticker": "DAVA",
                "Company": "Endava Plc"
              },
              {
                "Ticker": "DB",
                "Company": "Deutsche Bank Ag"
              },
              {
                "Ticker": "DBD",
                "Company": "Diebold Nixdorf Inc"
              },
              {
                "Ticker": "DBL",
                "Company": "Doubleline Opportunistic Credi"
              },
              {
                "Ticker": "DCF",
                "Company": "Dreyfus Alcentra Global Credit Income 2024 Targe"
              },
              {
                "Ticker": "DCI",
                "Company": "Donaldson Company"
              },
              {
                "Ticker": "DCO",
                "Company": "Ducommun Inc"
              },
              {
                "Ticker": "DCP",
                "Company": "Dcp Midstream LP"
              },
              {
                "Ticker": "DCP-B",
                "Company": "Dcp Midstream LP Red Perp Cum Pfd Unit Ser B"
              },
              {
                "Ticker": "DCP-C",
                "Company": "Dcp Midstream LP Red Perp Pfd Unit Ser C Fixed/F"
              },
              {
                "Ticker": "DCUD",
                "Company": "Dominion Resources Inc"
              },
              {
                "Ticker": "DD-A",
                "Company": "Du Pont E I 3.50 Pfd"
              },
              {
                "Ticker": "DD-B",
                "Company": "Du Pont E I 4.50 Pfd"
              },
              {
                "Ticker": "DDD",
                "Company": "3D Systems Corp"
              },
              {
                "Ticker": "DDE",
                "Company": "Dover Downs Gaming & Entertainment Inc"
              },
              {
                "Ticker": "DDF",
                "Company": "Delaware Dividend & Income"
              },
              {
                "Ticker": "DDR",
                "Company": "DDR Corp"
              },
              {
                "Ticker": "DDR-A",
                "Company": "DDR Corp Dep Shs Pfd Cl A"
              },
              {
                "Ticker": "DDR-J",
                "Company": "DDR Corp Dep Shs Pfd J"
              },
              {
                "Ticker": "DDR-K",
                "Company": "DDR Corp Dep Shs Pfd K"
              },
              {
                "Ticker": "DDS",
                "Company": "Dillard's"
              },
              {
                "Ticker": "DDT",
                "Company": "Dillard's"
              },
              {
                "Ticker": "DE",
                "Company": "Deere & Company"
              },
              {
                "Ticker": "DEA",
                "Company": "Easterly Government Properties"
              },
              {
                "Ticker": "DECK",
                "Company": "Deckers Outdoor Corp"
              },
              {
                "Ticker": "DEI",
                "Company": "Douglas Emmett"
              },
              {
                "Ticker": "DEO",
                "Company": "Diageo Plc"
              },
              {
                "Ticker": "DESP",
                "Company": "Despegar.com Corp"
              },
              {
                "Ticker": "DEX",
                "Company": "Delaware Enhanced Global Dividend"
              },
              {
                "Ticker": "DF",
                "Company": "Dean Foods Company"
              },
              {
                "Ticker": "DFIN",
                "Company": "Donnelly Financial Solutions Inc"
              },
              {
                "Ticker": "DFP",
                "Company": "Flaherty & Crumrine Dynamic"
              },
              {
                "Ticker": "DFS",
                "Company": "Discover Financial Services"
              },
              {
                "Ticker": "DG",
                "Company": "Dollar General Corp"
              },
              {
                "Ticker": "DGX",
                "Company": "Quest Diagnostics Inc"
              },
              {
                "Ticker": "DHC.X",
                "Company": "Ditech Holding Corp. Ser A Warrants"
              },
              {
                "Ticker": "DHCP",
                "Company": "Ditech Holding Corporation"
              },
              {
                "Ticker": "DHF",
                "Company": "Dreyfus High Yield Strategies Fund"
              },
              {
                "Ticker": "DHI",
                "Company": "D.R. Horton"
              },
              {
                "Ticker": "DHR",
                "Company": "Danaher Corp"
              },
              {
                "Ticker": "DHT",
                "Company": "Dht Holdings"
              },
              {
                "Ticker": "DHX",
                "Company": "Dice Holdings"
              },
              {
                "Ticker": "DIAX",
                "Company": "Nuveen Dow"
              },
              {
                "Ticker": "DIN",
                "Company": "Dineequity Inc"
              },
              {
                "Ticker": "DIS",
                "Company": "Walt Disney Company"
              },
              {
                "Ticker": "DK",
                "Company": "Delek US Holdings"
              },
              {
                "Ticker": "DKL",
                "Company": "Delek Logistics Partners LP"
              },
              {
                "Ticker": "DKS",
                "Company": "Dick's Sporting Goods Inc"
              },
              {
                "Ticker": "DKT",
                "Company": "Deutsch Bk Contingent Cap TR V"
              },
              {
                "Ticker": "DL",
                "Company": "China Distance Education Holdings"
              },
              {
                "Ticker": "DLB",
                "Company": "Dolby Laboratories"
              },
              {
                "Ticker": "DLN-A",
                "Company": "Dynagas Lng Partners LP 9.00% Series A"
              },
              {
                "Ticker": "DLNG",
                "Company": "Dynagas Lng Partners LP"
              },
              {
                "Ticker": "DLPH",
                "Company": "Delphi Technologies Plc"
              },
              {
                "Ticker": "DLR",
                "Company": "Digital Realty Trust"
              },
              {
                "Ticker": "DLR-C",
                "Company": "Digital Realty Trust Inc 6.625% Series C"
              },
              {
                "Ticker": "DLR-G",
                "Company": "Digital Realty Trust Inc"
              },
              {
                "Ticker": "DLR-H",
                "Company": "Digital Realty"
              },
              {
                "Ticker": "DLR-I",
                "Company": "Digital Rlty TR Inc Pfd Sr I %"
              },
              {
                "Ticker": "DLR-J",
                "Company": "Digital Realty Trust Inc Cum Redeemable Pfd Ser"
              },
              {
                "Ticker": "DLX",
                "Company": "Deluxe Corp"
              },
              {
                "Ticker": "DM",
                "Company": "Dominion Midstream Partners LP"
              },
              {
                "Ticker": "DMB",
                "Company": "Dreyfus Municipal Bond Infrastr"
              },
              {
                "Ticker": "DMO",
                "Company": "Western Asset Mortgage Defined Opp"
              },
              {
                "Ticker": "DNB",
                "Company": "Dun & Bradstreet Corp"
              },
              {
                "Ticker": "DNI",
                "Company": "Chartwell Dividend & Income Fund"
              },
              {
                "Ticker": "DNOW",
                "Company": "Now Inc"
              },
              {
                "Ticker": "DNP",
                "Company": "Duff & Phelps Utilities Income"
              },
              {
                "Ticker": "DNR",
                "Company": "Denbury Resources"
              },
              {
                "Ticker": "DO",
                "Company": "Diamond Offshore Drilling"
              },
              {
                "Ticker": "DOC",
                "Company": "Physicians Realty Trust"
              },
              {
                "Ticker": "DOOR",
                "Company": "Masonite Wrldwde Hld"
              },
              {
                "Ticker": "DOV",
                "Company": "Dover Corp"
              },
              {
                "Ticker": "DPG",
                "Company": "Duff & Phelps Global Utility I"
              },
              {
                "Ticker": "DPLO",
                "Company": "Diplomat Pharmacy Inc"
              },
              {
                "Ticker": "DPZ",
                "Company": "Domino's Pizza Inc"
              },
              {
                "Ticker": "DQ",
                "Company": "Daqo New Energy"
              },
              {
                "Ticker": "DRD",
                "Company": "Drdgold Ltd"
              },
              {
                "Ticker": "DRE",
                "Company": "Duke Realty Corp"
              },
              {
                "Ticker": "DRH",
                "Company": "Diamondrock Hospitality Company"
              },
              {
                "Ticker": "DRI",
                "Company": "Darden Restaurants"
              },
              {
                "Ticker": "DRQ",
                "Company": "Dril-Quip"
              },
              {
                "Ticker": "DRUA",
                "Company": "Dominion Resources Inc"
              },
              {
                "Ticker": "DS",
                "Company": "Drive Shack Inc"
              },
              {
                "Ticker": "DS-B",
                "Company": "Drive Shack Inc [Dspb]"
              },
              {
                "Ticker": "DS-C",
                "Company": "Drive Shack Inc [Dspc]"
              },
              {
                "Ticker": "DS-D",
                "Company": "Drive Shack Inc [Dspd]"
              },
              {
                "Ticker": "DSE",
                "Company": "Duff & Phelps Select Energy ML"
              },
              {
                "Ticker": "DSL",
                "Company": "Doubleline Income Solutions Fun"
              },
              {
                "Ticker": "DSM",
                "Company": "Dreyfus Strategic Muni Bond Fund"
              },
              {
                "Ticker": "DSU",
                "Company": "Blackrock Debt Strategies Fund"
              },
              {
                "Ticker": "DSW",
                "Company": "DSW Inc"
              },
              {
                "Ticker": "DSX",
                "Company": "Diana Shipping Inc"
              },
              {
                "Ticker": "DSX-B",
                "Company": "Diana Shipping"
              },
              {
                "Ticker": "DSXN",
                "Company": "Diana Shipping Inc"
              },
              {
                "Ticker": "DTE",
                "Company": "Dte Energy Company"
              },
              {
                "Ticker": "DTF",
                "Company": "Duff & Phelps Utilities Tax-Free Income"
              },
              {
                "Ticker": "DTJ",
                "Company": "Dte Energy Company 2016 Series"
              },
              {
                "Ticker": "DTL.P",
                "Company": "Datalink Corp"
              },
              {
                "Ticker": "DTQ",
                "Company": "Dte Energy Co"
              },
              {
                "Ticker": "DTV",
                "Company": "Dte Energy Co"
              },
              {
                "Ticker": "DTW",
                "Company": "Dte Energy Company 2017 Series E 5.25% Jr"
              },
              {
                "Ticker": "DTY",
                "Company": "Dte Energy Co"
              },
              {
                "Ticker": "DUC",
                "Company": "Duff & Phelps Utility & Corporate Trust"
              },
              {
                "Ticker": "DUK",
                "Company": "Duke Energy Corp"
              },
              {
                "Ticker": "DUKB",
                "Company": "Duke Energy Corporation 5.625% Junior Subordinat"
              },
              {
                "Ticker": "DUKH",
                "Company": "Duke Energy Corp"
              },
              {
                "Ticker": "DVA",
                "Company": "Davita Healthcare Partners Inc"
              },
              {
                "Ticker": "DVD",
                "Company": "Dover Downs Entertainment"
              },
              {
                "Ticker": "DVMT",
                "Company": "Dell Technologies Inc Cl V"
              },
              {
                "Ticker": "DVN",
                "Company": "Devon Energy Corp"
              },
              {
                "Ticker": "DWDP",
                "Company": "Dowdupont Inc"
              },
              {
                "Ticker": "DX",
                "Company": "Dynex Capital"
              },
              {
                "Ticker": "DX-A",
                "Company": "Dynex Capital Inc"
              },
              {
                "Ticker": "DX-B",
                "Company": "Dynex Capital Inc"
              },
              {
                "Ticker": "DXB",
                "Company": "Deutsche Bk Contingent Cap TR I"
              },
              {
                "Ticker": "DXC",
                "Company": "Dxc Technology Company"
              },
              {
                "Ticker": "DY",
                "Company": "Dycom Industries"
              },
              {
                "Ticker": "DYNC",
                "Company": "Dynegy Inc 7.00% Tangible Equi"
              },
              {
                "Ticker": "E",
                "Company": "Eni S.P.A."
              },
              {
                "Ticker": "EAB",
                "Company": "First Mortgage Bonds"
              },
              {
                "Ticker": "EAE",
                "Company": "Entergy Arkansas Inc"
              },
              {
                "Ticker": "EAF",
                "Company": "Graftech International Ltd"
              },
              {
                "Ticker": "EAI",
                "Company": "Entergy Arkansas Inc"
              },
              {
                "Ticker": "EARN",
                "Company": "Ellington Residential Mortgage"
              },
              {
                "Ticker": "EAT",
                "Company": "Brinker International"
              },
              {
                "Ticker": "EB",
                "Company": "Eventbrite Inc"
              },
              {
                "Ticker": "EBF",
                "Company": "Ennis Inc"
              },
              {
                "Ticker": "EBR",
                "Company": "Centrais Electricas Brazil"
              },
              {
                "Ticker": "EBR.B",
                "Company": "Centrais Eletricas Brasileiras"
              },
              {
                "Ticker": "EBS",
                "Company": "Emergent Biosolutions"
              },
              {
                "Ticker": "EC",
                "Company": "Ecopetrol S.A."
              },
              {
                "Ticker": "ECA",
                "Company": "Encana Corp"
              },
              {
                "Ticker": "ECC",
                "Company": "Eagle Point Credit Co. Inc"
              },
              {
                "Ticker": "ECCA",
                "Company": "Eagle Point Credit Company Inc"
              },
              {
                "Ticker": "ECCB",
                "Company": "Eagle Point Credit Company Inc"
              },
              {
                "Ticker": "ECCX",
                "Company": "Eagle Point Credit Company Inc. 6.6875% Notes Du"
              },
              {
                "Ticker": "ECCY",
                "Company": "Eagle Point Credit Company Inc"
              },
              {
                "Ticker": "ECL",
                "Company": "Ecolab Inc"
              },
              {
                "Ticker": "ECOM",
                "Company": "Channeladvisor Corp"
              },
              {
                "Ticker": "ECR",
                "Company": "Eclipse Resources Corp"
              },
              {
                "Ticker": "ECT",
                "Company": "Eca Marcellus Trust I"
              },
              {
                "Ticker": "ED",
                "Company": "Consolidated Edison Company of New York"
              },
              {
                "Ticker": "EDD",
                "Company": "Emerging Markets Domestic Debt Fund"
              },
              {
                "Ticker": "EDF",
                "Company": "Stone Harbor Emerging Markets"
              },
              {
                "Ticker": "EDI",
                "Company": "Stone Harbor Emerging Markets"
              },
              {
                "Ticker": "EDN",
                "Company": "Empresa Distribuidora Y Comercializadora"
              },
              {
                "Ticker": "EDR",
                "Company": "Education Realty Trust Inc"
              },
              {
                "Ticker": "EDU",
                "Company": "New Oriental Education & Technology Group"
              },
              {
                "Ticker": "EE",
                "Company": "El Paso Electric Company"
              },
              {
                "Ticker": "EEA",
                "Company": "European Equity Fund"
              },
              {
                "Ticker": "EEP",
                "Company": "Enbridge Energy LP"
              },
              {
                "Ticker": "EEQ",
                "Company": "Enbridge Energy Management Llc"
              },
              {
                "Ticker": "EEX",
                "Company": "Emerald Expositions Events Inc"
              },
              {
                "Ticker": "EFC",
                "Company": "Ellington Financial Llc"
              },
              {
                "Ticker": "EFF",
                "Company": "Eaton Vance Floating-Rate Inco"
              },
              {
                "Ticker": "EFL",
                "Company": "Eaton Vance Floating-Rate 2022 Target Term Trust"
              },
              {
                "Ticker": "EFR",
                "Company": "Eaton Vance Senior Floating-Rate Fund"
              },
              {
                "Ticker": "EFT",
                "Company": "Eaton Vance Floating Rate Income Trust"
              },
              {
                "Ticker": "EFX",
                "Company": "Equifax Inc"
              },
              {
                "Ticker": "EGF",
                "Company": "Blackrock Enhanced Government Fund"
              },
              {
                "Ticker": "EGHT",
                "Company": "8X8 Inc"
              },
              {
                "Ticker": "EGIF",
                "Company": "Eagle Growth and Income Opportu"
              },
              {
                "Ticker": "EGL",
                "Company": "Engility Holdings Inc"
              },
              {
                "Ticker": "EGN",
                "Company": "Energen Corp"
              },
              {
                "Ticker": "EGO",
                "Company": "Eldorado Gold Corp"
              },
              {
                "Ticker": "EGP",
                "Company": "Eastgroup Properties"
              },
              {
                "Ticker": "EGY",
                "Company": "Vaalco Energy Inc"
              },
              {
                "Ticker": "EHC",
                "Company": "Encompass Health Corp"
              },
              {
                "Ticker": "EHI",
                "Company": "Western Asset Global High"
              },
              {
                "Ticker": "EHIC",
                "Company": "Ehi Car Services Ltd"
              },
              {
                "Ticker": "EHT",
                "Company": "Eaton Vance High Income 2021 Ta"
              },
              {
                "Ticker": "EIG",
                "Company": "Employers Holdings Inc"
              },
              {
                "Ticker": "EIX",
                "Company": "Edison International"
              },
              {
                "Ticker": "EL",
                "Company": "Estee Lauder Companies"
              },
              {
                "Ticker": "ELAN",
                "Company": "Elanco Animal Health Inc"
              },
              {
                "Ticker": "ELC",
                "Company": "Entergy Louisiana Llc"
              },
              {
                "Ticker": "ELF",
                "Company": "E.L.F. Beauty Inc"
              },
              {
                "Ticker": "ELJ",
                "Company": "Entergy Louisiana Llc"
              },
              {
                "Ticker": "ELLI",
                "Company": "Ellie Mae Inc"
              },
              {
                "Ticker": "ELP",
                "Company": "Companhia Paranaense De Energia"
              },
              {
                "Ticker": "ELS",
                "Company": "Equity Lifestyle Properties"
              },
              {
                "Ticker": "ELU",
                "Company": "Entergy Louisiana Llc First M"
              },
              {
                "Ticker": "ELVT",
                "Company": "Elevate Credit Inc"
              },
              {
                "Ticker": "ELY",
                "Company": "Callaway Golf Company"
              },
              {
                "Ticker": "EMD",
                "Company": "Western Asset Emerging Market Debt Fund Inc"
              },
              {
                "Ticker": "EME",
                "Company": "Emcor Group"
              },
              {
                "Ticker": "EMES",
                "Company": "Emerge Energy Services LP"
              },
              {
                "Ticker": "EMF",
                "Company": "Templeton Emerging Markets Fund"
              },
              {
                "Ticker": "EMN",
                "Company": "Eastman Chemical Company"
              },
              {
                "Ticker": "EMO",
                "Company": "Clearbridge Energy MLP Opportu"
              },
              {
                "Ticker": "EMP",
                "Company": "Entergy Mississippi Inc 4.9% Bonds"
              },
              {
                "Ticker": "EMR",
                "Company": "Emerson Electric Company"
              },
              {
                "Ticker": "ENB",
                "Company": "Enbridge Inc"
              },
              {
                "Ticker": "ENBA",
                "Company": "Enbridge Inc 6.375% Fixed-To-Floating Rate Subor"
              },
              {
                "Ticker": "ENBL",
                "Company": "Enable Midstream Partners LP"
              },
              {
                "Ticker": "ENIA",
                "Company": "Enersis Americas S.A. American"
              },
              {
                "Ticker": "ENIC",
                "Company": "Enersis Chile S.A. ADR"
              },
              {
                "Ticker": "ENJ",
                "Company": "Entergy New Orleans Inc"
              },
              {
                "Ticker": "ENLC",
                "Company": "Enlink Midstream Llc"
              },
              {
                "Ticker": "ENLK",
                "Company": "Enlink Midstream Partners LP"
              },
              {
                "Ticker": "ENO",
                "Company": "Entergy New Orleans Inc.First"
              },
              {
                "Ticker": "ENR",
                "Company": "Energizer Holdings Inc"
              },
              {
                "Ticker": "ENS",
                "Company": "Enersys Inc"
              },
              {
                "Ticker": "ENV",
                "Company": "Envestnet Inc"
              },
              {
                "Ticker": "ENVA",
                "Company": "Enova International Inc"
              },
              {
                "Ticker": "ENZ",
                "Company": "Enzo Biochem"
              },
              {
                "Ticker": "EOCC",
                "Company": "Empresa Nacional De Electricida"
              },
              {
                "Ticker": "EOD",
                "Company": "Wells Fargo Global Dividend Opportunity"
              },
              {
                "Ticker": "EOG",
                "Company": "Eog Resources"
              },
              {
                "Ticker": "EOI",
                "Company": "Eaton Vance Enhance Equity"
              },
              {
                "Ticker": "EOS",
                "Company": "Eaton Vance Enhanced Equity II"
              },
              {
                "Ticker": "EOT",
                "Company": "Eaton Vance Muni Income Trust"
              },
              {
                "Ticker": "EP-C",
                "Company": "El Paso Egy Cap I Pr"
              },
              {
                "Ticker": "EPAM",
                "Company": "Epam Systems Inc"
              },
              {
                "Ticker": "EPC",
                "Company": "Edgewell Personal Care"
              },
              {
                "Ticker": "EPD",
                "Company": "Enterprise Products Partners LP"
              },
              {
                "Ticker": "EPE",
                "Company": "Ep Energy Corp"
              },
              {
                "Ticker": "EPR",
                "Company": "Entertainment Properties Trust"
              },
              {
                "Ticker": "EPR-C",
                "Company": "Entertainment Prp Pf"
              },
              {
                "Ticker": "EPR-E",
                "Company": "Entertainment Ppty P"
              },
              {
                "Ticker": "EPR-G",
                "Company": "Epr Properties Pfd Ser G"
              },
              {
                "Ticker": "EPRT",
                "Company": "Essential Properties Realty Trust Inc"
              },
              {
                "Ticker": "EQC",
                "Company": "Equity Commonwealth"
              },
              {
                "Ticker": "EQC-D",
                "Company": "Equity Commonwealth"
              },
              {
                "Ticker": "EQGP",
                "Company": "Eqt Gp Holdings LP"
              },
              {
                "Ticker": "EQH",
                "Company": "Axa Equitable Holdings Inc"
              },
              {
                "Ticker": "EQM",
                "Company": "Equity Midstream Partners LP"
              },
              {
                "Ticker": "EQNR",
                "Company": "Equinor ASA"
              },
              {
                "Ticker": "EQR",
                "Company": "Equity Residential"
              },
              {
                "Ticker": "EQS",
                "Company": "Equus Total Return"
              },
              {
                "Ticker": "EQT",
                "Company": "Eqt Corp"
              },
              {
                "Ticker": "ERA",
                "Company": "Era Group Inc"
              },
              {
                "Ticker": "ERF",
                "Company": "Enerplus Corp"
              },
              {
                "Ticker": "ERJ",
                "Company": "Embraer-Empresa Brasileira De Aeronautica"
              },
              {
                "Ticker": "EROS",
                "Company": "Eros International Plc"
              },
              {
                "Ticker": "ES",
                "Company": "Eversource Energy"
              },
              {
                "Ticker": "ESE",
                "Company": "Esco Technologies Inc"
              },
              {
                "Ticker": "ESL",
                "Company": "Esterline Technologies Corp"
              },
              {
                "Ticker": "ESNT",
                "Company": "Essent Group Ltd"
              },
              {
                "Ticker": "ESRT",
                "Company": "Empire State Realty Trust Inc"
              },
              {
                "Ticker": "ESS",
                "Company": "Essex Property Trust"
              },
              {
                "Ticker": "ESTE",
                "Company": "Earthstone Energy"
              },
              {
                "Ticker": "ESV",
                "Company": "Ensco Plc"
              },
              {
                "Ticker": "ETB",
                "Company": "Eaton Vance Tax-Managed Buy-Write"
              },
              {
                "Ticker": "ETE",
                "Company": "Energy Transfer Equity LP"
              },
              {
                "Ticker": "ETG",
                "Company": "Eaton Vance Tax-Advantaged Global Dividend"
              },
              {
                "Ticker": "ETH",
                "Company": "Ethan Allen Interiors Inc"
              },
              {
                "Ticker": "ETJ",
                "Company": "Eaton Vance Risk-Managed Diversified Equity"
              },
              {
                "Ticker": "ETM",
                "Company": "Entercom Communications Corp"
              },
              {
                "Ticker": "ETN",
                "Company": "Eaton Corp"
              },
              {
                "Ticker": "ETO",
                "Company": "Eaton Vance Tax-Advantage Global Dividend Opp"
              },
              {
                "Ticker": "ETP",
                "Company": "Energy Transfer Partners"
              },
              {
                "Ticker": "ETP-C",
                "Company": "Energy Transfer Partners LP Perp Pfd Unit Ser C"
              },
              {
                "Ticker": "ETP-D",
                "Company": "Energy Transfer Partners LP Cum Red Perp Pfd Uni"
              },
              {
                "Ticker": "ETR",
                "Company": "Entergy Corp"
              },
              {
                "Ticker": "ETV",
                "Company": "Eaton Vance Corp"
              },
              {
                "Ticker": "ETW",
                "Company": "Eaton Vance Corp"
              },
              {
                "Ticker": "ETX",
                "Company": "Eaton Vance Municipal Income T"
              },
              {
                "Ticker": "ETY",
                "Company": "Eaton Vance Tax-Managed Diversified Equity"
              },
              {
                "Ticker": "EURN",
                "Company": "Euronav Nv"
              },
              {
                "Ticker": "EV",
                "Company": "Eaton Vance Corp"
              },
              {
                "Ticker": "EVA",
                "Company": "Enviva Partners LP"
              },
              {
                "Ticker": "EVC",
                "Company": "Entravision Communications Corp"
              },
              {
                "Ticker": "EVF",
                "Company": "Eaton Vance Senior Income Trust"
              },
              {
                "Ticker": "EVG",
                "Company": "Eaton Vance Short Diversified"
              },
              {
                "Ticker": "EVH",
                "Company": "Evolent Health Inc Class A Com"
              },
              {
                "Ticker": "EVHC",
                "Company": "Envision Healthcare Holdings"
              },
              {
                "Ticker": "EVN",
                "Company": "Eaton Vance Muni Income Trust"
              },
              {
                "Ticker": "EVR",
                "Company": "Evercore Partners Inc"
              },
              {
                "Ticker": "EVRG",
                "Company": "Evergy Inc"
              },
              {
                "Ticker": "EVRI",
                "Company": "Everi Holdings Inc"
              },
              {
                "Ticker": "EVT",
                "Company": "Eaton Vance Tax Advantaged Dividend"
              },
              {
                "Ticker": "EVTC",
                "Company": "Evertec Inc"
              },
              {
                "Ticker": "EW",
                "Company": "Edwards Lifesciences Corp"
              },
              {
                "Ticker": "EXC",
                "Company": "Exelon Corp"
              },
              {
                "Ticker": "EXD",
                "Company": "Eaton Vance Tax-Advantaged Bond"
              },
              {
                "Ticker": "EXG",
                "Company": "Eaton Vance Tax-Managed Global Diversified Equit"
              },
              {
                "Ticker": "EXK",
                "Company": "Endeavour Silver Corp"
              },
              {
                "Ticker": "EXP",
                "Company": "Eagle Materials Inc"
              },
              {
                "Ticker": "EXPR",
                "Company": "Express Inc"
              },
              {
                "Ticker": "EXR",
                "Company": "Extra Space Storage Inc"
              },
              {
                "Ticker": "EXTN",
                "Company": "Exterran Corp"
              },
              {
                "Ticker": "EZT",
                "Company": "First Mortgage Bonds"
              },
              {
                "Ticker": "F",
                "Company": "Ford Motor Company"
              },
              {
                "Ticker": "FAF",
                "Company": "First American Corp"
              },
              {
                "Ticker": "FAM",
                "Company": "First Trust/Aberdeen Global Opportunity"
              },
              {
                "Ticker": "FBC",
                "Company": "Flagstar Bancorp"
              },
              {
                "Ticker": "FBHS",
                "Company": "Fortune Brands Home & Security"
              },
              {
                "Ticker": "FBK",
                "Company": "Fb Financial Corp"
              },
              {
                "Ticker": "FBM",
                "Company": "Foundation Building Materials Inc"
              },
              {
                "Ticker": "FBP",
                "Company": "First Bancorp"
              },
              {
                "Ticker": "FBR",
                "Company": "Fibria Celulose S.A."
              },
              {
                "Ticker": "FC",
                "Company": "Franklin Covey Company"
              },
              {
                "Ticker": "FCAU",
                "Company": "Fiat Chrysler Automobiles N.V."
              },
              {
                "Ticker": "FCB",
                "Company": "Fcb Financial Holdings Inc"
              },
              {
                "Ticker": "FCE.A",
                "Company": "Forest City Ent Cl A"
              },
              {
                "Ticker": "FCF",
                "Company": "First Commonwealth Financial Corp"
              },
              {
                "Ticker": "FCFS",
                "Company": "First Cash Fin Svcs"
              },
              {
                "Ticker": "FCN",
                "Company": "Fti Consulting"
              },
              {
                "Ticker": "FCPT",
                "Company": "Four Corners Property Trust In"
              },
              {
                "Ticker": "FCT",
                "Company": "Senior Floating Rate II"
              },
              {
                "Ticker": "FCX",
                "Company": "Freeport-Mcmoran Inc"
              },
              {
                "Ticker": "FDC",
                "Company": "First Data Corp"
              },
              {
                "Ticker": "FDEU",
                "Company": "First Trust Dynamic Europe Equi"
              },
              {
                "Ticker": "FDP",
                "Company": "Fresh Del Monte Produce"
              },
              {
                "Ticker": "FDS",
                "Company": "Factset Research Systems Inc"
              },
              {
                "Ticker": "FDX",
                "Company": "Fedex Corp"
              },
              {
                "Ticker": "FE",
                "Company": "Firstenergy Corp"
              },
              {
                "Ticker": "FEDU",
                "Company": "Four Seasons Education [Cayman] Inc"
              },
              {
                "Ticker": "FEI",
                "Company": "First Trust MLP and Energy Inc"
              },
              {
                "Ticker": "FELP",
                "Company": "Foresight Energy LP"
              },
              {
                "Ticker": "FENG",
                "Company": "Phoenix New Media Ltd"
              },
              {
                "Ticker": "FEO",
                "Company": "First Trust/Aberdeen Emerging Opportunity Fund"
              },
              {
                "Ticker": "FET",
                "Company": "Forum Energy Technologies Inc"
              },
              {
                "Ticker": "FF",
                "Company": "Futurefuel Corp"
              },
              {
                "Ticker": "FFA",
                "Company": "First Trust Enhanced Equity Income Fund"
              },
              {
                "Ticker": "FFC",
                "Company": "Flaherty Crumrine/Claymore Preferred Securities"
              },
              {
                "Ticker": "FFG",
                "Company": "Fbl Financial Group"
              },
              {
                "Ticker": "FG",
                "Company": "Fgl Holdings"
              },
              {
                "Ticker": "FG.W",
                "Company": "Fgl Holdings WT"
              },
              {
                "Ticker": "FGB",
                "Company": "Specialty Finance and Financial Fund"
              },
              {
                "Ticker": "FGP",
                "Company": "Ferrellgas Partners LP"
              },
              {
                "Ticker": "FHN",
                "Company": "First Horizon National Corp"
              },
              {
                "Ticker": "FHN-A",
                "Company": "First Horizon National Corpora"
              },
              {
                "Ticker": "FI",
                "Company": "Frank's International N.V."
              },
              {
                "Ticker": "FICO",
                "Company": "Fair Isaac and Company Inc"
              },
              {
                "Ticker": "FIF",
                "Company": "First Trust Energy Infrastruct"
              },
              {
                "Ticker": "FII",
                "Company": "Federated Investors"
              },
              {
                "Ticker": "FIS",
                "Company": "Fidelity National Information Services"
              },
              {
                "Ticker": "FIT",
                "Company": "Fitbit Inc"
              },
              {
                "Ticker": "FIV",
                "Company": "First Trust Senior Floating Rate 2022 Target Ter"
              },
              {
                "Ticker": "FIX",
                "Company": "Comfort Systems USA"
              },
              {
                "Ticker": "FL",
                "Company": "Footlocker Inc"
              },
              {
                "Ticker": "FLC",
                "Company": "Flaherty & Crumrine/Claymore Total Return"
              },
              {
                "Ticker": "FLO",
                "Company": "Flowers Foods"
              },
              {
                "Ticker": "FLOW",
                "Company": "SPX Flow Inc"
              },
              {
                "Ticker": "FLR",
                "Company": "Fluor Corp"
              },
              {
                "Ticker": "FLS",
                "Company": "Flowserve Corp"
              },
              {
                "Ticker": "FLT",
                "Company": "Fleetcor Technologies"
              },
              {
                "Ticker": "FLY",
                "Company": "Fly Leasing Ltd"
              },
              {
                "Ticker": "FMC",
                "Company": "FMC Corp"
              },
              {
                "Ticker": "FMN",
                "Company": "Federated Premier Muni"
              },
              {
                "Ticker": "FMO",
                "Company": "Fiduciary/Claymore MLP Opportunity Fund"
              },
              {
                "Ticker": "FMS",
                "Company": "Fresenius Medical Care Corp"
              },
              {
                "Ticker": "FMX",
                "Company": "Fomento Economico Mexicano S.A.B. De C.V."
              },
              {
                "Ticker": "FMY",
                "Company": "First Trust/Fidac Mortgage Income Fund"
              },
              {
                "Ticker": "FN",
                "Company": "Fabrinet"
              },
              {
                "Ticker": "FNB",
                "Company": "F.N.B. Corp"
              },
              {
                "Ticker": "FNB-E",
                "Company": "F.N.B. Corporation Representin"
              },
              {
                "Ticker": "FND",
                "Company": "Floor & Decor Holdings Inc"
              },
              {
                "Ticker": "FNF",
                "Company": "Fidelity National Financial"
              },
              {
                "Ticker": "FNV",
                "Company": "Franco Nev Corp"
              },
              {
                "Ticker": "FOE",
                "Company": "Ferro Corp"
              },
              {
                "Ticker": "FOF",
                "Company": "Cohen & Steers Closed-End Opportunity Fund"
              },
              {
                "Ticker": "FOR",
                "Company": "Forestar Group Inc"
              },
              {
                "Ticker": "FPA.U",
                "Company": "Far Point Acquisition Units"
              },
              {
                "Ticker": "FPA.W",
                "Company": "Far Point Acquisition Cl A WT"
              },
              {
                "Ticker": "FPAC",
                "Company": "Far Point Acquisition Corporation Class A"
              },
              {
                "Ticker": "FPF",
                "Company": "First Trust Intermediate Durat"
              },
              {
                "Ticker": "FPH",
                "Company": "Five Point Holdings Llc Class A"
              },
              {
                "Ticker": "FPI",
                "Company": "Farmland Partners Inc"
              },
              {
                "Ticker": "FPI-B",
                "Company": "Farmland Partners Inc"
              },
              {
                "Ticker": "FPL",
                "Company": "First Trust New Opportunities M"
              },
              {
                "Ticker": "FR",
                "Company": "First Industrial Realty Trust"
              },
              {
                "Ticker": "FRA",
                "Company": "Blackrock Floating Rate Income Fund"
              },
              {
                "Ticker": "FRAC",
                "Company": "Keane Group Inc"
              },
              {
                "Ticker": "FRC",
                "Company": "First Republic Bank"
              },
              {
                "Ticker": "FRC-D",
                "Company": "First Republic Bank San Francis"
              },
              {
                "Ticker": "FRC-E",
                "Company": "First Republic Bank"
              },
              {
                "Ticker": "FRC-F",
                "Company": "First Republic Bank"
              },
              {
                "Ticker": "FRC-G",
                "Company": "First Republic Bank"
              },
              {
                "Ticker": "FRC-H",
                "Company": "First Republic Bank [San Francisco Ca] Dep Shs R"
              },
              {
                "Ticker": "FRC-I",
                "Company": "First Republic Bank Dep Shs Pfd I"
              },
              {
                "Ticker": "FRO",
                "Company": "Frontline Ltd"
              },
              {
                "Ticker": "FRT",
                "Company": "Federal Realty Investment Trust"
              },
              {
                "Ticker": "FRT-C",
                "Company": "Federal Realty Investment Dep Shs Repstg 1/1000T"
              },
              {
                "Ticker": "FSB",
                "Company": "Franklin Financial Network Inc"
              },
              {
                "Ticker": "FSD",
                "Company": "High Income Long Short Fund"
              },
              {
                "Ticker": "FSIC",
                "Company": "FS Investment Corp"
              },
              {
                "Ticker": "FSM",
                "Company": "Fortuna Silver Mines"
              },
              {
                "Ticker": "FSS",
                "Company": "Federal Signal Corp"
              },
              {
                "Ticker": "FT",
                "Company": "Franklin Universal Trust"
              },
              {
                "Ticker": "FTAI",
                "Company": "Fortress Transportation & Infra"
              },
              {
                "Ticker": "FTCH",
                "Company": "Farfetch Limited Class A"
              },
              {
                "Ticker": "FTI",
                "Company": "Technipfmc Plc"
              },
              {
                "Ticker": "FTK",
                "Company": "Flotek Industries"
              },
              {
                "Ticker": "FTS",
                "Company": "Fortis Inc"
              },
              {
                "Ticker": "FTSI",
                "Company": "Fts International Inc"
              },
              {
                "Ticker": "FTV",
                "Company": "Fortive Corp"
              },
              {
                "Ticker": "FTV-A",
                "Company": "Fortive Corp Pfd Conv Ser A"
              },
              {
                "Ticker": "FUL",
                "Company": "H. B. Fuller Company"
              },
              {
                "Ticker": "FUN",
                "Company": "Cedar Fair LP"
              },
              {
                "Ticker": "G",
                "Company": "Genpact Ltd"
              },
              {
                "Ticker": "GAB",
                "Company": "Gabelli Equity Trust"
              },
              {
                "Ticker": "GAB-D",
                "Company": "Gabelli Eq TR Pfd D"
              },
              {
                "Ticker": "GAB-G",
                "Company": "The Gabelli Equity Trust Inc"
              },
              {
                "Ticker": "GAB-H",
                "Company": "The Gabelli Eqty Trust Inc"
              },
              {
                "Ticker": "GAB-J",
                "Company": "Gabelli Equity Trust Inc"
              },
              {
                "Ticker": "GAM",
                "Company": "General American Investors"
              },
              {
                "Ticker": "GAM-B",
                "Company": "Genl Amer Invs Pfd"
              },
              {
                "Ticker": "GATX",
                "Company": "GATX Corp"
              },
              {
                "Ticker": "GBAB",
                "Company": "Guggenheim Build America Bonds"
              },
              {
                "Ticker": "GBL",
                "Company": "Gamco Investors"
              },
              {
                "Ticker": "GBX",
                "Company": "Greenbrier Companies"
              },
              {
                "Ticker": "GCAP",
                "Company": "Gain Capital Holdings"
              },
              {
                "Ticker": "GCI",
                "Company": "Gannett Co. Inc"
              },
              {
                "Ticker": "GCO",
                "Company": "Genesco Inc"
              },
              {
                "Ticker": "GCP",
                "Company": "Gcp Applied Technologies Inc C"
              },
              {
                "Ticker": "GCV",
                "Company": "Gabelli Convertible and Income Securities"
              },
              {
                "Ticker": "GCV-B",
                "Company": "Gabelli 6.00% Pfd B"
              },
              {
                "Ticker": "GCV.P",
                "Company": "Gabelli Convertible & Income Securities Rights"
              },
              {
                "Ticker": "GD",
                "Company": "General Dynamics Corp"
              },
              {
                "Ticker": "GDDY",
                "Company": "Godaddy Inc"
              },
              {
                "Ticker": "GDI",
                "Company": "Gardner Denver Holdings Inc"
              },
              {
                "Ticker": "GDL",
                "Company": "The Gdl Fund"
              },
              {
                "Ticker": "GDL-C",
                "Company": "The Gdl Fund Series C Pfd"
              },
              {
                "Ticker": "GDO",
                "Company": "Western Asset Global Corporate Defined"
              },
              {
                "Ticker": "GDOT",
                "Company": "Green Dot Corp"
              },
              {
                "Ticker": "GDV",
                "Company": "Gabelli Dividend"
              },
              {
                "Ticker": "GDV-A",
                "Company": "Gabelli Dv"
              },
              {
                "Ticker": "GDV-D",
                "Company": "Gabelli Pref D"
              },
              {
                "Ticker": "GDV-G",
                "Company": "Gabelli Dividend & Income Trust"
              },
              {
                "Ticker": "GE",
                "Company": "General Electric Company"
              },
              {
                "Ticker": "GEF",
                "Company": "Greif Bros. Corp"
              },
              {
                "Ticker": "GEF.B",
                "Company": "Greif Bros. Corp Cl B"
              },
              {
                "Ticker": "GEL",
                "Company": "Genesis Energy LP"
              },
              {
                "Ticker": "GEN",
                "Company": "Genesis Healthcare Inc"
              },
              {
                "Ticker": "GEO",
                "Company": "Geo Group Inc"
              },
              {
                "Ticker": "GER",
                "Company": "Goldman Sachs MLP Energy Renai"
              },
              {
                "Ticker": "GES",
                "Company": "Guess Inc"
              },
              {
                "Ticker": "GF",
                "Company": "New Germany Fund"
              },
              {
                "Ticker": "GFA",
                "Company": "Gafisa S.A."
              },
              {
                "Ticker": "GFF",
                "Company": "Griffon Corp"
              },
              {
                "Ticker": "GFI",
                "Company": "Gold Fields Ltd"
              },
              {
                "Ticker": "GFY",
                "Company": "Western Asset Variable Rate Strategic"
              },
              {
                "Ticker": "GG",
                "Company": "Goldcorp Inc"
              },
              {
                "Ticker": "GGB",
                "Company": "Gerdau S.A."
              },
              {
                "Ticker": "GGG",
                "Company": "Graco Inc"
              },
              {
                "Ticker": "GGM",
                "Company": "Guggenheim Credit Allocation F"
              },
              {
                "Ticker": "GGT",
                "Company": "Gabelli Global Multi-Media Trust"
              },
              {
                "Ticker": "GGT-B",
                "Company": "Gabelli Global Multi-Media Trus"
              },
              {
                "Ticker": "GGT-E",
                "Company": "Gabelli Multimedia Trust Inc Pfd Ser E"
              },
              {
                "Ticker": "GGZ",
                "Company": "Gabelli Global Small and Mid CA"
              },
              {
                "Ticker": "GGZ-A",
                "Company": "Gabelli Global Small and Mid CA"
              },
              {
                "Ticker": "GHC",
                "Company": "Graham Holdings Company"
              },
              {
                "Ticker": "GHG",
                "Company": "Greentree Hospitality Group Ltd. ADR"
              },
              {
                "Ticker": "GHL",
                "Company": "Greenhill & Co. Inc"
              },
              {
                "Ticker": "GHM",
                "Company": "Graham Corp"
              },
              {
                "Ticker": "GHY",
                "Company": "Prudential Global Short Durati"
              },
              {
                "Ticker": "GIB",
                "Company": "CGI Group"
              },
              {
                "Ticker": "GIG",
                "Company": "Gigcapital Inc. Common Stock"
              },
              {
                "Ticker": "GIG.P",
                "Company": "Gig Capital Rt Rights"
              },
              {
                "Ticker": "GIG.U",
                "Company": "Gigcapital Inc Unit"
              },
              {
                "Ticker": "GIG.W",
                "Company": "Gig Capital WT Warrant"
              },
              {
                "Ticker": "GIL",
                "Company": "Gildan Activewear"
              },
              {
                "Ticker": "GIM",
                "Company": "Templeton Global"
              },
              {
                "Ticker": "GIS",
                "Company": "General Mills"
              },
              {
                "Ticker": "GJH",
                "Company": "Strats Sm Trust For United States Cellular Corp"
              },
              {
                "Ticker": "GJO",
                "Company": "Strats Sm Trust For Wal-Mart Stores Inc Securiti"
              },
              {
                "Ticker": "GJP",
                "Company": "Strats Sm Trust For Dominion Resources Inc Secur"
              },
              {
                "Ticker": "GJR",
                "Company": "Strats Sm Trust For The Procter & Gamble Co Secu"
              },
              {
                "Ticker": "GJS",
                "Company": "Strats Sm Trust For Goldman Sachs Group Securiti"
              },
              {
                "Ticker": "GJT",
                "Company": "Strats Sm Trust For Allstate Corp Securities Ser"
              },
              {
                "Ticker": "GJV",
                "Company": "Strats Sm Trust For News Corp Securities Series"
              },
              {
                "Ticker": "GKOS",
                "Company": "Glaukos Corp"
              },
              {
                "Ticker": "GLO-A",
                "Company": "Gaslog Partners LP 8.625% Series A"
              },
              {
                "Ticker": "GLO-B",
                "Company": "Gaslog Partners LP Perp Pref Unit Ser B Fixed/Fl"
              },
              {
                "Ticker": "GLO-G",
                "Company": "Gaslog Partners LP 8.75% Series A"
              },
              {
                "Ticker": "GLOB",
                "Company": "Globant S.A."
              },
              {
                "Ticker": "GLOG",
                "Company": "Gaslog Ltd"
              },
              {
                "Ticker": "GLOP",
                "Company": "Gaslog Partners LP"
              },
              {
                "Ticker": "GLP",
                "Company": "Global Partners LP"
              },
              {
                "Ticker": "GLP-A",
                "Company": "Global Partners L.P. Pfd A"
              },
              {
                "Ticker": "GLT",
                "Company": "Glatfelter"
              },
              {
                "Ticker": "GLW",
                "Company": "Corning Inc"
              },
              {
                "Ticker": "GM",
                "Company": "General Motors Company"
              },
              {
                "Ticker": "GM.B",
                "Company": "General Motors Cl B"
              },
              {
                "Ticker": "GME",
                "Company": "Gamestop Corp"
              },
              {
                "Ticker": "GMED",
                "Company": "Globus Medical Inc"
              },
              {
                "Ticker": "GMR-A",
                "Company": "Global Med REIT Inc Pfd."
              },
              {
                "Ticker": "GMRE",
                "Company": "Global Medical REIT Inc"
              },
              {
                "Ticker": "GMS",
                "Company": "Gms Inc"
              },
              {
                "Ticker": "GMTA",
                "Company": "GATX Corporation 5.625% Senior"
              },
              {
                "Ticker": "GMZ",
                "Company": "Goldman Sachs MLP Income Oppor"
              },
              {
                "Ticker": "GNC",
                "Company": "GNC Holdings Inc"
              },
              {
                "Ticker": "GNE",
                "Company": "Genie Energy Ltd Class B"
              },
              {
                "Ticker": "GNE-A",
                "Company": "Genie Energy Ltd Series"
              },
              {
                "Ticker": "GNK",
                "Company": "Genco Shipping & Trading Ltd"
              },
              {
                "Ticker": "GNL",
                "Company": "Global Net Lease Inc"
              },
              {
                "Ticker": "GNL-A",
                "Company": "Global Net Lease Inc 7.25% Pfd Ser A"
              },
              {
                "Ticker": "GNRC",
                "Company": "Generac Holdings Inc"
              },
              {
                "Ticker": "GNT",
                "Company": "Gabelli Natural Resources Gold"
              },
              {
                "Ticker": "GNT-A",
                "Company": "Gamco Natural Resources Gold & Income Trust"
              },
              {
                "Ticker": "GNW",
                "Company": "Genworth Financial Inc"
              },
              {
                "Ticker": "GOF",
                "Company": "Claymore/Guggenheim Strategic Fund"
              },
              {
                "Ticker": "GOL",
                "Company": "Gol Linhas Aereas Inteligentes S.A."
              },
              {
                "Ticker": "GOLF",
                "Company": "Acushnet Holdings Corp"
              },
              {
                "Ticker": "GOOS",
                "Company": "Canada Goose Holdings Inc Subordinate Voting Sh"
              },
              {
                "Ticker": "GPC",
                "Company": "Genuine Parts Company"
              },
              {
                "Ticker": "GPI",
                "Company": "Group 1 Automotive"
              },
              {
                "Ticker": "GPJA",
                "Company": "Georgia Power Company Series 2017A 5.00% Jr"
              },
              {
                "Ticker": "GPK",
                "Company": "Graphic Packaging Holding Company"
              },
              {
                "Ticker": "GPM",
                "Company": "Guggenheim Enhanced Equity"
              },
              {
                "Ticker": "GPMT",
                "Company": "Granite Point Mortgage Trust Inc"
              },
              {
                "Ticker": "GPN",
                "Company": "Global Payments Inc"
              },
              {
                "Ticker": "GPRK",
                "Company": "Geopark Hldgs Lmtd"
              },
              {
                "Ticker": "GPS",
                "Company": "Gap Inc"
              },
              {
                "Ticker": "GPT",
                "Company": "Gramercy Property Trust"
              },
              {
                "Ticker": "GPT-A",
                "Company": "Gramercy Property Trust"
              },
              {
                "Ticker": "GPX",
                "Company": "Gp Strategies Corp"
              },
              {
                "Ticker": "GRA",
                "Company": "W.R. Grace & Company"
              },
              {
                "Ticker": "GRAM",
                "Company": "Grana Y Montero S.A.A."
              },
              {
                "Ticker": "GRC",
                "Company": "Gorman-Rupp Company"
              },
              {
                "Ticker": "GRP.U",
                "Company": "Granite Real Estate Investment"
              },
              {
                "Ticker": "GRUB",
                "Company": "Grubhub Inc"
              },
              {
                "Ticker": "GRX",
                "Company": "The Gabelli Healthcare & Wellness Trust"
              },
              {
                "Ticker": "GRX-A",
                "Company": "The Gabelli Healthcare & Welln"
              },
              {
                "Ticker": "GRX-B",
                "Company": "The Gabelli Healthcare & Welln"
              },
              {
                "Ticker": "GS",
                "Company": "Goldman Sachs Group"
              },
              {
                "Ticker": "GS-A",
                "Company": "Goldman Sachs Pfd Series A"
              },
              {
                "Ticker": "GS-B",
                "Company": "Goldman Sachs Pfd Series B"
              },
              {
                "Ticker": "GS-C",
                "Company": "Goldman Sachs Pfd Series C"
              },
              {
                "Ticker": "GS-D",
                "Company": "Goldman Sachs Pfd Series D"
              },
              {
                "Ticker": "GS-J",
                "Company": "Goldman Sachs Pfd Series J"
              },
              {
                "Ticker": "GS-K",
                "Company": "Goldman Sachs Pfd Series K"
              },
              {
                "Ticker": "GS-N",
                "Company": "Goldman Sachs Pfd Series N"
              },
              {
                "Ticker": "GSA.U",
                "Company": "GS Acquisition Holdings Corp Units"
              },
              {
                "Ticker": "GSA.W",
                "Company": "GS Acquisition Holdings Corp Warrants"
              },
              {
                "Ticker": "GSAH",
                "Company": "GS Acquisition Holdings Corp. Class A"
              },
              {
                "Ticker": "GSBD",
                "Company": "Goldman Sachs Bdc Inc"
              },
              {
                "Ticker": "GSH",
                "Company": "Guangshen Railway"
              },
              {
                "Ticker": "GSK",
                "Company": "Glaxosmithkline Plc"
              },
              {
                "Ticker": "GSL",
                "Company": "Global Ship Lease Inc"
              },
              {
                "Ticker": "GSL-B",
                "Company": "Global Ship Lease Inc"
              },
              {
                "Ticker": "GTES",
                "Company": "Gates Industrial Corporation Plc Ordinary Shares"
              },
              {
                "Ticker": "GTN",
                "Company": "Gray Television"
              },
              {
                "Ticker": "GTN.A",
                "Company": "Gray Television"
              },
              {
                "Ticker": "GTS",
                "Company": "Triple-S Management Corp"
              },
              {
                "Ticker": "GTT",
                "Company": "Global Telcom & Technology Inc"
              },
              {
                "Ticker": "GTX",
                "Company": "Garrett Motion Inc."
              },
              {
                "Ticker": "GTY",
                "Company": "Getty Realty Corp"
              },
              {
                "Ticker": "GUT",
                "Company": "Gabelli Utility Trust"
              },
              {
                "Ticker": "GUT-A",
                "Company": "Gabelli Utility Trust Ser A Pfd"
              },
              {
                "Ticker": "GUT-C",
                "Company": "Gabelli Utility Trust Series C Pfd"
              },
              {
                "Ticker": "GVA",
                "Company": "Granite Construction Inc"
              },
              {
                "Ticker": "GWB",
                "Company": "Great Western Bancorp Inc"
              },
              {
                "Ticker": "GWR",
                "Company": "Genesee & Wyoming"
              },
              {
                "Ticker": "GWRE",
                "Company": "Guidewire Software Inc"
              },
              {
                "Ticker": "GWW",
                "Company": "W.W. Grainger"
              },
              {
                "Ticker": "GYB",
                "Company": "Cabco Series 2004-101 Trust"
              },
              {
                "Ticker": "GYC",
                "Company": "Corporate Asset Backed Corp Cabco"
              },
              {
                "Ticker": "GZT",
                "Company": "Gazit-Globe Ltd"
              },
              {
                "Ticker": "H",
                "Company": "Hyatt Hotels Corp"
              },
              {
                "Ticker": "HAE",
                "Company": "Haemonetics Corp"
              },
              {
                "Ticker": "HAL",
                "Company": "Halliburton Company"
              },
              {
                "Ticker": "HASI",
                "Company": "Hannon Armstrong Sustainable In"
              },
              {
                "Ticker": "HBB",
                "Company": "Horizons CA Select Universe Bond ETF"
              },
              {
                "Ticker": "HBI",
                "Company": "Hanesbrands Inc"
              },
              {
                "Ticker": "HBM",
                "Company": "Hudbay Minerals Inc"
              },
              {
                "Ticker": "HCA",
                "Company": "Hca Holdings Inc"
              },
              {
                "Ticker": "HCC",
                "Company": "Warrior Met Coal Inc"
              },
              {
                "Ticker": "HCF-A",
                "Company": "Hunt Companies Finance Trust Inc Pfd"
              },
              {
                "Ticker": "HCFT",
                "Company": "Hunt Companies Finance Trust Inc"
              },
              {
                "Ticker": "HCHC",
                "Company": "Hc2 Holdings Inc"
              },
              {
                "Ticker": "HCI",
                "Company": "Homeowners Choice"
              },
              {
                "Ticker": "HCLP",
                "Company": "Hi-Crush Partners LP"
              },
              {
                "Ticker": "HCP",
                "Company": "HCP Inc"
              },
              {
                "Ticker": "HCXY",
                "Company": "Hercules Capital Inc. 6.25% Notes Due 2033"
              },
              {
                "Ticker": "HCXZ",
                "Company": "Hercules Capital Inc. 5.25% Notes Due 2025"
              },
              {
                "Ticker": "HD",
                "Company": "Home Depot"
              },
              {
                "Ticker": "HDB",
                "Company": "Hdfc Bank Ltd"
              },
              {
                "Ticker": "HE",
                "Company": "Hawaiian Electric Industries"
              },
              {
                "Ticker": "HE-U",
                "Company": "Heco Cap III 6.50"
              },
              {
                "Ticker": "HEI",
                "Company": "Heico Corp"
              },
              {
                "Ticker": "HEI.A",
                "Company": "Heico Cp Cl A"
              },
              {
                "Ticker": "HEP",
                "Company": "Holly Energy Partners LP"
              },
              {
                "Ticker": "HEQ",
                "Company": "John Hancock Hedged Eqty & Inc"
              },
              {
                "Ticker": "HES",
                "Company": "Hess Corp"
              },
              {
                "Ticker": "HES-A",
                "Company": "Hess Corp"
              },
              {
                "Ticker": "HESM",
                "Company": "Hess Midstream Partners LP"
              },
              {
                "Ticker": "HF",
                "Company": "HFF Inc"
              },
              {
                "Ticker": "HFC",
                "Company": "Hollyfrontier Corp"
              },
              {
                "Ticker": "HFRO",
                "Company": "Highland Floating Rate Opportunities Fund"
              },
              {
                "Ticker": "HGH",
                "Company": "The Hartford Financial Srvcs G"
              },
              {
                "Ticker": "HGV",
                "Company": "Hilton Grand Vacations Inc"
              },
              {
                "Ticker": "HHC",
                "Company": "Howard Hughes Corp"
              },
              {
                "Ticker": "HHS",
                "Company": "Harte-Hanks"
              },
              {
                "Ticker": "HI",
                "Company": "Hillenbrand Inc"
              },
              {
                "Ticker": "HIE",
                "Company": "Miller/Howard High Income Eqty"
              },
              {
                "Ticker": "HIFR",
                "Company": "Infrareit Inc"
              },
              {
                "Ticker": "HIG",
                "Company": "Hartford Financial Services Group"
              },
              {
                "Ticker": "HIG.W",
                "Company": "Hartford Financial Services Group"
              },
              {
                "Ticker": "HII",
                "Company": "Huntington Ingalls Industries"
              },
              {
                "Ticker": "HIO",
                "Company": "Western Asset High"
              },
              {
                "Ticker": "HIVE",
                "Company": "Aerohive Networks Inc"
              },
              {
                "Ticker": "HIW",
                "Company": "Highwoods Properties"
              },
              {
                "Ticker": "HIX",
                "Company": "Western Asset High Income Fund II Inc"
              },
              {
                "Ticker": "HJV",
                "Company": "MS S.A.C. Saturns Ge Series 2002-14"
              },
              {
                "Ticker": "HK",
                "Company": "Halcon Resources"
              },
              {
                "Ticker": "HK.W",
                "Company": "Halcon Resources Corp Warrant"
              },
              {
                "Ticker": "HL",
                "Company": "Hecla Mining Company"
              },
              {
                "Ticker": "HL-B",
                "Company": "Hecla Mining Pfd B"
              },
              {
                "Ticker": "HLF",
                "Company": "Herbalife Ltd"
              },
              {
                "Ticker": "HLI",
                "Company": "Houlihan Lokey"
              },
              {
                "Ticker": "HLT",
                "Company": "Hilton Inc"
              },
              {
                "Ticker": "HLX",
                "Company": "Helix Energy Solutions Group"
              },
              {
                "Ticker": "HMC",
                "Company": "Honda Motor Company"
              },
              {
                "Ticker": "HMI",
                "Company": "Huami Corporation ADR"
              },
              {
                "Ticker": "HML-A",
                "Company": "Hoegh Lng Partners LP Cum Red Pfd Ser A"
              },
              {
                "Ticker": "HMLP",
                "Company": "Hoegh Lng Partners LP"
              },
              {
                "Ticker": "HMN",
                "Company": "Horace Mann Educators Corp"
              },
              {
                "Ticker": "HMY",
                "Company": "Harmony Gold Mining Co. Ltd"
              },
              {
                "Ticker": "HNGR",
                "Company": "Hanger Inc"
              },
              {
                "Ticker": "HNI",
                "Company": "Hon Industries Inc"
              },
              {
                "Ticker": "HNP",
                "Company": "Huaneng Power Intl"
              },
              {
                "Ticker": "HOG",
                "Company": "Harley-Davidson Inc"
              },
              {
                "Ticker": "HOME",
                "Company": "At Home Group Inc"
              },
              {
                "Ticker": "HON",
                "Company": "Honeywell International Inc"
              },
              {
                "Ticker": "HOS",
                "Company": "Hornbeck Offshore Services"
              },
              {
                "Ticker": "HOV",
                "Company": "Hovnanian Enterprises Inc"
              },
              {
                "Ticker": "HP",
                "Company": "Helmerich & Payne"
              },
              {
                "Ticker": "HPE",
                "Company": "Hewlett Packard Enterprise Comp"
              },
              {
                "Ticker": "HPF",
                "Company": "John Hancock Pfd II"
              },
              {
                "Ticker": "HPI",
                "Company": "John Hancock Preferred"
              },
              {
                "Ticker": "HPP",
                "Company": "Hudson Pacific Properties"
              },
              {
                "Ticker": "HPQ",
                "Company": "Hewlett-Packard Company"
              },
              {
                "Ticker": "HPR",
                "Company": "Highpoint Resources Corp"
              },
              {
                "Ticker": "HPS",
                "Company": "John Hancock Preferred Income Fund III"
              },
              {
                "Ticker": "HQH",
                "Company": "Tekla Healthcare Investors"
              },
              {
                "Ticker": "HQL",
                "Company": "Tekla Life Sciences Investors"
              },
              {
                "Ticker": "HR",
                "Company": "Healthcare Realty Trust Inc"
              },
              {
                "Ticker": "HRB",
                "Company": "H&R Block"
              },
              {
                "Ticker": "HRC",
                "Company": "Hill-Rom Holdings Inc"
              },
              {
                "Ticker": "HRI",
                "Company": "Herc Holdings Inc"
              },
              {
                "Ticker": "HRL",
                "Company": "Hormel Foods Corp"
              },
              {
                "Ticker": "HRS",
                "Company": "Harris Corp"
              },
              {
                "Ticker": "HRTG",
                "Company": "Heritage Insurance Holdings"
              },
              {
                "Ticker": "HSB-A",
                "Company": "HSBC Holdings Plc"
              },
              {
                "Ticker": "HSBC",
                "Company": "HSBC Holdings Plc"
              },
              {
                "Ticker": "HSC",
                "Company": "Harsco Corp"
              },
              {
                "Ticker": "HST",
                "Company": "Host Marriott Financial Trust"
              },
              {
                "Ticker": "HSY",
                "Company": "Hershey Foods Corp"
              },
              {
                "Ticker": "HT",
                "Company": "Hersha Hospitality Trust"
              },
              {
                "Ticker": "HT-C",
                "Company": "Hersha Hospitality Trust"
              },
              {
                "Ticker": "HT-D",
                "Company": "Hersha Hospitality Trust 6.50%"
              },
              {
                "Ticker": "HT-E",
                "Company": "Hersha Hospitality Trust"
              },
              {
                "Ticker": "HTA",
                "Company": "Healthcare Trust of America I"
              },
              {
                "Ticker": "HTD",
                "Company": "John Hancock Tax Advantaged Dividend"
              },
              {
                "Ticker": "HTFA",
                "Company": "Horizon Technology Finance 6.25% Notes Due 2022"
              },
              {
                "Ticker": "HTGC",
                "Company": "Hercules Technology Growth Capital"
              },
              {
                "Ticker": "HTGX",
                "Company": "Hercules Technology Growth Cap"
              },
              {
                "Ticker": "HTH",
                "Company": "Hilltop Holdings Inc"
              },
              {
                "Ticker": "HTY",
                "Company": "John Hancock Tax-Advantaged Global"
              },
              {
                "Ticker": "HTZ",
                "Company": "Hertz Global Holdings Inc"
              },
              {
                "Ticker": "HUBB",
                "Company": "Hubbell Inc B"
              },
              {
                "Ticker": "HUBS",
                "Company": "Hubspot Inc"
              },
              {
                "Ticker": "HUD",
                "Company": "Hudson Ltd. Class A Common Shares"
              },
              {
                "Ticker": "HUM",
                "Company": "Humana Inc"
              },
              {
                "Ticker": "HUN",
                "Company": "Huntsman Corp"
              },
              {
                "Ticker": "HUYA",
                "Company": "Huya Inc"
              },
              {
                "Ticker": "HVT",
                "Company": "Haverty Furniture Companies"
              },
              {
                "Ticker": "HVT.A",
                "Company": "Haverty Furn Cl A SC"
              },
              {
                "Ticker": "HXL",
                "Company": "Hexcel Corp"
              },
              {
                "Ticker": "HY",
                "Company": "Hyster-Yale Materials Handling"
              },
              {
                "Ticker": "HYB",
                "Company": "New America High"
              },
              {
                "Ticker": "HYI",
                "Company": "Western Asset High Yield Defined"
              },
              {
                "Ticker": "HYT",
                "Company": "Blackrock High Yield Fund Vi Inc"
              },
              {
                "Ticker": "HZN",
                "Company": "Horizon Global Corporation Comm"
              },
              {
                "Ticker": "HZO",
                "Company": "Marinemax Inc"
              },
              {
                "Ticker": "I",
                "Company": "Intelsat S.A."
              },
              {
                "Ticker": "IAE",
                "Company": "VOYA Asia Pacific High Dividend Equity"
              },
              {
                "Ticker": "IAG",
                "Company": "Iamgold Corp"
              },
              {
                "Ticker": "IBA",
                "Company": "Industrias Bachoco S.A. De C.V."
              },
              {
                "Ticker": "IBM",
                "Company": "International Business Machines"
              },
              {
                "Ticker": "IBN",
                "Company": "Icici Bank Ltd"
              },
              {
                "Ticker": "IBP",
                "Company": "Installed Building Products I"
              },
              {
                "Ticker": "ICD",
                "Company": "Independence Contract Drilling Inc"
              },
              {
                "Ticker": "ICE",
                "Company": "Intercontinental Exchange"
              },
              {
                "Ticker": "ICL",
                "Company": "Israel Chemicals Ltd"
              },
              {
                "Ticker": "IDA",
                "Company": "Idacorp Inc"
              },
              {
                "Ticker": "IDE",
                "Company": "VOYA Infrastructure Industrial"
              },
              {
                "Ticker": "IDT",
                "Company": "IDT Corp"
              },
              {
                "Ticker": "IEX",
                "Company": "Idex Corp"
              },
              {
                "Ticker": "IFF",
                "Company": "International Flavors & Fragrances"
              },
              {
                "Ticker": "IFFT",
                "Company": "International Flavors & Fragrances Inc"
              },
              {
                "Ticker": "IFN",
                "Company": "India Fund"
              },
              {
                "Ticker": "IGA",
                "Company": "VOYA Global Advantage and Premium"
              },
              {
                "Ticker": "IGD",
                "Company": "VOYA Global Equity Dividend and Premium"
              },
              {
                "Ticker": "IGI",
                "Company": "Western Asset Investment Grade Defined"
              },
              {
                "Ticker": "IGR",
                "Company": "VOYA Clarion Global Real Estate"
              },
              {
                "Ticker": "IGT",
                "Company": "International Game Technology"
              },
              {
                "Ticker": "IHC",
                "Company": "Independence Holding Company"
              },
              {
                "Ticker": "IHD",
                "Company": "VOYA Emerging Markets High Dividend"
              },
              {
                "Ticker": "IHG",
                "Company": "Intercontinental Hotels Group"
              },
              {
                "Ticker": "IHIT",
                "Company": "Invesco High Income 2023 Target Term Fund"
              },
              {
                "Ticker": "IHTA",
                "Company": "Invesco High Income 2024 Target Term Fund"
              },
              {
                "Ticker": "IID",
                "Company": "VOYA International High Dividend Equity"
              },
              {
                "Ticker": "IIF",
                "Company": "Morgan Stanley India Investment Fund Inc"
              },
              {
                "Ticker": "IIM",
                "Company": "Invesco Insured Muni Income Trust"
              },
              {
                "Ticker": "IIP-A",
                "Company": "Innovative Industrial Properties 9.00% Series A"
              },
              {
                "Ticker": "IIPR",
                "Company": "Innovative Industrial Properties"
              },
              {
                "Ticker": "IMAX",
                "Company": "Imax Corp"
              },
              {
                "Ticker": "INB",
                "Company": "Cohen & Steers Global Income Builder"
              },
              {
                "Ticker": "INF",
                "Company": "Brookfield Global Listed Infra"
              },
              {
                "Ticker": "INFY",
                "Company": "Infosys Ltd"
              },
              {
                "Ticker": "ING",
                "Company": "VOYA Group N.V."
              },
              {
                "Ticker": "INGR",
                "Company": "Ingredion Inc"
              },
              {
                "Ticker": "INN",
                "Company": "Summit Hotel Properties"
              },
              {
                "Ticker": "INN-D",
                "Company": "Summit Hotel Properties Inc"
              },
              {
                "Ticker": "INN-E",
                "Company": "Summit Hotel Properties Inc Cum Red Pfd Ser E"
              },
              {
                "Ticker": "INS-A",
                "Company": "Intl Seaways Inc. 8.50% Senior Notes"
              },
              {
                "Ticker": "INSI",
                "Company": "Insight Select Income Fund"
              },
              {
                "Ticker": "INSP",
                "Company": "Inspire Medical Systems Inc"
              },
              {
                "Ticker": "INST",
                "Company": "Instructure Inc"
              },
              {
                "Ticker": "INSW",
                "Company": "International Seaways Inc"
              },
              {
                "Ticker": "INT",
                "Company": "World Fuel Services Corp"
              },
              {
                "Ticker": "INVH",
                "Company": "Invitation Homes Inc"
              },
              {
                "Ticker": "INXN",
                "Company": "Interxion Holding N.V."
              },
              {
                "Ticker": "IO",
                "Company": "ION Geophysical Corp"
              },
              {
                "Ticker": "IP",
                "Company": "International Paper Company"
              },
              {
                "Ticker": "IPG",
                "Company": "Interpublic Group of Companies"
              },
              {
                "Ticker": "IPHI",
                "Company": "Inphi Corp"
              },
              {
                "Ticker": "IPI",
                "Company": "Intrepid Potash Inc"
              },
              {
                "Ticker": "IPL-D",
                "Company": "Interstate Power and Light Co"
              },
              {
                "Ticker": "IPO.U",
                "Company": "Social Capital Hedosophia Holdings Corp"
              },
              {
                "Ticker": "IPO.W",
                "Company": "Social Capital Hedosophia Warrant"
              },
              {
                "Ticker": "IPOA",
                "Company": "Social Capital Hedosophia Holdings Corp"
              },
              {
                "Ticker": "IQI",
                "Company": "Invesco Quality Muni Income Trust"
              },
              {
                "Ticker": "IQV",
                "Company": "Iqvia Holdings Inc"
              },
              {
                "Ticker": "IR",
                "Company": "Ingersoll-Rand Plc [Ireland]"
              },
              {
                "Ticker": "IRE-C",
                "Company": "Investors Real Estate Trust Pfd Ser C"
              },
              {
                "Ticker": "IRET",
                "Company": "Investors Real Estate Trust"
              },
              {
                "Ticker": "IRL",
                "Company": "Irish Investment Fund"
              },
              {
                "Ticker": "IRM",
                "Company": "Iron Mountain Inc"
              },
              {
                "Ticker": "IRR",
                "Company": "VOYA Risk Managed Natural Resources Fund"
              },
              {
                "Ticker": "IRS",
                "Company": "Irsa Inversiones Y Representaciones S.A."
              },
              {
                "Ticker": "IRT",
                "Company": "Independence Realty Trust Inc"
              },
              {
                "Ticker": "ISD",
                "Company": "Prudential Short Duration High"
              },
              {
                "Ticker": "ISF",
                "Company": "VOYA Group N.V."
              },
              {
                "Ticker": "ISG",
                "Company": "VOYA Group N.V."
              },
              {
                "Ticker": "IT",
                "Company": "Gartner Inc"
              },
              {
                "Ticker": "ITCB",
                "Company": "Itau Corpbanca"
              },
              {
                "Ticker": "ITG",
                "Company": "Investment Technology Group"
              },
              {
                "Ticker": "ITGR",
                "Company": "Integer Holdings Corp"
              },
              {
                "Ticker": "ITT",
                "Company": "ITT Industries"
              },
              {
                "Ticker": "ITUB",
                "Company": "Itau Unibanco Banco Holding S.A."
              },
              {
                "Ticker": "ITW",
                "Company": "Illinois Tool Works Inc"
              },
              {
                "Ticker": "IVC",
                "Company": "Invacare Corp"
              },
              {
                "Ticker": "IVH",
                "Company": "Ivy High Income Opportunities"
              },
              {
                "Ticker": "IVR",
                "Company": "Invesco Mortgage Capital Inc"
              },
              {
                "Ticker": "IVR-A",
                "Company": "Invesco Mortgage Capital Inc"
              },
              {
                "Ticker": "IVR-B",
                "Company": "Invesco Mortgage Capital Inc"
              },
              {
                "Ticker": "IVR-C",
                "Company": "Invesco Mortgage Capital Inc Pfd Fxd/Fltg Ser C"
              },
              {
                "Ticker": "IVZ",
                "Company": "Invesco Plc"
              },
              {
                "Ticker": "IX",
                "Company": "Orix Corp ADR"
              },
              {
                "Ticker": "JAG",
                "Company": "Jagged Peak Energy Inc"
              },
              {
                "Ticker": "JAX",
                "Company": "J. Alexander's Holdings Inc C"
              },
              {
                "Ticker": "JBGS",
                "Company": "Jbg Smith Properties"
              },
              {
                "Ticker": "JBK",
                "Company": "Lehman Abs Corp"
              },
              {
                "Ticker": "JBL",
                "Company": "Jabil Circuit"
              },
              {
                "Ticker": "JBN",
                "Company": "Select Asset Inc"
              },
              {
                "Ticker": "JBR",
                "Company": "Select Asset Inc"
              },
              {
                "Ticker": "JBT",
                "Company": "John Bean Technologies Corp"
              },
              {
                "Ticker": "JCA-B",
                "Company": "Jernigan Capital Inc Pfd Ser B"
              },
              {
                "Ticker": "JCAP",
                "Company": "Jernigan Capital Inc"
              },
              {
                "Ticker": "JCE",
                "Company": "Nuveen Core Equity Alpha Fund"
              },
              {
                "Ticker": "JCI",
                "Company": "Johnson Controls Intl"
              },
              {
                "Ticker": "JCO",
                "Company": "Nuveen Credit Opportunities 2022 Target Term Fun"
              },
              {
                "Ticker": "JCP",
                "Company": "J.C. Penney Company Inc"
              },
              {
                "Ticker": "JDD",
                "Company": "Nuveen Diversified Dividend and"
              },
              {
                "Ticker": "JE",
                "Company": "Just Energy Group Inc"
              },
              {
                "Ticker": "JE-A",
                "Company": "Just Energy Group Inc"
              },
              {
                "Ticker": "JEC",
                "Company": "Jacobs Engineering Group Inc"
              },
              {
                "Ticker": "JEF",
                "Company": "Jefferies Financial Group Inc"
              },
              {
                "Ticker": "JELD",
                "Company": "Jeld-Wen Holding Inc"
              },
              {
                "Ticker": "JEMD",
                "Company": "Nuveen Emerging Markets Debt 2022 Target Term Fu"
              },
              {
                "Ticker": "JEQ",
                "Company": "Japan Equity Fund"
              },
              {
                "Ticker": "JFR",
                "Company": "Nuveen Floating Rate"
              },
              {
                "Ticker": "JGH",
                "Company": "Nuveen Global High Income Fund"
              },
              {
                "Ticker": "JHA",
                "Company": "Nuveen High Income December"
              },
              {
                "Ticker": "JHB",
                "Company": "Nuveen High Income November 2021 Target Term Fun"
              },
              {
                "Ticker": "JHD",
                "Company": "Nuveen High Income December 2019 Target Term Fun"
              },
              {
                "Ticker": "JHG",
                "Company": "Janus Henderson Group Plc"
              },
              {
                "Ticker": "JHI",
                "Company": "John Hancock Investors Trust"
              },
              {
                "Ticker": "JHS",
                "Company": "John Hancock Income Securities Trust"
              },
              {
                "Ticker": "JHX",
                "Company": "James Hardie Industries Se"
              },
              {
                "Ticker": "JHY",
                "Company": "Nuveen High Income 2020 Target"
              },
              {
                "Ticker": "JILL",
                "Company": "J. Jill Inc"
              },
              {
                "Ticker": "JKS",
                "Company": "Jinkosolar Holding Company Ltd"
              },
              {
                "Ticker": "JLL",
                "Company": "Jones Lang Lasalle Inc"
              },
              {
                "Ticker": "JLS",
                "Company": "Nuveen Mortgage Opportunity Term Fund"
              },
              {
                "Ticker": "JMEI",
                "Company": "Jumei International Holding Ltd"
              },
              {
                "Ticker": "JMF",
                "Company": "Nuveen Energy MLP Total Return Fund"
              },
              {
                "Ticker": "JMLP",
                "Company": "Nuveen All Cap Energy MLP Oppo"
              },
              {
                "Ticker": "JMM",
                "Company": "Nuveen Multi-Market Income Fund Inc"
              },
              {
                "Ticker": "JMP",
                "Company": "JMP Group Inc"
              },
              {
                "Ticker": "JMPB",
                "Company": "JMP Group Inc"
              },
              {
                "Ticker": "JMPD",
                "Company": "JMP Group Llc 7.25% Senior Notes Due 2027"
              },
              {
                "Ticker": "JMT",
                "Company": "Nuven Mortgage Opportunity Term Fund 2"
              },
              {
                "Ticker": "JNJ",
                "Company": "Johnson & Johnson"
              },
              {
                "Ticker": "JNPR",
                "Company": "Juniper Networks"
              },
              {
                "Ticker": "JOE",
                "Company": "St. Joe Company"
              },
              {
                "Ticker": "JOF",
                "Company": "Japan Smaller Capitalization Fund Inc"
              },
              {
                "Ticker": "JONE",
                "Company": "Jones Energy Inc"
              },
              {
                "Ticker": "JP",
                "Company": "Jupai Holdings Ltd"
              },
              {
                "Ticker": "JPC",
                "Company": "Nuveen Preferred and Convertible"
              },
              {
                "Ticker": "JPI",
                "Company": "Nuveen Preferred and Income Term Fund"
              },
              {
                "Ticker": "JPM",
                "Company": "JP Morgan Chase & Co"
              },
              {
                "Ticker": "JPM-A",
                "Company": "JP Morgan Chase & Co"
              },
              {
                "Ticker": "JPM-B",
                "Company": "Jpmorgan Chase & Co. 6.70%"
              },
              {
                "Ticker": "JPM-D",
                "Company": "Jpmorgan Chase & Co Depositary Shs Repstg 1/400T"
              },
              {
                "Ticker": "JPM-E",
                "Company": "Jpmorgan Chase & Co"
              },
              {
                "Ticker": "JPM-F",
                "Company": "J P Morgan Chase & Co Depositar"
              },
              {
                "Ticker": "JPM-G",
                "Company": "J P Morgan Chase & Co Depositar"
              },
              {
                "Ticker": "JPM-H",
                "Company": "Jpmorgan Chase & Co"
              },
              {
                "Ticker": "JPM.W",
                "Company": "JP Morgan Chase & Co"
              },
              {
                "Ticker": "JPS",
                "Company": "Nuveen Quality Preferred 2"
              },
              {
                "Ticker": "JPT",
                "Company": "Nuveen Preferred and Income 2022 Term Fund"
              },
              {
                "Ticker": "JQC",
                "Company": "Nuveen Preferred and Convertible 2"
              },
              {
                "Ticker": "JRI",
                "Company": "Nuveen Real Asset Income and Gr"
              },
              {
                "Ticker": "JRO",
                "Company": "Nuveen Floating Rate Income Opportuntiy"
              },
              {
                "Ticker": "JRS",
                "Company": "Nuveen Real Estate Fund"
              },
              {
                "Ticker": "JSD",
                "Company": "Nuveen Short Duration Credit O"
              },
              {
                "Ticker": "JT",
                "Company": "Jianpu Technology Inc"
              },
              {
                "Ticker": "JTA",
                "Company": "Nuveen Tax-Advantaged Total Return"
              },
              {
                "Ticker": "JTD",
                "Company": "Nuveen Tax-Advantaged Dividend Growth"
              },
              {
                "Ticker": "JW.A",
                "Company": "John Wiley Sons Cl A"
              },
              {
                "Ticker": "JW.B",
                "Company": "John Wiley Sons Cl B"
              },
              {
                "Ticker": "JWN",
                "Company": "Nordstrom"
              },
              {
                "Ticker": "K",
                "Company": "Kellogg Company"
              },
              {
                "Ticker": "KAI",
                "Company": "Kadant Inc"
              },
              {
                "Ticker": "KAMN",
                "Company": "Kaman Corp"
              },
              {
                "Ticker": "KAP",
                "Company": "Kcap Financial Inc"
              },
              {
                "Ticker": "KAR",
                "Company": "Kar Auction Services Inc"
              },
              {
                "Ticker": "KB",
                "Company": "KB Financial Group Inc"
              },
              {
                "Ticker": "KBH",
                "Company": "KB Home"
              },
              {
                "Ticker": "KBR",
                "Company": "KBR Inc"
              },
              {
                "Ticker": "KDMN",
                "Company": "Kadmon Holdings Llc"
              },
              {
                "Ticker": "KDP",
                "Company": "Keurig Dr Pepper Inc"
              },
              {
                "Ticker": "KEG",
                "Company": "Key Energy Services Inc"
              },
              {
                "Ticker": "KEM",
                "Company": "Kemet Corp"
              },
              {
                "Ticker": "KEN",
                "Company": "Kenon Holdings Ltd Ordinary Sh"
              },
              {
                "Ticker": "KEP",
                "Company": "Korea Electric Power Corp"
              },
              {
                "Ticker": "KEX",
                "Company": "Kirby Corp"
              },
              {
                "Ticker": "KEY",
                "Company": "Keycorp"
              },
              {
                "Ticker": "KEY-I",
                "Company": "Keycorp Pref Share"
              },
              {
                "Ticker": "KEY-J",
                "Company": "Keycorp Dep Shs Repstg 1/40Th Perp Pfd Ser F"
              },
              {
                "Ticker": "KEYS",
                "Company": "Keysight Technologies Inc Comm"
              },
              {
                "Ticker": "KF",
                "Company": "Korea Fund"
              },
              {
                "Ticker": "KFS",
                "Company": "Kingsway Financial Services"
              },
              {
                "Ticker": "KFY",
                "Company": "Korn/Ferry International"
              },
              {
                "Ticker": "KGC",
                "Company": "Kinross Gold Corp"
              },
              {
                "Ticker": "KIM",
                "Company": "Kimco Realty Corp"
              },
              {
                "Ticker": "KIM-I",
                "Company": "Kimco Realty Corporation Deposi"
              },
              {
                "Ticker": "KIM-J",
                "Company": "Kimco Realty Corporation Class"
              },
              {
                "Ticker": "KIM-K",
                "Company": "Kimco Realty Corporation Class"
              },
              {
                "Ticker": "KIM-L",
                "Company": "Kimco Realty Corp Dep Shs Repstg 1/1000Th Pfd Cl"
              },
              {
                "Ticker": "KIM-M",
                "Company": "Kimco Realty Corp Dep Shs Repstg 1/1000 Shs Cl M"
              },
              {
                "Ticker": "KIO",
                "Company": "KKR Income Opportunities Fund"
              },
              {
                "Ticker": "KKR",
                "Company": "KKR & Co. LP"
              },
              {
                "Ticker": "KKR-A",
                "Company": "KKR & Co. LP Prf"
              },
              {
                "Ticker": "KKR-B",
                "Company": "KKR & Co. LP"
              },
              {
                "Ticker": "KL",
                "Company": "Kirkland Lake Gold Ltd"
              },
              {
                "Ticker": "KMB",
                "Company": "Kimberly-Clark Corp"
              },
              {
                "Ticker": "KMF",
                "Company": "Kayne Anderson Midstream Energy Fund"
              },
              {
                "Ticker": "KMG",
                "Company": "KMG Chemicals"
              },
              {
                "Ticker": "KMI",
                "Company": "Kinder Morgan"
              },
              {
                "Ticker": "KMI-A",
                "Company": "Kinder Morgan Inc"
              },
              {
                "Ticker": "KMM",
                "Company": "Scudder Multi-Market Income Trust"
              },
              {
                "Ticker": "KMPA",
                "Company": "Kemper Corporation 7.375% Subor"
              },
              {
                "Ticker": "KMPR",
                "Company": "Kemper Corp"
              },
              {
                "Ticker": "KMT",
                "Company": "Kennametal Inc"
              },
              {
                "Ticker": "KMX",
                "Company": "Carmax Inc"
              },
              {
                "Ticker": "KN",
                "Company": "Knowles Corp"
              },
              {
                "Ticker": "KNL",
                "Company": "Knoll Inc"
              },
              {
                "Ticker": "KNOP",
                "Company": "Knot Offshore Partners LP"
              },
              {
                "Ticker": "KNX",
                "Company": "Knight-Swift Transporation Inc"
              },
              {
                "Ticker": "KO",
                "Company": "Coca-Cola Company"
              },
              {
                "Ticker": "KODK",
                "Company": "Eastman Kodak"
              },
              {
                "Ticker": "KOF",
                "Company": "Coca Cola Femsa S.A.B. De C.V."
              },
              {
                "Ticker": "KOP",
                "Company": "Koppers Holdings Inc"
              },
              {
                "Ticker": "KORS",
                "Company": "Michael Kors Holdings Ltd"
              },
              {
                "Ticker": "KOS",
                "Company": "Kosmos Energy Ltd"
              },
              {
                "Ticker": "KR",
                "Company": "Kroger Company"
              },
              {
                "Ticker": "KRA",
                "Company": "Kraton Performance Polymers Inc"
              },
              {
                "Ticker": "KRC",
                "Company": "Kilroy Realty Corp"
              },
              {
                "Ticker": "KREF",
                "Company": "KKR Real Estate Finance Trust Inc"
              },
              {
                "Ticker": "KRG",
                "Company": "Kite Realty Group Trust"
              },
              {
                "Ticker": "KRO",
                "Company": "Kronos Worldwide Inc"
              },
              {
                "Ticker": "KRP",
                "Company": "Kimbell Royalty Partners"
              },
              {
                "Ticker": "KS",
                "Company": "Kapstone Paper and Packaging Corp"
              },
              {
                "Ticker": "KSM",
                "Company": "Scudder Strategic Municiple Income Trust"
              },
              {
                "Ticker": "KSS",
                "Company": "Kohl's Corp"
              },
              {
                "Ticker": "KST",
                "Company": "Scudder Strategic Income Trust"
              },
              {
                "Ticker": "KSU",
                "Company": "Kansas City Southern"
              },
              {
                "Ticker": "KSU.P",
                "Company": "Kansas Cty Sthn 4%"
              },
              {
                "Ticker": "KT",
                "Company": "Korea Telecom Corp"
              },
              {
                "Ticker": "KTF",
                "Company": "Scudder Municiple Income Trust"
              },
              {
                "Ticker": "KTH",
                "Company": "Lehman Abs Corp"
              },
              {
                "Ticker": "KTN",
                "Company": "Lehman Abs Corp"
              },
              {
                "Ticker": "KTP",
                "Company": "Lehman Abs Corp"
              },
              {
                "Ticker": "KW",
                "Company": "Kennedy-Wilson Holdings Inc"
              },
              {
                "Ticker": "KWR",
                "Company": "Quaker Chemical Corp"
              },
              {
                "Ticker": "KYN",
                "Company": "Kayne Anderson MLP Investment Company"
              },
              {
                "Ticker": "KYN-F",
                "Company": "Kayne Anderson MLP Investment"
              },
              {
                "Ticker": "L",
                "Company": "Loews Corp"
              },
              {
                "Ticker": "LAC",
                "Company": "Lithium Americas Corp"
              },
              {
                "Ticker": "LAD",
                "Company": "Lithia Motors"
              },
              {
                "Ticker": "LADR",
                "Company": "Ladder Capital Corp"
              },
              {
                "Ticker": "LAIX",
                "Company": "Laix Inc. ADR"
              },
              {
                "Ticker": "LAZ",
                "Company": "Lazard Ltd"
              },
              {
                "Ticker": "LB",
                "Company": "L Brands Inc"
              },
              {
                "Ticker": "LBRT",
                "Company": "Liberty Oilfield Services Inc"
              },
              {
                "Ticker": "LC",
                "Company": "Lendingclub Corp"
              },
              {
                "Ticker": "LCI",
                "Company": "Lannett Co Inc"
              },
              {
                "Ticker": "LCII",
                "Company": "Lci Industries"
              },
              {
                "Ticker": "LDF",
                "Company": "Latin American Discovery Fund"
              },
              {
                "Ticker": "LDL",
                "Company": "Lydall Inc"
              },
              {
                "Ticker": "LDOS",
                "Company": "Leidos Holdings Inc"
              },
              {
                "Ticker": "LDP",
                "Company": "Cohen & Steers Ltd Duration Prfd Income Fund"
              },
              {
                "Ticker": "LEA",
                "Company": "Lear Corp"
              },
              {
                "Ticker": "LEAF",
                "Company": "Leaf Group Ltd"
              },
              {
                "Ticker": "LEE",
                "Company": "Lee Enterprises Inc"
              },
              {
                "Ticker": "LEG",
                "Company": "Leggett & Platt Inc"
              },
              {
                "Ticker": "LEJU",
                "Company": "Leju Holdings Ltd"
              },
              {
                "Ticker": "LEN",
                "Company": "Lennar Corp"
              },
              {
                "Ticker": "LEN.B",
                "Company": "Lennar Corp Cl B"
              },
              {
                "Ticker": "LEO",
                "Company": "Dreyfus Strategic Municipals"
              },
              {
                "Ticker": "LFC",
                "Company": "China Life Insurance Company Ltd"
              },
              {
                "Ticker": "LGC",
                "Company": "Legacy Acquisition Corp"
              },
              {
                "Ticker": "LGC.U",
                "Company": "Legacy Acquisition Corp Units"
              },
              {
                "Ticker": "LGC.W",
                "Company": "Legacy Acquisition Corp. WT"
              },
              {
                "Ticker": "LGF.A",
                "Company": "Lions Gate Entertainment Corp Cl A"
              },
              {
                "Ticker": "LGF.B",
                "Company": "Lions Gate Entertainment Corp Cl B"
              },
              {
                "Ticker": "LGI",
                "Company": "Lazard Global Total Return and"
              },
              {
                "Ticker": "LH",
                "Company": "Laboratory Corporation of America Holdings"
              },
              {
                "Ticker": "LHC",
                "Company": "Leo Holdings Corp. Class A"
              },
              {
                "Ticker": "LHC.U",
                "Company": "Leo Holdings Corp. Units Each Consisting of One"
              },
              {
                "Ticker": "LHC.W",
                "Company": "Leo Holdings Corp Warrants"
              },
              {
                "Ticker": "LHO",
                "Company": "Lasalle Hotel Properties"
              },
              {
                "Ticker": "LHO-I",
                "Company": "Lasalle Hotel Properties"
              },
              {
                "Ticker": "LHO-J",
                "Company": "Lasalle Hotel Properties"
              },
              {
                "Ticker": "LII",
                "Company": "Lennox International"
              },
              {
                "Ticker": "LITB",
                "Company": "Lightinthebox Holding Co. Ltd"
              },
              {
                "Ticker": "LKM",
                "Company": "Link Motion Inc"
              },
              {
                "Ticker": "LKSD",
                "Company": "Lsc Communications Inc"
              },
              {
                "Ticker": "LL",
                "Company": "Lumber Liquidators Holdings Inc"
              },
              {
                "Ticker": "LLL",
                "Company": "L-3 Communications Holdings"
              },
              {
                "Ticker": "LLY",
                "Company": "Eli Lilly and Company"
              },
              {
                "Ticker": "LM",
                "Company": "Legg Mason Inc"
              },
              {
                "Ticker": "LMHA",
                "Company": "Legg Mason Inc"
              },
              {
                "Ticker": "LMHB",
                "Company": "Legg Mason Inc"
              },
              {
                "Ticker": "LMT",
                "Company": "Lockheed Martin Corp"
              },
              {
                "Ticker": "LN",
                "Company": "Line Corp"
              },
              {
                "Ticker": "LNC",
                "Company": "Lincoln National Corp"
              },
              {
                "Ticker": "LNC.W",
                "Company": "Lincoln National Corp"
              },
              {
                "Ticker": "LND",
                "Company": "Brasilagro Brazi ADR"
              },
              {
                "Ticker": "LNN",
                "Company": "Lindsay Corp"
              },
              {
                "Ticker": "LNT",
                "Company": "Alliant Energy Corp"
              },
              {
                "Ticker": "LOMA",
                "Company": "Loma Negra Comp Indu Argentina Sociedad ADR"
              },
              {
                "Ticker": "LOR",
                "Company": "Lazard World Dividend &"
              },
              {
                "Ticker": "LOW",
                "Company": "Lowe's Companies"
              },
              {
                "Ticker": "LPG",
                "Company": "Dorian Lpg Ltd"
              },
              {
                "Ticker": "LPI",
                "Company": "Laredo Petroleum Holdings Inc"
              },
              {
                "Ticker": "LPL",
                "Company": "Lg Display Co. Ltd"
              },
              {
                "Ticker": "LPT",
                "Company": "Liberty Property Trust"
              },
              {
                "Ticker": "LPX",
                "Company": "Louisiana-Pacific Corp"
              },
              {
                "Ticker": "LRN",
                "Company": "K12 Inc"
              },
              {
                "Ticker": "LSI",
                "Company": "Life Storage"
              },
              {
                "Ticker": "LTC",
                "Company": "Ltc Properties"
              },
              {
                "Ticker": "LTM",
                "Company": "Latam Airlines Group S.A."
              },
              {
                "Ticker": "LTN",
                "Company": "Union Acquisition Corp"
              },
              {
                "Ticker": "LTN.P",
                "Company": "Union Acquisition Corp Rights"
              },
              {
                "Ticker": "LTN.U",
                "Company": "Union Acquisition Corp"
              },
              {
                "Ticker": "LTN.W",
                "Company": "Union Acquisition Corp. Warrant"
              },
              {
                "Ticker": "LUB",
                "Company": "Luby's Inc"
              },
              {
                "Ticker": "LUV",
                "Company": "Southwest Airlines Company"
              },
              {
                "Ticker": "LVS",
                "Company": "Las Vegas Sands"
              },
              {
                "Ticker": "LW",
                "Company": "Lamb Weston Holdings Inc"
              },
              {
                "Ticker": "LXFR",
                "Company": "Luxfer Holdings Plc"
              },
              {
                "Ticker": "LXFT",
                "Company": "Luxoft Holding Inc"
              },
              {
                "Ticker": "LXP",
                "Company": "Lexington Realty Trust"
              },
              {
                "Ticker": "LXP-C",
                "Company": "Lexington Realty Tru"
              },
              {
                "Ticker": "LXU",
                "Company": "Lsb Industries Inc"
              },
              {
                "Ticker": "LYB",
                "Company": "Lyondellbasell Industries Nv"
              },
              {
                "Ticker": "LYG",
                "Company": "Lloyds Banking Group Plc"
              },
              {
                "Ticker": "LYV",
                "Company": "Live Nation Entertainment"
              },
              {
                "Ticker": "LZB",
                "Company": "La-Z-Boy Inc"
              },
              {
                "Ticker": "M",
                "Company": "Macy's Inc"
              },
              {
                "Ticker": "MA",
                "Company": "Mastercard Inc"
              },
              {
                "Ticker": "MAA",
                "Company": "Mid-America Apartment Communities"
              },
              {
                "Ticker": "MAA-I",
                "Company": "Mid-America Apt Communities Inc"
              },
              {
                "Ticker": "MAC",
                "Company": "Macerich Company"
              },
              {
                "Ticker": "MAIN",
                "Company": "Main Street Capital Corp"
              },
              {
                "Ticker": "MAN",
                "Company": "Manpower Inc"
              },
              {
                "Ticker": "MANU",
                "Company": "Manchester United Ltd"
              },
              {
                "Ticker": "MAS",
                "Company": "Masco Corp"
              },
              {
                "Ticker": "MATX",
                "Company": "Matson Inc"
              },
              {
                "Ticker": "MAV",
                "Company": "Pioneer Muni High Income Advantage Trust"
              },
              {
                "Ticker": "MAXR",
                "Company": "Maxar Technologies Ltd"
              },
              {
                "Ticker": "MBI",
                "Company": "MBIA Inc"
              },
              {
                "Ticker": "MBT",
                "Company": "Mobile Telesystems"
              },
              {
                "Ticker": "MC",
                "Company": "Moelis"
              },
              {
                "Ticker": "MCA",
                "Company": "Blackrock Muniyield California Insured Fund"
              },
              {
                "Ticker": "MCB",
                "Company": "Metropolitan Bank Holding Corp"
              },
              {
                "Ticker": "MCC",
                "Company": "Medley Capital Corp"
              },
              {
                "Ticker": "MCD",
                "Company": "McDonald's Corp"
              },
              {
                "Ticker": "MCI",
                "Company": "Massmutual Corporate Investors"
              },
              {
                "Ticker": "MCK",
                "Company": "Mckesson Corp"
              },
              {
                "Ticker": "MCN",
                "Company": "Madison/Claymore Covered Call & Equity Strategy"
              },
              {
                "Ticker": "MCO",
                "Company": "Moody's Corp"
              },
              {
                "Ticker": "MCR",
                "Company": "MFS Charter Income Trust"
              },
              {
                "Ticker": "MCRN",
                "Company": "Milacron Holdings Corp"
              },
              {
                "Ticker": "MCS",
                "Company": "Marcus Corp"
              },
              {
                "Ticker": "MCV",
                "Company": "Medley Capital Corp"
              },
              {
                "Ticker": "MCX",
                "Company": "Medley Capital Corp"
              },
              {
                "Ticker": "MCY",
                "Company": "Mercury General Corp"
              },
              {
                "Ticker": "MD",
                "Company": "Mednax Inc"
              },
              {
                "Ticker": "MDC",
                "Company": "M.D.C. Holdings"
              },
              {
                "Ticker": "MDLQ",
                "Company": "Medley Llc 7.25% Notes Due 2024"
              },
              {
                "Ticker": "MDLX",
                "Company": "Medley Llc"
              },
              {
                "Ticker": "MDLY",
                "Company": "Medley Management Inc"
              },
              {
                "Ticker": "MDP",
                "Company": "Meredith Corp"
              },
              {
                "Ticker": "MDR",
                "Company": "McDermott International"
              },
              {
                "Ticker": "MDT",
                "Company": "Medtronic Inc"
              },
              {
                "Ticker": "MDU",
                "Company": "Mdu Res Group Inc"
              },
              {
                "Ticker": "MED",
                "Company": "Medifast Inc"
              },
              {
                "Ticker": "MEI",
                "Company": "Methode Electronics"
              },
              {
                "Ticker": "MEN",
                "Company": "Blackrock Munienhanced Fund"
              },
              {
                "Ticker": "MER-K",
                "Company": "ML 6.45% Trust Pfd"
              },
              {
                "Ticker": "MET",
                "Company": "Metlife Inc"
              },
              {
                "Ticker": "MET-A",
                "Company": "Metlife Pfd A Fltg"
              },
              {
                "Ticker": "MET-E",
                "Company": "Metlife Inc Pfd"
              },
              {
                "Ticker": "MFA",
                "Company": "MFA Financial Inc"
              },
              {
                "Ticker": "MFA-B",
                "Company": "MFA Financial Inc"
              },
              {
                "Ticker": "MFA.U",
                "Company": "Megalith Financial Acquisition Corp. Units"
              },
              {
                "Ticker": "MFA.W",
                "Company": "Megalith Financial Acquisition Corp Warrants"
              },
              {
                "Ticker": "MFAC",
                "Company": "Megalith Financial Acquisition Corp. Class A"
              },
              {
                "Ticker": "MFC",
                "Company": "Manulife Financial Corp"
              },
              {
                "Ticker": "MFCB",
                "Company": "Mfc Industrial Ltd"
              },
              {
                "Ticker": "MFD",
                "Company": "Macquarie/First Trust Global"
              },
              {
                "Ticker": "MFG",
                "Company": "Mizuho Financial Group"
              },
              {
                "Ticker": "MFGP",
                "Company": "Micro Focus Intl Plc"
              },
              {
                "Ticker": "MFL",
                "Company": "Blackrock Muniholdings Investment Quality Fund"
              },
              {
                "Ticker": "MFM",
                "Company": "MFS Muni Income Trust"
              },
              {
                "Ticker": "MFO",
                "Company": "MFA Financial Inc"
              },
              {
                "Ticker": "MFT",
                "Company": "Blackrock Muniyield Investment Qualityfund"
              },
              {
                "Ticker": "MFV",
                "Company": "MFS Special Value Trust"
              },
              {
                "Ticker": "MG",
                "Company": "Mistras Group Inc"
              },
              {
                "Ticker": "MGA",
                "Company": "Magna International"
              },
              {
                "Ticker": "MGF",
                "Company": "MFS Government Markets Income Trust"
              },
              {
                "Ticker": "MGM",
                "Company": "MGM Resorts International"
              },
              {
                "Ticker": "MGP",
                "Company": "MGM Growth Properties Llc"
              },
              {
                "Ticker": "MGU",
                "Company": "Macquarie Global Infrastructure Total Return Fun"
              },
              {
                "Ticker": "MGY",
                "Company": "Magnolia Oil & Gas Corp"
              },
              {
                "Ticker": "MGY.W",
                "Company": "Magnolia Oil & Gas Corp. Warrant"
              },
              {
                "Ticker": "MH-A",
                "Company": "Maiden Holdings Ltd 8.25%"
              },
              {
                "Ticker": "MH-C",
                "Company": "Maiden Holdings North America"
              },
              {
                "Ticker": "MH-D",
                "Company": "Maiden Holdings Ltd Pref Ser D"
              },
              {
                "Ticker": "MHD",
                "Company": "Blackrock Muniholdings Fund"
              },
              {
                "Ticker": "MHE",
                "Company": "Massachusetts Health and Education Tax-Exempt TR"
              },
              {
                "Ticker": "MHF",
                "Company": "Western Asset Muni High"
              },
              {
                "Ticker": "MHI",
                "Company": "Pioneer Muni High Income Trust"
              },
              {
                "Ticker": "MHK",
                "Company": "Mohawk Industries"
              },
              {
                "Ticker": "MHLA",
                "Company": "Maiden Holdings Ltd 6.625% No"
              },
              {
                "Ticker": "MHN",
                "Company": "Blackrock Muniholdings New York Quality Fund"
              },
              {
                "Ticker": "MHNC",
                "Company": "Maiden Holdings North America"
              },
              {
                "Ticker": "MHO",
                "Company": "M/I Homes"
              },
              {
                "Ticker": "MIC",
                "Company": "Macquarie Infrastructure Company Trust"
              },
              {
                "Ticker": "MIE",
                "Company": "Cohen & Steers MLP Income and"
              },
              {
                "Ticker": "MIN",
                "Company": "MFS Intermediate Income Trust"
              },
              {
                "Ticker": "MIT-A",
                "Company": "Ag Mortgage Investment Trust"
              },
              {
                "Ticker": "MIT-B",
                "Company": "Ag Mortgage Investment Trust I"
              },
              {
                "Ticker": "MITT",
                "Company": "Ag Mortgage Investment Trust"
              },
              {
                "Ticker": "MIXT",
                "Company": "Mix Telematics Ltd"
              },
              {
                "Ticker": "MIY",
                "Company": "Blackrock Muniyield Michigan Quality Fund"
              },
              {
                "Ticker": "MKC",
                "Company": "Mccormick & Company Inc"
              },
              {
                "Ticker": "MKC.V",
                "Company": "Mccormick & Company Inc"
              },
              {
                "Ticker": "MKL",
                "Company": "Markel Corp"
              },
              {
                "Ticker": "MLI",
                "Company": "Mueller Industries"
              },
              {
                "Ticker": "MLM",
                "Company": "Martin Marietta Materials"
              },
              {
                "Ticker": "MLP",
                "Company": "Maui Land & Pineapple Company"
              },
              {
                "Ticker": "MLR",
                "Company": "Miller Industries"
              },
              {
                "Ticker": "MMC",
                "Company": "Marsh & Mclennan Companies"
              },
              {
                "Ticker": "MMD",
                "Company": "Mainstay Defined Muni Opp Fund"
              },
              {
                "Ticker": "MMI",
                "Company": "Marcus & Millichap"
              },
              {
                "Ticker": "MMM",
                "Company": "3M Company"
              },
              {
                "Ticker": "MMP",
                "Company": "Magellan Midstream Partners LP"
              },
              {
                "Ticker": "MMS",
                "Company": "Maximus Inc"
              },
              {
                "Ticker": "MMT",
                "Company": "MFS Multimarket Income Trust"
              },
              {
                "Ticker": "MMU",
                "Company": "Western Asset Managed Municipals Fund"
              },
              {
                "Ticker": "MN",
                "Company": "Manning & Napier Inc"
              },
              {
                "Ticker": "MNE",
                "Company": "Blackrock Muni New York Intermediate Duration Fu"
              },
              {
                "Ticker": "MNK",
                "Company": "Mallinckrodt Plc Ordinary Share"
              },
              {
                "Ticker": "MNP",
                "Company": "Western Asset Muni Partners Fund"
              },
              {
                "Ticker": "MNR",
                "Company": "Monmouth Real Estate Investment Corp"
              },
              {
                "Ticker": "MNR-C",
                "Company": "Monmouth Real Estate Investment Group"
              },
              {
                "Ticker": "MO",
                "Company": "Altria Group"
              },
              {
                "Ticker": "MOD",
                "Company": "Modine Manufacturing Company"
              },
              {
                "Ticker": "MODN",
                "Company": "Model N Inc"
              },
              {
                "Ticker": "MOG.A",
                "Company": "Moog Inc Cl A"
              },
              {
                "Ticker": "MOG.B",
                "Company": "Moog Inc Cl B"
              },
              {
                "Ticker": "MOH",
                "Company": "Molina Healthcare Inc"
              },
              {
                "Ticker": "MOS",
                "Company": "Mosaic Company"
              },
              {
                "Ticker": "MOS.U",
                "Company": "Mosaic Acquisition Corp"
              },
              {
                "Ticker": "MOS.W",
                "Company": "Mosaic Acquisition Corp. WT"
              },
              {
                "Ticker": "MOSC",
                "Company": "Mosaic Acquisition Corp"
              },
              {
                "Ticker": "MOV",
                "Company": "Movado Group Inc"
              },
              {
                "Ticker": "MP-D",
                "Company": "Mississippi Pr 5.25"
              },
              {
                "Ticker": "MPA",
                "Company": "Blackrock Muniyield Pennsylvania Quality Fund"
              },
              {
                "Ticker": "MPC",
                "Company": "Marathon Petroleum Corp"
              },
              {
                "Ticker": "MPLX",
                "Company": "Mplx LP"
              },
              {
                "Ticker": "MPO",
                "Company": "Midstates Petroleum Company Inc"
              },
              {
                "Ticker": "MPV",
                "Company": "Massmutual Participation Investors"
              },
              {
                "Ticker": "MPW",
                "Company": "Medical Properties Trust"
              },
              {
                "Ticker": "MPX",
                "Company": "Marine Products Corp"
              },
              {
                "Ticker": "MQT",
                "Company": "Blackrock Muniyield Quality Fund II"
              },
              {
                "Ticker": "MQY",
                "Company": "Blackrock Muniyield Quality Fund"
              },
              {
                "Ticker": "MRC",
                "Company": "Mrc Global Inc"
              },
              {
                "Ticker": "MRK",
                "Company": "Merck & Company"
              },
              {
                "Ticker": "MRO",
                "Company": "Marathon Oil Corp"
              },
              {
                "Ticker": "MRT",
                "Company": "Medequities Realty Trust Inc"
              },
              {
                "Ticker": "MS",
                "Company": "Morgan Stanley"
              },
              {
                "Ticker": "MS-A",
                "Company": "Morgan Stanley Prfd 'A'"
              },
              {
                "Ticker": "MS-E",
                "Company": "Morgan Stanley"
              },
              {
                "Ticker": "MS-F",
                "Company": "Morgan Stanley"
              },
              {
                "Ticker": "MS-G",
                "Company": "Morgan Stanley 6.625%"
              },
              {
                "Ticker": "MS-I",
                "Company": "Morgan Stanley"
              },
              {
                "Ticker": "MS-K",
                "Company": "Morgan Stanley Dep Shs Repstg 1/1000Th Sh Non-Cu"
              },
              {
                "Ticker": "MSA",
                "Company": "Msa Safety Inc"
              },
              {
                "Ticker": "MSB",
                "Company": "Mesabi Trust"
              },
              {
                "Ticker": "MSCI",
                "Company": "MSCI Inc"
              },
              {
                "Ticker": "MSD",
                "Company": "Morgan Stanley Emerging Markets Debt"
              },
              {
                "Ticker": "MSF",
                "Company": "Morgan Stanley Emerging Markets Fund Inc"
              },
              {
                "Ticker": "MSG",
                "Company": "The Madison Square Garden Comp"
              },
              {
                "Ticker": "MSGN",
                "Company": "Msg Networks Inc"
              },
              {
                "Ticker": "MSI",
                "Company": "Motorola Solutions"
              },
              {
                "Ticker": "MSL",
                "Company": "Midsouth Bancorp"
              },
              {
                "Ticker": "MSM",
                "Company": "Msc Industrial Direct Company"
              },
              {
                "Ticker": "MSP",
                "Company": "Madison Strategic Sector Premium Fund"
              },
              {
                "Ticker": "MT",
                "Company": "Arcelormittal"
              },
              {
                "Ticker": "MTB",
                "Company": "M&T Bank Corp"
              },
              {
                "Ticker": "MTB-C",
                "Company": "M&T Bank Corporation Fixed Rate"
              },
              {
                "Ticker": "MTB.P",
                "Company": "M&T Bank Corporation Fixed Rate"
              },
              {
                "Ticker": "MTB.W",
                "Company": "M&T Bank Corporation Warrants"
              },
              {
                "Ticker": "MTD",
                "Company": "Mettler-Toledo International"
              },
              {
                "Ticker": "MTDR",
                "Company": "Matador Resources Company"
              },
              {
                "Ticker": "MTG",
                "Company": "Mgic Investment Corp"
              },
              {
                "Ticker": "MTH",
                "Company": "Meritage Corp"
              },
              {
                "Ticker": "MTL",
                "Company": "Mechel Oao"
              },
              {
                "Ticker": "MTL.P",
                "Company": "Mechel Steel Group Oao American"
              },
              {
                "Ticker": "MTN",
                "Company": "Vail Resorts"
              },
              {
                "Ticker": "MTOR",
                "Company": "Meritor Inc"
              },
              {
                "Ticker": "MTR",
                "Company": "Mesa Royalty Trust"
              },
              {
                "Ticker": "MTRN",
                "Company": "Materion Corp"
              },
              {
                "Ticker": "MTT",
                "Company": "Western Asset Muni Defined Opportunity Trust Inc"
              },
              {
                "Ticker": "MTW",
                "Company": "Manitowoc Company"
              },
              {
                "Ticker": "MTX",
                "Company": "Minerals Technologies Inc"
              },
              {
                "Ticker": "MTZ",
                "Company": "Mastec Inc"
              },
              {
                "Ticker": "MUA",
                "Company": "Blackrock Muniassets Fund"
              },
              {
                "Ticker": "MUC",
                "Company": "Blackrock Muniholdings California Quality Fund"
              },
              {
                "Ticker": "MUE",
                "Company": "Blackrock Muniholdings Quality Fund II"
              },
              {
                "Ticker": "MUFG",
                "Company": "Mitsubishi Ufj Financial Group Inc"
              },
              {
                "Ticker": "MUH",
                "Company": "Blackrock Muniholdings Fund II"
              },
              {
                "Ticker": "MUI",
                "Company": "Blackrock Muni Intermediate Duration Fund Inc"
              },
              {
                "Ticker": "MUJ",
                "Company": "Blackrock Muniholdings New Jersey Insured Fund"
              },
              {
                "Ticker": "MUR",
                "Company": "Murphy Oil Corp"
              },
              {
                "Ticker": "MUS",
                "Company": "Blackrock Muniholdings Quality Fund"
              },
              {
                "Ticker": "MUSA",
                "Company": "Murphy USA Inc"
              },
              {
                "Ticker": "MUX",
                "Company": "Mcewen Mining Inc"
              },
              {
                "Ticker": "MVC",
                "Company": "MVC Capital"
              },
              {
                "Ticker": "MVCD",
                "Company": "MVC Capital Inc 6.25% Senior Notes Due 2022"
              },
              {
                "Ticker": "MVF",
                "Company": "Munivest Fund"
              },
              {
                "Ticker": "MVO",
                "Company": "Mv Oil Trust"
              },
              {
                "Ticker": "MVT",
                "Company": "Blackrock Munivest Fund II"
              },
              {
                "Ticker": "MWA",
                "Company": "Mueller Water Products"
              },
              {
                "Ticker": "MX",
                "Company": "Magnachip Semiconductor Corp"
              },
              {
                "Ticker": "MXE",
                "Company": "Mexico Equity and"
              },
              {
                "Ticker": "MXF",
                "Company": "Mexico Fund"
              },
              {
                "Ticker": "MXL",
                "Company": "Maxlinear Inc"
              },
              {
                "Ticker": "MYC",
                "Company": "Blackrock Muniyield California Fund"
              },
              {
                "Ticker": "MYD",
                "Company": "Blackrock Muniyield Fund"
              },
              {
                "Ticker": "MYE",
                "Company": "Myers Industries"
              },
              {
                "Ticker": "MYF",
                "Company": "Blackrock Muniyield Investment Fund"
              },
              {
                "Ticker": "MYI",
                "Company": "Blackrock Muniyield Quality Fund III"
              },
              {
                "Ticker": "MYJ",
                "Company": "Blackrock Muniyield New Jersey Fund"
              },
              {
                "Ticker": "MYN",
                "Company": "Blackrock Muniyield New York Quality Fund"
              },
              {
                "Ticker": "MYOV",
                "Company": "Myovant Sciences Ltd"
              },
              {
                "Ticker": "MZA",
                "Company": "Muniyield Arizona Fund"
              },
              {
                "Ticker": "NAC",
                "Company": "Nuveen California Divadv Fund"
              },
              {
                "Ticker": "NAD",
                "Company": "Nuveen Divadv Fund"
              },
              {
                "Ticker": "NAN",
                "Company": "Nuveen New York Divadv Fund"
              },
              {
                "Ticker": "NAO",
                "Company": "Nordic American Offshore Ltd"
              },
              {
                "Ticker": "NAP",
                "Company": "Navios Maritime Midstream Partn"
              },
              {
                "Ticker": "NAT",
                "Company": "Nordic American Tanker Shipping Ltd"
              },
              {
                "Ticker": "NAV",
                "Company": "Navistar International Corp"
              },
              {
                "Ticker": "NAV-D",
                "Company": "Navistar Intl Pfd D"
              },
              {
                "Ticker": "NAZ",
                "Company": "Nuveen Arizona Premium Fund"
              },
              {
                "Ticker": "NBB",
                "Company": "Nuveen Build America Bond Fund"
              },
              {
                "Ticker": "NBD",
                "Company": "Nuveen Build America Bond Opportunity Fund"
              },
              {
                "Ticker": "NBHC",
                "Company": "National Bank Holdings Corp"
              },
              {
                "Ticker": "NBL",
                "Company": "Noble Energy Inc"
              },
              {
                "Ticker": "NBLX",
                "Company": "Noble Midstream Partners LP"
              },
              {
                "Ticker": "NBR",
                "Company": "Nabors Industries"
              },
              {
                "Ticker": "NBR-A",
                "Company": "Nabors Industries Ltd Pfd Conv Ser A"
              },
              {
                "Ticker": "NC",
                "Company": "Nacco Industries"
              },
              {
                "Ticker": "NCA",
                "Company": "Nuveen California Muni Value Fund"
              },
              {
                "Ticker": "NCB",
                "Company": "Nuveen California Muni Value Fund 2"
              },
              {
                "Ticker": "NCI",
                "Company": "Navigant Consulting"
              },
              {
                "Ticker": "NCLH",
                "Company": "Norwegian Cruise Ord"
              },
              {
                "Ticker": "NCR",
                "Company": "NCR Corp"
              },
              {
                "Ticker": "NCS",
                "Company": "NCI Building Systems"
              },
              {
                "Ticker": "NCV",
                "Company": "Agic Convertible &"
              },
              {
                "Ticker": "NCV-A",
                "Company": "Allianzgi Convertible & Income Fund Pfd Shs Ser"
              },
              {
                "Ticker": "NCZ",
                "Company": "Agic Convertible & II"
              },
              {
                "Ticker": "NCZ-A",
                "Company": "Allianzgi Convertible & Income Fund II Pfd Shs S"
              },
              {
                "Ticker": "NDP",
                "Company": "Tortoise Energy Independence F"
              },
              {
                "Ticker": "NDRO",
                "Company": "Enduro Royalty Trust"
              },
              {
                "Ticker": "NE",
                "Company": "Noble Corp"
              },
              {
                "Ticker": "NEA",
                "Company": "Nuveen Insured Tax-Free Advantage Fund"
              },
              {
                "Ticker": "NEE",
                "Company": "Nextera Energy"
              },
              {
                "Ticker": "NEE-I",
                "Company": "Nextera Energy Capital Holding"
              },
              {
                "Ticker": "NEE-J",
                "Company": "Nextera Energy Capital Holding"
              },
              {
                "Ticker": "NEE-K",
                "Company": "Nextera Energy Inc Series K J"
              },
              {
                "Ticker": "NEE-R",
                "Company": "Nextera Energy Inc"
              },
              {
                "Ticker": "NEM",
                "Company": "Newmont Mining Corp"
              },
              {
                "Ticker": "NEP",
                "Company": "Nextera Energy Partners LP"
              },
              {
                "Ticker": "NETS",
                "Company": "Netshoes [Cayman] Ltd"
              },
              {
                "Ticker": "NEU",
                "Company": "Newmarket Corp"
              },
              {
                "Ticker": "NEV",
                "Company": "Nuveen Enhanced Muni Value Fund"
              },
              {
                "Ticker": "NEW",
                "Company": "Puxin Limited"
              },
              {
                "Ticker": "NEWM",
                "Company": "New Media Investment Group Inc"
              },
              {
                "Ticker": "NEWR",
                "Company": "New Relic Inc"
              },
              {
                "Ticker": "NEXA",
                "Company": "Nexa Resources S.A."
              },
              {
                "Ticker": "NFC",
                "Company": "New Frontier Corp"
              },
              {
                "Ticker": "NFC.U",
                "Company": "New Frontier Corporation Units Each Consisting"
              },
              {
                "Ticker": "NFC.W",
                "Company": "New Frontier Corp. Warrants"
              },
              {
                "Ticker": "NFG",
                "Company": "National Fuel Gas Company"
              },
              {
                "Ticker": "NFJ",
                "Company": "Nfj Dividend Interest & Premium Strategy Fund"
              },
              {
                "Ticker": "NFX",
                "Company": "Newfield Exploration Company"
              },
              {
                "Ticker": "NGG",
                "Company": "National Grid Transco Plc"
              },
              {
                "Ticker": "NGL",
                "Company": "Ngl Energy Partners LP"
              },
              {
                "Ticker": "NGL-A",
                "Company": "Targa Resources 9.00% Series A Perp"
              },
              {
                "Ticker": "NGL-B",
                "Company": "Ngl Energy Partners LP"
              },
              {
                "Ticker": "NGS",
                "Company": "Natural Gas Services Group"
              },
              {
                "Ticker": "NGVC",
                "Company": "Natural Grocers By Vitamin Cottage Inc"
              },
              {
                "Ticker": "NGVT",
                "Company": "Ingevity Corp"
              },
              {
                "Ticker": "NHA",
                "Company": "Nuveen Municipal"
              },
              {
                "Ticker": "NHF",
                "Company": "Nexpoint Credit Strategies Fund"
              },
              {
                "Ticker": "NHI",
                "Company": "National Health Investors"
              },
              {
                "Ticker": "NI",
                "Company": "NiSource Inc"
              },
              {
                "Ticker": "NID",
                "Company": "Nuveen Intermediate Duration M"
              },
              {
                "Ticker": "NIE",
                "Company": "Agic Equity & Convertible"
              },
              {
                "Ticker": "NIM",
                "Company": "Nuveen Maturities Fund"
              },
              {
                "Ticker": "NINE",
                "Company": "Nine Energy Service Inc"
              },
              {
                "Ticker": "NIO",
                "Company": "Nio Inc"
              },
              {
                "Ticker": "NIQ",
                "Company": "Nuveen Intermediate Duration Q"
              },
              {
                "Ticker": "NJR",
                "Company": "Newjersey Resources Corp"
              },
              {
                "Ticker": "NJV",
                "Company": "Nuveen New Jersey Muni Value Fund"
              },
              {
                "Ticker": "NKE",
                "Company": "Nike Inc"
              },
              {
                "Ticker": "NKG",
                "Company": "Nuveen Georgia Divadv Fund 2"
              },
              {
                "Ticker": "NKX",
                "Company": "Nuveen Insured California Tax-Free"
              },
              {
                "Ticker": "NL",
                "Company": "NL Industries"
              },
              {
                "Ticker": "NLS",
                "Company": "Nautilus Group"
              },
              {
                "Ticker": "NLSN",
                "Company": "Nielsen Holdings Plc"
              },
              {
                "Ticker": "NLY",
                "Company": "Annaly Capital Management Inc"
              },
              {
                "Ticker": "NLY-C",
                "Company": "Annaly Capital Management Inc"
              },
              {
                "Ticker": "NLY-D",
                "Company": "Annaly Capital Management Inc"
              },
              {
                "Ticker": "NLY-F",
                "Company": "Annaly Capital Management Inc Pfd"
              },
              {
                "Ticker": "NLY-G",
                "Company": "Annaly Capital Management Inc Pfd"
              },
              {
                "Ticker": "NLY-H",
                "Company": "Annaly Capital Mgmt 8.125%"
              },
              {
                "Ticker": "NM",
                "Company": "Navios Maritime Holdings Inc"
              },
              {
                "Ticker": "NM-G",
                "Company": "Navios Maritime"
              },
              {
                "Ticker": "NM-H",
                "Company": "Navios Maritime Holdngs Inc"
              },
              {
                "Ticker": "NMFC",
                "Company": "New Mountain Finance Corporati"
              },
              {
                "Ticker": "NMFX",
                "Company": "New Mountain Finance Corp"
              },
              {
                "Ticker": "NMI",
                "Company": "Nuveen Muni"
              },
              {
                "Ticker": "NMK-B",
                "Company": "Niagara Mohawk Holdings Inc P"
              },
              {
                "Ticker": "NMK-C",
                "Company": "Niagara Mohawk 3.60"
              },
              {
                "Ticker": "NMM",
                "Company": "Navios Maritime Partners LP"
              },
              {
                "Ticker": "NMR",
                "Company": "Nomura Holdings Inc ADR"
              },
              {
                "Ticker": "NMS",
                "Company": "Nuveen Minnesota Municipal Inco"
              },
              {
                "Ticker": "NMT",
                "Company": "Nuveen Massachusetts Premium Fund"
              },
              {
                "Ticker": "NMY",
                "Company": "Nuveen Maryland Premium Fund"
              },
              {
                "Ticker": "NMZ",
                "Company": "Nuveen Muni High Income Opportunity"
              },
              {
                "Ticker": "NNA",
                "Company": "Navios Maritime Acquisition Corp"
              },
              {
                "Ticker": "NNC",
                "Company": "Nuveen North Carolina Premium Fund"
              },
              {
                "Ticker": "NNI",
                "Company": "Nelnet Inc"
              },
              {
                "Ticker": "NNN",
                "Company": "National Retail Properties"
              },
              {
                "Ticker": "NNN-E",
                "Company": "National Retail Properties Depo"
              },
              {
                "Ticker": "NNN-F",
                "Company": "National Retail Properties Inc"
              },
              {
                "Ticker": "NNY",
                "Company": "Nuveen New York Muni Value Fund"
              },
              {
                "Ticker": "NOA",
                "Company": "North American Energy Partners"
              },
              {
                "Ticker": "NOAH",
                "Company": "Noah Holdings Ltd"
              },
              {
                "Ticker": "NOC",
                "Company": "Northrop Grumman Corp"
              },
              {
                "Ticker": "NOK",
                "Company": "Nokia Corp"
              },
              {
                "Ticker": "NOM",
                "Company": "Nuveen Missouri Premium Fund"
              },
              {
                "Ticker": "NOMD",
                "Company": "Nomad Foods Limited Ordinary Sh"
              },
              {
                "Ticker": "NOV",
                "Company": "National-Oilwell"
              },
              {
                "Ticker": "NOW",
                "Company": "Servicenow Inc"
              },
              {
                "Ticker": "NP",
                "Company": "Neenah Paper"
              },
              {
                "Ticker": "NPK",
                "Company": "National Presto Industries"
              },
              {
                "Ticker": "NPN",
                "Company": "Nuveen Pennsylvania Muni Value Fund"
              },
              {
                "Ticker": "NPO",
                "Company": "Enpro Industries"
              },
              {
                "Ticker": "NPTN",
                "Company": "Neophotonics Corp"
              },
              {
                "Ticker": "NPV",
                "Company": "Nuveen Virginia Premium Fund"
              },
              {
                "Ticker": "NQP",
                "Company": "Nuveen Pennsylvania Investment"
              },
              {
                "Ticker": "NR",
                "Company": "Newpark Resources"
              },
              {
                "Ticker": "NRE",
                "Company": "Northstar Realty Europe Corp C"
              },
              {
                "Ticker": "NRG",
                "Company": "NRG Energy"
              },
              {
                "Ticker": "NRK",
                "Company": "Nuveen Insured New York Tax-Free"
              },
              {
                "Ticker": "NRP",
                "Company": "Natural Resource Partners LP"
              },
              {
                "Ticker": "NRT",
                "Company": "North European Oil Royality Trust"
              },
              {
                "Ticker": "NRZ",
                "Company": "New Residential Investment Corp"
              },
              {
                "Ticker": "NS",
                "Company": "Nustar Energy LP"
              },
              {
                "Ticker": "NS-A",
                "Company": "Nustar Energy LP Pref Share"
              },
              {
                "Ticker": "NS-B",
                "Company": "Nustar Energy LP Cum Red Perp Pfd Ser B Fixed To"
              },
              {
                "Ticker": "NS-C",
                "Company": "Nustar Energy LP Cum Red Perp Pfd Ser C"
              },
              {
                "Ticker": "NSA",
                "Company": "National Storage Affiliates Tru"
              },
              {
                "Ticker": "NSA-A",
                "Company": "National Storage Affiliates Trust Pfd Cum Red BE"
              },
              {
                "Ticker": "NSC",
                "Company": "Norfolk Southern Corp"
              },
              {
                "Ticker": "NSL",
                "Company": "Nuveen Senior"
              },
              {
                "Ticker": "NSP",
                "Company": "Insperity Inc"
              },
              {
                "Ticker": "NSS",
                "Company": "Nustar Logistics LP"
              },
              {
                "Ticker": "NTB",
                "Company": "Bank of Butterfield Ltd"
              },
              {
                "Ticker": "NTC",
                "Company": "Nuveen Connecticut Premium Fund"
              },
              {
                "Ticker": "NTG",
                "Company": "Tortoise MLP Fund"
              },
              {
                "Ticker": "NTP",
                "Company": "Nam Tai Electronics"
              },
              {
                "Ticker": "NTR",
                "Company": "Nutrien Ltd"
              },
              {
                "Ticker": "NTX",
                "Company": "Nuveen Texas Quality"
              },
              {
                "Ticker": "NTZ",
                "Company": "Natuzzi S.P.A."
              },
              {
                "Ticker": "NUE",
                "Company": "Nucor Corp"
              },
              {
                "Ticker": "NUM",
                "Company": "Nuveen Michigan Quality"
              },
              {
                "Ticker": "NUO",
                "Company": "Nuveen Ohio Quality"
              },
              {
                "Ticker": "NUS",
                "Company": "Nu Skin Enterprises"
              },
              {
                "Ticker": "NUV",
                "Company": "Nuveen Muni Value Fund"
              },
              {
                "Ticker": "NUW",
                "Company": "Nuveen Muni Value Fund"
              },
              {
                "Ticker": "NVG",
                "Company": "Nuveen Insured Divadv Fund"
              },
              {
                "Ticker": "NVGS",
                "Company": "Navigator Holdings"
              },
              {
                "Ticker": "NVO",
                "Company": "Novo Nordisk A/S"
              },
              {
                "Ticker": "NVR",
                "Company": "NVR Inc"
              },
              {
                "Ticker": "NVRO",
                "Company": "Nevro Corp"
              },
              {
                "Ticker": "NVS",
                "Company": "Novartis Ag"
              },
              {
                "Ticker": "NVT",
                "Company": "Nvent Electric Plc"
              },
              {
                "Ticker": "NVTA",
                "Company": "Invitae Corp"
              },
              {
                "Ticker": "NWE",
                "Company": "Northwestern Corp"
              },
              {
                "Ticker": "NWHM",
                "Company": "New Home Co Llc"
              },
              {
                "Ticker": "NWL",
                "Company": "Newell Rubbermaid Inc"
              },
              {
                "Ticker": "NWN",
                "Company": "Northwest Natural Gas Company"
              },
              {
                "Ticker": "NWY",
                "Company": "New York & Company"
              },
              {
                "Ticker": "NX",
                "Company": "Quanex Building Products Corp"
              },
              {
                "Ticker": "NXC",
                "Company": "Nuveen California Tax-Free Income"
              },
              {
                "Ticker": "NXJ",
                "Company": "Nuveen New Jersey Divadv Fund"
              },
              {
                "Ticker": "NXN",
                "Company": "Nuveen Insured New York Tax-Free"
              },
              {
                "Ticker": "NXP",
                "Company": "Nuveen Tax Free Income Portfolio"
              },
              {
                "Ticker": "NXQ",
                "Company": "Nuveen Tax Free Income Portfolio II"
              },
              {
                "Ticker": "NXR",
                "Company": "Nuveen Tax Free Income Portfolio III"
              },
              {
                "Ticker": "NXRT",
                "Company": "Nexpoint Residential Trust Inc"
              },
              {
                "Ticker": "NYC-A",
                "Company": "New York Community Bancorp Inc"
              },
              {
                "Ticker": "NYC-U",
                "Company": "New York Community Bancorp Inc"
              },
              {
                "Ticker": "NYCB",
                "Company": "New York Community Bancorp"
              },
              {
                "Ticker": "NYL.A",
                "Company": "NRG Yield Inc Class A"
              },
              {
                "Ticker": "NYLD",
                "Company": "NRG Yield Inc"
              },
              {
                "Ticker": "NYRT",
                "Company": "New York REIT Inc"
              },
              {
                "Ticker": "NYT",
                "Company": "New York Times Company"
              },
              {
                "Ticker": "NYV",
                "Company": "Nuveen New York Muni Value Fund 2"
              },
              {
                "Ticker": "NZF",
                "Company": "Nuveen Divadv Fund 3"
              },
              {
                "Ticker": "O",
                "Company": "Realty Income Corp"
              },
              {
                "Ticker": "OAK",
                "Company": "Oaktree Capital Group Llc"
              },
              {
                "Ticker": "OAK-A",
                "Company": "Oaktree Cap Group Llc Series A Pfd"
              },
              {
                "Ticker": "OAK-B",
                "Company": "Oaktree Capital Group Llc Pfd Unit Ser B"
              },
              {
                "Ticker": "OAS",
                "Company": "Oasis Petroleum Inc"
              },
              {
                "Ticker": "OBE",
                "Company": "Obsidian Energy Ltd"
              },
              {
                "Ticker": "OC",
                "Company": "Owens Corning Inc"
              },
              {
                "Ticker": "OCN",
                "Company": "Ocwen Financial Corp"
              },
              {
                "Ticker": "ODC",
                "Company": "Oil-Dri Corporation of America"
              },
              {
                "Ticker": "OEC",
                "Company": "Orion Engineered Carbons S.A R"
              },
              {
                "Ticker": "OFC",
                "Company": "Corporate Office Properties"
              },
              {
                "Ticker": "OFG",
                "Company": "Oriental Financial Group"
              },
              {
                "Ticker": "OFG-A",
                "Company": "Oriental Fin Mips A"
              },
              {
                "Ticker": "OFG-B",
                "Company": "Oriental Finl Pfd B"
              },
              {
                "Ticker": "OFG-D",
                "Company": "Oriental Financial Group Inc"
              },
              {
                "Ticker": "OGE",
                "Company": "Oge Energy Corp"
              },
              {
                "Ticker": "OGS",
                "Company": "One Gas Inc"
              },
              {
                "Ticker": "OHI",
                "Company": "Omega Healthcare Investors"
              },
              {
                "Ticker": "OI",
                "Company": "Owens-Illinois"
              },
              {
                "Ticker": "OIA",
                "Company": "Invesco Muni Income Trust"
              },
              {
                "Ticker": "OIB.C",
                "Company": "Oi S.A."
              },
              {
                "Ticker": "OII",
                "Company": "Oceaneering International"
              },
              {
                "Ticker": "OIS",
                "Company": "Oil States International"
              },
              {
                "Ticker": "OKE",
                "Company": "Oneok Inc"
              },
              {
                "Ticker": "OLN",
                "Company": "Olin Corp"
              },
              {
                "Ticker": "OLP",
                "Company": "One Liberty Properties"
              },
              {
                "Ticker": "OMA.U",
                "Company": "One Madison Group"
              },
              {
                "Ticker": "OMA.W",
                "Company": "One Madison Corp. Warrants"
              },
              {
                "Ticker": "OMAD",
                "Company": "One Madison Corporation Class A"
              },
              {
                "Ticker": "OMC",
                "Company": "Omnicom Group Inc"
              },
              {
                "Ticker": "OMF",
                "Company": "Onemain Holdings Inc"
              },
              {
                "Ticker": "OMI",
                "Company": "Owens & Minor"
              },
              {
                "Ticker": "OMN",
                "Company": "Omnova Solutions Inc"
              },
              {
                "Ticker": "OMP",
                "Company": "Oasis Midstream Partners LP"
              },
              {
                "Ticker": "ONDK",
                "Company": "On Deck Capital Inc"
              },
              {
                "Ticker": "ONE",
                "Company": "Onesmart International Education Group Limited A"
              },
              {
                "Ticker": "OOMA",
                "Company": "Ooma Inc"
              },
              {
                "Ticker": "OPP",
                "Company": "Rivernorth/Doubleline Strategic Opportunity Fund"
              },
              {
                "Ticker": "OPY",
                "Company": "Oppenheimer Holdings"
              },
              {
                "Ticker": "OR",
                "Company": "Osisko Gold Royalties Ltd"
              },
              {
                "Ticker": "ORA",
                "Company": "Ormat Technologies"
              },
              {
                "Ticker": "ORAN",
                "Company": "Orange ADR"
              },
              {
                "Ticker": "ORC",
                "Company": "Orchid Island Capital Inc"
              },
              {
                "Ticker": "ORCL",
                "Company": "Oracle Corp"
              },
              {
                "Ticker": "ORI",
                "Company": "Old Republic International Corp"
              },
              {
                "Ticker": "ORN",
                "Company": "Orion Group Holdings Inc"
              },
              {
                "Ticker": "OSB",
                "Company": "Norbord Inc"
              },
              {
                "Ticker": "OSG",
                "Company": "Overseas Shipholding Group Inc"
              },
              {
                "Ticker": "OSK",
                "Company": "Oshkosh Truck Corp"
              },
              {
                "Ticker": "OSLE",
                "Company": "Oaktree Specialty Lending Corp"
              },
              {
                "Ticker": "OUT",
                "Company": "Outfront Media Inc"
              },
              {
                "Ticker": "OXM",
                "Company": "Oxford Industries"
              },
              {
                "Ticker": "OXY",
                "Company": "Occidental Petroleum Corp"
              },
              {
                "Ticker": "OZM",
                "Company": "Och-Ziff Capital Management"
              },
              {
                "Ticker": "P",
                "Company": "Pandora Media Inc"
              },
              {
                "Ticker": "PAA",
                "Company": "Plains All American Pipeline LP"
              },
              {
                "Ticker": "PAC",
                "Company": "Grupo Aeroportuario Del Pacifico"
              },
              {
                "Ticker": "PAG",
                "Company": "Penske Automotive Group"
              },
              {
                "Ticker": "PAGP",
                "Company": "Plains Gp Holdings LP"
              },
              {
                "Ticker": "PAGS",
                "Company": "Pagseguro Digital Ltd. Class A"
              },
              {
                "Ticker": "PAH",
                "Company": "Platform Specialty Products Corp"
              },
              {
                "Ticker": "PAI",
                "Company": "Pacific American Income Shares"
              },
              {
                "Ticker": "PAM",
                "Company": "Pampa Energia S.A."
              },
              {
                "Ticker": "PANW",
                "Company": "Palo Alto Networks Inc"
              },
              {
                "Ticker": "PAR",
                "Company": "Par Technology Corp"
              },
              {
                "Ticker": "PARR",
                "Company": "Par Petroleum Corp"
              },
              {
                "Ticker": "PAYC",
                "Company": "Paycom Software Inc"
              },
              {
                "Ticker": "PB",
                "Company": "Prosperity Bancshares"
              },
              {
                "Ticker": "PBA",
                "Company": "Pembina Pipeline Cor"
              },
              {
                "Ticker": "PBB",
                "Company": "Prospect Capital Corp"
              },
              {
                "Ticker": "PBF",
                "Company": "PBF Energy Inc"
              },
              {
                "Ticker": "PBFX",
                "Company": "PBF Logistics LP"
              },
              {
                "Ticker": "PBH",
                "Company": "Prestige Brand Holdings"
              },
              {
                "Ticker": "PBI",
                "Company": "Pitney Bowes Inc"
              },
              {
                "Ticker": "PBI-B",
                "Company": "Pitney Bowes Inc .6.70% Notes"
              },
              {
                "Ticker": "PBR",
                "Company": "Petroleo Brasileiro S.A. Petrobras"
              },
              {
                "Ticker": "PBR.A",
                "Company": "Petroleo Brasileiro S.A. Petrobras"
              },
              {
                "Ticker": "PBT",
                "Company": "Permian Basin Royalty Trust"
              },
              {
                "Ticker": "PBY",
                "Company": "Prospect Capital Corporation 6.25% Notes Due 202"
              },
              {
                "Ticker": "PCF",
                "Company": "Putnam High Income Bond Fund"
              },
              {
                "Ticker": "PCG",
                "Company": "Pacific Gas & Electric Co"
              },
              {
                "Ticker": "PCI",
                "Company": "Pimco Dynamic Credit Income Fun"
              },
              {
                "Ticker": "PCK",
                "Company": "Pimco California Muni II"
              },
              {
                "Ticker": "PCM",
                "Company": "Pimco Commercial Mortgage Securities"
              },
              {
                "Ticker": "PCN",
                "Company": "Pimco Corporate"
              },
              {
                "Ticker": "PCQ",
                "Company": "Pimco California Muni"
              },
              {
                "Ticker": "PDI",
                "Company": "Pimco Dynamic Income Fund"
              },
              {
                "Ticker": "PDM",
                "Company": "Piedmont Office Realty Trust"
              },
              {
                "Ticker": "PDS",
                "Company": "Precision Drilling Corp"
              },
              {
                "Ticker": "PDT",
                "Company": "John Hancock Premium Dividend Fund"
              },
              {
                "Ticker": "PE",
                "Company": "Parsley Energy"
              },
              {
                "Ticker": "PEB",
                "Company": "Pebblebrook Hotel Trust"
              },
              {
                "Ticker": "PEB-C",
                "Company": "Pebblebrook Hotel Trust"
              },
              {
                "Ticker": "PEB-D",
                "Company": "Pebblebrook Hotel Trust"
              },
              {
                "Ticker": "PEG",
                "Company": "Public Service Enterprise Group Inc"
              },
              {
                "Ticker": "PEI",
                "Company": "Pennsylvania Real Estate Investment"
              },
              {
                "Ticker": "PEI-B",
                "Company": "Pennsylvania Real Estate Inves"
              },
              {
                "Ticker": "PEI-C",
                "Company": "Pennsylvania Real Estate Investment Trust Red Pe"
              },
              {
                "Ticker": "PEI-D",
                "Company": "Pennsylvania Real Estate Investment Trust Pfd"
              },
              {
                "Ticker": "PEN",
                "Company": "Penumbra Inc"
              },
              {
                "Ticker": "PEO",
                "Company": "Adams Natural Resources Fund Inc"
              },
              {
                "Ticker": "PER",
                "Company": "Sandridge Permian Trust"
              },
              {
                "Ticker": "PES",
                "Company": "Pioneer Energy Services Corp"
              },
              {
                "Ticker": "PF",
                "Company": "Pinnacle Foods Inc"
              },
              {
                "Ticker": "PFD",
                "Company": "Flaherty & Crumrine Preferred Inc"
              },
              {
                "Ticker": "PFE",
                "Company": "Pfizer Inc"
              },
              {
                "Ticker": "PFGC",
                "Company": "Performance Food Group Co"
              },
              {
                "Ticker": "PFH",
                "Company": "Cabco TR Jcp 7.625"
              },
              {
                "Ticker": "PFL",
                "Company": "Pimco Income Strategy Fund"
              },
              {
                "Ticker": "PFN",
                "Company": "Pimco Income Strategy Fund II"
              },
              {
                "Ticker": "PFO",
                "Company": "Flaherty & Crumrine Preferred Fund"
              },
              {
                "Ticker": "PFS",
                "Company": "Provident Financial Services"
              },
              {
                "Ticker": "PFSI",
                "Company": "Pennymac Financial Services In"
              },
              {
                "Ticker": "PG",
                "Company": "Procter & Gamble Company"
              },
              {
                "Ticker": "PGP",
                "Company": "Pimco Global Stocksplus & Income"
              },
              {
                "Ticker": "PGR",
                "Company": "Progressive Corp"
              },
              {
                "Ticker": "PGRE",
                "Company": "Paramount Group Inc"
              },
              {
                "Ticker": "PGTI",
                "Company": "Pgt Inc"
              },
              {
                "Ticker": "PGZ",
                "Company": "Principal Real Estate Income F"
              },
              {
                "Ticker": "PH",
                "Company": "Parker-Hannifin Corp"
              },
              {
                "Ticker": "PHD",
                "Company": "Pioneer Floating Rate Trust"
              },
              {
                "Ticker": "PHG",
                "Company": "Koninklijke Philips Electronics"
              },
              {
                "Ticker": "PHH",
                "Company": "Phh Corp"
              },
              {
                "Ticker": "PHI",
                "Company": "Philippine Long Distance Telephone"
              },
              {
                "Ticker": "PHK",
                "Company": "Pimco High"
              },
              {
                "Ticker": "PHM",
                "Company": "Pultegroup"
              },
              {
                "Ticker": "PHT",
                "Company": "Pioneer High Income Trust"
              },
              {
                "Ticker": "PHX",
                "Company": "Panhandle Royalty Company"
              },
              {
                "Ticker": "PII",
                "Company": "Polaris Industries Inc"
              },
              {
                "Ticker": "PIM",
                "Company": "Putnam Master Intermediate Income"
              },
              {
                "Ticker": "PIR",
                "Company": "Pier 1 Imports"
              },
              {
                "Ticker": "PIY",
                "Company": "Merrill Lynch Depositor"
              },
              {
                "Ticker": "PJC",
                "Company": "Piper Jaffray Companies"
              },
              {
                "Ticker": "PJH",
                "Company": "Prudential Financial Inc"
              },
              {
                "Ticker": "PJT",
                "Company": "Pjt Partners Inc Class A"
              },
              {
                "Ticker": "PK",
                "Company": "Park Hotels & Resorts Inc"
              },
              {
                "Ticker": "PKD",
                "Company": "Parker Drilling Company"
              },
              {
                "Ticker": "PKE",
                "Company": "Park Electrochemical Corp"
              },
              {
                "Ticker": "PKG",
                "Company": "Packaging Corporation of America"
              },
              {
                "Ticker": "PKI",
                "Company": "Perkinelmer"
              },
              {
                "Ticker": "PKO",
                "Company": "Pimco Income Opportunity Fund"
              },
              {
                "Ticker": "PKX",
                "Company": "Posco ADR"
              },
              {
                "Ticker": "PLD",
                "Company": "Prologis Inc"
              },
              {
                "Ticker": "PLNT",
                "Company": "Planet Fitness"
              },
              {
                "Ticker": "PLOW",
                "Company": "Douglas Dynamics"
              },
              {
                "Ticker": "PLT",
                "Company": "Plantronics"
              },
              {
                "Ticker": "PM",
                "Company": "Philip Morris International Inc"
              },
              {
                "Ticker": "PMF",
                "Company": "Pimco Muni"
              },
              {
                "Ticker": "PML",
                "Company": "Pimco Muni II"
              },
              {
                "Ticker": "PMM",
                "Company": "Putnam Managed Muni Income Trust"
              },
              {
                "Ticker": "PMO",
                "Company": "Putnam Muni Opportunities Trust"
              },
              {
                "Ticker": "PMT",
                "Company": "Pennymac Mortgage Investment Trust"
              },
              {
                "Ticker": "PMT-A",
                "Company": "Pennymac Mortgage Investment Trust"
              },
              {
                "Ticker": "PMT-B",
                "Company": "Pennymac Mortgage Investment Trust Pfd"
              },
              {
                "Ticker": "PMX",
                "Company": "Pimco Muni Income Fund III"
              },
              {
                "Ticker": "PNC",
                "Company": "PNC Bank"
              },
              {
                "Ticker": "PNC-P",
                "Company": "PNC Financial Services Group I"
              },
              {
                "Ticker": "PNC-Q",
                "Company": "The PNC Financial Services Gro"
              },
              {
                "Ticker": "PNC.W",
                "Company": "The PNC Financial Services Group"
              },
              {
                "Ticker": "PNF",
                "Company": "Pimco New York Muni"
              },
              {
                "Ticker": "PNI",
                "Company": "Pimco New York Muni II"
              },
              {
                "Ticker": "PNM",
                "Company": "PNM Resources Inc"
              },
              {
                "Ticker": "PNR",
                "Company": "Pentair Ltd"
              },
              {
                "Ticker": "PNW",
                "Company": "Pinnacle West Capital Corp"
              },
              {
                "Ticker": "POL",
                "Company": "Polyone Corp"
              },
              {
                "Ticker": "POR",
                "Company": "Portland General Electric Company"
              },
              {
                "Ticker": "POST",
                "Company": "Post Holdings Inc"
              },
              {
                "Ticker": "PPDF",
                "Company": "Ppdai Group Inc"
              },
              {
                "Ticker": "PPG",
                "Company": "PPG Industries"
              },
              {
                "Ticker": "PPL",
                "Company": "PPL Corp"
              },
              {
                "Ticker": "PPR",
                "Company": "VOYA Prime Rate Trust"
              },
              {
                "Ticker": "PPT",
                "Company": "Putnam Premier Income Trust"
              },
              {
                "Ticker": "PPX",
                "Company": "PPL Capital Funding Inc"
              },
              {
                "Ticker": "PQG",
                "Company": "Pq Group Holdings Inc"
              },
              {
                "Ticker": "PRA",
                "Company": "Pro-Assurance Corp"
              },
              {
                "Ticker": "PRE-F",
                "Company": "Partnerre Ltd"
              },
              {
                "Ticker": "PRE-G",
                "Company": "Partnerre Ltd 6.50% Series G C"
              },
              {
                "Ticker": "PRE-H",
                "Company": "Partnerre Ltd 7.25% Series H C"
              },
              {
                "Ticker": "PRE-I",
                "Company": "Partnerre Ltd 5.875% Series I"
              },
              {
                "Ticker": "PRGO",
                "Company": "Perrigo Company"
              },
              {
                "Ticker": "PRH",
                "Company": "Prudential Financial Inc"
              },
              {
                "Ticker": "PRI",
                "Company": "Primerica Inc"
              },
              {
                "Ticker": "PRI-A",
                "Company": "Priority Income Fund Inc Term Pfd Ser A"
              },
              {
                "Ticker": "PRLB",
                "Company": "Proto Labs Inc"
              },
              {
                "Ticker": "PRO",
                "Company": "Pros Holdings"
              },
              {
                "Ticker": "PRS",
                "Company": "Prudential Financial Inc. 5.625% Junior"
              },
              {
                "Ticker": "PRSP",
                "Company": "Perspecta Inc"
              },
              {
                "Ticker": "PRT",
                "Company": "Permrock Royalty Trust Trust Units"
              },
              {
                "Ticker": "PRTY",
                "Company": "Party City Holdco Inc"
              },
              {
                "Ticker": "PRU",
                "Company": "Prudential Financial Inflation Retail"
              },
              {
                "Ticker": "PSA",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-A",
                "Company": "Public Storage 5.875%"
              },
              {
                "Ticker": "PSA-B",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-C",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-D",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-E",
                "Company": "Public Storage Prf"
              },
              {
                "Ticker": "PSA-F",
                "Company": "Public Storage Depositary 5.15% Series F Pfd"
              },
              {
                "Ticker": "PSA-G",
                "Company": "Public Storage Dep Shs Repstg 1/1000Th Cum Pfd B"
              },
              {
                "Ticker": "PSA-U",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-V",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-W",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-X",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSA-Y",
                "Company": "Public Storagedepositary Share"
              },
              {
                "Ticker": "PSA-Z",
                "Company": "Public Storage"
              },
              {
                "Ticker": "PSB",
                "Company": "Business Parks"
              },
              {
                "Ticker": "PSB-U",
                "Company": "PS Business Parks Inc"
              },
              {
                "Ticker": "PSB-V",
                "Company": "PS Business Pks Inc Calif Dep"
              },
              {
                "Ticker": "PSB-W",
                "Company": "PS Business Parks Inc"
              },
              {
                "Ticker": "PSB-X",
                "Company": "PS Business Parks Inc Pfd"
              },
              {
                "Ticker": "PSB-Y",
                "Company": "PS Business Parks Inc Dep Shs Repstg 1/1000Th Pf"
              },
              {
                "Ticker": "PSF",
                "Company": "Cohen & Steers Preferred Fund"
              },
              {
                "Ticker": "PSO",
                "Company": "Pearson Plc"
              },
              {
                "Ticker": "PSTG",
                "Company": "Pure Storage Inc"
              },
              {
                "Ticker": "PSX",
                "Company": "Phillips 66"
              },
              {
                "Ticker": "PSXP",
                "Company": "Phillips 66 Partners LP"
              },
              {
                "Ticker": "PTR",
                "Company": "Petrochina Company Ltd"
              },
              {
                "Ticker": "PTY",
                "Company": "Pimco Corporate Opportunity Fund"
              },
              {
                "Ticker": "PUK",
                "Company": "Prudential Public Limited Company"
              },
              {
                "Ticker": "PUK-A",
                "Company": "Pru Plc Perp Sub Cap"
              },
              {
                "Ticker": "PUK.P",
                "Company": "Prudential 6.75%"
              },
              {
                "Ticker": "PUMP",
                "Company": "Propetro Holding Corp"
              },
              {
                "Ticker": "PVG",
                "Company": "Pretium Res Inc"
              },
              {
                "Ticker": "PVH",
                "Company": "Phillips-Van Heusen Corp"
              },
              {
                "Ticker": "PVL",
                "Company": "Permianville Royalty Trust"
              },
              {
                "Ticker": "PVTL",
                "Company": "Pivotal Software Inc"
              },
              {
                "Ticker": "PWR",
                "Company": "Quanta Services"
              },
              {
                "Ticker": "PX",
                "Company": "Praxair"
              },
              {
                "Ticker": "PXD",
                "Company": "Pioneer Natural Resources Co"
              },
              {
                "Ticker": "PYN",
                "Company": "Pimco New York Muni Income Fund III"
              },
              {
                "Ticker": "PYS",
                "Company": "Pplus Trust"
              },
              {
                "Ticker": "PYT",
                "Company": "Pplus Trust"
              },
              {
                "Ticker": "PYX",
                "Company": "Pyxus International Inc"
              },
              {
                "Ticker": "PZC",
                "Company": "Pimco California Muni Income Fund III"
              },
              {
                "Ticker": "PZN",
                "Company": "Pzena Investment Management Inc"
              },
              {
                "Ticker": "QD",
                "Company": "Qudian Inc ADR"
              },
              {
                "Ticker": "QEP",
                "Company": "Qep Resources"
              },
              {
                "Ticker": "QES",
                "Company": "Quintana Energy Services Inc"
              },
              {
                "Ticker": "QGEN",
                "Company": "Qiagen N.V."
              },
              {
                "Ticker": "QHC",
                "Company": "Quorum Health Corp"
              },
              {
                "Ticker": "QSR",
                "Company": "Restaurant Brands International"
              },
              {
                "Ticker": "QTM",
                "Company": "Quantum Corp"
              },
              {
                "Ticker": "QTS",
                "Company": "Qts Realty Trust Inc"
              },
              {
                "Ticker": "QTS-A",
                "Company": "Qts Realty Trust Inc. Pfd A"
              },
              {
                "Ticker": "QTS-B",
                "Company": "Qts Realty Trust Inc Cum Perp Pfd Conv Ser B"
              },
              {
                "Ticker": "QTWO",
                "Company": "Q2 Holdings Inc"
              },
              {
                "Ticker": "QUAD",
                "Company": "Quad Graphics Inc"
              },
              {
                "Ticker": "QUOT",
                "Company": "Quotient Technology Inc"
              },
              {
                "Ticker": "QVCD",
                "Company": "Qvc Inc. 6.375% Senior Secured Notes Due 2067"
              },
              {
                "Ticker": "R",
                "Company": "Ryder System"
              },
              {
                "Ticker": "RA",
                "Company": "Brookfield Real Assets Income Fund Inc"
              },
              {
                "Ticker": "RACE",
                "Company": "Ferrari N.V."
              },
              {
                "Ticker": "RAD",
                "Company": "Rite Aid Corp"
              },
              {
                "Ticker": "RAMP",
                "Company": "Liveramp Holdings Inc."
              },
              {
                "Ticker": "RBA",
                "Company": "Ritchie Bros. Auctioneers Inc"
              },
              {
                "Ticker": "RBC",
                "Company": "Regal-Beloit Corp"
              },
              {
                "Ticker": "RBS",
                "Company": "Royal Bank Scotland Group Plc"
              },
              {
                "Ticker": "RBS-S",
                "Company": "Royal Bank Scotland"
              },
              {
                "Ticker": "RC",
                "Company": "Ready Capital Corp."
              },
              {
                "Ticker": "RCA",
                "Company": "Ready Capital Corp. 7.00%"
              },
              {
                "Ticker": "RCI",
                "Company": "Rogers Communication"
              },
              {
                "Ticker": "RCL",
                "Company": "Royal Caribbean Cruises Ltd"
              },
              {
                "Ticker": "RCP",
                "Company": "Ready Capital Corp. 6.50% Series"
              },
              {
                "Ticker": "RCS",
                "Company": "Rcm Strategic Global Government Fund"
              },
              {
                "Ticker": "RCUS",
                "Company": "Arcus Biosciences Inc"
              },
              {
                "Ticker": "RDC",
                "Company": "Rowan Companies"
              },
              {
                "Ticker": "RDN",
                "Company": "Radian Group Inc"
              },
              {
                "Ticker": "RDS.A",
                "Company": "Royal Dutch Shell Plc"
              },
              {
                "Ticker": "RDS.B",
                "Company": "Royal Dutch Shell Cl B"
              },
              {
                "Ticker": "RDY",
                "Company": "Dr. Reddy's Laboratories Ltd"
              },
              {
                "Ticker": "RE",
                "Company": "Everest Re Group"
              },
              {
                "Ticker": "REG",
                "Company": "Regency Centers Corp"
              },
              {
                "Ticker": "RELX",
                "Company": "Relx Plc"
              },
              {
                "Ticker": "REN",
                "Company": "Resolute Energy Corp"
              },
              {
                "Ticker": "RENN",
                "Company": "Renren Inc"
              },
              {
                "Ticker": "RES",
                "Company": "RPC Inc"
              },
              {
                "Ticker": "RESI",
                "Company": "Altisource Residential Corporat"
              },
              {
                "Ticker": "REV",
                "Company": "Revlon Inc"
              },
              {
                "Ticker": "REVG",
                "Company": "Rev Group Inc"
              },
              {
                "Ticker": "REX",
                "Company": "Rex American Resources Corp"
              },
              {
                "Ticker": "REX-A",
                "Company": "Rexford Industrial Realty Inc"
              },
              {
                "Ticker": "REX-B",
                "Company": "Rexford Industrial Realty Inc Pfd B"
              },
              {
                "Ticker": "REXR",
                "Company": "Rexford Industrial Realty Inc"
              },
              {
                "Ticker": "RF",
                "Company": "Regions Financial Corp"
              },
              {
                "Ticker": "RF-A",
                "Company": "Regions Financial Corp"
              },
              {
                "Ticker": "RF-B",
                "Company": "Regions Financial Corp"
              },
              {
                "Ticker": "RFI",
                "Company": "Cohen & Steers Total Return Realty Fund"
              },
              {
                "Ticker": "RFP",
                "Company": "Resolute Forest Products Inc"
              },
              {
                "Ticker": "RGA",
                "Company": "Reinsurance Group of America Inc"
              },
              {
                "Ticker": "RGR",
                "Company": "Sturm Ruger & Company"
              },
              {
                "Ticker": "RGS",
                "Company": "Regis Corp"
              },
              {
                "Ticker": "RGT",
                "Company": "Royce Global Value Trust Inc"
              },
              {
                "Ticker": "RH",
                "Company": "Restoration Hardware Holdings"
              },
              {
                "Ticker": "RHI",
                "Company": "Robert Half International Inc"
              },
              {
                "Ticker": "RHP",
                "Company": "Ryman Hospitality Properties REIT"
              },
              {
                "Ticker": "RHT",
                "Company": "Red Hat Inc"
              },
              {
                "Ticker": "RIG",
                "Company": "Transocean Inc"
              },
              {
                "Ticker": "RIO",
                "Company": "Rio Tinto Plc"
              },
              {
                "Ticker": "RIV",
                "Company": "Rivernorth Opportunities Fund"
              },
              {
                "Ticker": "RIV-R",
                "Company": "Rivernorth Opportunities Fund Inc"
              },
              {
                "Ticker": "RJF",
                "Company": "Raymond James Financial"
              },
              {
                "Ticker": "RL",
                "Company": "Ralph Lauren Corp"
              },
              {
                "Ticker": "RLGY",
                "Company": "Realogy Holdings Corp"
              },
              {
                "Ticker": "RLH",
                "Company": "Red Lion Hotels Corp"
              },
              {
                "Ticker": "RLI",
                "Company": "Rli Corp"
              },
              {
                "Ticker": "RLJ",
                "Company": "Rlj Lodging Trust"
              },
              {
                "Ticker": "RLJ-A",
                "Company": "Rlj Lodging Trust $1.95 Series A"
              },
              {
                "Ticker": "RM",
                "Company": "Regional Managment Corp"
              },
              {
                "Ticker": "RMAX",
                "Company": "Re/Max Holdings Inc"
              },
              {
                "Ticker": "RMD",
                "Company": "Resmed Inc"
              },
              {
                "Ticker": "RMED",
                "Company": "Ra Medical Systems Inc."
              },
              {
                "Ticker": "RMP.P",
                "Company": "Rivernorth Marketplace Lending Corp Term Pfd Ser"
              },
              {
                "Ticker": "RMT",
                "Company": "Royce Micro-Cap Trust"
              },
              {
                "Ticker": "RNG",
                "Company": "Ringcentral Inc"
              },
              {
                "Ticker": "RNGR",
                "Company": "Ranger Energy Services Inc Class A"
              },
              {
                "Ticker": "RNP",
                "Company": "Cohen & Steers REIT and Preferred"
              },
              {
                "Ticker": "RNR",
                "Company": "Renaissancere Holdings Ltd"
              },
              {
                "Ticker": "RNR-C",
                "Company": "Renaissancere 6.08 C"
              },
              {
                "Ticker": "RNR-E",
                "Company": "Renaissancere Holdings Ltd"
              },
              {
                "Ticker": "RNR-F",
                "Company": "Renaissancere Holdings Ltd - Prf Perpetual USD 2"
              },
              {
                "Ticker": "ROG",
                "Company": "Rogers Corp"
              },
              {
                "Ticker": "ROK",
                "Company": "Rockwell Automation Inc"
              },
              {
                "Ticker": "ROL",
                "Company": "Rollins Inc"
              },
              {
                "Ticker": "ROP",
                "Company": "Roper Industries"
              },
              {
                "Ticker": "ROYT",
                "Company": "Pacific Coast Oil Trust"
              },
              {
                "Ticker": "RPAI",
                "Company": "Retail Properties of America"
              },
              {
                "Ticker": "RPM",
                "Company": "RPM International Inc"
              },
              {
                "Ticker": "RPT",
                "Company": "Ramco-Gershenson Properties Trust"
              },
              {
                "Ticker": "RPT-D",
                "Company": "Ramco-Gershenson Properties Tru"
              },
              {
                "Ticker": "RQI",
                "Company": "Cohen & Steers Quality Income Realty Fund Inc"
              },
              {
                "Ticker": "RRC",
                "Company": "Range Resources Corp"
              },
              {
                "Ticker": "RRD",
                "Company": "Donnelley [R.R.] & Sons Co"
              },
              {
                "Ticker": "RRTS",
                "Company": "Roadrunner Transportation Systems Inc"
              },
              {
                "Ticker": "RS",
                "Company": "Reliance Steel & Aluminum Company"
              },
              {
                "Ticker": "RSG",
                "Company": "Republic Services"
              },
              {
                "Ticker": "RST",
                "Company": "Rosetta Stone"
              },
              {
                "Ticker": "RTEC",
                "Company": "Rudolph Technologies"
              },
              {
                "Ticker": "RTN",
                "Company": "Raytheon Company"
              },
              {
                "Ticker": "RUBI",
                "Company": "The Rubicon Project Inc"
              },
              {
                "Ticker": "RVI",
                "Company": "Retail Value Inc"
              },
              {
                "Ticker": "RVT",
                "Company": "Royce Value Trust"
              },
              {
                "Ticker": "RWG.U",
                "Company": "Regalwood Global Energy"
              },
              {
                "Ticker": "RWG.W",
                "Company": "Regalwood Global Energy Ws"
              },
              {
                "Ticker": "RWGE",
                "Company": "Regalwood Global Energy Ltd. Class A Ordinary Sh"
              },
              {
                "Ticker": "RWT",
                "Company": "Redwood Trust"
              },
              {
                "Ticker": "RXN",
                "Company": "Rexnord Corp"
              },
              {
                "Ticker": "RXN-A",
                "Company": "Rexnord Corp"
              },
              {
                "Ticker": "RY",
                "Company": "Royal Bank of Canada"
              },
              {
                "Ticker": "RY-T",
                "Company": "Royal Bank of Canada"
              },
              {
                "Ticker": "RYA-A",
                "Company": "Rayonier Advanced Materials Inc Pfd. Series A"
              },
              {
                "Ticker": "RYAM",
                "Company": "Rayonier Advanced Materials Inc"
              },
              {
                "Ticker": "RYB",
                "Company": "Ryb Education Inc Aps"
              },
              {
                "Ticker": "RYI",
                "Company": "Ryerson Holding Corp"
              },
              {
                "Ticker": "RYN",
                "Company": "Rayonier Inc REIT"
              },
              {
                "Ticker": "RZA",
                "Company": "Reinsurance Group of America I"
              },
              {
                "Ticker": "RZB",
                "Company": "Reinsurance Group of America I"
              },
              {
                "Ticker": "S",
                "Company": "Sprint Corp"
              },
              {
                "Ticker": "SA",
                "Company": "Seabridge Gold"
              },
              {
                "Ticker": "SAB",
                "Company": "Saratoga Investment Corp 6.75% Notes Due 2023"
              },
              {
                "Ticker": "SAF",
                "Company": "Saratoga Investment Corp"
              },
              {
                "Ticker": "SAFE",
                "Company": "Safety Income and Growth Inc"
              },
              {
                "Ticker": "SAH",
                "Company": "Sonic Automotive"
              },
              {
                "Ticker": "SAIC",
                "Company": "Science Applications Internatio"
              },
              {
                "Ticker": "SAIL",
                "Company": "Sailpoint Technologies Holdings Inc"
              },
              {
                "Ticker": "SALT",
                "Company": "Scorpio Bulkers Inc"
              },
              {
                "Ticker": "SAM",
                "Company": "Boston Beer Company"
              },
              {
                "Ticker": "SAN",
                "Company": "Banco Santander"
              },
              {
                "Ticker": "SAN-B",
                "Company": "Santander Finance Preferred S.A."
              },
              {
                "Ticker": "SAP",
                "Company": "SAP Ag"
              },
              {
                "Ticker": "SAR",
                "Company": "Saratoga Investment Corp"
              },
              {
                "Ticker": "SAVE",
                "Company": "Spirit Airlines Inc"
              },
              {
                "Ticker": "SB",
                "Company": "Safe Bulkers Inc"
              },
              {
                "Ticker": "SB-C",
                "Company": "Safe Bulkers Inc"
              },
              {
                "Ticker": "SB-D",
                "Company": "Safe Bulkers Inc"
              },
              {
                "Ticker": "SBBC",
                "Company": "Scorpio Tankers Inc 8.25% Senior Notes Due 2019"
              },
              {
                "Ticker": "SBGL",
                "Company": "Sibanye Gold Limited American D"
              },
              {
                "Ticker": "SBH",
                "Company": "Sally Beauty Holdings"
              },
              {
                "Ticker": "SBI",
                "Company": "Western Asset Intermediate Fund Inc"
              },
              {
                "Ticker": "SBNA",
                "Company": "Scorpio Tankers Inc"
              },
              {
                "Ticker": "SBOW",
                "Company": "Silverbow Resources Inc"
              },
              {
                "Ticker": "SBR",
                "Company": "Sabine Royalty Trust"
              },
              {
                "Ticker": "SBS",
                "Company": "Cia De Saneamento Basico Do Estado"
              },
              {
                "Ticker": "SC",
                "Company": "Santander Consumer USA Holdings"
              },
              {
                "Ticker": "SCA",
                "Company": "Stellus Capital Investment 5.75% Notes Due 2022"
              },
              {
                "Ticker": "SCCO",
                "Company": "Southern Peru Copper Corp"
              },
              {
                "Ticker": "SCD",
                "Company": "Lmp Capital and Income Fund Inc"
              },
              {
                "Ticker": "SCE-G",
                "Company": "Sce Trust II"
              },
              {
                "Ticker": "SCE-H",
                "Company": "Sce Trust III 5.75%"
              },
              {
                "Ticker": "SCE-J",
                "Company": "Sce Trust IV"
              },
              {
                "Ticker": "SCE-K",
                "Company": "Scr TR V Fxd/Fltg Rate"
              },
              {
                "Ticker": "SCE-L",
                "Company": "Sce Trust Vi TR Pref Secs"
              },
              {
                "Ticker": "SCG",
                "Company": "Scana Corp"
              },
              {
                "Ticker": "SCH-C",
                "Company": "Charles Schwab Corp Pref Share"
              },
              {
                "Ticker": "SCH-D",
                "Company": "Charles Schwab Corp Dep Pfd."
              },
              {
                "Ticker": "SCHW",
                "Company": "The Charles Schwab Corp"
              },
              {
                "Ticker": "SCI",
                "Company": "Service Corporation International"
              },
              {
                "Ticker": "SCL",
                "Company": "Stepan Company"
              },
              {
                "Ticker": "SCM",
                "Company": "Stellus Capital Investment Cor"
              },
              {
                "Ticker": "SCS",
                "Company": "Steelcase Inc"
              },
              {
                "Ticker": "SCX",
                "Company": "L.S. Starrett Company"
              },
              {
                "Ticker": "SD",
                "Company": "Sandridge Energy Inc"
              },
              {
                "Ticker": "SDLP",
                "Company": "Seadrill Partners Llc"
              },
              {
                "Ticker": "SDR",
                "Company": "Sandridge Mississippian Trust"
              },
              {
                "Ticker": "SDRL",
                "Company": "Seadrill Ltd"
              },
              {
                "Ticker": "SDT",
                "Company": "Sandridge Mississippian Trust I"
              },
              {
                "Ticker": "SE",
                "Company": "Sea Limited ADR"
              },
              {
                "Ticker": "SEAS",
                "Company": "Seaworld Entertainment Inc Co"
              },
              {
                "Ticker": "SEE",
                "Company": "Sealed Air Corp"
              },
              {
                "Ticker": "SEM",
                "Company": "Select Medical Holdings Corp"
              },
              {
                "Ticker": "SEMG",
                "Company": "Semgroup Corp"
              },
              {
                "Ticker": "SEND",
                "Company": "Sendgrid Inc"
              },
              {
                "Ticker": "SEP",
                "Company": "Spectra Energy Partners LP"
              },
              {
                "Ticker": "SERV",
                "Company": "Servicemaster Global Holdings I"
              },
              {
                "Ticker": "SF",
                "Company": "Stifel Financial Corp"
              },
              {
                "Ticker": "SF-A",
                "Company": "Stifel Financial Corp"
              },
              {
                "Ticker": "SFB",
                "Company": "Stifel Financial Corporation 5.20% Senior Notes"
              },
              {
                "Ticker": "SFE",
                "Company": "Safeguard Scientifics"
              },
              {
                "Ticker": "SFL",
                "Company": "Ship Finance International"
              },
              {
                "Ticker": "SFS",
                "Company": "Smart & Final Stores Inc"
              },
              {
                "Ticker": "SFUN",
                "Company": "Soufun Holdings"
              },
              {
                "Ticker": "SGU",
                "Company": "Star Gas Partners LP"
              },
              {
                "Ticker": "SGZA",
                "Company": "Selective Insurance Group Inc"
              },
              {
                "Ticker": "SHAK",
                "Company": "Shake Shack Inc"
              },
              {
                "Ticker": "SHG",
                "Company": "Shinhan Financial Group Co Ltd"
              },
              {
                "Ticker": "SHI",
                "Company": "Sinopec Shangai Petrochemical Company Ltd"
              },
              {
                "Ticker": "SHLX",
                "Company": "Shell Midstream Partners LP"
              },
              {
                "Ticker": "SHO",
                "Company": "Sunstone Hotel Investors"
              },
              {
                "Ticker": "SHO-E",
                "Company": "Sunstone Hotel Investors Inc"
              },
              {
                "Ticker": "SHO-F",
                "Company": "Sunstone Hotel Investors Inc"
              },
              {
                "Ticker": "SHOP",
                "Company": "Shopify Inc"
              },
              {
                "Ticker": "SHW",
                "Company": "Sherwin-Williams Company"
              },
              {
                "Ticker": "SID",
                "Company": "Companhia Siderurgica Nacional"
              },
              {
                "Ticker": "SIG",
                "Company": "Signet Jewelers Ltd"
              },
              {
                "Ticker": "SITE",
                "Company": "Siteone Landscape Supply"
              },
              {
                "Ticker": "SIX",
                "Company": "Six Flags Entertainment Corp"
              },
              {
                "Ticker": "SJI",
                "Company": "South Jersey Industries"
              },
              {
                "Ticker": "SJIU",
                "Company": "South Jersey Industries Inc"
              },
              {
                "Ticker": "SJM",
                "Company": "J.M. Smucker Company"
              },
              {
                "Ticker": "SJR",
                "Company": "Shaw Communications Inc"
              },
              {
                "Ticker": "SJT",
                "Company": "San Juan Basin Royalty Trust"
              },
              {
                "Ticker": "SJW",
                "Company": "SJW Corp"
              },
              {
                "Ticker": "SKM",
                "Company": "Sk Telecom Corp"
              },
              {
                "Ticker": "SKT",
                "Company": "Tanger Factory Outlet Centers"
              },
              {
                "Ticker": "SKX",
                "Company": "Skechers U.S.A."
              },
              {
                "Ticker": "SKY",
                "Company": "Skyline Corp"
              },
              {
                "Ticker": "SLB",
                "Company": "Schlumberger N.V."
              },
              {
                "Ticker": "SLCA",
                "Company": "U.S. Silica Holdings Inc"
              },
              {
                "Ticker": "SLD",
                "Company": "Sutherland Asset Management Corp MD"
              },
              {
                "Ticker": "SLDA",
                "Company": "Sutherland Asset Management Corporation 7.00% Co"
              },
              {
                "Ticker": "SLDD",
                "Company": "Sutherland Asset Management Corporation 6.50% Se"
              },
              {
                "Ticker": "SLF",
                "Company": "Sun Life Financial Inc"
              },
              {
                "Ticker": "SLG",
                "Company": "SL Green Realty Corp"
              },
              {
                "Ticker": "SLG-I",
                "Company": "SL Green Realty Corp"
              },
              {
                "Ticker": "SLTB",
                "Company": "Scorpio Bulkers Inc 7.50% Seni"
              },
              {
                "Ticker": "SM",
                "Company": "Sm Energy Company"
              },
              {
                "Ticker": "SMAR",
                "Company": "Smartsheet Inc. Class A"
              },
              {
                "Ticker": "SMFG",
                "Company": "Sumitomo Mitsui Financial Group Inc"
              },
              {
                "Ticker": "SMG",
                "Company": "Scotts Miracle-Gro Company"
              },
              {
                "Ticker": "SMHI",
                "Company": "Seacor Marine Holdings Inc"
              },
              {
                "Ticker": "SMI",
                "Company": "Semiconductor Manufacturing International"
              },
              {
                "Ticker": "SMLP",
                "Company": "Summit Midstream Partners LP"
              },
              {
                "Ticker": "SMM",
                "Company": "Salient Midstream & MLP Fund"
              },
              {
                "Ticker": "SMP",
                "Company": "Standard Motor Products"
              },
              {
                "Ticker": "SMTA",
                "Company": "Spirit Mta REIT"
              },
              {
                "Ticker": "SN",
                "Company": "Sanchez Energy Corp"
              },
              {
                "Ticker": "SNA",
                "Company": "Snap-On Inc"
              },
              {
                "Ticker": "SNAP",
                "Company": "Snap Inc"
              },
              {
                "Ticker": "SNDR",
                "Company": "Schneider National Inc"
              },
              {
                "Ticker": "SNE",
                "Company": "Sony Corp"
              },
              {
                "Ticker": "SNN",
                "Company": "Smith & Nephew Snats"
              },
              {
                "Ticker": "SNP",
                "Company": "China Petroleum & Chemical Corp"
              },
              {
                "Ticker": "SNR",
                "Company": "New Senior Investment Group Inc"
              },
              {
                "Ticker": "SNV",
                "Company": "Synovus Financial Corp"
              },
              {
                "Ticker": "SNV-D",
                "Company": "Synovus Financial Corp. - Fxdfr Prf Perpetual US"
              },
              {
                "Ticker": "SNX",
                "Company": "Synnex Corp"
              },
              {
                "Ticker": "SNY",
                "Company": "Sanofi-Aventis S.A."
              },
              {
                "Ticker": "SO",
                "Company": "Southern Company"
              },
              {
                "Ticker": "SOGO",
                "Company": "Sogou Inc"
              },
              {
                "Ticker": "SOI",
                "Company": "Solaris Oilfield Infrastructure Inc Class A"
              },
              {
                "Ticker": "SOJA",
                "Company": "The Southern Co. Series"
              },
              {
                "Ticker": "SOJB",
                "Company": "Southern Co"
              },
              {
                "Ticker": "SOJC",
                "Company": "Southern Company Series 2017B 5.25% Junior Subor"
              },
              {
                "Ticker": "SOL",
                "Company": "Renesola Ltd"
              },
              {
                "Ticker": "SON",
                "Company": "Sonoco Products Company"
              },
              {
                "Ticker": "SOR",
                "Company": "Source Capital"
              },
              {
                "Ticker": "SPA",
                "Company": "Sparton Corp"
              },
              {
                "Ticker": "SPA.U",
                "Company": "Spartan Energy Acquisition Corp. Units"
              },
              {
                "Ticker": "SPA.W",
                "Company": "Spartan Energy Acquisition Corp Warrants"
              },
              {
                "Ticker": "SPAQ",
                "Company": "Spartan Energy Acquisition Corp Class A"
              },
              {
                "Ticker": "SPB",
                "Company": "Spectrum Brands Holdings Inc"
              },
              {
                "Ticker": "SPE",
                "Company": "Special Opportunities Fund Inc"
              },
              {
                "Ticker": "SPE-B",
                "Company": "Special Opportunities 3.5% Conv. Pfd. Series B"
              },
              {
                "Ticker": "SPG",
                "Company": "Simon Property Group"
              },
              {
                "Ticker": "SPG-J",
                "Company": "Simon Prop Grp Pfd J"
              },
              {
                "Ticker": "SPGI",
                "Company": "S&P Global Inc"
              },
              {
                "Ticker": "SPH",
                "Company": "Suburban Propane Partners LP"
              },
              {
                "Ticker": "SPL-A",
                "Company": "Steel Partners Holdings LP 6.0% Series A"
              },
              {
                "Ticker": "SPLP",
                "Company": "Steel Partners Hldgs"
              },
              {
                "Ticker": "SPN",
                "Company": "Superior Energy Services"
              },
              {
                "Ticker": "SPOT",
                "Company": "Spotify Technology S.A."
              },
              {
                "Ticker": "SPR",
                "Company": "Spirit Aerosystems Holdings"
              },
              {
                "Ticker": "SPXC",
                "Company": "SPX Corp"
              },
              {
                "Ticker": "SPXX",
                "Company": "Nuveen Equity Premium and Growth Fund"
              },
              {
                "Ticker": "SQ",
                "Company": "Square"
              },
              {
                "Ticker": "SQM",
                "Company": "Sociedad Quimica Y Minera S.A."
              },
              {
                "Ticker": "SQNS",
                "Company": "Sequans Communications S A"
              },
              {
                "Ticker": "SR",
                "Company": "Spire Inc"
              },
              {
                "Ticker": "SRC",
                "Company": "Spirit Realty Capital Inc"
              },
              {
                "Ticker": "SRC-A",
                "Company": "Spirit Realty Capital Inc Pfd Ser A"
              },
              {
                "Ticker": "SRE",
                "Company": "Sempra Energy"
              },
              {
                "Ticker": "SRE-A",
                "Company": "Sempra Energy Pfd Conv Ser A"
              },
              {
                "Ticker": "SRE-B",
                "Company": "Sempra Energy Pfd Conv Ser B"
              },
              {
                "Ticker": "SRF",
                "Company": "The Cushing Royalty & Income Fund"
              },
              {
                "Ticker": "SRG",
                "Company": "Seritage Growth Properties Cla"
              },
              {
                "Ticker": "SRG-A",
                "Company": "Seritage Growth Properties 7.00% Cum Red Pfd Ser"
              },
              {
                "Ticker": "SRI",
                "Company": "Stoneridge Inc"
              },
              {
                "Ticker": "SRLP",
                "Company": "Sprague Resources LP"
              },
              {
                "Ticker": "SRT",
                "Company": "Startek Inc"
              },
              {
                "Ticker": "SRV",
                "Company": "The Cushing MLP Total Return Fund"
              },
              {
                "Ticker": "SSD",
                "Company": "Simpson Manufacturing Company"
              },
              {
                "Ticker": "SSI",
                "Company": "Stage Stores"
              },
              {
                "Ticker": "SSL",
                "Company": "Sasol Ltd"
              },
              {
                "Ticker": "SSTK",
                "Company": "Shutterstock Inc"
              },
              {
                "Ticker": "SSW",
                "Company": "Seaspan Corp"
              },
              {
                "Ticker": "SSW-D",
                "Company": "Seaspan Corp"
              },
              {
                "Ticker": "SSW-E",
                "Company": "Seaspan Corp"
              },
              {
                "Ticker": "SSW-G",
                "Company": "Seaspan Corp"
              },
              {
                "Ticker": "SSW-H",
                "Company": "Seaspan Corp"
              },
              {
                "Ticker": "SSW-I",
                "Company": "Seaspan Corp Fixed/Fltg Perp Pfd Ser I"
              },
              {
                "Ticker": "SSWA",
                "Company": "Seaspan Corporation 7.125% Notes Due 2027"
              },
              {
                "Ticker": "SSWN",
                "Company": "Seaspan Corp"
              },
              {
                "Ticker": "ST",
                "Company": "Sensata Technologies Holding N.V."
              },
              {
                "Ticker": "STA-C",
                "Company": "Stag Industrial Inc Prf C"
              },
              {
                "Ticker": "STA-D",
                "Company": "Istar Financial Inc Preferred"
              },
              {
                "Ticker": "STA-G",
                "Company": "Istar Financial Inc Preferred"
              },
              {
                "Ticker": "STA-I",
                "Company": "Istar Financial Inc Preferred"
              },
              {
                "Ticker": "STAG",
                "Company": "STI Inc"
              },
              {
                "Ticker": "STAR",
                "Company": "Istar Financial Inc"
              },
              {
                "Ticker": "STC",
                "Company": "Stewart Information Services Corp"
              },
              {
                "Ticker": "STE",
                "Company": "Steris Corp"
              },
              {
                "Ticker": "STG",
                "Company": "Sunlands Online Education Group ADR"
              },
              {
                "Ticker": "STI",
                "Company": "Suntrust Banks"
              },
              {
                "Ticker": "STI-A",
                "Company": "Suntrust Bks Dep Sh"
              },
              {
                "Ticker": "STI.A",
                "Company": "Suntrust Banks Inc Cl A"
              },
              {
                "Ticker": "STI.B",
                "Company": "Suntrust Banks Inc Cl B"
              },
              {
                "Ticker": "STK",
                "Company": "Columbia Seligman Premium Technology"
              },
              {
                "Ticker": "STL",
                "Company": "Sterling Bancorp"
              },
              {
                "Ticker": "STL-A",
                "Company": "Sterling Bancorp Series A"
              },
              {
                "Ticker": "STM",
                "Company": "Stmicroelectronics N.V."
              },
              {
                "Ticker": "STN",
                "Company": "Stantec Inc"
              },
              {
                "Ticker": "STNG",
                "Company": "Scorpio Tankers Inc"
              },
              {
                "Ticker": "STON",
                "Company": "Stonemor Partners LP"
              },
              {
                "Ticker": "STOR",
                "Company": "Store Capital Corpstore Capital"
              },
              {
                "Ticker": "STT",
                "Company": "State Street Corp"
              },
              {
                "Ticker": "STT-C",
                "Company": "State Street Corporation Dep Sh"
              },
              {
                "Ticker": "STT-D",
                "Company": "State Street Corporation Serie"
              },
              {
                "Ticker": "STT-E",
                "Company": "State Street Corporation Depos"
              },
              {
                "Ticker": "STT-G",
                "Company": "State Street Corp"
              },
              {
                "Ticker": "STWD",
                "Company": "Starwood Property Trust"
              },
              {
                "Ticker": "STZ",
                "Company": "Constellation Brands Inc"
              },
              {
                "Ticker": "STZ.B",
                "Company": "Constellation Brd Cl B"
              },
              {
                "Ticker": "SU",
                "Company": "Suncor Energy Inc"
              },
              {
                "Ticker": "SUI",
                "Company": "Sun Communities"
              },
              {
                "Ticker": "SUM",
                "Company": "Summit Materials Inc"
              },
              {
                "Ticker": "SUN",
                "Company": "Sunoco LP"
              },
              {
                "Ticker": "SUP",
                "Company": "Superior Industries International"
              },
              {
                "Ticker": "SUPV",
                "Company": "Grupo Supervielle S.A."
              },
              {
                "Ticker": "SVU",
                "Company": "Supervalu Inc"
              },
              {
                "Ticker": "SWCH",
                "Company": "Switch Inc"
              },
              {
                "Ticker": "SWJ",
                "Company": "Stanley Black & Decker Inc"
              },
              {
                "Ticker": "SWK",
                "Company": "Stanley Black & Decker Inc"
              },
              {
                "Ticker": "SWM",
                "Company": "Schweitzer-Mauduit International"
              },
              {
                "Ticker": "SWN",
                "Company": "Southwestern Energy Company"
              },
              {
                "Ticker": "SWP",
                "Company": "Stanley Black & Decker Inc"
              },
              {
                "Ticker": "SWX",
                "Company": "Southwest Gas Corp"
              },
              {
                "Ticker": "SWZ",
                "Company": "Swiss Helvetia Fund"
              },
              {
                "Ticker": "SXC",
                "Company": "Suncoke Energy Inc"
              },
              {
                "Ticker": "SXCP",
                "Company": "Suncoke Energy Partners LP"
              },
              {
                "Ticker": "SXE",
                "Company": "Southcross Energy Partners L"
              },
              {
                "Ticker": "SXI",
                "Company": "Standex International Corp"
              },
              {
                "Ticker": "SXT",
                "Company": "Sensient Technologies Corp"
              },
              {
                "Ticker": "SYF",
                "Company": "Synchrony Financial"
              },
              {
                "Ticker": "SYK",
                "Company": "Stryker Corp"
              },
              {
                "Ticker": "SYX",
                "Company": "Systemax Inc"
              },
              {
                "Ticker": "SYY",
                "Company": "Sysco Corp"
              },
              {
                "Ticker": "SZC",
                "Company": "The Cushing Renaissance Fund"
              },
              {
                "Ticker": "T",
                "Company": "AT&T Inc"
              },
              {
                "Ticker": "TAC",
                "Company": "Transalta Corp"
              },
              {
                "Ticker": "TAHO",
                "Company": "Tahoe Res Inc"
              },
              {
                "Ticker": "TAL",
                "Company": "Tal Education Group"
              },
              {
                "Ticker": "TALO",
                "Company": "Talos Energy Inc"
              },
              {
                "Ticker": "TAP",
                "Company": "Molson Coors Brewing Company"
              },
              {
                "Ticker": "TAP.A",
                "Company": "Molson Coors Brewing Company"
              },
              {
                "Ticker": "TARO",
                "Company": "Taro Pharm Inds"
              },
              {
                "Ticker": "TBB",
                "Company": "AT&T Inc 5.350% Global Notes Due 2066"
              },
              {
                "Ticker": "TBC",
                "Company": "AT&T Inc. 5.625% Global Notes Due 2067"
              },
              {
                "Ticker": "TBI",
                "Company": "Trueblue Inc"
              },
              {
                "Ticker": "TCF",
                "Company": "TCF Financial Corp"
              },
              {
                "Ticker": "TCF-D",
                "Company": "TCF Financial Corp"
              },
              {
                "Ticker": "TCF.W",
                "Company": "TCF Financial Corp"
              },
              {
                "Ticker": "TCI",
                "Company": "Transcontinental Realty Investors"
              },
              {
                "Ticker": "TCO",
                "Company": "Taubman Centers"
              },
              {
                "Ticker": "TCO-J",
                "Company": "Taubman Centers Inc Preferred"
              },
              {
                "Ticker": "TCO-K",
                "Company": "Taubman Centers Inc"
              },
              {
                "Ticker": "TCP",
                "Company": "TCP Pipelines"
              },
              {
                "Ticker": "TCRX",
                "Company": "THL Credit Inc"
              },
              {
                "Ticker": "TCRZ",
                "Company": "THL Credit Inc"
              },
              {
                "Ticker": "TCS",
                "Company": "The Container Store Group Inc"
              },
              {
                "Ticker": "TD",
                "Company": "Toronto Dominion Bank"
              },
              {
                "Ticker": "TDA",
                "Company": "Telephone and Data Systems Inc"
              },
              {
                "Ticker": "TDC",
                "Company": "Teradata Corp"
              },
              {
                "Ticker": "TDE",
                "Company": "Telephone and Data Systems"
              },
              {
                "Ticker": "TDF",
                "Company": "Templeton Dragon Fund"
              },
              {
                "Ticker": "TDG",
                "Company": "Transdigm Group Inc"
              },
              {
                "Ticker": "TDI",
                "Company": "Telephone and Data Systems"
              },
              {
                "Ticker": "TDJ",
                "Company": "Telephone and Data Systems Inc"
              },
              {
                "Ticker": "TDOC",
                "Company": "Teladoc Health Inc"
              },
              {
                "Ticker": "TDS",
                "Company": "Telephone and Data Systems"
              },
              {
                "Ticker": "TDW",
                "Company": "Tidewater Inc"
              },
              {
                "Ticker": "TDW.A",
                "Company": "Tidewater Inc Series A Warrants"
              },
              {
                "Ticker": "TDW.B",
                "Company": "Tidewater Inc Series B Warrants"
              },
              {
                "Ticker": "TDY",
                "Company": "Teledyne Technologies Inc"
              },
              {
                "Ticker": "TECK",
                "Company": "Teck Resources Ltd"
              },
              {
                "Ticker": "TEF",
                "Company": "Telefonica S.A."
              },
              {
                "Ticker": "TEI",
                "Company": "Templeton Emerging Markets"
              },
              {
                "Ticker": "TEL",
                "Company": "Te Connectivity Ltd"
              },
              {
                "Ticker": "TEN",
                "Company": "Tenneco Automotive"
              },
              {
                "Ticker": "TEO",
                "Company": "Telecom Argentina Stet - France Telecom S.A."
              },
              {
                "Ticker": "TER",
                "Company": "Teradyne Inc"
              },
              {
                "Ticker": "TEVA",
                "Company": "Teva Pharmaceutical Industries Ltd"
              },
              {
                "Ticker": "TEX",
                "Company": "Terex Corp"
              },
              {
                "Ticker": "TFX",
                "Company": "Teleflex Inc"
              },
              {
                "Ticker": "TG",
                "Company": "Tredegar Corp"
              },
              {
                "Ticker": "TGE",
                "Company": "Tallgrass Energy Gp LP"
              },
              {
                "Ticker": "TGH",
                "Company": "Textainer Group Holdings"
              },
              {
                "Ticker": "TGI",
                "Company": "Triumph Group"
              },
              {
                "Ticker": "TGNA",
                "Company": "Tegna Inc"
              },
              {
                "Ticker": "TGP",
                "Company": "Teekay Lng Partners LP"
              },
              {
                "Ticker": "TGP-A",
                "Company": "Teekay Lng Partners LP Pref Share"
              },
              {
                "Ticker": "TGP-B",
                "Company": "Teekay Lng Partners LP Perp Pfd Unit Ser B Fixed"
              },
              {
                "Ticker": "TGS",
                "Company": "Transportadora De Gas Sa Ord B"
              },
              {
                "Ticker": "TGT",
                "Company": "Target Corp"
              },
              {
                "Ticker": "THC",
                "Company": "Tenet Healthcare Corp"
              },
              {
                "Ticker": "THG",
                "Company": "The Hanover Insurance Group"
              },
              {
                "Ticker": "THGA",
                "Company": "The Hanover Insurance Group I"
              },
              {
                "Ticker": "THO",
                "Company": "Thor Industries"
              },
              {
                "Ticker": "THQ",
                "Company": "Tekla Healthcare Opportunities"
              },
              {
                "Ticker": "THR",
                "Company": "Thermon Group Holdings Inc"
              },
              {
                "Ticker": "THS",
                "Company": "Treehouse Foods"
              },
              {
                "Ticker": "THW",
                "Company": "Tekla World Healthcare Fund"
              },
              {
                "Ticker": "TI",
                "Company": "Telecom Italia S.P.A."
              },
              {
                "Ticker": "TI.A",
                "Company": "Telecom Italia S.P.A."
              },
              {
                "Ticker": "TIER",
                "Company": "Tier REIT"
              },
              {
                "Ticker": "TIF",
                "Company": "Tiffany & Co"
              },
              {
                "Ticker": "TISI",
                "Company": "Team Inc"
              },
              {
                "Ticker": "TJX",
                "Company": "TJX Companies"
              },
              {
                "Ticker": "TK",
                "Company": "Teekay Shipping Corp"
              },
              {
                "Ticker": "TKC",
                "Company": "Turkcell Iletisim Hizmetleri As"
              },
              {
                "Ticker": "TKR",
                "Company": "Timken Company"
              },
              {
                "Ticker": "TLI",
                "Company": "Lmp Corporate Loan Fund Inc"
              },
              {
                "Ticker": "TLK",
                "Company": "P.T. Telekomunikasi Indonesia Tbk"
              },
              {
                "Ticker": "TLP",
                "Company": "Transmontaigne Partners LP"
              },
              {
                "Ticker": "TLRA",
                "Company": "Telaria Inc"
              },
              {
                "Ticker": "TLRD",
                "Company": "Tailored Brands Inc"
              },
              {
                "Ticker": "TLYS",
                "Company": "Tilly's Inc"
              },
              {
                "Ticker": "TM",
                "Company": "Toyota Motor Corp Ltd Ord"
              },
              {
                "Ticker": "TMHC",
                "Company": "Taylor Morrison Home Corporatio"
              },
              {
                "Ticker": "TMK",
                "Company": "Torchmark Corp"
              },
              {
                "Ticker": "TMK-C",
                "Company": "Torchmark Corporation 6.125% Ju"
              },
              {
                "Ticker": "TMO",
                "Company": "Thermo Fisher Scientific Inc"
              },
              {
                "Ticker": "TMST",
                "Company": "Timken Steel Corp"
              },
              {
                "Ticker": "TNC",
                "Company": "Tennant Company"
              },
              {
                "Ticker": "TNET",
                "Company": "Trinet Group Inc"
              },
              {
                "Ticker": "TNK",
                "Company": "Teekay Tankers Ltd"
              },
              {
                "Ticker": "TNP",
                "Company": "Tsakos Energy Navigation Ltd"
              },
              {
                "Ticker": "TNP-B",
                "Company": "Tsakos Energy Navigation Limit"
              },
              {
                "Ticker": "TNP-C",
                "Company": "Tsakos Energy Navigation Limit"
              },
              {
                "Ticker": "TNP-D",
                "Company": "Tsakos Energy Navigation Limit"
              },
              {
                "Ticker": "TNP-E",
                "Company": "Tsakos Energy Navigation Ltd"
              },
              {
                "Ticker": "TNP-F",
                "Company": "Tsakos Energy Navigation Ltd Cum Red Perp Pfd FI"
              },
              {
                "Ticker": "TOL",
                "Company": "Toll Brothers Inc"
              },
              {
                "Ticker": "TOO",
                "Company": "Teekay Offshore Partners LP"
              },
              {
                "Ticker": "TOO-A",
                "Company": "Teekay Offshore Partners LP"
              },
              {
                "Ticker": "TOO-B",
                "Company": "Teekay Offshore Partners LP"
              },
              {
                "Ticker": "TOO-E",
                "Company": "Teekay Offshore Partners LP 8.875% Cum Red Perp"
              },
              {
                "Ticker": "TOT",
                "Company": "Totalfinaelf S.A."
              },
              {
                "Ticker": "TOWR",
                "Company": "Tower International"
              },
              {
                "Ticker": "TPB",
                "Company": "Turning Point Brands"
              },
              {
                "Ticker": "TPC",
                "Company": "Tutor Perini Corp"
              },
              {
                "Ticker": "TPG.H",
                "Company": "Tpg Pace Holdings Corp"
              },
              {
                "Ticker": "TPG.I",
                "Company": "Tpg Pace Holdings Corp Warrants"
              },
              {
                "Ticker": "TPGH",
                "Company": "Tpg Pace Holdings Corp Class A Ordinary Shares"
              },
              {
                "Ticker": "TPH",
                "Company": "Tri Pointe Homes Inc"
              },
              {
                "Ticker": "TPL",
                "Company": "Texas Pacific Land Trust"
              },
              {
                "Ticker": "TPR",
                "Company": "Tapestry Inc"
              },
              {
                "Ticker": "TPRE",
                "Company": "Third Point Reinsurance Ltd Co"
              },
              {
                "Ticker": "TPVG",
                "Company": "Triplepoint Venture Growth Bdc"
              },
              {
                "Ticker": "TPVY",
                "Company": "Triplepoint Venture Growth Bdc Corp 5.75% Notes"
              },
              {
                "Ticker": "TPX",
                "Company": "Tempur-Pedic International Inc"
              },
              {
                "Ticker": "TPZ",
                "Company": "Tortoise Power and Energy"
              },
              {
                "Ticker": "TR",
                "Company": "Tootsie Roll Industries"
              },
              {
                "Ticker": "TRC",
                "Company": "Tejon Ranch Company"
              },
              {
                "Ticker": "TRCO",
                "Company": "Tribune Media Corp"
              },
              {
                "Ticker": "TREC",
                "Company": "Trecora Resources"
              },
              {
                "Ticker": "TREX",
                "Company": "Trex Company"
              },
              {
                "Ticker": "TRGP",
                "Company": "Targa Resources"
              },
              {
                "Ticker": "TRI",
                "Company": "Thomson Reuters Corp"
              },
              {
                "Ticker": "TRK",
                "Company": "Speedway Motorsports"
              },
              {
                "Ticker": "TRN",
                "Company": "Trinity Industries"
              },
              {
                "Ticker": "TRNO",
                "Company": "Terreno Realty Corp"
              },
              {
                "Ticker": "TROX",
                "Company": "Tronox Inc"
              },
              {
                "Ticker": "TRP",
                "Company": "Transcananda Pipelines"
              },
              {
                "Ticker": "TRQ",
                "Company": "Turquoise Hill Resources Ltd"
              },
              {
                "Ticker": "TRTN",
                "Company": "Triton International Ltd"
              },
              {
                "Ticker": "TRTX",
                "Company": "Tpg Re Finance Trust Inc"
              },
              {
                "Ticker": "TRU",
                "Company": "Transunion"
              },
              {
                "Ticker": "TRV",
                "Company": "The Travelers Companies Inc"
              },
              {
                "Ticker": "TS",
                "Company": "Tenaris S.A."
              },
              {
                "Ticker": "TSE",
                "Company": "Trinseo S.A."
              },
              {
                "Ticker": "TSI",
                "Company": "Tcw Strategic"
              },
              {
                "Ticker": "TSLF",
                "Company": "THL Credit Senior Loan Fund"
              },
              {
                "Ticker": "TSLX",
                "Company": "Tpg Specialty Lending Inc"
              },
              {
                "Ticker": "TSM",
                "Company": "Taiwan Semiconductor Manufacturing"
              },
              {
                "Ticker": "TSN",
                "Company": "Tyson Foods"
              },
              {
                "Ticker": "TSQ",
                "Company": "Townsquare Media Llc"
              },
              {
                "Ticker": "TSS",
                "Company": "Total System Services"
              },
              {
                "Ticker": "TSU",
                "Company": "Tim Participacoes S.A."
              },
              {
                "Ticker": "TTC",
                "Company": "Toro Company"
              },
              {
                "Ticker": "TTI",
                "Company": "Tetra Technologies"
              },
              {
                "Ticker": "TTM",
                "Company": "Tata Motors Ltd"
              },
              {
                "Ticker": "TTP",
                "Company": "Tortoise Pipeline & Energy Fund"
              },
              {
                "Ticker": "TU",
                "Company": "Telus Corp Non Voting Shares"
              },
              {
                "Ticker": "TUP",
                "Company": "Tupperware Corp"
              },
              {
                "Ticker": "TV",
                "Company": "Grupo Televisa S.A."
              },
              {
                "Ticker": "TVC",
                "Company": "Tennessee Valley Authority"
              },
              {
                "Ticker": "TVE",
                "Company": "Tennessee Valley Authority"
              },
              {
                "Ticker": "TVPT",
                "Company": "Travelport Worldwide Ltd"
              },
              {
                "Ticker": "TWI",
                "Company": "Titan International"
              },
              {
                "Ticker": "TWLO",
                "Company": "Twilio"
              },
              {
                "Ticker": "TWN",
                "Company": "Taiwan Fund"
              },
              {
                "Ticker": "TWO",
                "Company": "Two Harbors Investments Corp"
              },
              {
                "Ticker": "TWO-A",
                "Company": "Two Harbors Investment Corp"
              },
              {
                "Ticker": "TWO-B",
                "Company": "Two Harbors Investment Corp"
              },
              {
                "Ticker": "TWO-C",
                "Company": "Two Harbors Investment Corp Cum Red Pfd Ser C FI"
              },
              {
                "Ticker": "TWO-D",
                "Company": "Two Harbors Investments Corp 7.75% Series D"
              },
              {
                "Ticker": "TWO-E",
                "Company": "Two Harbors Investments Corp 7.50% Series E"
              },
              {
                "Ticker": "TWTR",
                "Company": "Twitter Inc"
              },
              {
                "Ticker": "TX",
                "Company": "Ternium S.A."
              },
              {
                "Ticker": "TXT",
                "Company": "Textron Inc"
              },
              {
                "Ticker": "TY",
                "Company": "Tri Continental Corp"
              },
              {
                "Ticker": "TY.P",
                "Company": "Tri Contl Cp 2.50 Pr"
              },
              {
                "Ticker": "TYG",
                "Company": "Tortoise Energy Infrastructure Corp"
              },
              {
                "Ticker": "TYL",
                "Company": "Tyler Technologies"
              },
              {
                "Ticker": "UA",
                "Company": "Under Armour Inc Class C Comm"
              },
              {
                "Ticker": "UAA",
                "Company": "Under Armour"
              },
              {
                "Ticker": "UAN",
                "Company": "Cvr Partners LP"
              },
              {
                "Ticker": "UBA",
                "Company": "Urstadt Biddle Properties Inc"
              },
              {
                "Ticker": "UBP",
                "Company": "Urstadt Biddle Properties Inc"
              },
              {
                "Ticker": "UBP-G",
                "Company": "Urstadt Biddle Properties Inc"
              },
              {
                "Ticker": "UBP-H",
                "Company": "Urstadt Biddle Properties Inc Pfd."
              },
              {
                "Ticker": "UBS",
                "Company": "UBS Group Ag"
              },
              {
                "Ticker": "UDR",
                "Company": "United Dominion Realty Trust"
              },
              {
                "Ticker": "UE",
                "Company": "Urban Edge Properties"
              },
              {
                "Ticker": "UFI",
                "Company": "Unifi Inc"
              },
              {
                "Ticker": "UFS",
                "Company": "Domtar Corp"
              },
              {
                "Ticker": "UGI",
                "Company": "Ugi Corp"
              },
              {
                "Ticker": "UGP",
                "Company": "Ultrapar Participacoes S.A."
              },
              {
                "Ticker": "UHS",
                "Company": "Universal Health Services"
              },
              {
                "Ticker": "UHT",
                "Company": "Universal Health Realty Income Trust"
              },
              {
                "Ticker": "UIS",
                "Company": "Unisys Corp"
              },
              {
                "Ticker": "UL",
                "Company": "Unilever Plc"
              },
              {
                "Ticker": "UMC",
                "Company": "United Microelectronics Corp"
              },
              {
                "Ticker": "UMH",
                "Company": "Umh Properties"
              },
              {
                "Ticker": "UMH-B",
                "Company": "Umh Properties Inc"
              },
              {
                "Ticker": "UMH-C",
                "Company": "Umh Properties Inc"
              },
              {
                "Ticker": "UMH-D",
                "Company": "Umh Properties Inc Cum Red Pfd Ser D"
              },
              {
                "Ticker": "UN",
                "Company": "Unilever Nv"
              },
              {
                "Ticker": "UNF",
                "Company": "Unifirst Corp"
              },
              {
                "Ticker": "UNH",
                "Company": "Unitedhealth Group Inc"
              },
              {
                "Ticker": "UNM",
                "Company": "Unumprovident Corp"
              },
              {
                "Ticker": "UNMA",
                "Company": "Unum Group 6.250% Junior Subordinated Notes Due"
              },
              {
                "Ticker": "UNP",
                "Company": "Union Pacific Corp"
              },
              {
                "Ticker": "UNT",
                "Company": "Unit Corp"
              },
              {
                "Ticker": "UNVR",
                "Company": "Univar Inc"
              },
              {
                "Ticker": "UPS",
                "Company": "United Parcel Service"
              },
              {
                "Ticker": "URI",
                "Company": "United Rentals"
              },
              {
                "Ticker": "USA",
                "Company": "Liberty All-Star Equity Fund"
              },
              {
                "Ticker": "USAC",
                "Company": "USA Compression Partners LP"
              },
              {
                "Ticker": "USB",
                "Company": "U.S. Bancorp"
              },
              {
                "Ticker": "USB-A",
                "Company": "U.S. Bancorp Depositary Shares"
              },
              {
                "Ticker": "USB-H",
                "Company": "U.S. Bancorp Dep Sh"
              },
              {
                "Ticker": "USB-M",
                "Company": "U.S. Bancorp"
              },
              {
                "Ticker": "USB-O",
                "Company": "U.S. Bancorp"
              },
              {
                "Ticker": "USB-P",
                "Company": "US Bancorp [De] Depositary Shs Repstg 1/1000Th P"
              },
              {
                "Ticker": "USDP",
                "Company": "USD Partners LP"
              },
              {
                "Ticker": "USFD",
                "Company": "US Foods Holding"
              },
              {
                "Ticker": "USG",
                "Company": "USG Corp"
              },
              {
                "Ticker": "USM",
                "Company": "United States Cellular Corp"
              },
              {
                "Ticker": "USNA",
                "Company": "Usana Health Sciences Inc"
              },
              {
                "Ticker": "USPH",
                "Company": "U.S. Physical Therapy"
              },
              {
                "Ticker": "USX",
                "Company": "U.S. Xpress Enterprises Inc. Class A"
              },
              {
                "Ticker": "UTF",
                "Company": "Cohen & Steers Infrastructure Fund"
              },
              {
                "Ticker": "UTI",
                "Company": "Universal Technical Institute Inc"
              },
              {
                "Ticker": "UTL",
                "Company": "Unitil Corp"
              },
              {
                "Ticker": "UTX",
                "Company": "United Technologies Corp"
              },
              {
                "Ticker": "UVE",
                "Company": "Universal Insurance Holdings Inc"
              },
              {
                "Ticker": "UVV",
                "Company": "Universal Corp"
              },
              {
                "Ticker": "UZA",
                "Company": "United States Cellular Corp"
              },
              {
                "Ticker": "UZB",
                "Company": "United States Cellular Corpora"
              },
              {
                "Ticker": "UZC",
                "Company": "United States Cellular Corpora"
              },
              {
                "Ticker": "V",
                "Company": "Visa Inc"
              },
              {
                "Ticker": "VAC",
                "Company": "Marriot Vacations Worldwide Cor"
              },
              {
                "Ticker": "VALE",
                "Company": "Vale S.A."
              },
              {
                "Ticker": "VAM",
                "Company": "The Vivaldi Opportunities Fund"
              },
              {
                "Ticker": "VAR",
                "Company": "Varian Medical Systems"
              },
              {
                "Ticker": "VBF",
                "Company": "Invesco Van Kampen Bond Fund"
              },
              {
                "Ticker": "VCRA",
                "Company": "Vocera Communications Inc"
              },
              {
                "Ticker": "VCV",
                "Company": "Invesco California Value Muni Income Trust"
              },
              {
                "Ticker": "VEC",
                "Company": "Vectrus Inc"
              },
              {
                "Ticker": "VEDL",
                "Company": "Vedanta Ltd"
              },
              {
                "Ticker": "VEEV",
                "Company": "Veeva Systems Inc"
              },
              {
                "Ticker": "VER",
                "Company": "Vereit Inc"
              },
              {
                "Ticker": "VER-F",
                "Company": "Vereit Inc"
              },
              {
                "Ticker": "VET",
                "Company": "Vermilion Energy Inc"
              },
              {
                "Ticker": "VFC",
                "Company": "V.F. Corp"
              },
              {
                "Ticker": "VG",
                "Company": "Vonage Holdings"
              },
              {
                "Ticker": "VGI",
                "Company": "Virtus Global Multi-Sector Inc"
              },
              {
                "Ticker": "VGM",
                "Company": "Invesco Trust For Investment Grade Municipals"
              },
              {
                "Ticker": "VGR",
                "Company": "Vector Group Ltd"
              },
              {
                "Ticker": "VHI",
                "Company": "Valhi Inc"
              },
              {
                "Ticker": "VICI",
                "Company": "Vici Properties Inc"
              },
              {
                "Ticker": "VIPS",
                "Company": "Vipshop Holdings Ltd"
              },
              {
                "Ticker": "VIV",
                "Company": "Telecomunicacoes De Sao Paulo ADR"
              },
              {
                "Ticker": "VJET",
                "Company": "Voxeljet Ag"
              },
              {
                "Ticker": "VKQ",
                "Company": "Invesco Muni Trust"
              },
              {
                "Ticker": "VLO",
                "Company": "Valero Energy Corp"
              },
              {
                "Ticker": "VLP",
                "Company": "Valero Energy Partners LP"
              },
              {
                "Ticker": "VLRS",
                "Company": "Controladora Vuela Compaia De"
              },
              {
                "Ticker": "VLT",
                "Company": "Invesco High"
              },
              {
                "Ticker": "VLY",
                "Company": "Valley National Bancorp"
              },
              {
                "Ticker": "VLY-A",
                "Company": "Valley National Bancorp"
              },
              {
                "Ticker": "VLY-B",
                "Company": "Valley National Bancorp [Nj] Non Cum Perp Pfd Se"
              },
              {
                "Ticker": "VLY.W",
                "Company": "Valley National Bancorp"
              },
              {
                "Ticker": "VMC",
                "Company": "Vulcan Materials Company"
              },
              {
                "Ticker": "VMI",
                "Company": "Valmont Industries"
              },
              {
                "Ticker": "VMO",
                "Company": "Invesco Muni Opportunity Trust"
              },
              {
                "Ticker": "VMW",
                "Company": "Vmware Inc"
              },
              {
                "Ticker": "VNCE",
                "Company": "Vince Holding Corp"
              },
              {
                "Ticker": "VNE",
                "Company": "Veoneer Inc"
              },
              {
                "Ticker": "VNO",
                "Company": "Vornado Realty Trust"
              },
              {
                "Ticker": "VNO-K",
                "Company": "Vornado Realty Trust"
              },
              {
                "Ticker": "VNO-L",
                "Company": "Vornado Realty Trust"
              },
              {
                "Ticker": "VNO-M",
                "Company": "Vornado Realty Trust Redeemable Pfd Ser M"
              },
              {
                "Ticker": "VNTR",
                "Company": "Venator Materials Plc Ordinary Shares"
              },
              {
                "Ticker": "VOC",
                "Company": "Voc Energy Trust"
              },
              {
                "Ticker": "VOYA",
                "Company": "VOYA Financial Inc"
              },
              {
                "Ticker": "VPG",
                "Company": "Vishay Precision Group"
              },
              {
                "Ticker": "VPV",
                "Company": "Invesco Pennsylvania Muni"
              },
              {
                "Ticker": "VR-A",
                "Company": "Validus Holdings Ltd"
              },
              {
                "Ticker": "VR-B",
                "Company": "Validus Holdings Ltd"
              },
              {
                "Ticker": "VRS",
                "Company": "Verso Corp"
              },
              {
                "Ticker": "VRTV",
                "Company": "Veritiv Corp"
              },
              {
                "Ticker": "VSH",
                "Company": "Vishay Intertechnology"
              },
              {
                "Ticker": "VSI",
                "Company": "Vitamin Shoppe Inc"
              },
              {
                "Ticker": "VSLR",
                "Company": "Vivint Solar Inc"
              },
              {
                "Ticker": "VSM",
                "Company": "Versum Materials Inc"
              },
              {
                "Ticker": "VST",
                "Company": "Vistra Energy Corp"
              },
              {
                "Ticker": "VST.A",
                "Company": "Vistra Energy Corp"
              },
              {
                "Ticker": "VSTO",
                "Company": "Vista Outdoor Inc"
              },
              {
                "Ticker": "VTA",
                "Company": "Invesco Dynamic Credit Fund"
              },
              {
                "Ticker": "VTN",
                "Company": "Invesco Trust New York Muni"
              },
              {
                "Ticker": "VTR",
                "Company": "Ventas Inc"
              },
              {
                "Ticker": "VTRB",
                "Company": "Ventas Realty Limited Partner"
              },
              {
                "Ticker": "VVC",
                "Company": "Vectren Corp"
              },
              {
                "Ticker": "VVI",
                "Company": "Viad Corp"
              },
              {
                "Ticker": "VVR",
                "Company": "Invesco Senior Income Trust"
              },
              {
                "Ticker": "VVV",
                "Company": "Valvoline Inc"
              },
              {
                "Ticker": "VZ",
                "Company": "Verizon Communications Inc"
              },
              {
                "Ticker": "VZA",
                "Company": "Verizon Communications Inc 5.9"
              },
              {
                "Ticker": "W",
                "Company": "Wayfair Inc"
              },
              {
                "Ticker": "WAAS",
                "Company": "Aquaventure Holdings Ltd"
              },
              {
                "Ticker": "WAB",
                "Company": "Wabtec Corp"
              },
              {
                "Ticker": "WAGE",
                "Company": "Wageworks Inc"
              },
              {
                "Ticker": "WAIR",
                "Company": "Wesco Aircraft Holdings Inc"
              },
              {
                "Ticker": "WAL",
                "Company": "Western Alliance Bancorporation"
              },
              {
                "Ticker": "WALA",
                "Company": "Western Alliance Bancorporation"
              },
              {
                "Ticker": "WAT",
                "Company": "Waters Corp"
              },
              {
                "Ticker": "WBAI",
                "Company": "500Wan.com Ltd"
              },
              {
                "Ticker": "WBC",
                "Company": "Wabco Holdings Inc"
              },
              {
                "Ticker": "WBK",
                "Company": "Westpac Banking Corp"
              },
              {
                "Ticker": "WBS",
                "Company": "Webster Financial Corp"
              },
              {
                "Ticker": "WBS-F",
                "Company": "Webster Financial Corp Pfd"
              },
              {
                "Ticker": "WBT",
                "Company": "Welbilt Inc"
              },
              {
                "Ticker": "WCC",
                "Company": "Wesco International"
              },
              {
                "Ticker": "WCG",
                "Company": "Wellcare Group"
              },
              {
                "Ticker": "WCN",
                "Company": "Waste Connections Inc"
              },
              {
                "Ticker": "WD",
                "Company": "Walker & Dunlop"
              },
              {
                "Ticker": "WDR",
                "Company": "Waddell & Reed Financial"
              },
              {
                "Ticker": "WEA",
                "Company": "Western Asset Bond Fund"
              },
              {
                "Ticker": "WEC",
                "Company": "Wisconsin Energy Corp"
              },
              {
                "Ticker": "WEL-I",
                "Company": "Welltower Inc. Pfd Series I"
              },
              {
                "Ticker": "WELL",
                "Company": "Welltower Inc"
              },
              {
                "Ticker": "WES",
                "Company": "Western Gas Partners LP"
              },
              {
                "Ticker": "WEX",
                "Company": "Wex Inc"
              },
              {
                "Ticker": "WF",
                "Company": "Woori Finance Holdings Co Ltd"
              },
              {
                "Ticker": "WFC",
                "Company": "Wells Fargo & Company"
              },
              {
                "Ticker": "WFC-L",
                "Company": "Wells Fargo Pfd L"
              },
              {
                "Ticker": "WFC-N",
                "Company": "Wells Fargo & Company Dep Shs R"
              },
              {
                "Ticker": "WFC-O",
                "Company": "Wells Fargo & Company"
              },
              {
                "Ticker": "WFC-P",
                "Company": "Wells Fargo & Company Ser P"
              },
              {
                "Ticker": "WFC-Q",
                "Company": "Wells Fargo & Co"
              },
              {
                "Ticker": "WFC-R",
                "Company": "Wells Fargo"
              },
              {
                "Ticker": "WFC-T",
                "Company": "Wells Fargo & Company Series T"
              },
              {
                "Ticker": "WFC-V",
                "Company": "Wells Fargo & Company Depositar"
              },
              {
                "Ticker": "WFC-W",
                "Company": "Wells Fargo & Company"
              },
              {
                "Ticker": "WFC-X",
                "Company": "Wells Fargo & Company"
              },
              {
                "Ticker": "WFC-Y",
                "Company": "Wells Fargo & Co. Dep Shs Repstg 1/1000Th Int No"
              },
              {
                "Ticker": "WFC.W",
                "Company": "Wells Fargo and Co"
              },
              {
                "Ticker": "WFE-A",
                "Company": "Wells Fargo Real Estate Invest"
              },
              {
                "Ticker": "WFT",
                "Company": "Weatherford International Ltd"
              },
              {
                "Ticker": "WGO",
                "Company": "Winnebago Industries"
              },
              {
                "Ticker": "WGP",
                "Company": "Western Gas Eqty Partners LP"
              },
              {
                "Ticker": "WH",
                "Company": "Wyndham Hotels & Resorts Inc"
              },
              {
                "Ticker": "WHD",
                "Company": "Cactus Inc. Class A"
              },
              {
                "Ticker": "WHG",
                "Company": "Westwood Holdings Group Inc"
              },
              {
                "Ticker": "WHR",
                "Company": "Whirlpool Corp"
              },
              {
                "Ticker": "WIA",
                "Company": "U.S. Treasury Inflation Prot Secs Fd"
              },
              {
                "Ticker": "WIT",
                "Company": "Wipro Ltd"
              },
              {
                "Ticker": "WIW",
                "Company": "U.S Treasury Inflation Prot Secs Fd 2"
              },
              {
                "Ticker": "WK",
                "Company": "Workiva Llc"
              },
              {
                "Ticker": "WLH",
                "Company": "William Lyon Homes"
              },
              {
                "Ticker": "WLK",
                "Company": "Westlake Chemical Corp"
              },
              {
                "Ticker": "WLKP",
                "Company": "Westlake Chemical Partners LP"
              },
              {
                "Ticker": "WLL",
                "Company": "Whiting Petroleum Corp"
              },
              {
                "Ticker": "WM",
                "Company": "Waste Management"
              },
              {
                "Ticker": "WMB",
                "Company": "Williams Companies"
              },
              {
                "Ticker": "WMC",
                "Company": "Western Asset Mortgage Capital"
              },
              {
                "Ticker": "WMK",
                "Company": "Weis Markets"
              },
              {
                "Ticker": "WMLP",
                "Company": "Westmoreland Resource Partners LP"
              },
              {
                "Ticker": "WMS",
                "Company": "Advanced Drainage Systems Inc"
              },
              {
                "Ticker": "WMT",
                "Company": "Wal-Mart Stores"
              },
              {
                "Ticker": "WNC",
                "Company": "Wabash National Corp"
              },
              {
                "Ticker": "WNS",
                "Company": "Wns Ltd"
              },
              {
                "Ticker": "WOR",
                "Company": "Worthington Industries"
              },
              {
                "Ticker": "WOW",
                "Company": "Wideopenwest Inc"
              },
              {
                "Ticker": "WP",
                "Company": "Worldpay Inc"
              },
              {
                "Ticker": "WPC",
                "Company": "W.P. Carey & Co. Llc"
              },
              {
                "Ticker": "WPG",
                "Company": "Washington Prime Group Inc"
              },
              {
                "Ticker": "WPG-H",
                "Company": "Washington Prime Group Inc 7.5"
              },
              {
                "Ticker": "WPG-I",
                "Company": "Wp Glimcher Inc"
              },
              {
                "Ticker": "WPM",
                "Company": "Wheaton Precious Metals"
              },
              {
                "Ticker": "WPP",
                "Company": "Wpp Plc ADR"
              },
              {
                "Ticker": "WPX",
                "Company": "Wpx Energy Inc"
              },
              {
                "Ticker": "WRB",
                "Company": "W.R. Berkley Corp"
              },
              {
                "Ticker": "WRB-B",
                "Company": "W.R. Berkley Corp"
              },
              {
                "Ticker": "WRB-C",
                "Company": "W.R. Berkley Corp"
              },
              {
                "Ticker": "WRB-D",
                "Company": "W.R. Berkley Corporation 5.75%"
              },
              {
                "Ticker": "WRB-E",
                "Company": "W.R. Berkley Corp. 5.70% Sub Debentures"
              },
              {
                "Ticker": "WRD",
                "Company": "Wildhorse Resour"
              },
              {
                "Ticker": "WRE",
                "Company": "Washington Real Estate Investment"
              },
              {
                "Ticker": "WRI",
                "Company": "Weingarten Realty Investors"
              },
              {
                "Ticker": "WRK",
                "Company": "Westrock Company"
              },
              {
                "Ticker": "WSM",
                "Company": "Williams-Sonoma"
              },
              {
                "Ticker": "WSO",
                "Company": "Watsco Inc"
              },
              {
                "Ticker": "WSO.B",
                "Company": "Watsco Inc Cl B"
              },
              {
                "Ticker": "WSR",
                "Company": "Whitestone REIT"
              },
              {
                "Ticker": "WST",
                "Company": "West Pharmaceutical Services"
              },
              {
                "Ticker": "WTI",
                "Company": "W&T Offshore"
              },
              {
                "Ticker": "WTM",
                "Company": "White Mountains Insurance Group"
              },
              {
                "Ticker": "WTR",
                "Company": "Aqua America"
              },
              {
                "Ticker": "WTS",
                "Company": "Watts Water Technologies"
              },
              {
                "Ticker": "WTTR",
                "Company": "Select Energy Services Inc"
              },
              {
                "Ticker": "WTW",
                "Company": "Weight Watchers International Inc"
              },
              {
                "Ticker": "WU",
                "Company": "Western Union Company"
              },
              {
                "Ticker": "WUBA",
                "Company": "58.com Inc"
              },
              {
                "Ticker": "WWE",
                "Company": "World Wrestling Entertainment"
              },
              {
                "Ticker": "WWW",
                "Company": "Wolverine World Wide"
              },
              {
                "Ticker": "WY",
                "Company": "Weyerhaeuser Company"
              },
              {
                "Ticker": "WYND",
                "Company": "Wyndham Destinations Inc"
              },
              {
                "Ticker": "X",
                "Company": "United States Steel Corp"
              },
              {
                "Ticker": "XAN",
                "Company": "Exantas Capital Corp"
              },
              {
                "Ticker": "XAN-C",
                "Company": "Exantas Capital Corp. Pfd"
              },
              {
                "Ticker": "XEC",
                "Company": "Cimarex Energy Co"
              },
              {
                "Ticker": "XFLT",
                "Company": "Xai Octagon Floating Alt Income Term Trust Co"
              },
              {
                "Ticker": "XHR",
                "Company": "Xenia Hotels & Resorts Inc"
              },
              {
                "Ticker": "XIN",
                "Company": "Xinyuan Real Estate Co Ltd"
              },
              {
                "Ticker": "XOM",
                "Company": "Exxon Mobil Corp"
              },
              {
                "Ticker": "XOXO",
                "Company": "Xoxo Group Inc"
              },
              {
                "Ticker": "XPO",
                "Company": "Xpo Logistics Inc"
              },
              {
                "Ticker": "XRF",
                "Company": "China Rapid Finance Limited ADR"
              },
              {
                "Ticker": "XRM",
                "Company": "Xerium Technologies"
              },
              {
                "Ticker": "XRX",
                "Company": "Xerox Corp"
              },
              {
                "Ticker": "XYF",
                "Company": "X Financial"
              },
              {
                "Ticker": "XYL",
                "Company": "Xylem Inc"
              },
              {
                "Ticker": "Y",
                "Company": "Alleghany Corp"
              },
              {
                "Ticker": "YELP",
                "Company": "Yelp Inc"
              },
              {
                "Ticker": "YEXT",
                "Company": "Yext Inc"
              },
              {
                "Ticker": "YPF",
                "Company": "Ypf Sociedad Anonima"
              },
              {
                "Ticker": "YRD",
                "Company": "Yirendai Ltd"
              },
              {
                "Ticker": "YUM",
                "Company": "Yum! Brands"
              },
              {
                "Ticker": "YUMC",
                "Company": "Yum China Holdings Inc"
              },
              {
                "Ticker": "ZAYO",
                "Company": "Zayo Group Holdings Inc"
              },
              {
                "Ticker": "ZB-A",
                "Company": "Zions Bc Dp Shs A"
              },
              {
                "Ticker": "ZB-G",
                "Company": "Zions Bancorporation"
              },
              {
                "Ticker": "ZB-H",
                "Company": "Zions Bancorporation"
              },
              {
                "Ticker": "ZBH",
                "Company": "Zimmer Biomet Holdings"
              },
              {
                "Ticker": "ZBK",
                "Company": "Zion Bancorporation"
              },
              {
                "Ticker": "ZEN",
                "Company": "Zendesk Inc"
              },
              {
                "Ticker": "ZF",
                "Company": "Zweig Fund"
              },
              {
                "Ticker": "ZNH",
                "Company": "China Southern Airlines Company"
              },
              {
                "Ticker": "ZOES",
                "Company": "Zoe's Kitchen Inc"
              },
              {
                "Ticker": "ZTO",
                "Company": "Zto Express [Cayman] Inc"
              },
              {
                "Ticker": "ZTR",
                "Company": "Zweig Total Return Fund"
              },
              {
                "Ticker": "ZTS",
                "Company": "Zoetis Inc Class A"
              },
              {
                "Ticker": "ZUO",
                "Company": "Zuora Inc"
              },
              {
                "Ticker": "ZYME",
                "Company": "Zymeworks Inc"
              }
          ];
    }
});
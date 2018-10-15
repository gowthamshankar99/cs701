module.controller('graphController',function($scope,$http) {
    $http.get('https://iyz9xlw3ba.execute-api.us-east-1.amazonaws.com/Prod/getIndividualStockTickers').then(function(done) {
        console.log(JSON.stringify(done.data.Items));
        $scope.tickers = [];
        for(let temp=0;temp<done.data.Items.length;temp++)
        {
            $scope.tickers.push(done.data.Items[temp].tickerName.S);
        }

        //alert($scope.tickers);
    });

    $scope.searchClick = function()
    {
        //alert($scope.elec);
            //alert('From angular JS ');
    const a = 'Time Series (Daily)';
    
    $http.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + $scope.elec  + '&apikey=9cjx6en2H1_XFehNXrGx')
    .then(function(done) {
        //alert(JSON.stringify(done));
        let volumeArray = [];
        let dateArray = [];
        let openArray = [];
        for(let i=0;i<11;i++)
        {
            // new date
            let date2 = new Date();

            let getDateOnly = "";
            if((date2.getDate()-i) < 10)
            {
                 getDateOnly = date2.getFullYear() + "-0"  + (date2.getMonth() + 1) + "-0" + (date2.getDate()-i);
            }
            else
            {
                getDateOnly = date2.getFullYear() + "-0"  + (date2.getMonth() + 1) + "-" + (date2.getDate()-i);
            }
            
            console.log(getDateOnly);
            console.log(done['data'][`${a}`]);
            if(done['data'][`${a}`][`${getDateOnly}`] != undefined)
            {
                var ctx = document.getElementById("myChart").getContext('2d');
                dateArray.push(getDateOnly);
                console.log(done['data'][`${a}`][`${getDateOnly}`]['5. volume']);
                openArray.push(done['data'][`${a}`][`${getDateOnly}`]['1. open']);
                volumeArray.push(done['data'][`${a}`][`${getDateOnly}`]['5. volume']);

                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dateArray,
                        datasets: [{
                            label: 'Stock Price',
                            data: openArray,
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
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });

                var ctx2 = document.getElementById("myChart2").getContext('2d');
                var myChart2 = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: dateArray,
                        datasets: [{
                            label: 'Volume ',
                            data: volumeArray,
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
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            }
            
        }
    })
    }

});``
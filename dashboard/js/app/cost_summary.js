var costSummary = echarts.init(document.getElementById('cost-summary'));
var costMap = echarts.init(document.getElementById('map'));
var costService = echarts.init(document.getElementById('cost-service'));
var costAccount = echarts.init(document.getElementById('cost-account'));

var data = [
    {name: 'Seoul', value: 213.20},
    {name: 'Singapore', value: 63.50},
    {name: 'Ireland', value: 30.32},
    {name: 'N.Virginia', value: 0.07},
    {name: 'São Paulo', value: 0}
];

var geoCoordMap = {
    "N.Virginia":[-78.656894,37.431573],
    "Ohio":[-82.996216,40.367474],
    "N.California":[-119.417931, 36.778259],
    "Oregon":[-122.679565,45.512794],
    "Frankfurt":[8.682127, 50.110924],
    "Singapore":[103.851959,1.290270],
    "Ireland":[-7.692054,53.142367],
    "Seoul": [126.977969,37.566535],
    "Tokyo": [139.691706,35.689487],
    "Beijing":[116.388,39.9035],
    "London": [-0.1275,51.5072],
    "São Paulo": [-46.6388,-23.5489],
    "Sydney" : [151.209900, -33.865143],
    "Mumbai" : [72.8776559, 19.0759837],
    "Sydney" : [151.209900, -33.865143],
    "Mumbai" : [72.8776559, 19.0759837],
    "Central": [643329.12388567, 5540547.3703413]
};

function convertData(j) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
       var geoCoord = geoCoordMap[data[i].name];
       if (geoCoord) {
           res.push({
               name: data[i].name,
               value: geoCoord.concat(data[i].value)
           });
       }
   }
    var dataRegion = res[j];
    var arr = [];
    arr.push({
               name:dataRegion.name,
               value:dataRegion.value
           });
    return arr;
}

optionSummary = {
    color : ['#f87a56'],
    tooltip : {
        trigger: 'axis',
        formatter: '{b} : ${c}',
        backgroundColor:echart_tooltip_backgroundColor,
        padding: echart_tooltip_padding,
        textStyle:{
            fontFamily:echart_fontFamily,
            fontSize:echart_tooltip_fontSize
        }
    },
    grid: {
        left: '20px',
        right: '40px',
        top:'15%',
        bottom: '0',
        containLabel: true,
        borderColor: '#e1e1e1'
    },
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            axisTick : {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color:'#b0b0b0'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dotted',
                    color:'#ddd'
                }
            },
            axisLabel: {
                textStyle: {
                    fontFamily: echart_fontFamily,
                    fontSize:10
                }
            },
            data : ['2017-03-01','2017-03-02','2017-03-03','2017-03-04','2017-03-05','2017-03-06','2017-03-07','2017-03-08','2017-03-09','2017-03-10','2017-03-11','2017-03-12','2017-03-13','2017-03-14','2017-03-15','2017-03-16','2017-03-17']
        }
    ],
    yAxis : [
        {
            type : 'value',
            axisTick : {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color:'#b0b0b0'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dotted',
                    color:'#ddd'
                }
            },
            axisLabel: {
                textStyle: {
                    fontFamily: echart_fontFamily,
                    fontSize:10
                }
            }
        }
    ],
    series : [
        {
            name:'daily',
            type:'line',
            symbolSize: 6,
            itemStyle: {
                normal: {
                    borderColor:'#f87a56',
                    borderWidth:2
                }
            },
            lineStyle:{
                normal: {
                    color:'#f87a56'
                }
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(248, 122, 86, .4)'
                    }, {
                        offset: 1,
                        color: 'rgba(255, 69, 131, .1)'
                    }])
                }
            },
            data:[120, 132, 130, 130, 120, 130, 125, 120, 132, 101, 100, 90, 230, 210, 120, 132, 101, 134]
        }
    ]
};


optionMap = {
    tooltip: {
        trigger: 'item',
        formatter: function (params) {
            var value = (params.value + '').split(',');
            value = value[2];
            return params.name + ' : $'+value;
        },
        backgroundColor:echart_tooltip_backgroundColor,
        padding: echart_tooltip_padding,
        textStyle:{
            fontFamily:echart_fontFamily,
            fontSize:echart_tooltip_fontSize
        }
    },
    geo: {
        map: 'world',
        silent: true,
        roam: true,
        scaleLimit: {
            min:1,
            max:5
        },
        zoom: 1.4,
        center: [30,8],
        label: {
            normal: {
                show: false
            },
            emphasis:{
                textStyle: {
                    color: 'rgba(0,0,0,0.4)',
                    fontFamily:echart_fontFamily
                }
            }
        },
        itemStyle: {
            normal:{
                areaColor: '#f5f5f5',
                borderColor: '#dcdcdc'
            }
        }
    },
    series : [
        {
           name: 'eu-west-1',
           type: 'scatter',
           //geoIndex: 0,
           coordinateSystem: 'geo',
           data:convertData(0),
           symbolSize: 6,
           label: {
               normal: {
                   show:true,
                   position: 'bottom',
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontSize:12,
                        color: '#5f83e8'
                   }
               },
               emphasis: {
                   show: true,
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontWeight:500,
                        fontSize:24,
                        color: '#5f83e8'
                   }
               }
           },
		   itemStyle: {
			   normal: {
					color: '#5f83e8',
					opacity : 1,
				   borderColor:'rgba(95, 131, 232, 0.3)',
				   borderWidth:20,
			   },
			   emphasis: {
					borderWidth:34
				}
		   }
       },
       {
           name: 'us-east-1',
           type: 'scatter',
           geoIndex: 0,
           coordinateSystem: 'geo',
           data:convertData(1),
           symbolSize: 6,
           label: {
               normal: {
                   show:true,
                   position: 'right',
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontSize:12,
                        color: '#7a7a7a'
                   }
               },
               emphasis: {
                   show: true,
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontWeight:500,
                        fontSize:24,
                        color: '#7a7a7a'
                   }
               }
           },
           itemStyle: {
               normal: {
                    color: '#7a7a7a',
                    opacity : 1,
                   borderColor:'rgba(122, 122, 122, 0.3)',
                   borderWidth:0,
               }
           }
        },
        {
           name: 'eu-west-1',
           type: 'scatter',
           geoIndex: 0,
           coordinateSystem: 'geo',
           data:convertData(2),
           symbolSize: 6,
           label: {
               normal: {
                   show:true,
                   position: 'top',
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontSize:12,
                        color: '#7a7a7a'
                   }
               },
               emphasis: {
                   show: true,
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontWeight:500,
                        fontSize:24,
                        color: '#7a7a7a'
                   }
               }
           },
           itemStyle: {
               normal: {
                    color: '#7a7a7a',
                    opacity : 1,
                   borderColor:'rgba(122, 122, 122, 0.3)',
                   borderWidth:0,
               }
           }
        },
        {
           name: 'eu-west-1',
           type: 'scatter',
           geoIndex: 0,
           coordinateSystem: 'geo',
           data:convertData(3),
           symbolSize: 6,
           label: {
               normal: {
                   show:true,
                   position: 'left',
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontSize:12,
                        color: '#7a7a7a'
                   }
               },
               emphasis: {
                   show: true,
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontWeight:500,
                        fontSize:24,
                        color: '#7a7a7a'
                   }
               }
           },
           itemStyle: {
               normal: {
                    color: '#7a7a7a',
                    opacity : 1,
                   borderColor:'rgba(122, 122, 122, 0.3)',
                   borderWidth:0,
               }
           }
        },
        {
           name: 'eu-west-1',
           type: 'scatter',
           geoIndex: 0,
           coordinateSystem: 'geo',
           data:convertData(4),
           symbolSize: 6,
           label: {
               normal: {
                   show:true,
                   position: 'top',
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontSize:12,
                        color: '#7a7a7a'
                   }
               },
               emphasis: {
                   show: true,
                   textStyle: {
                        fontFamily:echart_fontFamily,
                        fontWeight:500,
                        fontSize:24,
                        color: '#7a7a7a'
                   }
               }
           },
           itemStyle: {
               normal: {
                    color: '#7a7a7a',
                    opacity : 1,
                   borderColor:'rgba(122, 122, 122, 0.3)',
                   borderWidth:0,
               }
           }
        }

    ]
};

var optionService = {
    tooltip : {
        trigger: 'item',
        formatter: "{b} : ${c}",
        backgroundColor:echart_tooltip_backgroundColor,
        padding: echart_tooltip_padding,
        textStyle:{
            fontFamily:echart_fontFamily,
            fontSize:echart_tooltip_fontSize
        }
    },
    legend: {
        show: false,
        orient : 'horizontal',
        x : 'right',
        y : 'center',
        padding : [0, 26],
        width: 10,
        backgroundColor:'#ffff00',
        itemGap : 5,
        itemWidth : 12,
        itemHeight : 12,
        textStyle : {
            fontFamily : echart_fontFamily,
            fontSize : '10',
            color : 'rgba(0,0,0,.5)'
        },
        data:['EC2','RDS','Elaticache','ELB','etc']
    },
    series : [
        {
            name:'Cost by AWS Service',
            type:'pie',
            radius : ['50%', '70%'],
            itemStyle : {
                normal : {
                    label : {
                        show : true,
                        formatter : "${c}",
                        textStyle : {
                            fontSize : '12',
                            fontFamily : echart_fontFamily,
                        }
                    },
                    labelLine : {
                        show : true
                    }
                },
                emphasis : {
                    label : {
                        show : true,
                        position : 'center',
                        formatter : "${c}",
                        textStyle : {
                            fontSize : '24',
                            fontFamily : echart_fontFamily,
                            fontWeight : 500
                        }
                    }
                }
            },
            data:[
                {value:129.89, name:'EC2'},
                {value:55.88, name:'RDS'},
                {value:40.08, name:'Elaticache'},
                {value:29.25, name:'ELB'},
                {value:51.99, name:'etc'}
            ]
        }
    ],
    color : echart_color_palette15,
    animationDuration : 800
};

var optionAccount = {
    tooltip : {
        trigger: 'axis',
        //formatter: "{a} : ${c}",
        backgroundColor:'rgba(0,0,0,0.6)',
        padding: [10,15],
        textStyle:{
            fontSize:13,
            fontFamily: echart_fontFamily
        },
        axisPointer : {
            type : 'shadow',
            shadowStyle : {
                opacity:0,
            }
        }
    },
    legend: {
        show:false,
        orient : 'vertical',
        x : 'right',
        y : 'center',
        padding : [0, 26],
        itemGap : 5,
        itemWidth : 12,
        itemHeight : 12,
        textStyle : {
            fontFamily : echart_fontFamily,
            fontSize : '10',
            color : 'rgba(0,0,0,.5)'
        }
    },
    grid: {
        top: '3%',
        left: '0',
        right: '1px',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            axisTick : {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color:'#bbb'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dotted',
                    color:'#ddd'
                }
            },
            axisLabel: {
                show: false,
                textStyle: {
                    fontFamily: echart_fontFamily,
                    fontSize:10
                }
            },
            data : [''],
            barCategoryGap: '50%'
        }
    ],
    yAxis : [
        {
            type : 'value',
            axisTick : {
                show: false
            },
            axisLine: {
                show: false,
                lineStyle: {
                    color:'#bbb'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    type: 'dotted',
                    color:'#ddd'
                }
            },
            axisLabel: {
                textStyle: {
                    fontFamily: echart_fontFamily,
                    fontSize:10
                }
            }
        }
    ],
    series: [
        {
            name: 'A2-devops',
            type: 'bar',
            data: [25.2],
            label: {
                normal: {
                    show: false,
                    position: 'top',
                    formatter: '${c}',
                    textStyle: {
                        fontSize:10
                    }
                }
            },
            barMaxWidth: 30,
            barGap: '100%'
        },
        {
            name: 'A2-homepage',
            type: 'bar',
            data: [10],
            label: {
                normal: {
                    show: false,
                    position: 'top',
                    formatter: '${c}',
                    textStyle: {
                        fontSize:10,
                        fontFamily: echart_fontFamily,
                        fontWeight : 500
                    }
                }
            },
            barMaxWidth: 30,
            barGap: '100%'
        },
        {
            name: 'A2-aws-admin',
            type: 'bar',
            data: [10],
            label: {
                normal: {
                    show: false,
                    position: 'top',
                    formatter: '${c}',
                    textStyle: {
                        fontSize:10,
                        fontFamily: echart_fontFamily,
                        fontWeight : 500
                    }
                }
            },
            barMaxWidth: 30,
            barGap: '100%'
        }
    ],
    color : echart_color_palette15,
    animationDuration : 800
};
costSummary.setOption(optionSummary);
costMap.setOption(optionMap);
costService.setOption(optionService);
costAccount.setOption(optionAccount);
window.onresize = function() {
    costSummary.resize();
    costMap.resize();
    costService.resize();
    costAccount.resize();
};

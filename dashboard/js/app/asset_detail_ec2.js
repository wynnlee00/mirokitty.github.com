var byType = echarts.init(document.getElementById('ec2-type'));
var byRegion = echarts.init(document.getElementById('ec2-region'));
var byStatus = echarts.init(document.getElementById('ec2-status'));


//dispatchaction
$('.chart-legend').on('mouseover','li',function(){
    var name = $(this).text();
    var typeString = $(this).parents('.chart-legend').attr('class');
    var typeArray = typeString.split(' ');
    var type = typeArray[1];
    switch (type) {
        case 'type':
        byType.dispatchAction({
            type: 'highlight',
            name: name
        });
        break;
        case 'region':
        byRegion.dispatchAction({
            type: 'highlight',
            name: name
        });
        break;
        case 'status':
        byStatus.dispatchAction({
            type: 'highlight',
            name: name
        });
        break;
    }
});

$('.chart-legend').on('click','li',function(){
    var name = $(this).text();
    var typeString = $(this).parents('.chart-legend').attr('class');
    var typeArray = typeString.split(' ');
    var type = typeArray[1];
    switch (type) {
        case 'type':
        byType.dispatchAction({
            type: 'legendToggleSelect',
            name: name
        });
        break;
        case 'region':
        byRegion.dispatchAction({
            type: 'legendToggleSelect',
            name: name
        });
        break;
        case 'status':
        byStatus.dispatchAction({
            type: 'legendToggleSelect',
            name: name
        });
        break;
    }
    $(this).toggleClass('dimmed');
});

$('.chart-legend').on('mouseleave', 'li', function(){
    var name = $(this).text();
    var typeString = $(this).parents('.chart-legend').attr('class');
    var typeArray = typeString.split(' ');
    var type = typeArray[1];
    switch (type) {
        case 'type':
        byType.dispatchAction({
            type: 'downplay',
            name: name
        });
        break;
        case 'region':
        byRegion.dispatchAction({
            type: 'downplay',
            name: name
        });
        break;
        case 'status':
        byStatus.dispatchAction({
            type: 'downplay',
            name: name
        });
        break;
    }
});



var optionType = {
    tooltip : {
        trigger: 'item',
        //formatter: "{a} <br/>{b} : <strong>${c}</strong> ({d}%)",
        backgroundColor:echart_tooltip_backgroundColor,
        padding: echart_tooltip_padding,
        textStyle:{
            fontFamily:echart_fontFamily,
            fontSize:echart_tooltip_fontSize
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
        },
        data:['t2.micro','t2.nano','m4.large','m3.large','t2.small','t2.medium']
    },
    series : [
        {
            name:'by Type',
            type:'pie',
            center: ['50%','105px'],
            radius : ['46px', '70px'],
            labelLine : {
                normal : {
                    length: 20
                }
            },
            itemStyle : {
                normal : {
                    label : {
                        show : false,
                        formatter : "{c}",
                    },
                    labelLine : {
                        show : true
                    }
                },
                emphasis : {
                    label : {
                        show : true,
                        position : 'center',
                        formatter : "{c}",
                        textStyle : {
                            fontSize : '24',
                            fontFamily : echart_fontFamily,
                            fontWeight : '500'
                        }
                    }
                }
            },
            data:[
                {value:131, name:'t2.micro'},
                {value:125, name:'t2.nano'},
                {value:103, name:'m4.large'},
                {value:50, name:'m3.large'},
                {value:40, name:'t2.small'},
                {value:25, name:'t2.medium'}
            ]
        }
    ],
    color : echart_color_palette15,
    animationDuration : 800
};

var optionRegion = {
    tooltip : {
        trigger: 'item',
        //formatter: "{a} <br/>{b} : <strong>${c}</strong> ({d}%)",
        backgroundColor:echart_tooltip_backgroundColor,
        padding: echart_tooltip_padding,
        textStyle:{
            fontFamily:echart_fontFamily,
            fontSize:echart_tooltip_fontSize
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
        },
        data:['us-east-1','us-east-2','us-west-1','us-west-2','ca-central-1','eu-west-1','eu-central-1','eu-west-2','ap-northeast-2','sa-east-1']
    },
    series : [
        {
            name:'by Region',
            type:'pie',
            center: ['50%','105px'],
            radius : ['46px', '70px'],
            labelLine : {
                normal : {
                    length: 20
                }
            },
            itemStyle : {
                normal : {
                    label : {
                        show : false,
                        formatter : "{c}",
                    },
                    labelLine : {
                        show : true
                    }
                },
                emphasis : {
                    label : {
                        show : true,
                        position : 'center',
                        formatter : "{c}",
                        textStyle : {
                            fontSize : '24',
                            fontFamily : echart_fontFamily,
                            fontWeight : '500'
                        }
                    }
                }
            },
            data:[
                {value:25, name:'us-east-1'},
                {value:13, name:'us-east-2'},
                {value:11, name:'us-west-1'},
                {value:5, name:'us-west-2'},
                {value:4, name:'ca-central-1'},
                {value:5, name:'eu-west-1'},
                {value:3, name:'eu-central-1'},
                {value:2, name:'eu-west-2'},
                {value:25, name:'ap-northeast-2'},
                {value:13, name:'sa-east-1'}
            ]
        }
    ],
    color : echart_color_palette15,
    animationDuration : 800
};

var optionStatus = {
    tooltip : {
        trigger: 'item',
        //formatter: "{a} <br/>{b} : <strong>${c}</strong> ({d}%)",
        backgroundColor:echart_tooltip_backgroundColor,
        padding: echart_tooltip_padding,
        textStyle:{
            fontFamily:echart_fontFamily,
            fontSize:echart_tooltip_fontSize
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
        },
        data:['Running','Stopped']
    },
    series : [
        {
            name:'by Status',
            type:'pie',
            center: ['50%','105px'],
            radius : ['46px', '70px'],
            labelLine : {
                normal : {
                    length: 20
                }
            },
            itemStyle : {
                normal : {
                    label : {
                        show : false,
                        formatter : "{c}",
                    },
                    labelLine : {
                        show : true
                    }
                },
                emphasis : {
                    label : {
                        show : true,
                        position : 'center',
                        formatter : "{c}",
                        textStyle : {
                            fontSize : '24',
                            fontFamily : echart_fontFamily,
                            fontWeight : '500'
                        }
                    }
                }
            },
            data:[
                {value:25.2, name:'Running'},
                {value:3.2, name:'Stopped'},
            ]
        }
    ],
    color : echart_color_palette15,
    animationDuration : 800
};
byType.setOption(optionType);
byRegion.setOption(optionRegion);
byStatus.setOption(optionStatus);
window.onresize = function() {
    byType.resize();
    byRegion.resize();
    byStatus.resize();
};

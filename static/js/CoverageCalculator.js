/**
 *  Target: LoveLive! SIF Perfect Lock Coverage Calculator
 *  Version: 1.1.0.20160812_alpha
 *  Author: Chemical Fertilizers
 */

var Offset = [4.5, 4, 3.625, 3.25, 2.875, 2.5, 2.25, 2, 1.75, 1.5];
var Speed = [1.8, 1.6, 1.45, 1.3, 1.15, 1, 0.9, 0.8, 0.7, 0.6];
var Perfect = [0.072, 0.064, 0.058, 0.052, 0.046, 0.04, 0036, 0.032, 0.028, 0.024];
var Great = [0.18, 0.16, 0.145, 0.13, 0.115, 0.1, 0.09, 0.08, 0.07, 0.06];
var Good = [0.288, 0.256, 0.232, 0.208, 0.184, 0.16, 0.144, 0.128, 0.112, 0.096];

function sortNumber(a, b)
{
    return a - b;
}

//区间长度计算
function EndPoint_calc(StartPoint, q, td)
{
	var IntervalLength = 0;
	
		for (; q < Map_size; q++)
		{
		    if (StartPoint <= Map_beat[q])
			{
		        var r = 1;
		        while (q < Map_size)
				{
		            var td_c = Map_beat[q] - StartPoint;
	 	            td_c = td_c + 16 * r;
	 	            r++;
		            if (td_c > td)
					{
	 	                IntervalLength = td - 16 * (r - 2);
	 		           	break;
					}
	  		        else if (td_c == td)
					{
	                	IntervalLength = td - 16 * (r - 1);
	                	break;
	                }
		        	q++;
	            }
		    
		        if (IntervalLength == 0)
				{
		            IntervalLength = Map_beat[Map_size - 1] - StartPoint;
		        }
		        return StartPoint + IntervalLength;
			}
		}
}
	
//N判时间轴覆盖计算
function N_calc(n, p, td)
{
    var TimeAxis = new Array();
	for (var i = 0; i < Map_beat[Map_size - 1]; i++)
	{
	    TimeAxis[i] = 1;
	}
	td *= 1000;
	var RequireNote = Math.floor(Map_size / n);
	
	var StartPoint = new Array();
	var EndPoint = new Array();
	var Probability = new Array();
	for (var k = 0; k < 66; k++)
	{
	    StartPoint[k] = new Array();
	    EndPoint[k] = new Array();
	    Probability[k] = new Array();
	}
	
	for (i = 0; i < RequireNote; i++)
	{
	    var j = 0;
		StartPoint[i][j] = Map_note[(i + 1) * n];
		var q = Math.max(0,(i + 1) * n - 50);
		EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], q, td);
		
		//计算第一个状态
		var sigma2 = 0;
        for (var l = 1; i != 0 && i - l != -1; l++)
		{
		    var sigma1 = 0;
			for (k = 0; k < EndPoint[i - l].length; k++)
			{
			    if (EndPoint[i - l][k] <= StartPoint[i][j])
				{
				    sigma1 = sigma1 + Probability[i - l][k];
				}
			}
			sigma2 = sigma2 + sigma1 * Math.pow((1 - p),(l - 1));
		}
		sigma2 = sigma2 + Math.pow((1 - p),(l - 1));
		Probability[i][j] = p * sigma2;
		
		//计算后面的状态
		j++;
		var TempStartPoint = new Array(0);
		var TempProbability = new Array(0);
		for (l = 1; i - l != -1; l++)
		{
		    for (k = 0; k < EndPoint[i - l].length; k++)
			{
			    if (EndPoint[i - l][k] > StartPoint[i][0])
				{
				    TempStartPoint[j] = EndPoint[i - l][k];
					TempProbability[j] = p * Probability[i - l][k] * Math.pow((1 - p),(l - 1));
					j++;
				}
			}
		}
		
		//合并重合的状态
		j = 1;
		l = 1;
		for (k = 1; k <= TempStartPoint.length; k++)
		{
		    Probability[i][k] = 0;
		}
		while (l < TempStartPoint.length)
		{
		    while (l < TempStartPoint.length)
			{
			    if (TempStartPoint[l] != -1)
				{
				    StartPoint[i][j] = TempStartPoint[l];
					Probability[i][j] += TempProbability[l];
					break;
				}
				l++;
			}
			for (k = l + 1; k < TempStartPoint.length; k++)
			{
			    if (TempStartPoint[k] == TempStartPoint[l])
				{
				    TempStartPoint[k] = -1;
					Probability[i][j] += TempProbability[k];
				}
			}
			q = Math.max(0,(i + 1) * n - 50);
			EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], q, td);
			j++;
			l++;
		}
		
		//结果输出到时间轴
		for (j = 0; j < StartPoint[i].length; j++)
		{
		    var a = Math.round(StartPoint[i][j]) - 1;
			var b = Math.round(EndPoint[i][j]) - 1;
	    	for (; a < b; a++)
			{
			    TimeAxis[a] -= Probability[i][j];
			}
		}
	}

	return TimeAxis;
}

//T判时间轴覆盖计算
function T_calc(t, p, td)
{
    var TimeAxis = new Array();
	for (var i = 0; i < Map_beat[Map_size - 1]; i++)
	{
	    TimeAxis[i] = 1;
	}
	t *= 2;
	td *= 2;
	var StartPoint = new Array();
	var EndPoint = new Array();
	var Probability = new Array();
	var k = Math.ceil(Map_beat[Map_size - 1] * 0.002 + Map_size * 0.032 + 2);
	var f = new Array(k);
	var g = new Array(k);
	for (i = 0; i < k; i++)
	{
	    f[i] = 0;
		g[i] = 0;
	}
	g[0] = 1;
	
	var j = 0;
	for (i = t; i < k; i++)
	{
	    f[i] = p * g[i - t];
		g[i] = f[i - td] + (1 - p) * g[i - t];
		if (f[i] != 0)
		{
		    StartPoint[j] = i * 500;
	        EndPoint[j] = StartPoint[j] + td * 500;
	        Probability[j] = f[i];
			j++;
		}
	}
	
	//处理技能时间bug
	for (i = 0; i < Map_size; i++)
	{
	    for (j = 0; j < StartPoint.length; j++)
		{
		    if (Map_beat[i] < StartPoint[j])
		    {
		        StartPoint[j] -= 16;
		    }
		    if (Map_beat[i] < EndPoint[j])
		    {
		        EndPoint[j] -= 16;
		    }
		}
	}
	
	for (i = 0; i < StartPoint.length; i++)
	{
	    for (j = Math.round(StartPoint[i]) - 1; j < Math.round(EndPoint[i]) - 1; j++)
		{
		    TimeAxis[j] -= Probability[i];
		}
	}
	return TimeAxis;
}

//C判时间轴覆盖计算
function C_calc(c, p, td, s)
{
    var TimeAxis = new Array();
	for (var i = 0; i < Map_beat[Map_size - 1]; i++)
	{
	    TimeAxis[i] = 1;
	}
	td *= 1000;
	var RequireNote = Math.floor(Map_size / c);
	
	var StartPoint = new Array();
	var EndPoint = new Array();
	var Probability = new Array();
	for (var k = 0; k < 66; k++)
	{
	    StartPoint[k] = new Array();
	    EndPoint[k] = new Array();
	    Probability[k] = new Array();
	}
	
	for (i = 0; i < RequireNote; i++)
	{
	    var j = 0;
		StartPoint[i][j] = Map_beat[(i + 1) * c] - Good[s - 1] * 1000;
		var q = Math.max(0,(i + 1) * c - 50);
		EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], q, td);
		
		//计算第一个状态
		var sigma2 = 0;
        for (var l = 1; i != 0 && i - l != -1; l++)
		{
		    var sigma1 = 0;
			for (k = 0; k < EndPoint[i - l].length; k++)
			{
			    if (EndPoint[i - l][k] <= StartPoint[i][j])
				{
				    sigma1 = sigma1 + Probability[i - l][k];
				}
			}
			sigma2 = sigma2 + sigma1 * Math.pow((1 - p),(l - 1));
		}
		sigma2 = sigma2 + Math.pow((1 - p),(l - 1));
		Probability[i][j] = p * sigma2;
		
		//计算后面的状态
		j++;
		var TempStartPoint = new Array(0);
		var TempProbability = new Array(0);
		for (l = 1; i - l != -1; l++)
		{
		    for (k = 0; k < EndPoint[i - l].length; k++)
			{
			    if (EndPoint[i - l][k] > StartPoint[i][0])
				{
				    TempStartPoint[j] = EndPoint[i - l][k];
					TempProbability[j] = p * Probability[i - l][k] * Math.pow((1 - p),(l - 1));
					j++;
				}
			}
		}
		
		//合并重合的状态
		j = 1;
		l = 1;
		for (k = 1; k <= TempStartPoint.length; k++)
		{
		    Probability[i][k] = 0;
		}
		while (l < TempStartPoint.length)
		{
		    while (l < TempStartPoint.length)
			{
			    if (TempStartPoint[l] != -1)
				{
				    StartPoint[i][j] = TempStartPoint[l];
					Probability[i][j] += TempProbability[l];
					break;
				}
				l++;
			}
			for (k = l + 1; k < TempStartPoint.length; k++)
			{
			    if (TempStartPoint[k] == TempStartPoint[l])
				{
				    TempStartPoint[k] = -1;
					Probability[i][j] += TempProbability[k];
				}
			}
			q = Math.max(0,(i + 1) * c - 50);
			EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], q, td);
			j++;
			l++;
		}
		
		//触发note不会被覆盖
		StartPoint[i][0] += Good[s - 1] * 1000;
		
		//结果输出到时间轴
		for (j = 0; j < StartPoint[i].length; j++)
		{
		    var a = Math.round(StartPoint[i][j]) - 1;
			var b = Math.round(EndPoint[i][j]) - 1;
	    	for (; a < b; a++)
			{
			    TimeAxis[a] -= Probability[i][j];
			}
		}
	}

	return TimeAxis;
}

//计算单note覆盖率
function CoverageOfSingleNote(i, s, _offset)
{
    if (Map[i].effect == 3)
	{
		var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
	    var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Great[s - 1]);
	    var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Great[s - 1]);
	    var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
		var c1 = a1 + Math.round(1000 * Map[i].effect_value);
		var c2 = a2 + Math.round(1000 * Map[i].effect_value);
		var d1 = b1 + Math.round(1000 * Map[i].effect_value);
		var d2 = b2 + Math.round(1000 * Map[i].effect_value);
	    var TempCoverage = 0;
	    for (j = a1; j < a2; j++)
	    {
	        TempCoverage += TimeAxis[j];
	    }
	    for (j = b1; j < b2; j++)
	    {
	        TempCoverage += TimeAxis[j];
	    }
	    for (j = c1; j < c2; j++)
	    {
	        TempCoverage += TimeAxis[j];
	    }
	    for (j = d1; j < d2; j++)
	    {
	        TempCoverage += TimeAxis[j];
	    }
	    return Math.round(TempCoverage * 1000 / (4 * (a2 - a1))) / 10;
	}
    else
	{
		var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
	    var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Great[s - 1]);
	    var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Great[s - 1]);
	    var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
	    var TempCoverage = 0;
	    for (j = a1; j < a2; j++)
	    {
	        TempCoverage += TimeAxis[j];
	    }
	    for (j = b1; j < b2; j++)
	    {
	        TempCoverage += TimeAxis[j];
	    }
	    return Math.round(TempCoverage * 1000 / (2 * (a2 - a1))) / 10;
	}
}

function draw()
{
$(function ()
{
    $('#container').highcharts({
		title:
		{
		    text: null
		},
		
		chart:
		{
            inverted: true,
            zoomType: 'x',
			resetZoomButton:
			{
                position:
				{
                    x: 0,
                    y: 600
                }
            }
        },
		
		scrollbar:
		{
		    enabled: true
		},
		
		exporting: 
		{
		    enabled: false
		},
		
        xAxis:
		{
            reversed: false,
            gridLineWidth: 1,
            title:
			{
                text: 'Time Axis /s （时间轴/秒）'
            },
			labels:
			{
			    formatter: function()
				{
				    return 5 * this.value / 1000;
				}
			}
        },
		
        yAxis:
		[
		    {
                min: -0.5,
                max: 1,
                tickInterval: 0.1,
                title:
				{
                    text: '.　　 Position （位置）　　　　　　　　 Coverage （覆盖率）',
					align: "low"
                },
                labels:
				{
                    formatter: function()
					{
                        if (this.value < 0)
						{ 
                            return 10 + 20 * this.value;
                        }
                        else
						{
						    return this.value;
						}
                    } 
                }
            },
			{
                opposite: true,
                min: -0.5,
                max: 1,
                tickInterval: 0.1,
                title:
				{
                    text: null
                },
                labels:
				{
                    formatter: function()
					{
                        if (this.value < 0)
						{ 
                            return 10 + 20 * this.value;
                        }
                        else
						{
						    return this.value;
					    }
					}
                }
			}
		],
		
        tooltip:
		{
			crosshairs: true,
		    positioner: function()
			{
                return {x: 425, y: 535}
            },
		    formatter: function()
			{
				if (this.point.note != undefined)
				{
				    return 'Note ' + this.point.note + '<br></br>Coverage ' + this.point.Coverage + '%';
				}
				else
				{
				    return 't = ' + 5 * this.x + ' ms<br></br>p = ' + Math.round(1000 * this.y) / 10 + '%';
				}
			}
        },
		
        legend:
		{
            enabled: false
        },
        
        plotOptions: 
        {
            scatter:
			{
                lineWidth: 8,
                color: "#B0B0B0",
                marker:
				{
				    fillColor: 'white',
					symbol: "circle",
					lineWidth: 2,
					lineColor: livecolor
				}
            },
            area:
			{
                marker:
				{
                    enabled: false
                }
            }
        },
		
        series: Map_draw
    });
});
}

function CoverageCalculator()
{
    //读取卡组数据
	member = new Array(9);
	for (var i = 0; i < 9; i++)
	{
	    member[i] = new Array(4);
		member[i][0] = Number(document.getElementById("member" + i).value);
		member[i][1] = Number(document.getElementById("require" + i).value);
		if (member[i][0] != 0 && member[i][1] <= 0)
		{
		    alert("impossible");
            return;
		}
		member[i][2] = Number(document.getElementById("probability" + i).value);
		if (member[i][2] < 0 || member[i][2] > 100)
		{
		    alert("impossible");
            return;
		}
		member[i][2] /= 100;
		member[i][3] = Number(document.getElementById("time" + i).value);
		if (member[i][0] != 0 && member[i][3] <= 0)
		{
		    alert("impossible");
            return;
		}
    }
	
	//读取谱面文件
	switch (songs[document.getElementById('songchoice').value].attribute)
	{
    	case "smile":
        	livecolor = "#f15c80";
        	break;
    	case "pure":
        	livecolor = "#86e373";
        	break;
    	case "cool":
        	livecolor = "#7cb5ec";
        	break;
	}
	var s = Number(document.getElementById("speeds").value);
	var _offset = Number(document.getElementById("offset").value);
	if (_offset < -50 || _offset > 50)
	{
		alert("impossible");
        return;
	}
	var maps = songs[document.getElementById('songchoice').value][document.getElementById('diffchoice').value].liveid;
	//+判断库中该谱面文件是否存在
	if (Number(maps) >= 559 && Number(maps) <= 562)
	{
		alert("file does not exist");
        return;
	}
	//处理文件序号
	var j = maps.length;
	for (i = 0; i < 4 - j; i++)
	{
	    maps = "0" + maps;
	}
	
	Map = new Array(0);
	$.getJSON("https://app.lovelivewiki.com/Maps/setting_" + maps + ".json", function(data){
	Map = data;
	
	Map_size = Map.length;
	Map_note = new Array(0);
	Map_beat = new Array(0);
	
	//计算note出现的时间，以ms为单位
	for (i = 0; i < Map_size; i++)
	{
	    Map_note[i] = Math.round((Map[i].timing_sec - Speed[s - 1]) * 1000);
	}
	
	//计算模拟击打点列表
	for (i = 0; i < Map_size; i++)
	{    
		if (Map[i].effect == 3)
		{
		    Map_beat[i] = Math.round((Map[i].timing_sec + Map[i].effect_value + Good[s - 1]) * 1000 - _offset * Offset[s - 1]);
		}
		else
		{
		    Map_beat[i] = Math.round((Map[i].timing_sec + Good[s - 1]) * 1000 - _offset * Offset[s - 1]);
		}
	}
	Map_beat.sort(sortNumber);
	
	//计算主程序
	TimeAxis = new Array(0);
	for (var i = 0; i < Map_beat[Map_size - 1]; i++)
	{
	    TimeAxis[i] = 1;
	}
	
	for (i = 0; i < 9; i++)
	{
	    if (member[i][0] == 1)
	    {
	        var TempTimeAxis = N_calc(member[i][1], member[i][2], member[i][3]);
			for (j = 0; j < Map_beat[Map_size - 1]; j++)
			{
			    TimeAxis[j] *= TempTimeAxis[j];
			}
    	}
    	if (member[i][0] == 2)
	    {
	    	var TempTimeAxis = T_calc(member[i][1], member[i][2], member[i][3]);
			for (j = 0; j < Map_beat[Map_size - 1]; j++)
			{
			    TimeAxis[j] *= TempTimeAxis[j];
			}
	    }
	    if (member[i][0] == 3)
	    {
	    	var TempTimeAxis = C_calc(member[i][1], member[i][2], member[i][3], s);
			for (j = 0; j < Map_beat[Map_size - 1]; j++)
			{
			    TimeAxis[j] *= TempTimeAxis[j];
			}
    	}
	}
	
	//最终时间轴采样输出
	for (var i = 0; i < Map_beat[Map_size - 1]; i++)
	{
	    TimeAxis[i] = 1 - TimeAxis[i];
	}
	var j = 0;
	SampleTimeAxis = new Array(0);
	for (var i = 0; i < Map_beat[Map_size - 1]; i += 5)
	{
	    SampleTimeAxis[j] = TimeAxis[i];
		j++;
	}
	
	//单点覆盖率输出
	NoteAxis = new Array(0);
	var j = 0;
	for (i = 0; i < Map_size; i++)
	{
		if (Map[i].effect != 3)
		{
		    NoteAxis[j] = 
		    {
    		    x: Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]) / 5,
			    y: Map[i].position * -0.05,
    		    note: i + 1,
    		    Coverage: CoverageOfSingleNote(i, s, _offset)
            };
			j++;
		}
	}
	
	//谱面作图数据
	Map_draw = 
    [
	    {
            type: 'area',
            lineWidth: 1,
            data: SampleTimeAxis
        },
		{
	        type: 'scatter',
		    lineWidth: 0,
	        data: NoteAxis
	    }
	];
	
	//长条作图参数
	var j = 2;
	for (i = 0; i < Map_size; i++)
	{
	    if (Map[i].effect == 3)
		{
			var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]);
			var TempCoverage = CoverageOfSingleNote(i, s, _offset);
			Map_draw[j] = 
			{
                type: 'scatter',
                data: 
				[
				    {
					    x: a1 / 5,
						y: Map[i].position * -0.05,
						note: i + 1,
						Coverage: TempCoverage
					}, 
					{
					    x: Math.round(a1 + 1000 * Map[i].effect_value) / 5,
						y: Map[i].position * -0.05,
						note: i + 1,
						Coverage: TempCoverage
					}
				]
            };
			j++;
		}
	}
	
	//作图
	document.getElementById('container').style.display = "";
	draw();
	
	});
}

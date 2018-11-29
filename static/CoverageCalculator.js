/**
 *  Target: LoveLive! SIF Perfect Lock Coverage Calculator
 *  Version: 3.0.4.20171227_beta
 *  Author: Chemical Fertilizers
 */

//9速10速的判定区间还是8速（from stat）
var Offset = [4.5, 4, 3.625, 3.25, 2.875, 2.5, 2.25, 2, 1.75, 1.5];
var Speed = [1.8, 1.6, 1.45, 1.3, 1.15, 1, 0.9, 0.8, 0.7, 0.6];
var Perfect = [0.072, 0.064, 0.058, 0.052, 0.046, 0.04, 0.036, 0.032, 0.032, 0.032];
var Great = [0.18, 0.16, 0.145, 0.13, 0.115, 0.1, 0.09, 0.08, 0.08, 0.08];
var Good = [0.288, 0.256, 0.232, 0.208, 0.184, 0.16, 0.144, 0.128, 0.128, 0.128];
var Bad = [0.504, 0.448, 0.406, 0.364, 0.322, 0.28, 0.252, 0.224, 0.224, 0.224];

function sortNumber(a, b)
{
    return a - b;
}

function sortArray(a, b)
{
    return a[0] - b[0];
}

//区间长度计算
function EndPoint_calc(StartPoint, td)
{
    return StartPoint + td;
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
    for (var k = 0; k < 80; k++)
    {
        StartPoint[k] = new Array();
        EndPoint[k] = new Array();
        Probability[k] = new Array();
    }

    for (i = 0; i < RequireNote; i++)
    {
        var j = 0;
        StartPoint[i][j] = Map_note[(i + 1) * n - 1];
        EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], td);

        //计算第一个状态
        Probability[i][j] = p * TimeAxis[Math.round(StartPoint[i][j]) - 2];

        //计算后面的状态
        j++;
        var TempStartPoint = new Array(0);
        var TempProbability = new Array(0);
        for (l = 1; i - l != -1; l++)
        {
            for (k = 0; k < EndPoint[i - l].length; k++)
            {
                if (EndPoint[i - l][k] >= StartPoint[i][0] && StartPoint[i - l][k] <= StartPoint[i][0])
                {
                    var x = 1;
                    for (var y = 1; l - y > 0; y++)
                    {
                        if (StartPoint[i - y][0] >= StartPoint[i - l][k])
                        {
                            x = 0;
                            break;
                        }
                    }
                    TempStartPoint[j] = EndPoint[i - l][k];
                    TempProbability[j] = p * Probability[i - l][k] * x;
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
            EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], td);
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
    for (var k = 0; k < 80; k++)
    {
        StartPoint[k] = new Array();
        EndPoint[k] = new Array();
        Probability[k] = new Array();
    }

    for (i = 0; i < RequireNote; i++)
    {
        var j = 0;
        StartPoint[i][j] = Map_CTrigger[(i + 1) * c - 1][0];
        EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], td);

        //计算第一个状态
        Probability[i][j] = p * TimeAxis[Math.round(StartPoint[i][j]) - 2];

        //计算后面的状态
        j++;
        var TempStartPoint = new Array(0);
        var TempProbability = new Array(0);
        for (l = 1; i - l != -1; l++)
        {
            for (k = 0; k < EndPoint[i - l].length; k++)
            {
                if (EndPoint[i - l][k] >= StartPoint[i][0] && StartPoint[i - l][k] <= StartPoint[i][0])
                {
                    var x = 1;
                    for (var y = 1; l - y > 0; y++)
                    {
                        if (StartPoint[i - y][0] >= StartPoint[i - l][k])
                        {
                            x = 0;
                            break;
                        }
                    }
                    TempStartPoint[j] = EndPoint[i - l][k];
                    TempProbability[j] = p * Probability[i - l][k] * x;
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
            EndPoint[i][j] = EndPoint_calc(StartPoint[i][j], td);
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

//计算单note覆盖率
function CoverageOfSingleNote(s, _offset)
{
    var TempCoverage = new Array(0);
    for (var i = 0; i < Map_size; i++)
    {
        if (Map[i].effect == 3)
        {
            TempCoverage[i] = [0, 0];
            var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
            var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Great[s - 1]);
            var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Great[s - 1]);
            var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
            var c1 = a1 + Math.round(1000 * Map[i].effect_value);
            var c2 = a2 + Math.round(1000 * Map[i].effect_value);
            var d1 = b1 + Math.round(1000 * Map[i].effect_value);
            var d2 = b2 + Math.round(1000 * Map[i].effect_value);
            for (var j = a1; j < a2; j++)
            {
                TempCoverage[i][0] += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempCoverage[i][0] += TimeAxis[j];
            }
            for (j = c1; j < c2; j++)
            {
                TempCoverage[i][1] += TimeAxis[j];
            }
            for (j = d1; j < d2; j++)
            {
                TempCoverage[i][1] += TimeAxis[j];
            }
            TempCoverage[i][0] = TempCoverage[i][0] / (2 * (a2 - a1));
            TempCoverage[i][1] = TempCoverage[i][1] / (2 * (a2 - a1));
        }
        else if (Map[i].effect == 13)
        {
            TempCoverage[i] = [0, 0];
            var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Bad[s - 1]);
            var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
            var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
            var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Bad[s - 1]);
            var c1 = a1 + Math.round(1000 * Map[i].effect_value);
            var c2 = a2 + Math.round(1000 * Map[i].effect_value);
            var d1 = b1 + Math.round(1000 * Map[i].effect_value);
            var d2 = b2 + Math.round(1000 * Map[i].effect_value);
            for (var j = a1; j < a2; j++)
            {
                TempCoverage[i][0] += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempCoverage[i][0] += TimeAxis[j];
            }
            for (j = c1; j < c2; j++)
            {
                TempCoverage[i][1] += TimeAxis[j];
            }
            for (j = d1; j < d2; j++)
            {
                TempCoverage[i][1] += TimeAxis[j];
            }
            TempCoverage[i][0] = TempCoverage[i][0] / (2 * (a2 - a1));
            TempCoverage[i][1] = TempCoverage[i][1] / (2 * (a2 - a1));
        }
        else if (Map[i].effect == 11 || Map[i].effect == 12)
        {
            TempCoverage[i] = 0;
            var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Bad[s - 1]);
            var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
            var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
            var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Bad[s - 1]);
            for (var j = a1; j < a2; j++)
            {
                TempCoverage[i] += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempCoverage[i] += TimeAxis[j];
            }
            TempCoverage[i] = TempCoverage[i] / (2 * (a2 - a1));
        }
        else
        {
            TempCoverage[i] = 0;
            var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
            var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Great[s - 1]);
            var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Great[s - 1]);
            var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
            for (var j = a1; j < a2; j++)
            {
                TempCoverage[i] += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempCoverage[i] += TimeAxis[j];
            }
            TempCoverage[i] = TempCoverage[i] / (2 * (a2 - a1));
        }
    }
    return TempCoverage;
}

//计算含有C判单note覆盖率
function CoverageOfSingleNote_forC(member_C, s, _offset)
{
    var p = 1;
    for (var i = 0; i < member_C.length; i++)
    {
        p *= 1 - member_C[i][1];
    }
    var TriggerPoint = new Array(0);
    for (var i = 0; i < Math.floor(Map_size / member_C[0][0]); i++)
    {
        TriggerPoint[i] = new Array(0);
        TriggerPoint[i][0] = Map_CTrigger[(i + 1) * member_C[0][0] - 1][0];
        TriggerPoint[i][1] = Map_CTrigger[(i + 1) * member_C[0][0] - 1][1];
        TriggerPoint[i][2] = p;
    }
    /*两种以上的C判状态 预留
    */

    //根据note与触发点的关系计算单点和长条结尾覆盖率
    k = 0;
    var TempCoverage = new Array(0);
    for (var i = 0; i < Map_size; i++)
    {
        TempCoverage[Map_CTrigger[i][1] - 1] = 0;
        if ((Map_CTrigger[i][0] - TriggerPoint[k][0] == 0 && Map_CTrigger[i][1] == TriggerPoint[k][1]) || (Map_CTrigger[i][0] - TriggerPoint[k][0] == 0 && Map_CTrigger[i][1] != TriggerPoint[k][1] && Map_CTrigger[i][0] != Map_CTrigger[i - 1][0]))
        {
            var a1 = Map_CTrigger[i][0] - 1000 * Good[s - 1];
            var a2 = Map_CTrigger[i][0] - 1000 * Great[s - 1];
            var b1 = Map_CTrigger[i][0] + 1000 * Great[s - 1];
            var b2 = Map_CTrigger[i][0] + 1000 * Good[s - 1];
            for (j = a1; j < a2; j++)
            {
                TempCoverage[Map_CTrigger[i][1] - 1] += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempCoverage[Map_CTrigger[i][1] - 1] += (1 - (1 - TimeAxis[j]) / TriggerPoint[k][2]);
            }
            TempCoverage[Map_CTrigger[i][1] - 1] = TempCoverage[Map_CTrigger[i][1] - 1] / ((a2 - a1) + (b2 - b1));
        }
        else if (Map_CTrigger[i][0] - TriggerPoint[k][0] == 0 && Map_CTrigger[i][1] != TriggerPoint[k][1] && Map_CTrigger[i][0] == Map_CTrigger[i - 1][0])
        {
            var b1 = Map_CTrigger[i][0] + 1000 * Great[s - 1];
            var b2 = Map_CTrigger[i][0] + 1000 * Good[s - 1];
            for (j = b1; j < b2; j++)
            {
                TempCoverage[Map_CTrigger[i][1] - 1] += TimeAxis[j];
            }
            TempCoverage[Map_CTrigger[i][1] - 1] = (TempCoverage[Map_CTrigger[i][1] - 1] / (b2 - b1) + TempCoverage[Map_CTrigger[i - 1][1] - 1]) / 2;
            TempCoverage[Map_CTrigger[i - 1][1] - 1] = TempCoverage[Map_CTrigger[i][1] - 1];
        }
        else
        {
            if (Map_CTrigger[i][0] - TriggerPoint[k][0] < 0 && TriggerPoint[k][0] - Map_CTrigger[i][0] <= 1000 * Good[s - 1])
            {
                var a1 = Map_CTrigger[i][0] - 1000 * Good[s - 1];
                var a2 = Map_CTrigger[i][0] - 1000 * Great[s - 1];
                var b1 = Math.min((Map_CTrigger[i][0] + 1000 * Great[s - 1]),TriggerPoint[k][0] - 1);
                var b2 = TriggerPoint[k][0] - 1;
            }
            else if (Map_CTrigger[i][0] - TriggerPoint[k][0] > 0 && Map_CTrigger[i][0] - TriggerPoint[k][0] <= 1000 * Good[s - 1])
            {
                var a1 = TriggerPoint[k][0];
                var a2 = Math.max((Map_CTrigger[i][0] - 1000 * Great[s - 1]),TriggerPoint[k][0]);
                var b1 = Map_CTrigger[i][0] + 1000 * Great[s - 1];
                var b2 = Map_CTrigger[i][0] + 1000 * Good[s - 1];
            }
            else
            {
                var a1 = Map_CTrigger[i][0] - 1000 * Good[s - 1];
                var a2 = Map_CTrigger[i][0] - 1000 * Great[s - 1];
                var b1 = Map_CTrigger[i][0] + 1000 * Great[s - 1];
                var b2 = Map_CTrigger[i][0] + 1000 * Good[s - 1];
            }
            for (j = a1; j < a2; j++)
            {
                TempCoverage[Map_CTrigger[i][1] - 1] += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempCoverage[Map_CTrigger[i][1] - 1] += TimeAxis[j];
            }
            TempCoverage[Map_CTrigger[i][1] - 1] = TempCoverage[Map_CTrigger[i][1] - 1] / ((a2 - a1) + (b2 - b1));
        }
        if (Map_CTrigger[i][0] - TriggerPoint[k][0] > 1000 * Good[s - 1] && k < TriggerPoint.length - 1)
        {
            k += 1;
        }
    }
    //计算长条开头覆盖率
    for (var i = 0; i < Map_size; i++)
    {
        if (Map[i].effect == 3 || Map[i].effect == 13)
        {
            var TempTempCoverage = TempCoverage[i];
            TempCoverage[i] = [0, TempTempCoverage];
            TempTempCoverage = 0;
            var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Good[s - 1]);
            var a2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] - 1000 * Great[s - 1]);
            var b1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Great[s - 1]);
            var b2 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1] + 1000 * Good[s - 1]);
            for (j = a1; j < a2; j++)
            {
                TempTempCoverage += TimeAxis[j];
            }
            for (j = b1; j < b2; j++)
            {
                TempTempCoverage += TimeAxis[j];
            }
            TempCoverage[i][0] = TempTempCoverage / (2 * (a2 - a1));
        }
    }
    return TempCoverage;
}

//计算对于trick的总note覆盖率
function CoverageOfTrick(s)
{
    var TempCoverage = new Array(0);
    var k = new Array(0);
    for (var i = 0; i < Map_size; i++)
    {
        TempCoverage[i] = [0, 0];
        if (Map[Map_CTrigger[i][1] - 1].effect == 11 || Map[Map_CTrigger[i][1] - 1].effect == 12 || Map[Map_CTrigger[i][1] - 1].effect == 13)
        {
            var a1 = Map_CTrigger[i][0] - 1000 * Bad[s - 1];
            var a2 = Map_CTrigger[i][0] + 1000 * Bad[s - 1];
        }
        else
        {
            var a1 = Map_CTrigger[i][0] - 1000 * Good[s - 1];
            var a2 = Map_CTrigger[i][0] + 1000 * Good[s - 1];
        }
        for (var j = a1; j < a2; j++)
        {
            TempCoverage[i][0] += TimeAxis[j];
        }
        TempCoverage[i][0] = TempCoverage[i][0] / (a2 - a1);

        if (i <= 49)
        {
            TempCoverage[i][1] = TempCoverage[i][0];
            k[i] = 1;
        }
        if (i >= 50 && i <= 99)
        {
            TempCoverage[i][1] = 1.10 * TempCoverage[i][0];
            k[i] = 1.10;
        }
        if (i >= 100 && i <= 199)
        {
            TempCoverage[i][1] = 1.15 * TempCoverage[i][0];
            k[i] = 1.15;
        }
        if (i >= 200 && i <= 399)
        {
            TempCoverage[i][1] = 1.20 * TempCoverage[i][0];
            k[i] = 1.20;
        }
        if (i >= 400 && i <= 599)
        {
            TempCoverage[i][1] = 1.25 * TempCoverage[i][0];
            k[i] = 1.25;
        }
        if (i >= 600 && i <= 799)
        {
            TempCoverage[i][1] = 1.30 * TempCoverage[i][0];
            k[i] = 1.30;
        }
        if (i >= 800)
        {
            TempCoverage[i][1] = 1.35 * TempCoverage[i][0];
            k[i] = 1.35;
        }
        if (Map[Map_CTrigger[i][1] - 1].effect == 11 || Map[Map_CTrigger[i][1] - 1].effect == 12 || Map[Map_CTrigger[i][1] - 1].effect == 13)
        {
            TempCoverage[i][1] *= 0.5;
            k[i] *= 0.5;
        }
        if (Map[Map_CTrigger[i][1] - 1].effect == 3 || Map[Map_CTrigger[i][1] - 1].effect == 13)
        {
            TempCoverage[i][1] *= 1.25;
            k[i] *= 1.25;
        }
    }
    var TempCoverageTrick = [0, 0];
    var j = 0;
    for (var i = 0; i < Map_size; i++)
    {
        TempCoverageTrick[0] += TempCoverage[i][0];
        TempCoverageTrick[1] += TempCoverage[i][1];
        j += k[i];
    }
    TempCoverageTrick[0] = TempCoverageTrick[0] / Map_size;
    TempCoverageTrick[1] = TempCoverageTrick[1] / j;
    return TempCoverageTrick;
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
        credits:
        {
            text: 'LLhelper',
            href: 'http://llhelper.com'
        },
        chart:
        {
            inverted: true,
            zoomType: 'x',
            resetZoomButton:
            {
                position:
                {
                    verticalAlign: 'bottom',
                    x: 0,
                    y: 44
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
        labels:
        {
            items:
            [{
                html: Crotchet + ' ms/Beat<br></br>Total Note Coverage ' + CoverageTrick[0] + '% (' + CoverageTrick[1] + '% C&L Weight) ●SIF Version: 5.0',
                style: 
                {
                    left: '-30px',
                    top: containerheight + 54 + 'px',
                    color: "#707070"
                }
            }]
        },
        xAxis:
        {
            reversed: false,
            gridLineWidth: 1,
            gridLineColor: "#d8d8d8",
            minorGridLineColor: "#f0f0f0",
            minRange: 48000 / bpm,
            minorTickInterval: 12000 / bpm,
            tickPositioner: function ()
            {
                var positions = [];
                var tick = tickPosition;
                if (prebpm[0] == 0)
                {
                    if (bpm >= 200)
                    {
                        var increment = 96000 / bpm;
                    }
                    else
                    {
                        var increment = 48000 / bpm;
                    }
                    for (tick; tick - increment <= this.dataMax; tick += increment)
                    {
                        positions.push(tick);
                    }
                }
                else
                {
                    var increment = 48000 / prebpm[0];
                    for (tick; tick < prebpm[1]; tick += increment)
                    {
                        positions.push(tick);
                    }
                    tick = prebpm[1];
                    increment = 48000 / bpm;
                    for (tick; tick - increment <= this.dataMax; tick += increment)
                    {
                        positions.push(tick);
                    }
                }
                return positions;
            },
            title:
            {
                text: "Time Axis /s"
            },
            labels:
            {
                step: labelsstep,
                formatter: function()
                {
                    return Math.round(5 * this.value / 100) / 10;
                }
            }
        },
        yAxis:
        [{
            min: -0.5,
            max: 1,
            tickInterval: 0.1,
            title:
            {
                text: "Position & Coverage"
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
        }],
        tooltip:
        {
            crosshairs: true,
            positioner: function()
            {
                return {x: 425, y: containerheight - 12}
            },
            formatter: function()
            {
                if (this.point.note != undefined)
                {
                    return 'Note ' + this.point.note + '<br></br>Coverage ' + this.point.Coverage + '%<br></br>t = ' + 5 * this.x + ' ms';
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

function redraw(i)
{
    var chart = $('#container').highcharts();
    if (chart.series.length === initialLength)
    {
        chart.addSeries({
            name: String(i),
            type: 'area',
            lineWidth: 1,
            color: '#f7a35c',
            data: SampleSingleTimeAxis[i]
        });
        document.getElementById("separater" + i).style.border = "2px #606060 solid";
    }
    else if (String(i) !== chart.series[chart.series.length - 1].name)
    {
        document.getElementById("separater" + chart.series[chart.series.length - 1].name).style.border = "2px #b0b0b0 solid";
        chart.series[chart.series.length - 1].remove();
        chart.addSeries({
            name: String(i),
            type: 'area',
            lineWidth: 1,
            color: '#f7a35c',
            data: SampleSingleTimeAxis[i]
        });
        document.getElementById("separater" + i).style.border = "2px #606060 solid";
    }
    else
    {
        chart.series[chart.series.length - 1].remove();
        document.getElementById("separater" + i).style.border = "2px #b0b0b0 solid";
    }
}

function CoverageCalculatorWithData(song, member, member_C, _offset, s, data) {
    Map = data;

    Map_size = Map.length;
    Map_note = new Array(0);
    Map_beat = new Array(0);
    //刻度线起点绘图参数
    tickPosition = Math.round(Map[0].timing_sec * 1000 - _offset * Offset[s - 1]) / 5;
    var songId = parseInt(song.id);
    if (songId == 5 || songId == 7 || songId == 442)
    {
        tickPosition -= 6;
    }
    if (songId == 204)
    {
        tickPosition -= 19;
    }
    if (songId == 526)
    {
        tickPosition += 15;
    }
    //计算note出现的时间，以ms为单位
    for (i = 0; i < Map_size; i++)
    {
        Map_note[i] = Math.round((Map[i].timing_sec - Speed[s - 1]) * 1000);
    }
    //计算模拟击打点列表
    for (i = 0; i < Map_size; i++)
    {    
        if (Map[i].effect == 3 || Map[i].effect == 13)
        {
            Map_beat[i] = Math.round((Map[i].timing_sec + Map[i].effect_value + Bad[s - 1]) * 1000 - _offset * Offset[s - 1]);
        }
        else
        {
            Map_beat[i] = Math.round((Map[i].timing_sec + Bad[s - 1]) * 1000 - _offset * Offset[s - 1]);
        }
    }
    Map_beat.sort(sortNumber);
    //计算C判触发可能点期望（判定点）列表
    Map_CTrigger = new Array(0);
    for (i = 0; i < Map_size; i++)
    {    
        Map_CTrigger[i] = new Array(0);
        if (Map[i].effect == 3 || Map[i].effect == 13)
        {
            Map_CTrigger[i][0] = Math.round((Map[i].timing_sec + Map[i].effect_value) * 1000 - _offset * Offset[s - 1]);
            Map_CTrigger[i][1] = i + 1;
        }
        else
        {
            Map_CTrigger[i][0] = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]);
            Map_CTrigger[i][1] = i + 1;
        }
    }
    Map_CTrigger.sort(sortArray);
        //消除1ms的谱面偏差
    for (i = 1; i < Map_size; i++)
    {
        if (Map_CTrigger[i][0] - Map_CTrigger[i - 1][0] == 1)
        {
            Map_CTrigger[i][0] = Map_CTrigger[i - 1][0];
        }
    }

    //计算主程序
    TimeAxis = new Array(0);
    for (var i = 0; i < Map_beat[Map_size - 1]; i++)
    {
        TimeAxis[i] = 1;
    }
    SampleSingleTimeAxis = new Array(0);

    for (i = 0; i < 9; i++)
    {
        if (member[i][0] == 1)
        {
            SampleSingleTimeAxis[i] = new Array(0);
            var TempTimeAxis = N_calc(member[i][1], member[i][2], member[i][3]);
            var k = 0;
            for (j = 0; j < Map_beat[Map_size - 1]; j++)
            {
                TimeAxis[j] *= TempTimeAxis[j];
                if (Math.round(j / 5) == j / 5)
                {
                    SampleSingleTimeAxis[i][k] = TempTimeAxis[j];
                    k++;
                }
            }
        }
        if (member[i][0] == 2)
        {
            SampleSingleTimeAxis[i] = new Array(0);
            var TempTimeAxis = T_calc(member[i][1], member[i][2], member[i][3]);
            var k = 0;
            for (j = 0; j < Map_beat[Map_size - 1]; j++)
            {
                TimeAxis[j] *= TempTimeAxis[j];
                if (Math.round(j / 5) == j / 5)
                {
                    SampleSingleTimeAxis[i][k] = TempTimeAxis[j];
                    k++;
                }
            }
        }
        if (member[i][0] == 3)
        {
            SampleSingleTimeAxis[i] = new Array(0);
            var TempTimeAxis = C_calc(member[i][1], member[i][2], member[i][3], s);
            var k = 0;
            for (j = 0; j < Map_beat[Map_size - 1]; j++)
            {
                TimeAxis[j] *= TempTimeAxis[j];
                if (Math.round(j / 5) == j / 5)
                {
                    SampleSingleTimeAxis[i][k] = TempTimeAxis[j];
                    k++;
                }
            }
        }
    }
        //单卡边际覆盖率
    for (i = 0; i < 9; i++)
    {
        if (member[i][0] != 0)
        {
            for (j = 0; j < SampleSingleTimeAxis[i].length; j++)
            {
                SampleSingleTimeAxis[i][j] = (1 - SampleSingleTimeAxis[i][j]) * TimeAxis[j * 5] / SampleSingleTimeAxis[i][j];
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
    //单note覆盖率计算
    CoverageSingle = new Array(0);
    if (member_C.length == 0)
    {
        CoverageSingle = CoverageOfSingleNote(s, _offset);
    }
    else
    {
        CoverageSingle = CoverageOfSingleNote_forC(member_C, s, _offset);
    }
    for (i = 0; i < Map_size; i++)
    {
        if (Map[i].effect == 3 || Map[i].effect == 13)
        {
            CoverageSingle[i][0] = Math.round(CoverageSingle[i][0] * 1000) / 10;
            CoverageSingle[i][1] = Math.round(CoverageSingle[i][1] * 1000) / 10;
        }
        else
        {
            CoverageSingle[i] = Math.round(CoverageSingle[i] * 1000) / 10;
        }
    }
        //计算总trick覆盖率
    CoverageTrick = CoverageOfTrick(s);
    CoverageTrick[0] = Math.round(CoverageTrick[0] * 1000) / 10;
    CoverageTrick[1] = Math.round(CoverageTrick[1] * 1000) / 10;
    //单点作图参数
    NoteAxis = new Array(0);
    StarNoteAxis = new Array(0);
    SwingNoteAxis = new Array(0);
    var j = 0;
    var k = 0;
    var r = 0;
    for (i = 0; i < Map_size; i++)
    {
        if (Map[i].effect == 4)
        {
            StarNoteAxis[k] = 
            {
                x: Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]) / 5,
                y: Map[i].position * -0.05,
                note: i + 1,
                Coverage: CoverageSingle[i]
            };
            k++;
        }
        else if (Map[i].effect == 11 || Map[i].effect == 12)
        {
            SwingNoteAxis[r] = 
            {
                x: Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]) / 5,
                y: Map[i].position * -0.05,
                note: i + 1,
                notes_level: Map[i].notes_level,
                Coverage: CoverageSingle[i]
            };
            r++;
        }
        else if (Map[i].effect == 13)
        {
            SwingNoteAxis[r] = 
            {
                x: Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]) / 5,
                y: Map[i].position * -0.05,
                note: i + 1,
                notes_level: Map[i].notes_level,
                Coverage: CoverageSingle[i][0]
            };
            r++;
        }
        else if (Map[i].effect != 3)
        {
            NoteAxis[j] = 
            {
                x: Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]) / 5,
                y: Map[i].position * -0.05,
                note: i + 1,
                Coverage: CoverageSingle[i]
            };
            j++;
        }
    }
    //谱面作图数据
    Map_draw = 
    [{
        type: 'area',
        lineWidth: 1,
        data: SampleTimeAxis
    },
    {
        type: 'scatter',
        marker:
        {
            fillColor: '#f0f04a'
        },
        lineWidth: 0,
        data: StarNoteAxis
    },
    {
        type: 'scatter',
        lineWidth: 0,
        data: NoteAxis
    }];
    //长条作图参数
    for (i = 0; i < Map_size; i++)
    {
        if (Map[i].effect == 3 || Map[i].effect == 13)
        {
            var a1 = Math.round(Map[i].timing_sec * 1000 - _offset * Offset[s - 1]);
            var TempMap_draw = 
            {
                type: 'scatter',
                marker:
                {
                    fillColor: 'white'
                },
                data: 
                [{
                    x: a1 / 5,
                    y: Map[i].position * -0.05,
                    note: String(i + 1) + ' Start',
                    Coverage: CoverageSingle[i][0]
                }, 
                {
                    x: Math.round(a1 + 1000 * Map[i].effect_value) / 5,
                    y: Map[i].position * -0.05,
                    note: String(i + 1) + ' End',
                    Coverage: CoverageSingle[i][1]
                }]
            };
            if (Map[i].effect == 13)
            {
                TempMap_draw.marker.fillColor = '#5dffff';
            }
            Map_draw.push(TempMap_draw);
        }
    }
    //滑键作图分组参数
    SepSwingNoteAxis = new Array(0);
    j = 0;
    for (var i = 0; i < SwingNoteAxis.length; i++)
    {
        if (SwingNoteAxis[i] !== 'NaN')
        {
            SepSwingNoteAxis[j] = new Array(0);
            SepSwingNoteAxis[j].push(SwingNoteAxis[i]);
            for (k = i + 1; k < SwingNoteAxis.length; k++)
            {
                if (SwingNoteAxis[k].notes_level == SepSwingNoteAxis[j][SepSwingNoteAxis[j].length - 1].notes_level)
                {
                    SepSwingNoteAxis[j].push(SwingNoteAxis[k]);
                    SwingNoteAxis[k] = 'NaN';
                }
            }
            j++;
        }
    }
    for (i = 0; i < SepSwingNoteAxis.length; i++)
    {
        var TempMap_draw = 
        {
            type: 'scatter',
            marker:
            {
                symbol: "diamond",
                fillColor: '#5dffff'
            },
            lineWidth: 2,
            data: SepSwingNoteAxis[i]
        };
        Map_draw.push(TempMap_draw);
    }
    initialLength = Map_draw.length;
    //作图
    draw();
    document.getElementById('running').style.display = "none";
}

function CoverageCalculator(song, difficulty, createdData)
{
    //读取卡组数据
    var member = new Array(9);
    var member_C = new Array(0);
    var j = 0;
    var k = 0;
    for (var i = 0; i < 9; i++)
    {
        member[i] = new Array(4);
        member[i][0] = Number(document.getElementById("member" + i).value);
        //打开有判卡的对应位置的按钮
        if (member[i][0] != 0)
        {
            document.getElementById("separater" + i).style.display = "";
            document.getElementById("separater" + i).style.border = "2px #b0b0b0 solid";
            k++;
        }
        else
        {
            document.getElementById("separater" + i).style.display = "none";
        }
        member[i][1] = Number(document.getElementById("require" + i).value);
        if (member[i][0] != 0 && member[i][1] <= 0)
        {
            alert("请输入正数");
            return;
        }
        if (member[i][0] != 0 && Math.floor(member[i][1]) != member[i][1])
        {
            alert("请输入整数");
            return;
        }
        if ((member[i][0] == 1 || member[i][0] == 3) && song[difficulty].combo / member[i][1] > 80)
        {
            alert("结果超出设计容量");
            return;
        }
        member[i][2] = Number(document.getElementById("probability" + i).value);
        if (member[i][0] != 0 && (member[i][2] <= 0 || member[i][2] >= 100))
        {
            alert("impossible");
            return;
        }
        member[i][2] /= 100;
        member[i][3] = Number(document.getElementById("time" + i).value);
        if (member[i][0] != 0 && member[i][3] <= 0)
        {
            alert("请输入正数");
            return;
        }
        if (member[i][0] == 2 && member[i][3] > member[i][1])
        {
            alert("覆盖时间应小于条件时间");
            return;
        }
        if (member[i][0] == 2 && Math.floor(2 * member[i][3]) != 2 * member[i][3])
        {
            alert("覆盖时间应为0.5的倍数");
            return;
        }
        //记录C判的信息
        if (member[i][0] == 3)
        {
            member_C[j] = new Array(0);
            member_C[j][0] = member[i][1];
            if (j - 1 >= 0 && member_C[j][0] != member_C[j - 1][0])
            {
                alert("暂不支持队伍中含有两种以上的C判");
                return;
            }
            member_C[j][1] = member[i][2];
            j++;
        }
    }
    if (k == 1)
    {
        document.getElementById("separater").style.display = "none";
    }

    //读取谱面文件
    switch (song.attribute)
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
        case "":
            livecolor = "purple";
            break;
    }
    var s = Number(document.getElementById("speeds").value);
    var _offset = Number(document.getElementById("offset").value);
    if (_offset < -50 || _offset > 50)
    {
        alert("请正确填写击打节奏");
        return;
    }
        //获取BPM并处理
    bpm = song.bpm;
    if (!bpm)
    {
        bpm = 200;
        prebpm = [0, 0];
        Crotchet = "?";
    }
    else
    {
        switch (bpm)
        {
            case "100-190":
                Crotchet = "316-600";
                bpm = 190;
                prebpm = [100, 28032];
                break;
            case "130-153":
                Crotchet = "392-462";
                bpm = 153;
                prebpm = [130, 19541];
                break;
            case "80-168":
                Crotchet = "357-750";
                bpm = 168;
                prebpm = [80, 26918];
                break;
            case "84-179":
                Crotchet = "335-714";
                bpm = 179;
                prebpm = [84, 21881];
                break;
            default:
                bpm = Number(bpm);
                prebpm = [0, 0];
                Crotchet = Math.round(60000 / bpm);
        }
    }
    prebpm[1] = Math.round(prebpm[1] - _offset * Offset[s - 1]) / 5;
    labelsstep = 2;
    if (bpm < 100)
    {
        labelsstep = null;
    }
    document.getElementById('running').style.display = "";
    document.getElementById("running").scrollIntoView();
    Map = new Array(0);

    if (createdData) {
        CoverageCalculatorWithData(song, member, member_C, _offset, s, createdData);
    } else {
        var maps = song[difficulty].liveid;
        var _liveid = Number(maps);
        //处理文件序号
        var j = maps.length;
        for (i = 0; i < 4 - j; i++)
        {
            maps = "0" + maps;
        }
        if (_liveid < 641 || _liveid == 808 || _liveid == 809)
        {
            maps = "https://app.lovelivewiki.com/Maps/setting_" + maps + ".json";
        }
        else
        {
            maps = "https://rawfile.loveliv.es/livejson/Live_s" + maps + ".json";
        }
        $.getJSON(maps, function (data) {
           CoverageCalculatorWithData(song, member, member_C, _offset, s, data);
        });
    }
}

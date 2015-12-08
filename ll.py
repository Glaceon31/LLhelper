def expbylvl(lvl, expf):
    lowexp = [0, 11, 13, 16, 20, 26, 32, 39, 48, 57, 67, 79, 91, 105, 120, 135, 152, 170, 189, 208, 229, 251, 274, 298, 323, 349, 376, 405, 434, 464, 495, 528, 561, 596, 620]
    if lvl < 34:
        exp = lowexp[lvl]
    else:
        exp = int(34.45*lvl-551)
    if lvl < 100 and expf == 1:
        exp = exp/2
    return exp

def lpbylvl(lvl):
    if lvl < 300:
        return lvl/2+25
    return lvl/3+75

def expbylp(lp):
    lowlp = [0, 2, 5, 7, 9, 12, 14, 17, 20, 25, 29, 29, 35, 35, 42, 46, 46, 46, 51, 55, 58, 60, 63, 66, 71]
    if lp < 25:
        return lowlp[lp]
    else:
        return 83

def itembylp(lp):
    if lp == 25:
        return 27
    if lp == 15:
        return 16
    return lp

def cbmulti(cb):
    if cb <= 50:
        return 1
    elif cb <= 100:
        return (1.1*(cb-50)+50.0)/cb
    elif cb <= 200:
        return (1.15*(cb-100)+105.0)/cb
    elif cb <= 400:
        return (1.2*(cb-200)+220.0)/cb
    elif cb <= 600:
        return (1.25*(cb-400)+460.0)/cb
    elif cb <= 800:
        return (1.3*(cb-600)+710.0)/cb
    else:
        return (1.35*(cb-800)+970)/cb

expbylpmax = [0, 0, 0, 0, 9, 12, 14, 17, 20, 25, 29, 29, 35, 35, 42, 46, 46, 47, 51, 55, 58, 60, 63, 66, 71, 83]
expbylpmin = [0, 0, 0, 0, 9, 12, 14, 17, 20, 23, 26, 29, 35, 35, 42, 46, 46, 47, 51, 55, 58, 60, 63, 66, 69, 83]
expbylptrue = [0, 0, 0, 0, 9, 12, 14, 17, 20, 25, 29, 29, 35, 35, 42, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 83]
expbyacdiff = [12, 26, 46, 83]
expbyfive = [0, 12, 26, 46, 58, 83]
smchoices = [5, 10 ,15, 25]
lpchoices = [1, 15, 25]
itemchoices = [15, 30, 45, 75]
acpt = [0, 65, 140, 233, 298]
smpt = [36, 89, 163, 272]
smremainpt = [36, 89, 163, 199, 272]
daybymonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
color = {'smile':'red', 'pure':'green', 'cool':'blue'}
kizuna = {' ':[0,0], 'N':[25, 50], 'R':[100,200], 'SR':[250,500], 'UR':[500,1000]}

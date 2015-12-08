var kizuna = new Array();
   kizuna["N"] = [25, 50]
   kizuna["R"] = [100, 200]
   kizuna["SR"] = [250, 500]
   kizuna["UR"] = [500, 1000]
   
function getQuery(name) 
     {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
     }
     
   function setCookie(c_name,value,expiredays)
  {
	var exdate=new Date()
	exdate.setDate(exdate.getDate()+expiredays)
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
  }
     
   function getCookie(c_name)
  {
	if (document.cookie.length>0){
  		c_start=document.cookie.indexOf(c_name + "=")
 		if (c_start!=-1){ 
    			c_start=c_start + c_name.length+1 
    			c_end=document.cookie.indexOf(";",c_start)
    			if (c_end==-1) c_end=document.cookie.length
    			return unescape(document.cookie.substring(c_start,c_end))
    		}
  	}
	return ""
  }
  
  function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 100000000);
    var cval=getCookie(name);
if(cval!=null) {document.cookie= name + "="+cval+";expires="+exp.toGMTString();}
}
  
  function isNumber(x){
	if (isNaN(x) || x == "") return false;
	return true;
  }
  
  function isNotNegative(x){
  	if (isNumber(x) && (x[0] != '-')) return true;
  	return false;
  }

function expfx(lvl){
	if (lvl == 0)
		return 0
	else
		return Math.round(0.522*lvl*lvl+0.522*lvl+10.0005)
}

function expbylvl(lvl, expf){
	if (expf == 0){
		if (lvl < 34)
			return expfx(lvl)
		else
			return (expfx(lvl)-expfx(lvl-33))
	}
	else{
		if (lvl >= 100)
			return (expfx(lvl)-expfx(lvl-33))
		else{
			totalexp = [0]
			for (i = 1; i <= lvl; i++)
				totalexp.push(totalexp[i-1]+expbylvl(i,0))
			return Math.round(totalexp[lvl]/2)-Math.round(totalexp[lvl-1]/2)
		}
	}
}

function lpbylvl(lvl){
	if (lvl < 300)
		return parseInt(lvl/2)+25
	return parseInt(lvl/3)+75
}

function expbylpmax(lp){
	expmax = [0, 0, 0, 0, 9, 12, 14, 17, 20, 25, 29, 29, 35, 35, 42, 46, 46, 47, 51, 55, 58, 60, 63, 66, 71, 83]
	return expmax[lp]
}

function expbylpmin(lp){
	expmin = [0, 0, 0, 0, 9, 12, 14, 17, 20, 23, 26, 29, 35, 35, 42, 46, 46, 47, 51, 55, 58, 60, 63, 66, 69, 83]
	return expmin[lp]
}



function tothree(string){
   	str = String(string)
   	while (str.length < 3){
   		str = '0'+str
   	}
   	return str
   }

function itembylp(lp){
	if (lp == 25)
		return 27
	else if (lp >= 15)
		return lp+1
	else
		return lp
}


   function isrscore(c){
   	if (c.Cskillpercentage == 3){
   		if (c.skilleffect == 11)
   			return true
   	}
   	return false
   }
   
   function cbmulti(cb) {
      if (cb <= 50) {
         return 1;
      } else if (cb <= 100) {
         return 1.1 - 5 / cb;
      } else if (cb <= 200) {
         return 1.15 - 10 / cb;
      } else if (cb <= 400) {
         return 1.2 - 20 / cb;
      } else if (cb <= 600) {
         return 1.25 - 40 / cb;
      } else if (cb <= 800) {
         return 1.3 - 70 / cb;
      } else {
         return 1.35 - 110 / cb;
      }
   }

   function strength(c, mezame, level, tail){
    tail = tail || 0
   	basic = 0
    if (c.support == 1)
      return 0
   	if (c.Cskillpercentage < 12){
   		if (mezame == 0)
   			basic = parseInt(c[c.attribute]*1.09)+kizuna[c.rarity][0]
   		else
   			basic = parseInt(c[c.attribute+'2']*1.09)+kizuna[c.rarity][1]
   	}
   	else{
   		if (mezame == 0)
   			basic = parseInt(c[c.attribute])+parseInt(c[c.Cskillattribute]*0.12)+kizuna[c.rarity][0]
   		else
   			basic = parseInt(c[c.attribute+'2'])+parseInt(c[c.Cskillattribute+'2']*0.12)+kizuna[c.rarity][1]
   	}
    if (!c.skill)
      return basic
   	skill = 0
   	if (c.skilleffect == 11)
      skill = skillstrength(c, level, tail)
   	return basic+skill
   }

   
   
   function skillstrength(c, level, tail){
    tail = tail || 0
    combo = 500
    perfectrate = 0.95
    time = 120
    score = c['skilldetail'][level].score
    possibility = c['skilldetail'][level].possibility
    require = c['skilldetail'][level].require
    if (tail == 0){
      //accurracy
      if ((c.skilleffect == 4) || (c.skilleffect == 5)){
        if (c.triggertype == 1){
          skill = score*possibility/100/require
          skill = skill/(skill+1.0)
          skill = parseInt(1000*skill)/10
        }
        else if ((c.triggertype == 3) || (c.triggertype == 4)){
          skill = parseInt(1000*500*score*possibility/100/require/120)/10
        }
      }
      //recover
      if (c.skilleffect == 9){
        if (c.triggertype == 1)
          skill = parseInt(1000*120*score*possibility/100/require/500)/1000
        else if (c.triggertype == 3)
          skill = parseInt(1000*score*possibility/100/require)/1000
        else if (c.triggertype == 4)
          skill = parseInt(1000*score*possibility/100/require)/1000
        else if (c.triggertype == 6)
          skill = parseInt(1000*0.95*score*possibility/100/require)/1000
      }
      //score
      if (c.skilleffect == 11){
        if (c.triggertype == 1)
          skill = parseInt(80/1.1/1.17/1.02/0.994*120/500*score*possibility/100/require)
        else if (c.triggertype == 3)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*possibility/100/require)
        else if (c.triggertype == 4)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*possibility/100/require)
        else if (c.triggertype == 5)
          skill = parseInt(52500*score*possibility/100/require)
        else if (c.triggertype == 6)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*0.95*possibility/100/require)
        else if (c.triggertype == 12)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*65/500*0.95*possibility/100/require)
      }
    }
    else if (tail == 1){
      //accurracy
      if ((c.skilleffect == 4) || (c.skilleffect == 5)){
        if (c.triggertype == 1){
          skill = score*possibility/100/require
          skill = skill/(skill+1.0)
          waste = (1-skill)*skill*require/2+skill*score/2
          skill = (skill*120-waste)/120
          skill = parseInt(1000*skill)/10
        }
        else if ((c.triggertype == 3) || (c.triggertype == 4)){
          skill = 500*score*possibility/100/require/120
          waste = skill*score/2
          skill = 500*score*possibility/100/require/120*(500-require/2)/500
          skill = (skill*120-waste)/120
          skill = parseInt(1000*skill)/10
        }
      }
      //recover
      if (c.skilleffect == 9){
        if (c.triggertype == 1)
          skill = parseInt(1000*120*score*possibility/100/require/500*(120-require/2)/120)/1000
        else if (c.triggertype == 3)
          skill = parseInt(1000*score*possibility/100/require*(500-require/2)/500)/1000
        else if (c.triggertype == 4)
          skill = parseInt(1000*score*possibility/100/require*(500-require/2)/500)/1000
        else if (c.triggertype == 6)
          skill = parseInt(1000*0.95*score*possibility/100/require*(475-require/2)/475)/1000
      }
      //score
      if (c.skilleffect == 11){
        if (c.triggertype == 1)
          skill = parseInt(80/1.1/1.17/1.02/0.994*120/500*score*possibility/100/require*(120-require/2)/120)
        else if (c.triggertype == 3)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*possibility/100/require*(500-require/2)/500)
        else if (c.triggertype == 4)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*possibility/100/require*(500-require/2)/500)
        else if (c.triggertype == 5)
          skill = parseInt(52500*score*possibility/100/require*(450000-require/2)/450000)
        else if (c.triggertype == 6)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*0.95*possibility/100/require*(475-require/2)/475)
        else if (c.triggertype == 12)
          skill = parseInt(80/1.1/1.17/1.02/0.994*score*65/500*0.95*possibility/100/require*(65-require/2)/65)
      }
    }
    return skill
   }

   function skillstrengthdetail(c, level, combo, longrate, perfectrate, time, starperfect){
    score = c['skilldetail'][level].score
    possibility = c['skilldetail'][level].possibility
    require = c['skilldetail'][level].require
      //accurracy
      if ((c.skilleffect == 4) || (c.skilleffect == 5)){
        if (c.triggertype == 1){
          skill = score*possibility/100/require
          skill = skill/(skill+1.0)
          skill = parseInt(1000*skill)/10
        }
        else if ((c.triggertype == 3) || (c.triggertype == 4)){
          skill = parseInt(1000*combo*score*possibility/100/require/time)/10
        }
      }
      //recover
      if (c.skilleffect == 9){
        if (c.triggertype == 1)
          skill = parseInt(1000*time*score*possibility/100/require/combo)/1000
        else if (c.triggertype == 3)
          skill = parseInt(1000*score*possibility/100/require)/1000
        else if (c.triggertype == 4)
          skill = parseInt(1000*score*possibility/100/require)/1000
        else if (c.triggertype == 6)
          skill = parseInt(1000*perfectrate*score*possibility/100/require)/1000
      }
      //score
      if (c.skilleffect == 11){
        if (c.triggertype == 1)
          skill = parseInt(80/1.1/cbmulti(combo)/(1+0.25*longrate)/(0.88+0.12*perfectrate)*time/combo*score*possibility/100/require)
        else if (c.triggertype == 3)
          skill = parseInt(80/1.1/cbmulti(combo)/(1+0.25*longrate)/(0.88+0.12*perfectrate)*score*possibility/100/require)
        else if (c.triggertype == 4)
          skill = parseInt(80/1.1/cbmulti(combo)/(1+0.25*longrate)/(0.88+0.12*perfectrate)*score*possibility/100/require)
        else if (c.triggertype == 5)
          skill = parseInt(52500*score*possibility/100/require)
        else if (c.triggertype == 6)
          skill = parseInt(80/1.1/cbmulti(combo)/(1+0.25*longrate)/(0.88+0.12*perfectrate)*score*perfectrate*possibility/100/require)
        else if (c.triggertype == 12)
          skill = parseInt(80/1.1/cbmulti(combo)/(1+0.25*longrate)/(0.88+0.12*perfectrate)*score*starperfect/combo*possibility/100/require)
      }
    return skill
   }
/*
   function skillstrength(c, level8, tail){
    tail = tail || 0
   	if (level8 == 0){
      if (tail == 0){
   		 if ((c.skill == 1) || (c.skill == 11))
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*c.score*c.possibility/100/c.require)
   		 else if (c.skill == 2)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*c.score*0.95*c.possibility/100/c.require)
   		 else if (c.skill == 3)
   			  skill = parseInt(52500*c.score*c.possibility/100/c.require)
   		 else if (c.skill == 4)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*120/500*c.score*c.possibility/100/c.require)
   		 else if (c.skill == 10)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*c.score*65/500*0.95*c.possibility/100/c.require)
   		//recover
   		 else if ((c.skill == 7) || (c.skill == 13))
   			  skill = parseInt(1000*c.score*c.possibility/100/c.require)/1000
   		 else if (c.skill == 8)
   			  skill = parseInt(1000*120*c.score*c.possibility/100/c.require/500)/1000
   		 else if (c.skill == 9)
   			  skill = parseInt(1000*0.95*c.score*c.possibility/100/c.require)/1000
   		//accuracy
   		 else if ((c.skill == 6) || (c.skill == 12))
   			  skill = parseInt(1000*500*c.score*c.possibility/100/c.require/120)/10
   		 else if (c.skill == 5){
   			  skill = c.score*c.possibility/100/c.require
   			  skill = skill/(skill+1)
   			  skill = parseInt(1000*skill)/10
        }
   		}
      else{
        if ((c.skill == 1) || (c.skill == 11))
          skill = parseInt(80/1.1/1.17/1.02/0.994*c.score*c.possibility/100/c.require*(500-c.require/2)/500)
       else if (c.skill == 2)
          skill = parseInt(80/1.1/1.17/1.02/0.994*c.score*0.95*c.possibility/100/c.require*(475-c.require/2)/475)
       else if (c.skill == 3)
          skill = parseInt(52500*c.score*c.possibility/100/c.require*(450000-c.require/2)/450000)
       else if (c.skill == 4)
          skill = parseInt(80/1.1/1.17/1.02/0.994*120/500*c.score*c.possibility/100/c.require*(120-c.require/2)/120)
       else if (c.skill == 10)
          skill = parseInt(80/1.1/1.17/1.02/0.994*c.score*65/500*0.95*c.possibility/100/c.require*(500-c.require/2)/500)
        //recover
       else if ((c.skill == 7) || (c.skill == 13))
          skill = parseInt(1000*c.score*c.possibility/100/c.require*(500-c.require/2)/500)/1000
       else if (c.skill == 8)
          skill = parseInt(1000*120*c.score*c.possibility/100/c.require/500*(120-c.require/2)/120)/1000
       else if (c.skill == 9)
          skill = parseInt(1000*0.95*c.score*c.possibility/100/c.require*(475-c.require/2)/475)/1000
        //accuracy
       else if ((c.skill == 6) || (c.skill == 12)){
          skill = 500*c.score*c.possibility/100/c.require/120
          waste = skill*c.score/2
          skill = 500*c.score*c.possibility/100/c.require/120*(500-c.require/2)/500
          skill = (skill*120-waste)/120
          skill = parseInt(1000*skill)/10
        }
       else if (c.skill == 5){
          skill = c.score*c.possibility/100/c.require
          skill = skill/(skill+1)
          waste = (1-skill)*skill*c.require/2+skill*c.score/2
          skill = (skill*120-waste)/120
          skill = parseInt(1000*skill)/10
        }
      }

   	}
   	else{
      if (tail == 1){
   		 if (c.skill == 1)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*420*50/100/20*(500-20/2)/500)
   		 else if (c.skill == 2)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*400*0.95*50/100/15*(475-15/2)/475)
   		 else if (c.skill == 4)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*120/500*400*50/100/10*(120-10/2)/120)
   		 else if (c.skill == 11)
   			  skill = parseInt(80/1.1/1.17/1.02/0.994*400*50/100/17*(500-17/2)/500)
   		 //recover
   		 else if (c.skill == 7)
   			  skill = parseInt(1000*3*50/100/20*(500-20/2)/500)/1000
   		 else if (c.skill == 8)
   			  skill = parseInt(1000*120*3*50/100/10/500*(120-10/2)/120)/1000
   		 else if (c.skill == 9)
   			  skill = parseInt(1000*0.95*3*50/100/15*(475-15/2)/475)/1000
   		 else if (c.skill == 13)
   			  skill = parseInt(1000*3*50/100/17*(500-17/2)/500)/1000
   		 //accuracy
   		 else if (c.skill == 6){
          skill = 500*5.5*50/100/20/120
          waste = skill*5.5/2
          skill = 500*5.5*50/100/20/120*(500-20/2)/500
          skill = (skill*120-waste)/120
          skill = parseInt(1000*skill)/10
        }
   		 else if (c.skill == 5){
   			  skill = 5.5*50/100/10
   			  skill = skill/(skill+1)
          waste = (1-skill)*skill*10/2+skill*5.5/2
          skill = (skill*120-waste)/120
   			  skill = parseInt(1000*skill)/10
   		 }
      }
      else{
        if (c.skill == 1)
          skill = parseInt(80/1.1/1.17/1.02/0.994*420*50/100/20)
       else if (c.skill == 2)
          skill = parseInt(80/1.1/1.17/1.02/0.994*400*0.95*50/100/15)
       else if (c.skill == 4)
          skill = parseInt(80/1.1/1.17/1.02/0.994*120/500*400*50/100/10)
       else if (c.skill == 11)
          skill = parseInt(80/1.1/1.17/1.02/0.994*400*50/100/17)
       //recover
       else if (c.skill == 7)
          skill = parseInt(1000*3*50/100/20)/1000
       else if (c.skill == 8)
          skill = parseInt(1000*120*3*50/100/10/500)/1000
       else if (c.skill == 9)
          skill = parseInt(1000*0.95*3*50/100/15)/1000
       else if (c.skill == 13)
          skill = parseInt(1000*3*50/100/17)/1000
       //accuracy
       else if (c.skill == 6)
          skill = parseInt(1000*500*5.5*50/100/20/120)/10
       else if (c.skill == 5){
          skill = 5.5*50/100/10
          skill = skill/(skill+1)
          skill = parseInt(1000*skill)/10
       }
      }
   	}
   	return skill
   }*/
   
   function strengthlevel(s){
    if (s >= 7478)
      return 'SS+'
   	//7361边界：最强觉醒分UR：初期希
   	if (s >= 7243)
   		return 'SS'
   	//7243边界：最弱觉醒分UR：厨娘maki
   	if (s >= 6898)
   		return 'S+'
   	//6856边界：最强觉醒非分UR：机厅nico
   	else if (s >= 6642)
   		return 'S'
   	//6534边界：最强未觉醒分UR：初期希
   	else if (s >= 6416)
   		return 'A+'
   	//6416边界：最弱未觉醒分UR：厨娘maki
   	else if (s >= 6062)
   		return 'A'
   	//6020边界：最强未觉醒非分UR：机厅nico
   	else if (s >= 5830)
   		return 'A-'
   	//5830边界：最弱未觉醒非分UR：初期鸟
   	else if (s >= 5753)
   		return 'B+'
   	//5752 
   	else if (s >= 5520)
   		return 'B'
   	//5520边界
   	else if (s >= 5350)
   		return 'B-'
   	//5350边界：最强满级加分R：R果、梦门nico
   	else if (s >= 5180)
   		return 'C+'
   	//5180边界
   	else if (s >= 5000)
   		return 'C'
   	//5000边界
   	else if (s >= 4750)
   		return 'C-'
   	//4750边界：最弱未觉醒SR：初期希、赏月凛
   	else if (s >= 4500)
   		return 'D+'
   	//4500边界
   	else
   		return 'D'
   }
   
   function tothree(string){
   	str = String(string)
   	while (str.length < 3){
   		str = '0'+str
   	}
   	return str
   }
   
   function raritynum(rarity){
   	if (rarity == 'UR')
   		return 7
   	if (rarity == 'SR')
   		return 5
   	if (rarity == 'R')
   		return 3
   	if (rarity == 'N')
   		return 1
   }
   
   function checkinfo(){
   	   lvl = parseInt(document.getElementById('lvl').value)
   	   lp = parseInt(document.getElementById('lp').value)
   	   exp = parseInt(document.getElementById('exp').value)
   	   expf = parseInt(document.getElementById('expf').value)
   	   document.getElementById('lpwarning').style.display = 'none'
   	   document.getElementById('expwarning').style.display = 'none'
   	   if (!isNotNegative(lvl))
   	   	   return
   	   if (lp > lpbylvl(lvl))
   	   	   document.getElementById('lpwarning').style.display = ''
   	   if (exp > expbylvl(lvl, expf))
   	   	   document.getElementById('expwarning').style.display = ''
   }
//wtf
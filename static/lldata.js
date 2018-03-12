/*
 * This script contains following things:
 *   LoadingUtil
 *   LLData
 *   LLUnit
 *
 * By ben1222
 */

/*
 * LoadingUtil: utility to show loading box when defers are not resolved
 * and hide the loading box when defers are resolved or rejected
 */
var LoadingUtil = {
   start: function (defers, merger) {
      return LoadingUtil.startImpl(defers, 'loadingbox', 'loadingbox_progress', merger);
   },
   startSingle: function (defer) {
      return LoadingUtil.startImpl([defer], 'loadingbox', 'loadingbox_progress').then(function (data) { return data[0]; });
   },
   startImpl: function (defers, loadingboxid, progressboxid, merger) {
      var defer = $.Deferred();
      var result = {};
      if ((!defers) || defers.length == 0) {
         defer.resolve(result);
         return defer;
      }
      var loadingbox = document.getElementById(loadingboxid);
      var progressbox = document.getElementById(progressboxid);
      var finishedCount = 0;
      var totalCount = defers.length;

      var updateProgress = function(){};
      if (progressbox) {
         updateProgress = function() {
            progressbox.innerHTML = finishedCount + ' / ' + totalCount;
         }
      }
      var updateLoadingBox = function(){};
      if (loadingbox) {
         updateLoadingBox = function(s) {
            loadingbox.style.display = s;
         }
      }

      updateProgress();
      updateLoadingBox('');
      for (var i = 0; i < totalCount; i++) {
         (function (index) {
            defers[index].then(function(data) {
               if (merger) {
                  merger(data, index, result);
               } else {
                  result[index] = data;
               }
               finishedCount++;
               updateProgress();
               if (finishedCount == totalCount) {
                  updateLoadingBox('none');
                  defer.resolve(result);
               }
            }, function() {
               updateLoadingBox('none');
               defer.reject();
            });
         })(i);
      }
      return defer;
   },

   cardDetailMerger: function (card, index, result) {
      result[parseInt(card.id)] = card;
   }
};

/*
 * LLData: class to load json data from backend
 * LLCardData: instance for LLData, load card data
 * require jQuery
 */
function LLData(brief_url, detail_url, brief_keys) {
   this.briefUrl = brief_url;
   this.detailUrl = detail_url;
   this.briefKeys = brief_keys;
   this.briefCache = {};
   this.briefCachedKeys = {};
   this.detailCache = {};
}

LLData.prototype.getAllBriefData = function(keys, url) {
   if (keys === undefined) keys = this.briefKeys;
   if (url === undefined) url = this.briefUrl;
   var me = this;
   var missingKeys = [];
   var defer = $.Deferred();
   for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!this.briefCachedKeys[key]) {
         missingKeys.push(key);
      }
   }
   if (missingKeys.length == 0) {
      defer.resolve(me.briefCache);
      return defer;
   }
   var requestKeys = missingKeys.sort().join(',');

   $.ajax({
      'url': url,
      'type': 'GET',
      'data': {
         'keys': requestKeys
      },
      'success': function (data) {
         for (var index in data) {
            if (!me.briefCache[index]) {
               me.briefCache[index] = data[index];
            } else {
               var curData = data[index];
               var curCache = me.briefCache[index];
               for (var curKey in curData) {
                  curCache[curKey] = curData[curKey];
               }
            }
         }
         for (var i = 0; i < missingKeys.length; i++) {
            me.briefCachedKeys[missingKeys[i]] = 1;
         }
         defer.resolve(me.briefCache);
      },
      'error': function (xhr, textStatus, errorThrown) {
         console.error("Failed on request to " + url + " with keys:\"" + requestKeys + "\": " + textStatus);
         console.error(errorThrown);
         defer.reject();
      },
      'dataType': 'json'
   });
   return defer;
};

LLData.prototype.getDetailedData = function(index, url) {
   if (url === undefined) url = this.detailUrl;
   var defer = $.Deferred();
   if (index === undefined) {
      console.error("Index not specified");
      defer.reject();
      return defer;
   }
   if (this.detailCache[index]) {
      defer.resolve(this.detailCache[index]);
      return defer;
   }
   var me = this;
   url = url + index;
   $.ajax({
      'url': url ,
      'type': 'GET',
      'success': function (data) {
         me.detailCache[index] = data;
         defer.resolve(data);
      },
      'error': function (xhr, textStatus, errorThrown) {
         console.error("Failed on request to " + url + ": " + textStatus);
         console.error(errorThrown);
         defer.reject();
      },
      'dataType': 'json'
   });
   return defer;
};

var LLCardData = new LLData('/lldata/cardbrief', '/lldata/card/',
   ['id', 'support', 'rarity', 'jpname', 'name', 'attribute', 'special', 'type', 'skilleffect', 'triggertype', 'jpseries', 'series', 'eponym', 'jpeponym']);

/*
 * LLUnit: utility functions for unit related operations, used in llnewunit, llnewunitsis, etc.
 */
var defaultHandleFailedRequest = function() {
   alert('载入失败!');
};

var LLUnit = {
   changeunitskilllevel: function(n) {
      var index = document.getElementById('cardid'+String(n)).value;
      var level = parseInt(document.getElementById('skilllevel'+String(n)).value)-1;
      if ((level < 0) || (level > 7)) return;
      LoadingUtil.startSingle(LLCardData.getDetailedData(index)).then(function(card) {
         //document.getElementById('require'+String(n)).value = card['skilldetail'][level].require;
         //document.getElementById('possibility'+String(n)).value = card['skilldetail'][level].possibility;
         //document.getElementById('score'+String(n)).value = card['skilldetail'][level].score;
      }, defaultHandleFailedRequest);
   },

   changeskilllevel: function(skilllevel) {
      document.getElementById('skilllevel').innerHTML = String(skilllevel+1)
      var index = document.getElementById('cardchoice').value
      if (index == "") {
         document.getElementById('skillcontainer').style.display = 'none';
         return;
      }
      LoadingUtil.startSingle(LLCardData.getDetailedData(index)).then(function(curCard) {
         if (curCard && curCard.skill){
            document.getElementById('skillcontainer').style.display = '';
            document.getElementById('skilltext').innerHTML = LLUnit.getCardSkillText(curCard, skilllevel);
         } else {
            document.getElementById('skillcontainer').style.display = 'none';
         }
      }, defaultHandleFailedRequest);
   },

   cardtoskilltype: function(c){
      if (!c)
         return 0
      if (!c.skill)
         return 0
      if ((c.skilleffect == 4) || (c.skilleffect == 5)){
         if (c.triggertype == 1)
            return 5
         else if (c.triggertype == 3)
            return 6
         else if (c.triggertype == 4)
            return 12
      }
      else if (c.skilleffect == 9){
         if (c.triggertype == 1)
            return 8
         else if (c.triggertype == 3)
            return 7
         else if (c.triggertype == 4)
            return 13
         else if (c.triggertype == 6)
            return 9
      }
      else if (c.skilleffect == 11){
         if (c.triggertype == 1)
            return 4
         else if (c.triggertype == 3)
            return 1
         else if (c.triggertype == 4)
            return 11
         else if (c.triggertype == 5)
            return 3
         else if (c.triggertype == 6)
            return 2
         else if (c.triggertype == 12)
            return 10
      }
   },

   changeskilltext: function(card, n) {
      var postfix = "";
      if ((n != "") || (String(n) == "0"))
         postfix = String(n);
      var skilltype = LLUnit.cardtoskilltype(card);
      if (skilltype == 0) {
         document.getElementById("skilltext"+postfix).style.display = "none";
      } else {
         document.getElementById("skilltext"+postfix).style.display = "";
      }
      //require
      if ((skilltype == 1) || (skilltype == 6) || (skilltype == 7))
         document.getElementById("requiretext"+postfix).innerHTML = "个图标"
      else if ((skilltype == 2) || (skilltype == 9))
         document.getElementById("requiretext"+postfix).innerHTML = "个perfect"
      else if (skilltype == 3)
         document.getElementById("requiretext"+postfix).innerHTML = "分"
      else if (skilltype == 10)
         document.getElementById("requiretext"+postfix).innerHTML = "星星perfect"
      else if ((skilltype == 4) || (skilltype == 5) || (skilltype == 8))
         document.getElementById("requiretext"+postfix).innerHTML = "秒"
      else if ((skilltype == 11) || (skilltype == 12) || (skilltype == 13))
         document.getElementById("requiretext"+postfix).innerHTML = "combo"
      //effect
      if ((skilltype == 1) || (skilltype == 2) || (skilltype == 3) || (skilltype == 4) || (skilltype == 10) || (skilltype == 11)){
         document.getElementById("effecttext"+postfix).innerHTML = "增加"
         document.getElementById("unittext"+postfix).innerHTML = "分"
      }
      if ((skilltype == 5) || (skilltype == 6) || (skilltype == 12)){
         document.getElementById("effecttext"+postfix).innerHTML = "增强判定"
         document.getElementById("unittext"+postfix).innerHTML = "秒"
      }
      if ((skilltype == 7) || (skilltype == 8) || (skilltype == 9) || (skilltype == 13)){
         document.getElementById("effecttext"+postfix).innerHTML = "回复"
         document.getElementById("unittext"+postfix).innerHTML = "点体力"
      }
   },

   // kizuna from twintailos.js, skilllevel from each page
   applycarddata: function () {
      var index = document.getElementById('cardchoice').value;
      var mezame = (document.getElementById("mezame").checked ? 1 : 0);
      if (index != "") {
         document.getElementById('cardchoice').style.color = llcard.attcolor[llcard.cards[index].attribute];
         LoadingUtil.startSingle(LLCardData.getDetailedData(index)).then(function(card) {
            document.getElementById("main").value = card.attribute

            //document.getElementById('skill').value = LLUnit.cardtoskilltype(card)
            if (card.skill){
               //skilllevel = parseInt(document.getElementById('skilllevel').innerHTML)
               //document.getElementById('require').innerHTML = card['skilldetail'][skilllevel].require
               //document.getElementById('possibility').innerHTML = card['skilldetail'][skilllevel].possibility
               //document.getElementById('score').innerHTML = card['skilldetail'][skilllevel].time
            }
            var infolist2 = ["smile", "pure", "cool"]
            if (!mezame){
               for (var i in infolist2){
                  document.getElementById(infolist2[i]).value = card[infolist2[i]]
               }
               document.getElementById("mezame").value = "未觉醒"
            }
            else{
               for (var i in infolist2){
                  document.getElementById(infolist2[i]).value = card[infolist2[i]+"2"]
               }
               document.getElementById("mezame").value = "已觉醒"
            }
            document.getElementById("kizuna").value = kizuna[card.rarity][mezame]
            //LLUnit.changeskilltext(card, "")
         }, defaultHandleFailedRequest);
      }
      LLUnit.changeskilllevel(skilllevel);
      LLUnit.changeavatar('imageselect', index, mezame);
   },

   // getimagepath require twintailos.js
   changeavatar: function (elementid, cardid, mezame) {
      var path;
      if ((!cardid) || cardid == "0")
         path = '/static/null.png'
      else if (!mezame)
         path = getimagepath(cardid,'avatar',0)
      else
         path = getimagepath(cardid,'avatar',1)
      var element = document.getElementById(elementid);
      if (element.src != path) {
         // avoid showing last image before new image is loaded
         element.src = '';
      }
      element.src = path;
   },
   changeavatarn: function (n) {
      var cardid = threetonumber(document.getElementById('cardid'+String(n)).value)
      var mezame = parseInt(document.getElementById('mezame'+String(n)).value);
      LLUnit.changeavatar('avatar' + n, cardid, mezame);
   },

   calculate: function (docalculate) {
      var requests = [];
      for (var i = 0; i < 9; i++) {
         var cardid = document.getElementById('cardid' + i).value;
         if (cardid) {
            requests.push(LLCardData.getDetailedData(cardid));
         }
      }
      LoadingUtil.start(requests, LoadingUtil.cardDetailMerger).then(function (cards) {
         docalculate(cards);
      }, defaultHandleFailedRequest);
   },

   changecenter: function () {
      var cardid = parseInt(document.getElementById("cardid4").value)
      if (cardid == "") return;
      LoadingUtil.startSingle(LLCardData.getDetailedData(cardid)).then(function(card) {
         document.getElementById("bonus").value = card["attribute"]
         document.getElementById("percentage").value = card["Cskillpercentage"]
         document.getElementById("base").value = card["Cskillattribute"]
         document.getElementById("secondpercentage").value = "0"
         if (card["rarity"] == "SSR" || card["rarity"] == "UR"){
            document.getElementById("secondlimit").value = card["Csecondskilllimit"]
            document.getElementById("secondbase").innerHTML = card["attribute"] // ?
            document.getElementById("secondpercentage").value = card["Csecondskillattribute"]
         }
      }, defaultHandleFailedRequest);
   },

   copyTo: function (n) {
      var index=document.getElementById("cardchoice").value;
      var copyList = ["main", "smile", "pure", "cool"];
      for (var i in copyList){
         if (copyList[i] == document.getElementById("main").value)
            document.getElementById(copyList[i]+String(n)).value = parseInt(document.getElementById(copyList[i]).value)+parseInt(document.getElementById("kizuna").value)
         else
            document.getElementById(copyList[i]+String(n)).value = document.getElementById(copyList[i]).value
      }
      document.getElementById("skilllevel"+String(n)).value = document.getElementById('skilllevel').innerHTML
      document.getElementById("mezame"+String(n)).value = (document.getElementById("mezame").checked ? 1 : 0);
      document.getElementById("cardid"+String(n)).value = index;
      if (index != "" && document.getElementById("maxcost"+String(n))) {
         LoadingUtil.startSingle(LLCardData.getDetailedData(index)).then(function(card) {
            document.getElementById("maxcost"+String(n)).value = card.minslot;
         }, defaultHandleFailedRequest);
      }
      //changeskilltext(n)
      if (n == 4){
         LLUnit.changecenter()
      }
      LLUnit.changeavatarn(n)
   },

   getSkillText: function (effect_type, trigger_type, effect_value, discharge_time, trigger_value, activation_rate, trigger_target, effect_target) {
      var trigger_text = '(未知条件)';
      if (trigger_type == 1) trigger_text = '每' + trigger_value + '秒';
      else if (trigger_type == 3) trigger_text = '每' + trigger_value + '个图标';
      else if (trigger_type == 4) trigger_text = '每达成' + trigger_value + '次连击';
      else if (trigger_type == 5) trigger_text = '每达成' + trigger_value + '分';
      else if (trigger_type == 6) trigger_text = '每获得' + trigger_value + '个PERFECT';
      else if (trigger_type == 12) trigger_text = '每获得' + trigger_value + '个星星图标的PERFECT';
      else if (trigger_type == 100) trigger_text = '自身以外的' + trigger_target + '的成员的特技全部发动时';
      var rate_text = '就有' + activation_rate + '%的概率';
      var effect_text = '(未知效果)';
      if (effect_type == 4) effect_text = '稍微增强判定' + discharge_time + '秒'
      else if (effect_type == 5) effect_text = '增强判定' + discharge_time + '秒';
      else if (effect_type == 9) effect_text = '恢复' + effect_value + '点体力';
      else if (effect_type == 11) effect_text = '提升分数' + effect_value + '点';
      else if (effect_type == 2000) effect_text = discharge_time + '秒内其它的特技发动概率提高到' + effect_value + '倍';
      else if (effect_type == 2100) effect_text = '发动上一个发动的非repeat的特技';
      else if (effect_type == 2201) effect_text = discharge_time + '秒内的PERFECT提升' + effect_value + '分';
      else if (effect_type == 2400) effect_text = discharge_time + '秒内自身的属性P变为与' + effect_target + '的随机一位成员的属性P一致';
      else if (effect_type == 2600) effect_text = discharge_time + '秒内' + effect_target + '的成员的属性P提高到' + effect_value + '倍';
      return trigger_text + rate_text + effect_text;
   },

   targetIdToName: {
      1: '1年级',
      2: '2年级',
      3: '3年级',
      4: "μ's",
      5: 'Aqours',
   },

   getTriggerTarget: function (targets) {
      if (!targets) return '(数据缺失)';
      var ret = '';
      for (var i = 0; i < targets.length; i++) {
         ret += LLUnit.targetIdToName[parseInt(targets[i])];
      }
      return ret;
   },

   getCardSkillText: function (card, level) {
      if (!card.skill) return '无';
      if (card.skilleffect == 0) return '获得特技经验';
      var level_detail = card.skilldetail[level];
      var effect_type = card.skilleffect;
      var effect_value = level_detail.score;
      var discharge_time = level_detail.time;
      if (discharge_time === undefined) {
         if (effect_type == 4 || effect_type == 5) {
            discharge_time = effect_value;
            effect_value = 0;
         } else {
            discharge_time = '(数据缺失)';
         }
      }
      var trigger_target = LLUnit.getTriggerTarget(card.triggertarget);
      var effect_target = LLUnit.getTriggerTarget(card.effecttarget);
      var text = LLUnit.getSkillText(effect_type, card.triggertype, effect_value, discharge_time, level_detail.require, level_detail.possibility, trigger_target, effect_target);
      if (!LLUnit.isStrengthSupported(card)) text = text + '(该技能暂不支持强度计算)';
      return text;
   },

   isStrengthSupported: function (card) {
      if (card.skill && (card.skilleffect > 11 || card.triggertype > 12)) return false;
      return true;
   }
};



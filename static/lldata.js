/*
 * This script contains following things:
 *   LLData
 *   LLUnit
 *
 * By ben1222
 */

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
      LLCardData.getDetailedData(index).then(function(card) {
         document.getElementById('require'+String(n)).value = card['skilldetail'][level].require;
         document.getElementById('possibility'+String(n)).value = card['skilldetail'][level].possibility;
         document.getElementById('score'+String(n)).value = card['skilldetail'][level].score;
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

   // kizuna from twintailos.js
   applycarddata: function () {
      var index = document.getElementById('cardchoice').value;
      var mezame = 0;
      if (index != "") {
         document.getElementById('cardchoice').style.color = llcard.attcolor[llcard.cards[index].attribute];
         LLCardData.getDetailedData(index).then(function(card) {
            document.getElementById("main").value = card.attribute

            //document.getElementById('skill').value = LLUnit.cardtoskilltype(card)
            if (card.skill){
               //skilllevel = parseInt(document.getElementById('skilllevel').innerHTML)
               document.getElementById('require').innerHTML = card['skilldetail'][skilllevel].require
               document.getElementById('possibility').innerHTML = card['skilldetail'][skilllevel].possibility
               document.getElementById('score').innerHTML = card['skilldetail'][skilllevel].score
            }
            var infolist2 = ["smile", "pure", "cool"]
            mezame = (document.getElementById("mezame").checked ? 1 : 0);
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
      LLUnit.changeavatar('imageselect', index, mezame);
   },

   // getimagepath require twintailos.js
   changeavatar: function (elementid, cardid, mezame) {
      if (!cardid)
         document.getElementById(elementid).src = '/static/null.png'
      else if (!mezame)
         document.getElementById(elementid).src = getimagepath(cardid,'avatar',0)
      else
         document.getElementById(elementid).src = getimagepath(cardid,'avatar',1)
   },
   changeavatarn: function (n) {
      var cardid = threetonumber(document.getElementById('cardid'+String(n)).value)
      var mezame = document.getElementById('mezame'+String(n)).value;
      LLUnit.changeavatar('avatar' + n, cardid, mezame);
   },

   calculate: function (docalculate) {
      var unitCardData = {};
      var finishedCount = 0;
      var defer_carddata = $.Deferred();
      for (var i = 0; i < 9; i++) {
         var cardid = document.getElementById('cardid' + i).value;
         LLCardData.getDetailedData(cardid).then(function(card) {
            // do not use cardid, as its value can change...
            unitCardData[parseInt(card.id)] = card;
            finishedCount++;
            if (finishedCount == 9) defer_carddata.resolve(unitCardData);
         }, function() {
            defer_carddata.reject();
         });
      }
      defer_carddata.then(docalculate, handleFailedRequest);
   },

   changecenter: function () {
      var cardid = parseInt(document.getElementById("cardid4").value)
      LLCardData.getDetailedData(cardid).then(function(card) {
         document.getElementById("bonus").value = card["attribute"]
         document.getElementById("percentage").value = card["Cskillpercentage"]
         document.getElementById("base").value = card["Cskillattribute"]
         document.getElementById("secondpercentage").value = "0"
         if (card["rarity"] == "SSR" || card["rarity"] == "UR"){
            document.getElementById("secondlimit").value = card["Csecondskilllimit"]
            document.getElementById("secondbase").innerHTML = card["attribute"] // ?
            document.getElementById("secondpercentage").value = card["Csecondskillattribute"]
         }
      }, handleFailedRequest);
   }

};



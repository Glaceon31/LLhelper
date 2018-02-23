/*
 * script to load song/card data
 * require jQuery
 *
 * By ben1222
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


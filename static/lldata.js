/*
 * This script contains following things:
 *   LoadingUtil
 *   LLData
 *     (instance) LLCardData
 *   LLUnit
 *   LLSisGem
 *   LLSkill
 *   LLMember
 *   LLTeam
 *   LLSaveData
 *
 * components:
 *   LLComponentBase
 *     +- LLValuedComponent
 *       +- LLSelectComponent
 *   LLComponentCollection
 *     +- LLSkillContainer
 *     +- LLCardSelector
 *
 * v0.6.0
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
 * base components:
 *   LLComponentBase
 *     +- LLValuedComponent
 *       +- LLSelectComponent
 *   LLComponentCollection
 */
var LLComponentBase = (function () {
   /* Properties:
    *    id
    *    exist
    *    visible
    *    element
    * Methods:
    *    show
    *    hide
    *    toggleVisible
    *    serialize
    *    deserialize
    *    on
    */
   var cls = function (id, options) {
      this.id = id;
      this.exist = false;
      this.visible = false;
      if (this.id) {
         this.element = document.getElementById(this.id);
         if (this.element) {
            this.exist = true;
            if (this.element.style.display != 'none') {
               this.visible = true;
            }
            if (options && options.listen) {
               var listenList = Object.keys(options.listen);
               for (var i = 0; i < listenList.length; i++) {
                  var e = listenList[i];
                  this.on(e, options.listen[e]);
               }
            }
         }
      }
   };
   var proto = cls.prototype;
   proto.show = function () {
      if (!this.exist) return;
      if (this.visible) return;
      this.element.style.display = '';
      this.visible = true;
   };
   proto.hide = function () {
      if (!this.exist) return;
      if (!this.visible) return;
      this.element.style.display = 'none';
      this.visible = false;
   };
   proto.toggleVisible = function () {
      if (!this.exist) return;
      if (this.visible) {
         this.hide();
      } else {
         this.show();
      }
   };
   proto.serialize = function () {
      if (!this.exist) return undefined;
      return this.visible;
   };
   proto.deserialize = function (v) {
      if (v) {
         this.show();
      } else {
         this.hide();
      }
   };
   proto.on = function (e, callback) {
      if (!this.exist) return;
      if ((!e) || (!callback)) return;
      this.element.addEventListener(e, callback);
   };
   return cls;
})();

var LLValuedComponent = (function() {
   /* Properties:
    *    value (serialize)
    *    valueKey
    * Methods:
    *    get
    *    set
    *    serialize (override)
    *    deserialize (override)
    */
   var cls = function (id, options) {
      LLComponentBase.call(this, id, options);
      if (!this.exist) {
         this.value = undefined;
         return this;
      }
      var vk = (options && options.valueKey ? options.valueKey : '');
      if (!vk) {
         var tag = this.element.tagName.toUpperCase();
         if (tag == 'INPUT') {
            if (this.element.type.toUpperCase() == 'CHECKBOX') {
               vk = 'checked';
            } else {
               vk = 'value';
            }
         } else if (tag == 'SELECT' ) {
            vk = 'value';
         } else {
            vk = 'innerHTML';
         }
      }
      this.valueKey = vk;
      this.value = this.element[vk];
      var me = this;
      this.on('change', function (e) {
         me.set(me.element[me.valueKey]);
      });
   };
   cls.prototype = new LLComponentBase();
   cls.prototype.constructor = cls;
   var proto = cls.prototype;
   proto.get = function () {
      return this.value;
   };
   proto.set = function (v) {
      if (!this.exist) return;
      if (v == this.value) return;
      this.element[this.valueKey] = v;
      this.value = v;
      if (this.onValueChange) this.onValueChange(v);
   };
   proto.serialize = function () {
      return this.get();
   };
   proto.deserialize = function (v) {
      this.set(v);
   };
   return cls;
})();

var LLSelectComponent = (function() {
   /* Properties:
    *    options
    *    filter
    * Methods:
    *    set (override)
    *    setOptions
    *    filterOptions
    */
   var cls = function (id, options) {
      LLValuedComponent.call(this, id, options);
      if (!this.exist) {
         this.options = undefined;
         return this;
      }
      var opts = [];
      var orig_opts = this.element.options;
      for (var i = 0; i < orig_opts.length; i++) {
         opts.push({
            value: orig_opts[i].value,
            text: orig_opts[i].text
         });
      }
      this.options = opts;
   };
   cls.prototype = new LLValuedComponent();
   cls.prototype.constructor = cls;
   var proto = cls.prototype;
   proto.set = function (v) {
      if (!this.exist) return;
      if (v != this.element[this.valueKey]) {
         this.element[this.valueKey] = v;
      }
      if (this.element.selectedIndex >= 0) {
         this.element.style.color = this.element.options[this.element.selectedIndex].style.color;
      }
      if (v != this.value) {
         this.value = v;
         if (this.onValueChange) this.onValueChange(v);
      }
   };
   proto.setOptions = function (options, filter) {
      if (!this.exist) return;
      this.options = options || [];
      this.filterOptions(filter);
   };
   proto.filterOptions = function (filter) {
      if (!this.exist) return;
      if (!filter) filter = this.filter;
      var oldValue = this.get();
      var foundOldValue = false;
      this.element.options.length = 0;
      for (var i in this.options) {
         var option = this.options[i];
         if (filter && !filter(option)) continue;
         var newOption = new Option(option.text, option.value);
         newOption.style.color = option.color || '';
         this.element.options.add(newOption);
         if (oldValue == option.value) foundOldValue = true;
      }
      if (foundOldValue) {
         this.set(oldValue);
      } else {
         this.set(this.element.value);
      }
      this.filter = filter;
   };
   return cls;
})();

var LLComponentCollection = (function() {
   /* Properties:
    *    components (serialize)
    * Methods:
    *    add(name, component)
    *    getComponent(name)
    *    serialize()
    *    deserialize(v)
    *    saveCookie(key) (require setCookie)
    *    loadCookie(key) (require getCookie)
    *    deleteCookie(key) (require setCookie)
    */
   var cls = function () {
      this.components = {};
   };
   var proto = cls.prototype;
   proto.add = function (name, component) {
      this.components[name] = component;
   };
   proto.getComponent = function (name) {
      return this.components[name];
   };
   proto.serialize = function () {
      var ret = {};
      for (var i in this.components) {
         var val = this.components[i].serialize();
         if (val !== undefined) {
            ret[i] = val;
         }
      }
      return ret;
   };
   proto.deserialize = function (v) {
      if (!v) return;
      for (var i in this.components) {
         var val = v[i];
         if (val !== undefined) {
            this.components[i].deserialize(val);
         }
      }
   };
   proto.saveCookie = function (key) {
      setCookie(key, JSON.stringify(this.serialize()), 1);
   };
   proto.loadCookie = function (key) {
      var data = getCookie(key);
      if (data && data != 'undefined') {
         try {
            this.deserialize(JSON.parse(data));
         } catch (e) {
            console.error(e);
         }
      }
   };
   proto.deleteCookie = function (key) {
      setCookie(key, '', -1);
   };
   return cls;
})();

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

   comboMulti: function (cb) {
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
   },

   healNumberToString: function (n) {
      var ret = n.toFixed(2);
      while (ret[ret.length-1] == '0') ret = ret.substring(0, ret.length-1);
      if (ret[ret.length-1] == '.') ret = ret.substring(0, ret.length-1);
      return ret;
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

   // kizuna from twintailos.js, skilllevel from each page
   applycarddata: function () {
      var index = document.getElementById('cardchoice').value;
      var mezame = (document.getElementById("mezame").checked ? 1 : 0);
      if (index != "") {
         LoadingUtil.startSingle(LLCardData.getDetailedData(index)).then(function(card) {
            document.getElementById("main").value = card.attribute
            comp_skill.setCardData(card);

            var infolist2 = ["smile", "pure", "cool"]
            var i;
            if (!mezame){
               for (i in infolist2){
                  document.getElementById(infolist2[i]).value = card[infolist2[i]]
               }
               document.getElementById("mezame").value = "未觉醒"
            }
            else{
               for (i in infolist2){
                  document.getElementById(infolist2[i]).value = card[infolist2[i]+"2"]
               }
               document.getElementById("mezame").value = "已觉醒"
            }
            document.getElementById("kizuna").value = kizuna[card.rarity][mezame]
         }, defaultHandleFailedRequest);
      } else {
         comp_skill.setCardData();
      }
      LLUnit.changeavatar('imageselect', index, mezame);
   },

   // getimagepath require twintailosu.js
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
      var cardid = parseInt(document.getElementById('cardid'+String(n)).value)
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

/*
 * componsed components
 *   LLSkillContainer (require LLUnit)
 *   LLCardSelector
 */
var LLSkillContainer = (function() {
   var cls = function (options) {
      LLComponentCollection.call(this);
      this.skillLevel = 0; // base 0, range 0-7
      this.cardData = undefined;
      options = options || {
         container: 'skillcontainer',
         lvup: 'skilllvup',
         lvdown: 'skilllvdown',
         level: 'skilllevel',
         text: 'skilltext'
      };
      var me = this;
      this.add('container', new LLComponentBase(options.container));
      this.add('lvup', new LLComponentBase(options.lvup));
      this.getComponent('lvup').on('click', function (e) {
         me.setSkillLevel(me.skillLevel+1);
      });
      this.add('lvdown', new LLComponentBase(options.lvdown));
      this.getComponent('lvdown').on('click', function (e) {
         me.setSkillLevel(me.skillLevel-1);
      });
      this.add('level', new LLValuedComponent(options.level));
      this.add('text', new LLValuedComponent(options.text));
      this.setCardData(options.cardData, true);
      this.render();
   };
   cls.prototype = new LLComponentCollection();
   cls.prototype.constructor = cls;
   var proto = cls.prototype;
   proto.setSkillLevel = function (lv) {
      if (lv == this.skillLevel) return;
      if (lv > 7) {
         this.skillLevel = 0;
      } else if (lv < 0) {
         this.skillLevel = 7;
      } else {
         this.skillLevel = lv;
      }
      this.render();
   };
   proto.setCardData = function (cardData, skipRender) {
      if (this.cardData === undefined) {
         if (cardData === undefined) return;
         this.cardData = cardData;
         this.skillLevel = 0;
         if (!skipRender) this.render();
      } else {
         if (cardData === undefined || this.cardData.id != cardData.id) {
            this.cardData = cardData;
            this.skillLevel = 0;
            if (!skipRender) this.render();
         }
      }
   };
   proto.render = function () {
      if ((!this.cardData) || this.cardData.skill == 0 || this.cardData.skill == null) {
         this.getComponent('container').hide();
      } else {
         this.getComponent('container').show();
         this.getComponent('text').set(LLUnit.getCardSkillText(this.cardData, this.skillLevel));
         this.getComponent('level').set(this.skillLevel+1);
      }
   };
   return cls;
})();

var LLCardSelector = (function() {
   /* Properties:
    *    cards
    *    language (serialize)
    *    filters
    *    freezeCardFilter
    *    attcolor (const)
    *    unitgradechr (const)
    *    cardOptions
    * Methods:
    *    handleCardFilter()
    *    setLanguage(language)
    *    getCardId()
    *    isInUnitGroup(unitgrade, character)
    *    addComponentAsFilter(name, component, filterfunction)
    *    serialize() (override)
    *    deserialize(v) (override)
    */
   var const_attcolor = {
      'smile': 'red',
      'pure': 'green',
      'cool': 'blue'
   };
   var const_unitgradechr = [
      [],
      ["星空凛","西木野真姫","小泉花陽","津島善子","国木田花丸","黒澤ルビィ"],
      ["高坂穂乃果","南ことり","園田海未","高海千歌","桜内梨子","渡辺曜"],
      ["絢瀬絵里","東條希","矢澤にこ","松浦果南","黒澤ダイヤ","小原鞠莉"],
      ["高坂穂乃果","絢瀬絵里","南ことり","園田海未","星空凛","西木野真姫","東條希","小泉花陽","矢澤にこ"],
      ["高海千歌","桜内梨子","松浦果南","黒澤ダイヤ","渡辺曜","津島善子","国木田花丸","小原鞠莉","黒澤ルビィ"],
      ["高坂穂乃果","南ことり","小泉花陽"],
      ["園田海未","星空凛","東條希"],
      ["絢瀬絵里","西木野真姫","矢澤にこ"],
      ["高海千歌","渡辺曜","黒澤ルビィ"],
      ["松浦果南","黒澤ダイヤ","国木田花丸"],
      ["桜内梨子","津島善子","小原鞠莉"]
   ];
   var cls = function (cards, options) {
      LLComponentCollection.call(this);

      // init variables
      if (typeof(cards) == "string") {
         cards = JSON.parse(cards);
      }
      this.cards = cards;
      this.language = 0;
      this.filters = {};
      this.freezeCardFilter = 1;
      this.attcolor = const_attcolor;
      this.unitgradechr = const_unitgradechr;

      // init components
      options = options || {
         cardchoice: 'cardchoice',
         rarity: 'rarity',
         chr: 'chr',
         att: 'att',
         special: 'special',
         cardtype: 'cardtype',
         skilltype: 'skilltype',
         triggertype: 'triggertype',
         setname: 'setname',
         unitgrade: 'unitgrade',
         showncard: 'showncard'
      };
      var me = this;
      var addSelect = function (name, f) {
         var comp = new LLSelectComponent(options[name]);
         me.addComponentAsFilter(name, comp, f);
      };
      this.add('cardchoice', new LLSelectComponent(options.cardchoice));
      this.getComponent('cardchoice').onValueChange = function (v) {
         if (me.onCardChange) me.onCardChange(v);
      };
      addSelect('rarity', function (card, v) { return (v == '' || card.rarity == v); });
      addSelect('chr', function (card, v) { return (v == '' || card.jpname == v); });
      addSelect('att', function (card, v) { return (v == '' || card.attribute == v); });
      addSelect('special', function (card, v) { return (v == '' || parseInt(card.special) == parseInt(v)); });
      addSelect('cardtype', function (card, v) { return (v == '' || card.type.indexOf(v) >= 0); });
      addSelect('skilltype', function (card, v) { return (v == '' || card.skilleffect == v); });
      addSelect('triggertype', function (card, v) { return (v == '' || card.triggertype == v); });
      addSelect('setname', function (card, v) { return (v == '' || card.jpseries == v); });
      addSelect('unitgrade', function (card, v) { return (v == '' || me.isInUnitGroup(v, card.jpname)); });
      me.addComponentAsFilter('showncard', new LLValuedComponent(options.showncard), function (card, v) { return (v == true || card.rarity != 'N'); });

      // build card options for both language
      var cardOptionsCN = [{'value': '', 'text': ''}];
      var cardOptionsJP = [{'value': '', 'text': ''}];
      var setnameSet = {};
      var cardKeys = Object.keys(cards).sort(function(a,b){return parseInt(a) - parseInt(b);});
      var i;
      for (i = 0; i < cardKeys.length; i++) {
         var index = cardKeys[i];
         if (index == "0") continue;
         var curCard = this.cards[index];
         if (curCard.support == 1) continue;

         var fullname = String(curCard.id);
         while (fullname.length < 3) fullname = '0' + fullname;
         fullname += ' ' + curCard.rarity + ' ';
         var cnName = fullname + (curCard.eponym ? "【"+curCard.eponym+"】" : '') + ' ' + curCard.name + ' ' + (curCard.series ? "("+curCard.series+")" : '');
         var jpName = fullname + (curCard.jpeponym ? "【"+curCard.jpeponym+"】" : '') + ' ' + curCard.jpname + ' ' + (curCard.jpseries ? "("+curCard.jpseries+")" : '');
         var color = this.attcolor[curCard.attribute];
         cardOptionsCN.push({'value': index, 'text': cnName, 'color': color});
         cardOptionsJP.push({'value': index, 'text': jpName, 'color': color});
         if (curCard.jpseries && curCard.jpseries.indexOf('編') >= 1 && !setnameSet[curCard.jpseries]) {
            setnameSet[curCard.jpseries] = [index, (curCard.series ? curCard.series : curCard.jpseries)];
         }
      }
      this.cardOptions = [cardOptionsCN, cardOptionsJP];
      this.getComponent('cardchoice').setOptions(this.cardOptions[this.language]);

      // build setname options
      var setnameOptions = this.getComponent('setname').options;
      if (setnameOptions) {
         for (i = 0; i < setnameOptions.length; i++) {
            delete setnameSet[setnameOptions[i].value];
         }
         var setnameMissingList = Object.keys(setnameSet).sort(function(a,b){return parseInt(setnameSet[a][0]) - parseInt(setnameSet[b][0]);});
         for (i = 0; i < setnameMissingList.length; i++) {
            setnameOptions.push({
               value: setnameMissingList[i],
               text: setnameSet[setnameMissingList[i]][1]
            });
         }
         this.getComponent('setname').setOptions(setnameOptions);
      }

      // at last, unfreeze the card filter and refresh filter
      this.freezeCardFilter = 0;
      this.handleCardFilter();
   };
   cls.prototype = new LLComponentCollection();
   cls.prototype.constructor = cls;
   var doFilter = function (me, option) {
      var index = option.value;
      if (!index) return true;
      var card = me.cards[index];
      if (!card) return true;
      var filters = me.filters;
      if (!filters) return true;
      for (var i in filters) {
         if (!filters[i](card)) return false;
      }
      return true;
   };
   var proto = cls.prototype;
   proto.handleCardFilter = function () {
      var me = this;
      this.getComponent('cardchoice').filterOptions(function (option) {
         return doFilter(me, option);
      });
   };
   proto.setLanguage = function (language) {
      if (this.language == language) return;
      this.language = language;
      this.getComponent('cardchoice').setOptions(this.cardOptions[this.language]);
   };
   proto.getCardId = function () {
      return this.getComponent('cardchoice').get() || '';
   };
   proto.isInUnitGroup = function (unitgrade, character) {
      if (!unitgrade) return true;
      var chrs = const_unitgradechr[parseInt(unitgrade)];
      if (!chrs) {
         console.error("Not found unit " + unitgrade + ", character " + character);
         return true;
      }
      for (var i = 0; i < chrs.length; i++) {
         if (chrs[i] == character) return true;
      }
      return false;
   };
   cls.isInUnitGroup = proto.isInUnitGroup;
   proto.addComponentAsFilter = function (name, comp, f) {
      var me = this;
      me.add(name, comp);
      comp.onValueChange = function (v) {
         me.filters[name] = function (card) { return f(card, v); };
         if (!me.freezeCardFilter) me.handleCardFilter();
      };
      comp.onValueChange(comp.get());
   };
   var super_serialize = proto.serialize;
   var super_deserialize = proto.deserialize;
   proto.serialize = function () {
      return {
         language: this.language,
         components: super_serialize.call(this)
      };
   };
   proto.deserialize = function (v) {
      if (!v) return;
      this.freezeCardFilter = 1;
      if (v.language !== undefined) {
         this.setLanguage(v.language);
      }
      super_deserialize.call(this, v.components);
      this.freezeCardFilter = 0;
      this.handleCardFilter();
      if (this.onCardChange) this.onCardChange(this.getCardId());
   };
   return cls;
})();

/*
 * strength calculation helper
 *   LLSisGem
 *   LLSkill
 *   LLMember
 *   LLTeam
 */
var LLSisGem = (function () {
   var EFFECT_RANGE = {
      'SELF': 1,
      'ALL': 2
   };
   var GEM_TYPE_DATA = [
      {'name': 'kiss', 'key': 'SADD_200', 'slot': 1, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 200, 'per_color': 1, 'attr_add': 1},
      {'name': 'perfume', 'key': 'SADD_450', 'slot': 2, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 450, 'per_color': 1, 'attr_add': 1},
      {'name': 'ring', 'key': 'SMUL_10', 'slot': 2, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 10, 'per_color': 1, 'per_grade': 1, 'attr_mul': 1},
      {'name': 'cross', 'key': 'SMUL_16', 'slot': 3, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 16, 'per_color': 1, 'per_grade': 1, 'attr_mul': 1},
      {'name': 'aura', 'key': 'AMUL_18', 'slot': 3, 'effect_range': EFFECT_RANGE.ALL, 'effect_value': 1.8, 'per_color': 1, 'attr_mul': 1},
      {'name': 'veil', 'key': 'AMUL_24', 'slot': 4, 'effect_range': EFFECT_RANGE.ALL, 'effect_value': 2.4, 'per_color': 1, 'attr_mul': 1},
      {'name': 'charm', 'key': 'SCORE_250', 'slot': 4, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 150, 'per_color': 1, 'skill_mul': 1},
      {'name': 'heal', 'key': 'HEAL_480', 'slot': 4, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 480, 'per_color': 1, 'heal_mul': 1},
      {'name': 'trick', 'key': 'EMUL_33', 'slot': 4, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 33, 'per_color': 1, 'ease_attr_mul': 1},
      {'name': 'wink', 'key': 'SADD_1400', 'slot': 5, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 1400, 'per_color': 1, 'attr_add': 1},
      {'name': 'trill', 'key': 'SMUL_28', 'slot': 5, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 28, 'per_color': 1, 'per_grade': 1, 'attr_mul': 1},
      {'name': 'bloom', 'key': 'AMUL_40', 'slot': 6, 'effect_range': EFFECT_RANGE.ALL, 'effect_value': 4, 'per_color': 1, 'attr_mul': 1},
      {'name': 'member', 'key': 'MEMBER_29', 'slot': 4, 'effect_range': EFFECT_RANGE.SELF, 'effect_value': 29, 'per_member': 1, 'attr_mul': 1},
      {'name': 'nonet', 'key': 'NONET_42', 'slot': 4, 'effect_range': EFFECT_RANGE.ALL, 'effect_value': 4.2, 'per_color': 1, 'per_unit': 1, 'attr_mul': 1}
   ];
   var MEMBER_COLOR = {
      "高坂穂乃果": 'smile',
      "絢瀬絵里": 'cool',
      "南ことり": 'pure',
      "園田海未": 'cool',
      "星空凛": 'smile',
      "西木野真姫": 'cool',
      "東條希": 'pure',
      "小泉花陽": 'pure',
      "矢澤にこ": 'smile',
      "高海千歌": 'smile',
      "桜内梨子": 'cool',
      "松浦果南": 'pure',
      "黒澤ダイヤ": 'cool',
      "渡辺曜": 'pure',
      "津島善子": 'cool',
      "国木田花丸": 'smile',
      "小原鞠莉": 'smile',
      "黒澤ルビィ": 'pure'
   };
   var EPSILON = 1e-8;
   var cls = function (type, options) {
      // options: {grade:(1~3), member:(member name), color:({smile|pure|cool}), unit:({muse|aqours})}
      if (type < 0 || type >= GEM_TYPE_DATA.length) throw 'Unknown type: ' + type;
      this.type = type;
      var data = GEM_TYPE_DATA[type];
      for (var i in data) {
         if (i != 'key') {
            this[i] = data[i];
         }
      }
      options = options || {};
      if (data.per_grade && options.grade) this.grade = options.grade;
      if (data.per_member && options.member) {
         this.member = options.member;
         this.color = MEMBER_COLOR[options.member];
      }
      if (data.per_color && options.color) this.color = options.color;
      if (data.per_unit && options.unit) this.unit = options.unit;
   };
   (function (obj) {
      var keys = [];
      for (var i = 0; i < GEM_TYPE_DATA.length; i++) {
         obj[GEM_TYPE_DATA[i].key] = i;
         keys.push(GEM_TYPE_DATA[i].key);
      }
      obj.getGemTypeKeys = function () {
         return keys;
      };
   })(cls);
   var bitSplit = function (val, candidate) {
      var ret = [];
      // assume candidate sort by value desending
      for (var i = 0; i < candidate.length; i++) {
         var cur_type = GEM_TYPE_DATA[candidate[i]];
         if (val >= cur_type.effect_value) {
            val -= cur_type.effect_value;
            ret.push(candidate[i]);
         }
      }
      return ret;
   };
   var sumSlot = function (types) {
      var ret = 0;
      for (var i = 0; i < types.length; i++) {
         ret += GEM_TYPE_DATA[types[i]].slot;
      }
      return ret;
   };
   var createGems = function (types, options) {
      var ret = [];
      for (var i = 0; i < types.length; i++) {
         ret.push(new LLSisGem(types[i], options));
      }
      return ret;
   };
   cls.createGems = createGems;
   cls.getGemSlot = function (type) {
      return GEM_TYPE_DATA[type].slot;
   };
   cls.parseSADDSlot = function (val) {
      return sumSlot(bitSplit(parseInt(val), [cls.SADD_1400, cls.SADD_450, cls.SADD_200]));
   };
   cls.parseSMULSlot = function (val) {
      return sumSlot(bitSplit(parseInt(val), [cls.SMUL_28, cls.SMUL_16, cls.SMUL_10]));
   };
   cls.parseAMULSlot = function (val) {
      val = parseFloat(val);
      if (Math.abs(val - 4.2) < EPSILON) return sumSlot([cls.AMUL_24, cls.AMUL_18]);
      return sumSlot(bitSplit(val+EPSILON, [cls.AMUL_40, cls.AMUL_24, cls.AMUL_18]));
   };
   cls.parseSADD = function (val, color) {
      return createGems(bitSplit(parseInt(val), [cls.SADD_1400, cls.SADD_450, cls.SADD_200]), {'color': color});
   };
   cls.parseSMUL = function (val, color, grade) {
      return createGems(bitSplit(parseInt(val), [cls.SMUL_28, cls.SMUL_16, cls.SMUL_10]), {'color': color, 'grade': grade});
   };
   cls.parseAMUL = function (val, color) {
      val = parseFloat(val);
      if (Math.abs(val - 4.2) < EPSILON) return createGems([cls.AMUL_24, cls.AMUL_18], {'color': color});
      return createGems(bitSplit(val+EPSILON, [cls.AMUL_40, cls.AMUL_24, cls.AMUL_18]), {'color': color});
   };
   var proto = cls.prototype;
   proto.isEffectRangeSelf = function () { return this.effect_range == EFFECT_RANGE.SELF; };
   proto.isEffectRangeAll = function () { return this.effect_range == EFFECT_RANGE.ALL; };
   proto.isSkillGem = function () { return this.skill_mul || this.heal_mul; };
   proto.getGemStockKeys = function () {
      if (this.gemStockKeys !== undefined) return this.gemStockKeys;
      var ret = [GEM_TYPE_DATA[this.type].key];
      if (this.per_color) {
         if (this.color === undefined) throw "Gem has no color";
         ret.push(this.color);
      }
      if (this.per_grade) {
         if (this.grade === undefined) throw "Gem has no grade";
         ret.push(this.grade);
      }
      if (this.per_member) {
         if (this.member === undefined) throw "Gem has no member";
         ret.push(this.member);
      }
      if (this.per_unit) {
         if (this.unit === undefined) throw "Gem has no unit";
         ret.push(this.unit);
      }
      this.gemStockKeys = ret;
      return ret;
   };
   proto.getGemStockCount = function (gemStock) {
      var cur = gemStock;
      var keys = this.getGemStockKeys();
      for (var i = 0; i < keys.length; i++) {
         cur = cur[keys[i]];
         if (cur === undefined) {
            console.log("Not found " + keys.join('.') + " in gem stock");
            return 0;
         }
      }
      return cur;
   };
   return cls;
})();

var LLSkill = (function () {
   var cls = function (card, level, buff) {
      this.card = card;
      this.level = level;
      var skilldetails = card.skilldetail || [];
      var skilldetail = skilldetails[level]  || {};
      this.hasSkill = (card.skilldetail && skilldetail.possibility);
      this.require = skilldetail.require || 1;
      this.possibility = skilldetail.possibility || 0;
      this.score = skilldetail.score || 0;
      this.time = skilldetail.time || 0;

      this.triggerType = card.triggertype;
      this.effectType = card.skilleffect;
      this.triggerTarget = card.triggertarget;
      this.effectTarget = card.effecttarget;

      this.reset();

      buff = buff || {};
      this.setScoreGem(buff.gemskill);
      this.setSkillPossibilityUp(buff.skillup);
   };
   var eTriggerType = {
      'TIME': 1,
      'NOTE': 3,
      'COMBO': 4,
      'SCORE': 5,
      'PERFECT': 6,
      'STAR_PERFECT': 12,
      'MEMBERS': 100
   };
   var eEffectType = {
      'ACCURACY_SMALL': 4,
      'ACCURACY_NORMAL': 5,
      'HEAL': 9,
      'SCORE': 11,
      'SKILL_POSSIBILITY_UP': 2000,
      'REPEAT': 2100,
      'PERFECT_SCORE_UP': 2201,
      'SYNC': 2400,
      'ATTRIBUTE_UP': 2600
   };
   var calcBiDist = function (n, p) {
      // time: O(n^2), space: O(n)
      if (n < 0) throw 'LLSkill::calcBiDist: n cannot be negitive, n=' + n + ', p=' + p;
      var dist = [new Array(n+1), new Array(n+1)];
      var pCur = 0, pNext = 1;
      var q = 1-p; // p: possiblility for +1, q: possibility for no change
      dist[pCur][0] = 1;
      for (var i = 1; i <= n; i++) {
         dist[pNext][0] = dist[pCur][0] * q;
         dist[pNext][i] = dist[pCur][i-1] * p;
         for (var j = 1; j < i; j++) {
            dist[pNext][j] = dist[pCur][j-1] * p + dist[pCur][j] * q;
         }
         pCur = pNext;
         pNext = 1-pNext;
      }
      return dist[pCur];
   };
   var proto = cls.prototype;
   proto.setScoreGem = function (has) {
      this.actualScore = 0;
      if (parseInt(has || 0)) {
         if (this.effectType == eEffectType.HEAL) {
            // 日服4.1版本前是270, 4.1版本后是480; 国服没有270
            this.actualScore = this.score * 480;
         } else if (this.effectType == eEffectType.SCORE) {
            this.actualScore = Math.ceil(this.score * 2.5);
         }
      } else {
         if (this.effectType == eEffectType.SCORE) {
            this.actualScore = this.score;
         }
      }
   };
   proto.setSkillPossibilityUp = function (rate) {
      this.actualPossibility = this.possibility * (1+parseInt(rate || 0)/100);
   };
   proto.reset = function () {
      this.skillChance = 0;
      this.averageScore = 0;
      this.maxScore = 0;
      this.averageHeal = 0;
      this.maxHeal = 0;
      this.simpleCoverage = 0;
      this.skillDist = undefined;
   };
   proto.isScoreTrigger = function () { return this.triggerType == eTriggerType.SCORE; };
   // 技能发动最大判定次数
   // 如果比上次计算的次数更多, 返回true, 否则返回false
   // env: {time, combo, score, perfect, starperfect}
   proto.calcSkillChance = function (env) {
      if (!this.hasSkill) return false;
      var chance = 0;
      var total = 0;
      if (this.triggerType == eTriggerType.TIME) {
         total = env.time;
      } else if (this.triggerType == eTriggerType.NOTE || this.triggerType == eTriggerType.COMBO) {
         total = env.combo;
      } else if (this.triggerType == eTriggerType.SCORE) {
         total = env.score;
      } else if (this.triggerType == eTriggerType.PERFECT) {
         // TODO: combo*perfect_rate?
         total = env.perfect;
      } else if (this.triggerType == eTriggerType.STAR_PERFECT) {
         // TODO: star*perfect_rate?
         total = env.starperfect;
      }
      chance = Math.floor(total/this.require);
      if (chance > this.skillChance) {
         this.skillChance = chance;
         this.skillDist = undefined; // reset distribution
         return true;
      } else {
         return false;
      }
   };
   proto.calcSkillEffect = function (env) {
      if (!this.hasSkill) return false;
      this.maxScore = this.skillChance * this.actualScore;
      if (this.effectType == eEffectType.HEAL) {
         this.maxHeal = this.skillChance * this.score;
      } else {
         this.maxHeal = 0;
      }
      this.averageScore = this.maxScore * this.actualPossibility/100;
      this.averageHeal = this.maxHeal * this.actualPossibility/100;
      // 对于buff型技能, 计算简易覆盖率
      if (this.time > 0) {
         // 令: 判定次数*每次发动需要秒数+判定次数*发动率*发动秒数 <= 总时间
         // 则: 判定次数<=总时间/(每次发动需要秒数+发动率*发动秒数)
         // 简易覆盖率: 发动率*发动秒数/(每次发动需要秒数+发动率*发动秒数)
         // 实际覆盖率受多种因素影响(临近结尾发动的判定, note分布不均匀等), 到llcoverge页面计算实际覆盖率
         // 非时间系的转换成平均多少秒能满足发动条件
         var timeRequire = env.time/this.skillChance;
         var p = this.actualPossibility/100;
         this.simpleCoverage = p*this.time/(timeRequire+p*this.time);
      } else {
         this.simpleCoverage = 0;
      }
   };
   proto.calcSkillStrength = function (scorePerStrength) {
      if (!this.maxScore) {
         this.strength = 0;
      } else {
         this.strength = Math.round(this.maxScore * this.possibility/100 /scorePerStrength);
      }
   };
   proto.calcSkillDist = function () {
      if (!this.skillChance) return false;
      if (this.skillDist) return this.skillDist;
      this.skillDist = calcBiDist(this.skillChance, this.actualPossibility/100);
      return this.skillDist;
   };
   proto.isEffectHeal = function () { return this.effectType == eEffectType.HEAL; }
   proto.isEffectScore = function () { return this.effectType == eEffectType.SCORE; }
   return cls;
})();

var LLMember = (function() {
   var int_attr = ["cardid", "smile", "pure", "cool", "skilllevel", "maxcost"];
   var MIC_RATIO = {'UR': 100, 'SSR': 59, 'SR': 29, 'R': 13, 'N': 0};
   var DEFAULT_MAX_SLOT = {'UR': 8, 'SSR': 6, 'SR': 4, 'R': 2, 'N': 1};
   var cls = function (v) {
      v = v || {};
      var i;
      for (i = 0; i < int_attr.length; i++) {
         var attr = int_attr[i];
         if (v[attr] === undefined) {
            console.error('missing attribute ' + attr);
            this[attr] = 0;
         } else {
            this[attr] = parseInt(v[attr]);
         }
      }
      if (v.card === undefined) {
         console.error('missing card detail');
      } else {
         this.card = v.card;
      }
      if (v.gems === undefined) {
         console.error('missing gem info');
         this.gems = [];
      } else {
         this.gems = v.gems;
      }
   };
   var isInUnitGroup = LLCardSelector.isInUnitGroup;
   var proto = cls.prototype;
   proto.hasSkillGem = function () {
      for (var i = 0; i < this.gems.length; i++) {
         if (this.gems[i].isSkillGem()) return 1;
      }
      return 0;
   };
   proto.calcDisplayAttr = function (mapcolor) {
      //显示属性=(基本属性+绊)*单体百分比宝石加成+数值宝石加成
      var curAttr = this[mapcolor];
      var ret = curAttr;
      for (var i = 0; i < this.gems.length; i++) {
         var gem = this.gems[i];
         if (gem.attr_add && gem.color == mapcolor) {
            ret += gem.effect_value;
         }
         if (gem.attr_mul && gem.isEffectRangeSelf() && gem.color == mapcolor) {
            ret += Math.ceil(gem.effect_value/100 * curAttr);
         }
      }
      this.displayAttr = ret;
      return ret;
   };
   proto.calcAttrWithGem = function (mapcolor, teamgem) {
      if (!this.displayAttr) throw "Need calcDisplayAttr first";
      if (!(teamgem && teamgem.length == 9)) throw "Expect teamgem length 9";
      //全体宝石累计加成(下标i表示0..i-1位队员所带的全体宝石给该队员带来的总加成, [0]=0)
      //注意全体宝石是在(基本属性值+绊)基础上计算的, 不是在显示属性上计算的
      var cumulativeTeamGemBonus = [0];
      var sum = 0;
      for (var i = 0; i < 9; i++) {
         for (var j = 0; j < teamgem[i].length; j++) {
            sum += Math.ceil(teamgem[i][j].effect_value/100 * this[mapcolor]);
         }
         cumulativeTeamGemBonus.push(sum);
      }
      this.cumulativeTeamGemBonus = cumulativeTeamGemBonus;
      this.attrWithGem = this.displayAttr + sum;
      return this.attrWithGem;
   };
   proto.calcAttrWithCSkill = function (mapcolor, cskills) {
      if (!this.attrWithGem) throw "Need calcAttrWithGem first";
      //主唱技能加成(下标i表示只考虑前i-1个队员的全体宝石时, 主唱技能的加成值, 下标0表示不考虑全体宝石)
      var cumulativeCSkillBonus = [];
      //属性强度(下标i表示只考虑前i-1个队员的全体宝石时的属性强度)
      var cumulativeAttrStrength = [];
      var baseAttr = {'smile':this.smile, 'pure':this.pure, 'cool':this.cool};
      for (var i = 0; i <= 9; i++) {
         baseAttr[mapcolor] = this.displayAttr + this.cumulativeTeamGemBonus[i];
         var bonusAttr = {'smile':0, 'pure':0, 'cool':0};
         for (var j = 0; j < cskills.length; j++) {
            var cskill = cskills[j];
            //主c技能
            if (cskill.Cskillpercentage) {
               bonusAttr[cskill.attribute] += Math.ceil(baseAttr[cskill.Cskillattribute]*cskill.Cskillpercentage/100);
            }
            //副c技能
            if (cskill.Csecondskillattribute) {
               if (isInUnitGroup(cskill.Csecondskilllimit, this.card.jpname)) {
                  bonusAttr[cskill.attribute] += Math.ceil(baseAttr[cskill.attribute]*cskill.Csecondskillattribute/100);
               }
            }
         }
         cumulativeCSkillBonus.push(bonusAttr[mapcolor]);
         cumulativeAttrStrength.push(baseAttr[mapcolor] + bonusAttr[mapcolor]);
         if (i == 9) {
            this.bonusAttr = bonusAttr;
            this.finalAttr = {
               'smile': baseAttr.smile + bonusAttr.smile,
               'pure': baseAttr.pure + bonusAttr.pure,
               'cool': baseAttr.cool + bonusAttr.cool
            };
            this.attrStrength = this.finalAttr[mapcolor];
         }
      }
      this.cumulativeCSkillBonus = cumulativeCSkillBonus;
      this.cumulativeAttrStrength = cumulativeAttrStrength;
      return this.finalAttr[mapcolor];
   };
   proto.getAttrDebuffFactor = function (mapcolor, mapunit, weight, totalweight) {
      var debuff = 1;
      if (this.card.attribute != mapcolor) debuff *= 1.1;
      if (!isInUnitGroup(mapunit, this.card.jpname)) debuff *= 1.1;
      debuff = 1-1/debuff;
      debuff = (weight/totalweight)*debuff;
      return debuff;
   };
   proto.calcAttrDebuff = function (mapcolor, mapunit, weight, totalweight, teamattr) {
      var attrDebuff = Math.round(this.getAttrDebuffFactor(mapcolor, mapunit, weight, totalweight) * teamattr);
      this.attrDebuff = attrDebuff;
      return attrDebuff;
   };
   proto.getMicPoint = function () {
      if (!this.card) throw "No card data";
      var rarity = this.card.rarity;
      if (DEFAULT_MAX_SLOT[rarity] != this.card.maxslot) {
         console.debug('Rarity not match max slot, consider as R for mic calculation');
         console.debug(this.card);
         rarity = 'R';
      }
      return MIC_RATIO[rarity] * this.skilllevel;
   };
   proto.calcTotalCSkillPercentageForSameColor = function (mapcolor, cskills) {
      var sumPercentage = 0;
      for (var i = 0; i < cskills.length; i++) {
         var cskill = cskills[i];
         if (cskill.Cskillpercentage && cskill.attribute == mapcolor && cskill.Cskillattribute == mapcolor) {
            sumPercentage += parseInt(cskill.Cskillpercentage);
         }
         if (cskill.Csecondskillattribute && cskill.attribute == mapcolor) {
            if (isInUnitGroup(cskill.Csecondskilllimit, this.card.jpname)) {
               sumPercentage += parseInt(cskill.Csecondskillattribute);
            }
         }
      }
      return sumPercentage;
   };
   return cls;
})();

var LLTeam = (function() {
   var cls = function (members) {
      if (members === undefined) throw("Missing members");
      if (members.length != 9) throw("Expect 9 members");
      this.members = members;
   };
   var MAX_SCORE = 10000000;
   var MAX_SCORE_TEXT = '1000w+';
   var MIC_BOUNDARIES = [
      [0, 187],      // 1
      [234, 455],    // 2
      [463, 681],    // 3
      [682, 1122],   // 4
      [1129, 1563],  // 5
      [1605, 2313],  // 6
      [2324, 3440],  // 7
      [3452, 5000],  // 8
      [5005, 7100],  // 9
      [7200, 7200]   // 10
   ];
   var armCombinationList = [];
   var getArmCombinationList = function (gems) {
      if (armCombinationList.length > 0) return armCombinationList;
      for (var i = 0; i <= 8; i++) {
         armCombinationList.push([]);
      }
      var gemTypeCount = gems.length;
      var dfs = function (gemList, usedSlot, nextGemIndex) {
         if (nextGemIndex >= gemTypeCount) {
            for (var i = usedSlot; i <= 8; i++) {
               armCombinationList[i].push(gemList);
            }
            return;
         }
         dfs(gemList, usedSlot, nextGemIndex+1);
         var nextUsedSlot = usedSlot + gems[nextGemIndex].gem.slot
         if (nextUsedSlot <= 8) {
            dfs(gemList.concat(nextGemIndex), nextUsedSlot, nextGemIndex+1);
         }
      };
      dfs([], 0, 0);
      return armCombinationList;
   };
   var proto = cls.prototype;
   var getTotalWeight = function (weights) {
      var totalWeight = 0;
      for (var i = 0; i < 9; i++) {
         totalWeight += weights[i];
      }
      return totalWeight;
   };
   proto.calculateAttributeStrength = function (mapcolor, mapunit, friendcskill, weights) {
      //((基本属性+绊)*百分比宝石加成+数值宝石加成)*主唱技能加成
      var teamgem = [];
      var totalWeight = getTotalWeight(weights);
      var i, j;
      //数值和单体百分比宝石
      for (i = 0; i < 9; i++) {
         var curMember = this.members[i];
         curMember.calcDisplayAttr(mapcolor);
         var curGems = [];
         for (j = 0; j < curMember.gems.length; j++) {
            var curGem = curMember.gems[j];
            if (curGem.attr_mul && curGem.isEffectRangeAll() && curGem.color == mapcolor) curGems.push(curGem);
         }
         teamgem.push(curGems);
      }
      //全体宝石和主唱技能加成
      var cskills = [this.members[4].card];
      if (friendcskill) cskills.push(friendcskill);
      for (i = 0; i < 9; i++) {
         var curMember = this.members[i];
         curMember.calcAttrWithGem(mapcolor, teamgem);
         curMember.calcAttrWithCSkill(mapcolor, cskills);
      }
      //全体宝石的提升统合到携带全体宝石的队员的属性强度上
      var attrStrength = [];
      var finalAttr = {'smile':0, 'pure':0, 'cool':0};
      var bonusAttr = {'smile':0, 'pure':0, 'cool':0};
      for (i = 0; i < 9; i++) {
         var curMember = this.members[i];
         var curAttrStrength = curMember.cumulativeAttrStrength[0];
         for (j = 0; j < 9; j++) {
            var jMember = this.members[j];
            curAttrStrength += jMember.cumulativeAttrStrength[i+1] - jMember.cumulativeAttrStrength[i];
         }
         attrStrength.push(curAttrStrength);
         for (j in finalAttr) {
            finalAttr[j] += curMember.finalAttr[j];
            bonusAttr[j] += curMember.bonusAttr[j];
         }
      }
      //debuff
      var attrDebuff = [];
      var totalAttrStrength = 0;
      for (i = 0; i < 9; i++) {
         var curMember = this.members[i];
         curMember.calcAttrDebuff(mapcolor, mapunit, weights[i], totalWeight, finalAttr[mapcolor]);
         attrDebuff.push(curMember.attrDebuff);
         totalAttrStrength += attrStrength[i] - attrDebuff[i];
      }
      this.attrStrength = attrStrength;
      this.attrDebuff = attrDebuff;
      this.finalAttr = finalAttr;
      this.bonusAttr = bonusAttr;
      // total
      this.totalWeight = totalWeight;
      this.totalAttrStrength = totalAttrStrength;
      // TODO:判定宝石
   };
   var calcTeamSkills = function (llskills, env, isAvg) {
      var finish = false;
      var scoreAttr = (isAvg ? 'averageScore' : 'maxScore');
      var healAttr = (isAvg ? 'averageHeal' : 'maxHeal');
      while (!finish) {
         finish = true;
         if (env[scoreAttr] >= MAX_SCORE) {
            env[scoreAttr] = MAX_SCORE;
            break;
         }
         var sumScore = env.minscore;
         var sumHeal = 0;
         for (var i = 0; i < 9; i++) {
            if (llskills[i].calcSkillChance(env)) {
               finish = false;
               llskills[i].calcSkillEffect(env);
            }
            sumScore += llskills[i][scoreAttr];
            sumHeal += llskills[i][healAttr];
         }
         sumScore = Math.round(sumScore);
         env[scoreAttr] = sumScore;
         env[healAttr] = sumHeal;
         env.score = sumScore;
      }
   };
   proto.calculateSkillStrength = function (maptime, mapcombo, mapperfect, mapstarperfect, tapup, skillup) {
      var comboMulti = LLUnit.comboMulti(mapcombo);
      var accuracyMulti = 0.88+0.12*(mapperfect/mapcombo);
      var scorePerStrength = 1.21/80*this.totalWeight*comboMulti*accuracyMulti;
      var minScore = Math.round(this.totalAttrStrength * scorePerStrength * (1+parseFloat(tapup)/100));

      var avgSkills = [];
      var maxSkills = [];
      var i;
      for (i = 0; i < 9 ; i++) {
         var curMember = this.members[i]
         avgSkills.push(new LLSkill(curMember.card, curMember.skilllevel-1, {'gemskill': curMember.hasSkillGem(), 'skillup': skillup}));
         maxSkills.push(new LLSkill(curMember.card, curMember.skilllevel-1, {'gemskill': curMember.hasSkillGem(), 'skillup': skillup}));
      }

      var env = {
         'time': maptime,
         'combo': mapcombo,
         'score': minScore,
         'perfect': mapperfect,
         'starperfect': mapstarperfect,
         'minscore': minScore
      };
      calcTeamSkills(avgSkills, env, true);
      calcTeamSkills(maxSkills, env, false);
      var totalSkillStrength = 0;
      for (i = 0; i < 9; i++) {
         avgSkills[i].calcSkillStrength(scorePerStrength);
         totalSkillStrength += avgSkills[i].strength;
      }
      this.avgSkills = avgSkills;
      this.maxSkills = maxSkills;
      this.minScore = minScore;
      this.averageScoreNumber = env.averageScore;
      this.averageScore = (env.averageScore == MAX_SCORE ? MAX_SCORE_TEXT : env.averageScore);
      this.maxScoreNumber = env.maxScore;
      this.maxScore = (env.maxScore == MAX_SCORE ? MAX_SCORE_TEXT : env.maxScore);
      this.averageHeal = env.averageHeal;
      this.maxHeal = env.maxHeal;
      // total
      this.totalSkillStrength = totalSkillStrength;
      this.totalStrength = this.totalAttrStrength + this.totalSkillStrength;
   };
   proto.calculateScoreDistribution = function () {
      if (this.maxScore == MAX_SCORE) {
         console.error('Cannot calculate distribution for infinite max score');
         return '分数太高，无法计算分布';
      }
      var nonScoreTriggerSkills = [];
      var scoreTriggerSkills = [];
      var nextScore = [];
      for (var i = 0; i < 9; i++) {
         var curSkill = this.avgSkills[i];
         if (curSkill.actualScore) {
            if (curSkill.isScoreTrigger()) {
               scoreTriggerSkills.push(curSkill);
               nextScore.push(curSkill.require);
            } else {
               nonScoreTriggerSkills.push(curSkill);
            }
         }
      }
      // non-score trigger skills
      var scoreRange = this.maxScore - this.minScore + 1;
      var scorePossibility = [new Array(scoreRange), new Array(scoreRange)];
      var pCur = 0, pNext = 1;
      var curMax = 0;
      scorePossibility[pCur][0] = 1;
      for (var i = 0; i < nonScoreTriggerSkills.length; i++) {
         var curScore = nonScoreTriggerSkills[i].actualScore;
         var curDist = nonScoreTriggerSkills[i].calcSkillDist();
         var nextMax = curMax + curScore * (curDist.length - 1);
         for (var j = 0; j <= nextMax; j++) {
            scorePossibility[pNext][j] = 0;
         }
         for (var j = 0; j <= curMax; j++) {
            for (var k = 0; k < curDist.length; k++) {
               scorePossibility[pNext][j+k*curScore] += scorePossibility[pCur][j] * curDist[k];
            }
         }
         curMax = nextMax;
         pCur = pNext;
         pNext = 1 - pNext;
      }
      //console.debug(scorePossibility[pCur]);
      // score trigger skills
      while (scoreTriggerSkills.length > 0) {
         var minNextScore = nextScore[0];
         var minIndex = 0;
         for (var i = 1; i < nextScore.length; i++) {
            if (nextScore[i] < minNextScore) {
               minNextScore = nextScore[i];
               minIndex = i;
            }
         }
         if (minNextScore > this.maxScore) break;
         var curSkill = scoreTriggerSkills[minIndex];
         var curScore = curSkill.actualScore;
         var curPossibility = curSkill.actualPossibility / 100;
         var minNextScoreIndex = minNextScore - this.minScore;
         if (minNextScoreIndex < 0) minNextScoreIndex = 0;
         var nextMax = curMax + curScore;
         for (var i = 0; i < minNextScoreIndex; i++) {
            scorePossibility[pNext][i] = scorePossibility[pCur][i];
         }
         for (var i = minNextScoreIndex; i <= nextMax; i++) {
            scorePossibility[pNext][i] = 0;
         }
         for (var i = minNextScoreIndex; i <= curMax; i++) {
            scorePossibility[pNext][i] += scorePossibility[pCur][i] * (1-curPossibility);
            scorePossibility[pNext][i+curScore] += scorePossibility[pCur][i] * curPossibility;
         }
         curMax = nextMax;
         pCur = pNext;
         pNext = 1 - pNext;
         nextScore[minIndex] += curSkill.require;
      }
      //console.debug(scorePossibility[pCur]);
      this.scoreDistribution = scorePossibility[pCur];
      this.probabilityForMinScore = this.scoreDistribution[0];
      this.probabilityForMaxScore = this.scoreDistribution[this.scoreDistribution.length - 1];
      return undefined;
   };
   proto.calculatePercentileNaive = function () {
      if (!this.scoreDistribution) return undefined;
      var expection = 0;
      var percent = 0;
      var dist = this.scoreDistribution;
      var percentile = [];
      percentile.push(this.minScore);
      var nextPercent = 1;
      for (var i = 0; i < dist.length; i++) {
         expection += (i+this.minScore) * dist[i];
         percent += dist[i];
         if (percent*100 >= nextPercent) {
            var curScore = i + this.minScore;
            while (percent*100 >= nextPercent) {
               percentile.push(curScore);
               nextPercent++;
            }
         }
      }
      if (nextPercent == 100) {
         percentile.push(i+this.minScore-1);
         console.debug(percentile);
      } else {
         console.log('calculatePercentileNaive: sum of probability over 100%');
         console.log(percentile);
         percentile[100] = i+this.minScore-1;
      }
      console.debug('calculatePercentileNaive: expection = ' + expection + ', percent = 1 ' + (percent >= 1 ? '+ ' : '- ') + Math.abs(percent-1));
      this.naivePercentile = percentile;
      this.naiveExpection = Math.round(expection);
   };
   proto.calculateMic = function () {
      var micPoint = 0;
      var i;
      for (i = 0; i < 9; i++) {
         micPoint += this.members[i].getMicPoint();
      }
      for (i = 0; i < 10; i++) {
         if (micPoint >= MIC_BOUNDARIES[i][0] && micPoint <= MIC_BOUNDARIES[i][1]) {
            this.micNumber = i+1;
            break;
         } else if (micPoint < MIC_BOUNDARIES[i][0]) {
            this.micNumber = i+0.5;
            break;
         }
      }
      if (i == 10) this.micNumber = 10.5;
      this.micPoint = micPoint;
   };
   var isInUnitGroup = LLCardSelector.isInUnitGroup;
   proto.autoArmGem = function (mapcolor, mapunit, maptime, mapcombo, mapperfect, mapstarperfect, tapup, skillup, friendcskill, weights, gemStock) {
      // 计算主唱增益率以及异色异团惩罚率
      var cskills = [this.members[4].card];
      if (friendcskill) cskills.push(friendcskill);
      var cskillPercentages = [];
      var totalDebuffFactor = 0;
      var totalWeight = getTotalWeight(weights);
      for (var i = 0; i < 9; i++) {
         var curMember = this.members[i];
         cskillPercentages.push(curMember.calcTotalCSkillPercentageForSameColor(mapcolor, cskills));
         totalDebuffFactor += curMember.getAttrDebuffFactor(mapcolor, mapunit, weights[i], totalWeight);
      }
      // 需要爆分宝石/治愈宝石可能带来的强度, 所以强行放入宝石进行计算
      for (var i = 0; i < 9; i++) {
         var curMember = this.members[i];
         if (!curMember.hasSkillGem()) {
            curMember.gems.push(new LLSisGem(LLSisGem.SCORE_250, {'color': curMember.card.attribute}));
         }
      }
      this.calculateAttributeStrength(mapcolor, mapunit, friendcskill, weights);
      this.calculateSkillStrength(maptime, mapcombo, mapperfect, mapstarperfect, tapup, skillup);
      // 统计年级, 组合信息
      var gradeInfo = [];
      var gradeCount = [0, 0, 0];
      var unitInfo = [];
      var unitMemberCount = {'muse':{}, 'aqours':{}};
      for (var i = 0; i < 9; i++) {
         var curMember = this.members[i];
         for (var j = 1; j <= 3; j++) {
            if (isInUnitGroup(j, curMember.card.jpname)) {
               gradeInfo.push(j);
               gradeCount[j]++;
               break;
            }
         }
         if (isInUnitGroup(4, curMember.card.jpname)) {
            unitInfo.push('muse');
            unitMemberCount.muse[curMember.card.jpname] = 1;
         } else if (isInUnitGroup(5, curMember.card.jpname)) {
            unitInfo.push('aqours');
            unitMemberCount.aqours[curMember.card.jpname] = 1;
         }
      }
      var allMuse = (Object.keys(unitMemberCount.muse).length == 9);
      var allAqours = (Object.keys(unitMemberCount.aqours).length == 9);
      // 计算每种宝石带来的增益
      var gemStockSubset = [];
      var gemStockKeyToIndex = {};
      var powerUps = [];
      var gemTypes = LLSisGem.getGemTypeKeys();
      for (var i = 0; i < 9; i++) {
         var curMember = this.members[i];
         var curPowerUps = [];
         var gemOption = {'grade': gradeInfo[i], 'color': mapcolor, 'member': curMember.card.jpname, 'unit': unitInfo[i]};
         for (var j = 0; j < gemTypes.length; j++) {
            var curGem = new LLSisGem(LLSisGem[gemTypes[j]], gemOption);
            var curStrengthBuff = 0;
            if (curGem.isSkillGem()) {
               var curSkill = this.avgSkills[i];
               curGem.color = curMember.card.attribute;
               if (curGem.heal_mul && curSkill.isEffectHeal()) {
                  curStrengthBuff = curSkill.strength;
               } else if (curGem.skill_mul && curSkill.isEffectScore()) {
                  curStrengthBuff = curSkill.strength * curGem.effect_value / (100+curGem.effect_value);
               }
               // 考虑技能概率提升带来的增益
               curStrengthBuff *= (1 + parseInt(skillup||0)/100);
            } else {
               if (curGem.attr_add) {
                  if (curGem.isEffectRangeSelf()) {
                     curStrengthBuff = curGem.effect_value * (1 + cskillPercentages[i]/100);
                  }
               } else if (curGem.attr_mul) {
                  if (curGem.isEffectRangeSelf()) {
                     if (curGem.color == mapcolor) {
                        curStrengthBuff = (curGem.effect_value / 100) * (1 + cskillPercentages[i]/100) * curMember[mapcolor];
                     }
                     // TODO: 个人宝石和歌曲颜色不同的情况下, 增加强度为12%主唱技能加成带来的强度
                  } else if (curGem.isEffectRangeAll()) {
                     var takeEffect = 0;
                     if (curGem.name == 'nonet') {
                        if ((curGem.unit == 'muse' && allMuse) || (curGem.unit == 'aqours' && allAqours)) {
                           takeEffect = 1;
                        }
                     } else {
                        takeEffect = 1;
                     }
                     if (takeEffect) {
                        for (var k = 0; k < 9; k++) {
                           curStrengthBuff += Math.ceil( (curGem.effect_value / 100) * this.members[k][mapcolor] ) * (1 + cskillPercentages[k]/100);
                        }
                     }
                  }
               }
               //TODO: 判定宝石
               // 考虑点击得分提升带来的增益, 以及异色异团惩罚带来的减益
               curStrengthBuff *= (1 + parseInt(tapup||0)/100) * (1 - totalDebuffFactor);
            }
            var gemStockKey = curGem.getGemStockKeys().join('.');
            if (gemStockKeyToIndex[gemStockKey] === undefined) {
               gemStockKeyToIndex[gemStockKey] = gemStockSubset.length;
               gemStockSubset.push(curGem.getGemStockCount(gemStock));
            }
            curPowerUps.push({'gem': curGem, 'strength': curStrengthBuff, 'stockindex': gemStockKeyToIndex[gemStockKey]});
         }
         powerUps.push(curPowerUps);
      }
      // 假设宝石库存充足的情况下, 计算宝石对每个成员带来的最大强度
      var combList = getArmCombinationList(powerUps[0]);
      var maxStrengthBuffForMember = [];
      for (var i = 0; i < 9; i++) {
         var curCombList = combList[this.members[i].maxcost];
         var curPowerUps = powerUps[i];
         var curMaxStrengthBuff = 0;
         var curMaxStrengthBuffComb = [];
         for (var j = 0; j < curCombList.length; j++) {
            var curComb = curCombList[j];
            var sumStrengthBuff = 0;
            for (var k = 0; k < curComb.length; k++) {
               sumStrengthBuff += curPowerUps[curComb[k]].strength;
            }
            if (sumStrengthBuff > curMaxStrengthBuff) {
               curMaxStrengthBuff = sumStrengthBuff;
               curMaxStrengthBuffComb = curComb;
            }
         }
         maxStrengthBuffForMember.push({'strength': curMaxStrengthBuff, 'comb': curMaxStrengthBuffComb});
      }
      // gemStockRequests[i][j]: 统计第(i+1)~第9个成员(下标i~8)对第j种宝石的总需求量
      var gemStockRequests = [];
      for (var i = 0; i < 9; i++) {
         var curRequests = [];
         var curPowerUps = powerUps[i];
         for (var j = 0; j < gemStockSubset.length; j++) {
            curRequests.push(0);
         }
         for (var j = 0; j < curPowerUps.length; j++) {
            curRequests[curPowerUps[j].stockindex] = 1;
         }
         gemStockRequests.push(curRequests);
      }
      for (var i = 7; i >= 0; i--) {
         for (var j = 0; j < gemStockSubset.length; j++) {
            gemStockRequests[i][j] += gemStockRequests[i+1][j];
         }
      }
      // dp[member_index][cur_state]={'strength': cur_max_strength, 'prev': prev_state, 'comb': cur_combination}
      // DP状态: 在考虑第1~member_index个成员(下标0~(member_index-1))的宝石分配情况下, 还剩cur_state个宝石的时候, 所能达到的最大强度加成
      // prev_state和cur_combination用于记录到达该状态的路径
      // member_index==0: 初始状态
      // cur_state, prev_state: 状态用字符串表示, 每个字符用0~9或者-, 表示剩余宝石数, -表示库存充足
      var curState = '';
      for (var i = 0; i < gemStockSubset.length; i++) {
         if (gemStockSubset[i] >= gemStockRequests[0][i]) {
            curState = curState + '-';
         } else {
            curState = curState + String(gemStockSubset[i]);
         }
      }
      var dp = [{}];
      dp[0][curState] = {'strength': 0, 'prev': '', 'comb': []};
      var maxStrengthBuff = 0;
      var addDPState = function (curDP, memberIndex, state, strength, prev, comb) {
         var nextState = state.split('');
         for (var i = 0; i < nextState.length; i++) {
            if (nextState[i] != '-') {
               if (memberIndex+1 < 9) {
                  if (parseInt(nextState[i]) >= gemStockRequests[memberIndex+1][i]) nextState[i] = '-';
               } else {
                  nextState[i] = '-';
               }
            }
         }
         var nextStateStr = nextState.join('');
         if (curDP[nextStateStr] !== undefined && curDP[nextStateStr].strength >= strength) return;
         curDP[nextStateStr] = {'strength': strength, 'prev': prev, 'comb': comb};
         if (strength > maxStrengthBuff) maxStrengthBuff = strength;
      };
      for (var i = 0; i < 9; i++) {
         var curMaxStrengthBuffStrength = maxStrengthBuffForMember[i].strength;
         var curMaxStrengthBuffComb = maxStrengthBuffForMember[i].comb;
         var curCombList = combList[this.members[i].maxcost];
         var curPowerUps = powerUps[i];
         var remainingMaxStrengthBuff = 0;
         for (var j = i; j < 9; j++) {
            remainingMaxStrengthBuff += maxStrengthBuffForMember[j].strength;
         }
         var lastDP = dp[i];
         var curDP = {};
         for (var lastState in lastDP) {
            var lastDPState = lastDP[lastState];
            if (lastDPState.strength + remainingMaxStrengthBuff < maxStrengthBuff) continue;
            // 检查当前成员最大加成所需的宝石是否充足, 如果充足就用这个配置
            var enoughGem = 1;
            for (var j = 0; enoughGem && j < curMaxStrengthBuffComb.length; j++) {
               if (lastState.charAt(curPowerUps[curMaxStrengthBuffComb[j]].stockindex) != '-') enoughGem = 0;
            }
            if (enoughGem) {
               addDPState(curDP, i, lastState, lastDPState.strength + curMaxStrengthBuffStrength, lastState, curMaxStrengthBuffComb);
               continue;
            }
            // 尝试该槽数下所有可行的宝石组合
            for (var j = 0; j < curCombList.length; j++) {
               var curComb = curCombList[j];
               var nextState = lastState.split('');
               var sumStrengthBuff = 0;
               var k;
               for (k = 0; k < curComb.length; k++) {
                  var powerUp = curPowerUps[curComb[k]];
                  if (nextState[powerUp.stockindex] == '0') break;
                  if (nextState[powerUp.stockindex] != '-') {
                     nextState[powerUp.stockindex] = String(parseInt(nextState[powerUp.stockindex])-1);
                  }
                  sumStrengthBuff += powerUp.strength;
               }
               if (k < curComb.length) continue;
               addDPState(curDP, i, nextState.join(''), lastDPState.strength + sumStrengthBuff, lastState, curComb);
            }
         }
         dp.push(curDP);
      }
      // 找到最优组合并沿着路径获取每个成员的最优宝石分配
      // dp[9]里应该只有一个状态(全是'-')
      maxStrengthBuff = 0;
      var maxStrengthState;
      for (var i in dp[9]) {
         if (dp[9][i].strength > maxStrengthBuff) {
            maxStrengthBuff = dp[9][i].strength;
            maxStrengthState = i;
         }
      }
      for (var i = 8; i >= 0; i--) {
         var curDPState = dp[i+1][maxStrengthState];
         var curComb = curDPState.comb;
         var curPowerUps = powerUps[i];
         var curGems = [];
         for (var j = 0; j < curComb.length; j++) {
            curGems.push(curPowerUps[curComb[j]].gem);
         }
         this.members[i].gems = curGems;
         maxStrengthState = curDPState.prev;
      }
   };
   return cls;
})();

var LLSaveData = (function () {
   // ver 0 : invalid save data
   // ver 1 : [{team member}, ..] total 9 members
   // ver 2 : [{team member with maxcost}, ..(9 members), {gem stock}] total 10 items
   // ver 10 : [{sub member}, ..] any number of members
   // ver 11 : {gem stock} ("1".."15", total 15 items)
   // ver 101 : (not compatible with old version)
   //   { "version": 101, "team": [{team member}, ..(9 members)], "gemstock": {gem stock v2}, "submember": [{sub member}, ..] }
   //   gem stock v2:
   //     {
   //       "<gem type key>": {"<sub type>": {"<sub type>": ...{"<sub type>": "<number>"}...} }, ...
   //     }
   //     sub type in following order and value:
   //       gem type has per_color: "smile", "pure", "cool"
   //       gem type has per_grade: "1", "2", "3"
   //       gem type has per_member: "<member name>"
   //       gem type has per_unit: "muse", "aqours"
   var checkSaveDataVersion = function (data) {
      if (data.version !== undefined) return parseInt(data.version);
      if (data.length === undefined && Object.keys(data).length == 15) return 11;
      if (data.length == 0) return 0;
      if (!data[0]) return 0;
      var member = data[0];
      if (!(member.cardid && member.mezame && member.skilllevel)) return 0;
      if (member.maxcost && !member.smile) return 10;
      if (data.length == 9) return 1;
      if (data.length == 10) return 2;
      return 0;
   };
   var calculateSlot = function (member){
      var ret = 0;
      ret += LLSisGem.parseSADDSlot(member.gemnum || 0);
      ret += LLSisGem.parseSMULSlot(parseFloat(member.gemsinglepercent || 0)*100);
      ret += LLSisGem.parseAMULSlot(parseFloat(member.gemallpercent || 0)*100);
      ret += parseInt(member.gemskill || 0)*4;
      ret += parseInt(member.gemacc || 0)*4;
      return ret;
   }
   var getTeamMemberV1V2 = function (data) {
      var ret = [];
      for (var i = 0; i < 9; i++) {
         var member = {};
         var cur = data[i];
         for (var j in cur) {
            member[j] = cur[j];
         }
         if (member.maxcost === undefined) member.maxcost = calculateSlot(member);
         ret.push(member);
      }
      return ret;
   };
   var getGemStockV11 = function (data) {
      var ret = {};
      var gemv1 = [9];
      for (var i = 1; i < 16; i++) {
         gemv1.push(parseInt(data[i] || 0));
      }
      ret['SADD_200'] = {'smile': gemv1[0], 'pure': gemv1[0], 'cool': gemv1[0]};
      ret['SADD_450'] = {'smile': gemv1[1], 'pure': gemv1[1], 'cool': gemv1[1]};
      ret['SMUL_10'] = {
         'smile': {'1': gemv1[2], '2': gemv1[3], '3': gemv1[4]},
         'pure': {'1': gemv1[2], '2': gemv1[3], '3': gemv1[4]},
         'cool': {'1': gemv1[2], '2': gemv1[3], '3': gemv1[4]}
      };
      ret['SMUL_16'] = {
         'smile': {'1': gemv1[5], '2': gemv1[6], '3': gemv1[7]},
         'pure': {'1': gemv1[5], '2': gemv1[6], '3': gemv1[7]},
         'cool': {'1': gemv1[5], '2': gemv1[6], '3': gemv1[7]}
      };
      ret['AMUL_18'] = {'smile': gemv1[8], 'pure': gemv1[8], 'cool': gemv1[8]};
      ret['AMUL_24'] = {'smile': gemv1[9], 'pure': gemv1[9], 'cool': gemv1[9]};
      ret['SCORE_250'] = {'smile': gemv1[10], 'pure': gemv1[11], 'cool': gemv1[12]};
      ret['HEAL_480'] = {'smile': gemv1[13], 'pure': gemv1[14], 'cool': gemv1[15]};
      return ret;
   };
   var getGemStockV1V2 = function (data) {
      if (!data[9]) {
         return {};
      }
      return getGemStockV11(data[9]);
   };
   var getSubMemberV10 = function (data) {
      return data;
   };
   var recursiveMakeGemStockDataImpl = function (meta, current_sub, subtypes, callback) {
      if (!current_sub) {
         return callback(meta, subtypes);
      }
      var next_sub;
      var types;
      if (current_sub == 'per_color') {
         next_sub = 'per_grade';
         types = ['smile', 'pure', 'cool'];
      } else if (current_sub == 'per_grade') {
         next_sub = 'per_member';
         types = ['1', '2', '3'];
      } else if (current_sub == 'per_member') {
         next_sub = 'per_unit';
         types = ["高坂穂乃果", "絢瀬絵里", "南ことり", "園田海未", "星空凛", "西木野真姫", "東條希", "小泉花陽", "矢澤にこ",
                  "高海千歌", "桜内梨子", "松浦果南", "黒澤ダイヤ", "渡辺曜", "津島善子", "国木田花丸", "小原鞠莉", "黒澤ルビィ"];
      } else if (current_sub == 'per_unit') {
         next_sub = '';
         types = ['muse', 'aqours'];
      } else {
         throw 'Unexpected current_sub "' + current_sub + '"';
      }
      if (!meta[current_sub]) return recursiveMakeGemStockDataImpl(meta, next_sub, subtypes, callback);
      var ret = {};
      for (var i = 0; i < types.length; i++) {
         ret[types[i]] = recursiveMakeGemStockDataImpl(meta, next_sub, subtypes.concat(types[i]), callback);
      }
      return ret;
   };
   var recursiveMakeGemStockData = function (meta, callback) {
      return recursiveMakeGemStockDataImpl(meta, 'per_color', [], callback);
   };
   var fillDefaultGemStock = function (stock, fillnum) {
      var keys = LLSisGem.getGemTypeKeys();
      for (var i = 0; i < keys.length; i++) {
         if (stock[keys[i]] === undefined) {
            stock[keys[i]] = recursiveMakeGemStockData(new LLSisGem(i), function(){return fillnum;});
         }
      }
   };
   var cls = function (data) {
      this.rawData = data;
      this.rawVersion = checkSaveDataVersion(data);
      if (this.rawVersion == 0) {
         console.error("Unknown save data:");
         console.error(data);
         this.teamMember = [];
         this.gemStock = {};
         this.hasGemStock = false;
         this.subMember = [];
      } else if (this.rawVersion == 1 || this.rawVersion == 2) {
         this.teamMember = getTeamMemberV1V2(data);
         this.gemStock = getGemStockV1V2(data);
         this.hasGemStock = true;
         this.subMember = [];
      } else if (this.rawVersion == 10) {
         this.teamMember = [];
         this.gemStock = {};
         this.hasGemStock = false;
         this.subMember = getSubMemberV10(data);
      } else if (this.rawVersion == 11) {
         this.teamMember = [];
         this.gemStock = getGemStockV11(data);
         this.hasGemStock = true;
         this.subMember = [];
      } else if (this.rawVersion >= 101) {
         this.teamMember = data.team;
         this.gemStock = data.gemstock;
         this.hasGemStock = true;
         this.subMember = data.submember;
      }
      fillDefaultGemStock(this.gemStock, (this.hasGemStock ? 0 : 9));
   };
   cls.checkSaveDataVersion = checkSaveDataVersion;
   cls.calculateSlot = calculateSlot;
   var proto = cls.prototype;
   proto.getLegacyGemStock = function() {
      return {
         '1': String(this.gemStock.SADD_450.smile),
         '2': String(this.gemStock.SMUL_10.smile['1']),
         '3': String(this.gemStock.SMUL_10.smile['2']),
         '4': String(this.gemStock.SMUL_10.smile['3']),
         '5': String(this.gemStock.SMUL_16.smile['1']),
         '6': String(this.gemStock.SMUL_16.smile['2']),
         '7': String(this.gemStock.SMUL_16.smile['3']),
         '8': String(this.gemStock.AMUL_18.smile),
         '9': String(this.gemStock.AMUL_24.smile),
         '10': String(this.gemStock.SCORE_250.smile),
         '11': String(this.gemStock.SCORE_250.pure),
         '12': String(this.gemStock.SCORE_250.cool),
         '13': String(this.gemStock.HEAL_480.smile),
         '14': String(this.gemStock.HEAL_480.pure),
         '15': String(this.gemStock.HEAL_480.cool)
      };
   };
   proto.serializeV1 = function() {
      return JSON.stringify(this.teamMember);
   };
   proto.serializeV2 = function() {
      var ret = [];
      for (var i = 0; i < 9; i++) {
         ret.push(this.teamMember[i]);
      }
      ret.push(this.getLegacyGemStock());
      return JSON.stringify(ret);
   };
   proto.serializeV10 = function() {
      return JSON.stringify(this.subMember);
   };
   proto.serializeV11 = function() {
      return JSON.stringify(this.getLegacyGemStock());
   };
   proto.serializeV101 = function() {
      return JSON.stringify({
         'version': this.rawVersion,
         'team': this.teamMember,
         'gemstock': this.gemStock,
         'submember': this.subMember
      });
   };
   proto.mergeV10 = function (v10data) {
      this.subMember = getSubMemberV10(v10data);
   };
   return cls;
})();



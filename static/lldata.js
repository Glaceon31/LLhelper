/*
 * This script contains following things:
 *   LoadingUtil
 *   LLData
 *   LLUnit
 *
 * components:
 *   LLComponentBase
 *     +- LLValuedComponent
 *       +- LLSelectComponent
 *   LLComponentCollection
 *     +- LLSkillContainer
 *     +- LLCardSelector
 *
 * v0.4.0
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
      var me = this;
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
         //document.getElementById('cardchoice').style.color = llcard.attcolor[llcard.cards[index].attribute];
         LoadingUtil.startSingle(LLCardData.getDetailedData(index)).then(function(card) {
            document.getElementById("main").value = card.attribute
            comp_skill.setCardData(card);

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
         cards = eval("("+cards+")");
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
      for (var i = 0; i < cardKeys.length; i++) {
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
         if (curCard.jpseries && curCard.jpseries.indexOf('編') > 0 && !setnameSet[curCard.jpseries]) {
            setnameSet[curCard.jpseries] = index;
         }
      }
      this.cardOptions = [cardOptionsCN, cardOptionsJP];
      this.getComponent('cardchoice').setOptions(this.cardOptions[this.language]);

      // build setname options
      var setnameOptions = this.getComponent('setname').options;
      if (setnameOptions) {
         for (var i = 0; i < setnameOptions.length; i++) {
            delete setnameSet[setnameOptions[i].value];
         }
         var setnameMissingList = Object.keys(setnameSet).sort(function(a,b){return parseInt(setnameSet[a]) - parseInt(setnameSet[b]);});
         for (var i = 0; i < setnameMissingList.length; i++) {
            setnameOptions.push({
               value: setnameMissingList[i],
               text: setnameMissingList[i]
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



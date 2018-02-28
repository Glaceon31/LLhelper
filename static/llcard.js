/*
 * Common card filter/select script
 *
 * By ben1222
 */

function LLCard(cardjson) {
   var cards = cardjson;
   if (typeof(cards) == "string") {
      cards = eval("("+cards+")");
   }

   this.cards = cards;
   this.attcolor = {
      'smile': 'red',
      'pure': 'green',
      'cool': 'blue'
   };
   this.nametojp = {
      "高坂穗乃果": "高坂穂乃果",
      "绚濑绘里": "絢瀬絵里",
      "南小鸟": "南ことり",
      "园田海未": "園田海未",
      "星空凛": "星空凛",
      "西木野真姬": "西木野真姫",
      "东条希": "東條希",
      "小泉花阳": "小泉花陽",
      "矢泽妮可": "矢澤にこ",
      "高海千歌": "高海千歌",
      "樱内梨子": "桜内梨子",
      "松浦果南": "松浦果南",
      "黑泽黛雅": "黒澤ダイヤ",
      "渡边曜": "渡辺曜",
      "津岛善子": "津島善子",
      "国木田花丸": "国木田花丸",
      "小原鞠莉": "小原鞠莉",
      "黑泽露比": "黒澤ルビィ"
   };
   this.unitgradechr = [
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
   this.units = ['','1年生','2年生','3年生',"μ's",'Aqours','Printemps','lilywhite','BiBi','CYaRon!','AZALEA','Guilty Kiss'];
   this.language = 0;
   this.cardSelId = 'cardchoice';
   this.cardRarityId = 'rarity';
   this.cardChrId = 'chr';
   this.cardAttId = 'att';
   this.cardTypeId = 'cardtype';
   this.cardSpecialId = 'special';
   this.cardSkillTypeId = 'skilltype';
   this.cardTriggerTypeId = 'triggertype';
   this.cardSetNameId = 'setname';
   this.cardShowNCardId = 'showncard';
   this.cardUnitGradeId = 'unitgrade';
   this.cardStrengthLowBoundId = 'lowbound';
   this.calcCardMaxStrength = undefined;
};

// listeners
LLCard.prototype.initListeners = function() {
   var me = this;
   var funcOnCardFilterChange = function() { me.onCardFilterChange(); };
   var funcOnCardSelectChange = function() { me.onCardSelectChange(); };
   this._listen(this.cardRarityId, 'change', funcOnCardFilterChange);
   this._listen(this.cardChrId, 'change', funcOnCardFilterChange);
   this._listen(this.cardAttId, 'change', funcOnCardFilterChange);
   this._listen(this.cardTypeId, 'change', funcOnCardFilterChange);
   this._listen(this.cardSpecialId, 'change', funcOnCardFilterChange);
   this._listen(this.cardSkillTypeId, 'change', funcOnCardFilterChange);
   this._listen(this.cardTriggerTypeId, 'change', funcOnCardFilterChange);
   this._listen(this.cardSetNameId, 'change', funcOnCardFilterChange);
   this._listen(this.cardShowNCardId, 'change', funcOnCardFilterChange);
   this._listen(this.cardUnitGradeId, 'change', funcOnCardFilterChange);
   this._listen(this.cardStrengthLowBoundId, 'change', funcOnCardFilterChange);
   this._listen(this.cardSelId, 'change', funcOnCardSelectChange);
};
LLCard.prototype._listen = function(id, e, func) {
   if (!(id && e && func)) return;
   var element = document.getElementById(id);
   if (!element) return;
   element.addEventListener(e, func);
};

// gets
LLCard.prototype.getElementValue = function (id, defaultValue) {
   if (!id) return defaultValue;
   var ret = undefined;
   var element = document.getElementById(id);
   if (element) ret = element.value;
   if (ret === undefined) return defaultValue;
   return ret;
};
LLCard.prototype.getElementChecked = function (id, defaultValue) {
   if (!id) return defaultValue;
   var ret = undefined;
   var element = document.getElementById(id);
   if (element) ret = element.checked;
   if (ret === undefined) return defaultValue;
   return ret;
};
LLCard.prototype.getElementOrThrow = function (id) {
   if (!id) throw "Not given id";
   var ret = document.getElementById(id);
   if (!ret) throw ("Not found " + id);
   return ret;
};

// event handlers
LLCard.prototype.defaultOnCardFilterChange = function () {
   this.filterCards();
   this.onCardSelectChange();
};
LLCard.prototype.onCardFilterChange = LLCard.prototype.defaultOnCardFilterChange;
LLCard.prototype.onCardSelectChange = function () {};

// filters
LLCard.prototype.filterCards = function (cardsel, rarity, chr, att, cardtype, special, skilltype, triggertype, setname, showncard, unitgrade, strlowbound) {
   if (cardsel === undefined) cardsel = this.getElementOrThrow(this.cardSelId);
   if (rarity === undefined) rarity = this.getElementValue(this.cardRarityId, "");
   if (chr === undefined) chr = this.getElementValue(this.cardChrId, "");
   if (att === undefined) att = this.getElementValue(this.cardAttId, "");
   if (cardtype === undefined) cardtype = this.getElementValue(this.cardTypeId, "");
   if (special === undefined) special = this.getElementValue(this.cardSpecialId, "");
   if (skilltype === undefined) skilltype = this.getElementValue(this.cardSkillTypeId, "");
   if (triggertype === undefined) triggertype = this.getElementValue(this.cardTriggerTypeId, "");
   if (setname === undefined) setname = this.getElementValue(this.cardSetNameId, "");
   if (showncard === undefined) showncard = this.getElementChecked(this.cardShowNCardId, false);
   if (unitgrade === undefined) unitgrade = this.getElementValue(this.cardUnitGradeId, "");
   if (strlowbound === undefined) strlowbound = this.getElementValue(this.cardStrengthLowBoundId, "");

   var lastSelected = cardsel.value;
   var keepLastSelected = false;
   cardsel.options.length = 1;
   var cardKeys = Object.keys(this.cards).sort(function(a,b){return parseInt(a) - parseInt(b);});
   for (var i = 0; i < cardKeys.length; i++) {
      var index = cardKeys[i];
      if (index == "0") continue;
      var curCard = this.cards[index];
      if (curCard.support == 1) continue;

      if (rarity && rarity != curCard.rarity) continue;
      if (chr && curCard.jpname.indexOf(this.nametojp[chr]) == -1) continue;
      if (att && att != curCard.attribute) continue;
      if (special != "" && parseInt(special) != parseInt(curCard.special)) continue;
      if (cardtype && curCard.type.indexOf(cardtype) == -1) continue;
      if (skilltype != "" && skilltype != curCard.skilleffect) continue;
      if (triggertype != "" && triggertype != curCard.triggertype) continue;
      if (setname && setname != curCard.jpseries) continue;
      if ((!showncard) && curCard.rarity == 'N') continue;
      if (!this.isInUnitGroup(unitgrade, curCard.jpname)) continue;
      if (strlowbound && this.calcCardMaxStrength && strlowbound > this.calcCardMaxStrength(curCard)) continue;

      var fullname = String(curCard.id);
      while (fullname.length < 3) fullname = '0' + fullname;
      fullname += ' ' + curCard.rarity + ' ';
      if (this.language == 0) {
         fullname += (curCard.eponym ? "【"+curCard.eponym+"】" : '') + ' ' + curCard.name + ' ' + (curCard.series ? "("+curCard.series+")" : '');
      } else {
         fullname += (curCard.jpeponym ? "【"+curCard.jpeponym+"】" : '') + ' ' + curCard.jpname + ' ' + (curCard.jpseries ? "("+curCard.jpseries+")" : '');
      }
      var newOption = new Option(fullname, index);
      newOption.style.color = this.attcolor[curCard.attribute];
      cardsel.options.add(newOption);

      if (index == lastSelected) keepLastSelected = true;
   }
   if (keepLastSelected) {
      cardsel.value = lastSelected;
   }
};
LLCard.prototype.showAllCards = function (cardsel) {
   this.filterCards(cardsel, "", "", "", "", "", "", "", "", "", "", "");
};

// util
LLCard.prototype.isInUnitGroup = function (unitgrade, character) {
   if (!unitgrade) return true;
   var chrs = this.unitgradechr[parseInt(unitgrade)];
   if (!chrs) {
      console.error("Not found unit " + unitgrade + ", character " + character);
      return true;
   }
   for (var i = 0; i < chrs.length; i++) {
      if (chrs[i] == character) return true;
   }
   return false;
};


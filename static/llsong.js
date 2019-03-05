/*
 * Common song filter/select script
 *
 * By ben1222
 */

function LLSong(songjson, includeDefaultSong) {
   var songs = songjson;
   if (typeof(songs) == "string") {
      songs = JSON.parse(songs);
   }
   if (includeDefaultSong === undefined || includeDefaultSong) {
      var defaultsong1 = {
         'name': '默认曲目（缪）',
         'jpname': '默认曲目（缪）',
         'muse': 1,
         'aqours': 0,
         'bpm': 200,
         'attribute': ''
      };
      var defaultsong2 = {
         'name': '默认曲目（水）',
         'jpname': '默认曲目（水）',
         'muse': 0,
         'aqours': 1,
         'bpm': 200,
         'attribute': ''
      };
      var defaultsong3 = {
         'name': '默认曲目2（缪）',
         'jpname': '默认曲目2（缪）',
         'muse': 1,
         'aqours': 0,
         'bpm': 200,
         'attribute': ''
      };
      var defaultsong4 = {
         'name': '默认曲目2（水）',
         'jpname': '默认曲目2（水）',
         'muse': 0,
         'aqours': 1,
         'bpm': 200,
         'attribute': ''
      };
      var expert_default1 = {
         'positionweight': [63.75,63.75,63.75,63.75,0,63.75,63.75,63.75,63.75],
         'combo': 500,
         'time': 110,
         'star': 65
      };
      var expert_default2 = {
         'positionweight': [63,63,63,63,0,63,63,63,63],
         'combo': 504,
         'time': 110,
         'star': 65
      };
      var master_default1 = {
         'positionweight': [87.5,87.5,87.5,87.5,0,87.5,87.5,87.5,87.5],
         'combo': 700,
         'time': 110,
         'star': 65
      };
      var master_default2 = {
         'positionweight': [88,88,88,88,0,88,88,88,88],
         'combo': 704,
         'time': 110,
         'star': 65
      };
      defaultsong1["expert"] = expert_default1;
      defaultsong1["master"] = master_default1;
      defaultsong1["type"] = "0";
      defaultsong2["expert"] = expert_default1;
      defaultsong2["master"] = master_default1;
      defaultsong2["type"] = "0"
      defaultsong3["expert"] = expert_default2;
      defaultsong3["master"] = master_default2;
      defaultsong3["type"] = "0";
      defaultsong4["expert"] = expert_default2;
      defaultsong4["master"] = master_default2;
      defaultsong4["type"] = "0";
      songs["-4"] = defaultsong3
      songs["-3"] = defaultsong4
      songs["-2"] = defaultsong1
      songs["-1"] = defaultsong2
   }

   var attcolor = new Array();
   attcolor["smile"] = "red"
   attcolor["pure"] = "green"
   attcolor["cool"] = "blue"
   attcolor[""] = "purple"

   this.songs = songs;
   this.attcolor = attcolor;
   this.language = 0;
   this.songSelId = 'songchoice';
   this.songAttId = 'songatt';
   this.songUnitId = 'songunit';
   this.songSearchId = 'songsearch';
   this.songDiffId = 'songdiff';
   this.mapAttId = 'map';
   this.diffSelId = 'diffchoice';
};

// listeners
LLSong.prototype.initListeners = function() {
   var me = this;
   var funcOnSongFilterChange = function() { me.onSongFilterChange(); };
   var funcOnSongSelectChange = function() { me.onSongSelectChange(); };
   var funcOnDiffSelectChange = function() { me.onDiffSelectChange(); };
   this._listen(this.songAttId, 'change', funcOnSongFilterChange);
   this._listen(this.songUnitId, 'change', funcOnSongFilterChange);
   this._listen(this.songSearchId, 'change', funcOnSongFilterChange);
   this._listen(this.songDiffId, 'change', funcOnSongFilterChange);
   this._listen(this.songSelId, 'change', funcOnSongSelectChange);
   this._listen(this.diffSelId, 'change', funcOnDiffSelectChange);
};
LLSong.prototype._listen = function(id, e, func) {
   if (!(id && e && func)) return;
   var element = document.getElementById(id);
   if (!element) return;
   element.addEventListener(e, func);
};

// gets
LLSong.prototype.getElementValue = function (id, defaultValue) {
   if (!id) return defaultValue;
   var ret = undefined;
   var element = document.getElementById(id);
   if (element) ret = element.value;
   if (ret === undefined) return defaultValue;
   return ret;
};
LLSong.prototype.getElementOrThrow = function (id) {
   if (!id) throw "Not given id";
   var ret = document.getElementById(id);
   if (!ret) throw ("Not found " + id);
   return ret;
};
LLSong.prototype.getSelectedSongIndex = function (selid) {
   if (selid === undefined) selid = this.songSelId;
   return this.getElementValue(selid, "");
};
LLSong.prototype.getSelectedSong = function (selid) {
   return this.songs[this.getSelectedSongIndex(selid)];
};
LLSong.prototype.getSongAttr = function (songindex) {
   if (songindex === undefined) songindex = this.getSelectedSongIndex();
   if (songindex == "") return "";
   var song = this.songs[songindex];
   if (!song) return "";
   var songattr = song.attribute;
   if (songattr == "") songattr = this.getElementValue(this.songAttId, "");
   if (songattr == "") songattr = this.getElementValue(this.mapAttId, "");
   return songattr;
};

// event handlers
LLSong.prototype.defaultOnSongFilterChange = function () {
   this.filterSongs();
   this.onSongSelectChange();
};
LLSong.prototype.onSongFilterChange = LLSong.prototype.defaultOnSongFilterChange;
LLSong.prototype.defaultOnSongSelectChange = function () {
   this.filterDiff();
   this.onDiffSelectChange();
};
LLSong.prototype.onSongSelectChange = LLSong.prototype.defaultOnSongSelectChange;
LLSong.prototype.onDiffSelectChange = function () {};

// filters
LLSong.prototype.filterSongs = function (songsel, songatt, songunit, songdiff, keyword) {
   // TODO: filter by event(sm, mf, etc.), by star, by special flags (限时, 超难关, 滑键, etc.)
   if (songsel === undefined) songsel = this.getElementOrThrow(this.songSelId);
   if (songatt === undefined) songatt = this.getElementValue(this.songAttId, "");
   if (songunit === undefined) songunit = this.getElementValue(this.songUnitId, "");
   if (songdiff === undefined) songdiff = this.getElementValue(this.songDiffId, "");
   if (keyword === undefined) keyword = this.getElementValue(this.songSearchId, "");

   var lastSelected = songsel.value;
   var keepLastSelected = false;
   songsel.options.length = 1;
   if (keyword) keyword = keyword.toLowerCase();
   var songKeys = Object.keys(this.songs).sort(function(a,b){return parseInt(a) - parseInt(b);});
   for (var i = 0; i < songKeys.length; i++) {
      var index = songKeys[i];
      var curSong = this.songs[index];
      if (songatt && !((songatt == curSong.attribute) || (curSong.attribute == ""))) {
         continue;
      }
      if (songunit && !(curSong[songunit] == 1)) {
         continue;
      }
      if (songdiff && curSong[songdiff] === undefined) {
         continue;
      }
      if (keyword && !((curSong.name.toLowerCase().indexOf(keyword) != -1) || (curSong.jpname.toLowerCase().indexOf(keyword) != -1))) {
         continue;
      }
      var newOption;
      if (this.language == 0)
         newOption = new Option(curSong.name, index);
      else
         newOption = new Option(curSong.jpname, index);
      newOption.style.color = this.attcolor[curSong.attribute];
      songsel.options.add(newOption);

      if (index == lastSelected) keepLastSelected = true;
   }
   if (keepLastSelected) {
      songsel.value = lastSelected;
   }
};
LLSong.prototype.showAllSongs = function (songsel) {
   this.filterSongs(songsel, "", "", "", "");
};
LLSong.prototype.filterDiff = function (diffsel, songindex, cnhave, defaultdiff) {
   if (diffsel === undefined) diffsel = this.getElementOrThrow(this.diffSelId);
   if (songindex === undefined) songindex = this.getSelectedSongIndex();
   if (cnhave === undefined) cnhave = '';
   if (defaultdiff === undefined) defaultdiff = 'expert';

   diffsel.options.length = 0;
   if (songindex == "") return;

   var savediff = diffsel.value;
   if (!savediff) savediff = this.getElementValue(this.songDiffId, "");
   if (!savediff) savediff = defaultdiff;

   var diffname = ['easy', 'normal', 'hard', 'expert', 'master', 'arcade'];
   var diffDisplay = ['容易(Easy)', '普通(Normal)', '困难(Hard)', '专家(Expert)', '大师(Master)', 'Master Arcade'];
   var curSong = this.songs[songindex];
   for (var i in diffname) {
      var diff = diffname[i];
      var curSongWithDiff = curSong[diff];
      if (!curSongWithDiff) continue;
      if (cnhave == '' || (curSongWithDiff['cnhave'] == cnhave)) {
         var newOption = new Option(diffDisplay[i], diff);
         diffsel.options.add(newOption);
         if (savediff == diff) {
            diffsel.value = savediff;
         }
      }
   }
};
LLSong.prototype.applyDataOfSongWithDiff = function (targets, songindex, diff) {
   // targets: {
   //    '<song property>': [
   //       ['<element id>', '<element property>'], ...
   //    ], ...
   // }
   if (targets === undefined) return;
   if (songindex === undefined) songindex = this.getSelectedSongIndex();
   var curSong = this.songs[songindex];
   if (!curSong) return;
   if (diff === undefined) diff = this.getElementValue(this.diffSelId, "");

   var songattr = this.getSongAttr(songindex);
   var songattrcolor = this.attcolor[songattr];
   for (var songprop in targets) {
      var value;
      if (songprop == "attrcolor") {
         value = songattrcolor;
      } else if (songprop == "attribute") {
         value = songattr;
      } else if (curSong[songprop] !== undefined) {
         value = curSong[songprop];
      } else if (curSong[diff] && curSong[diff][songprop] !== undefined) {
         value = curSong[diff][songprop];
      } else {
         console.error("Not found song property '" + songprop + "'");
         continue;
      }
      var elements = targets[songprop];
      for (var i in elements) {
         var element = elements[i];
         if (typeof(element) == "function") {
            element(value);
            continue;
         }
         if (typeof(element) == "string") element = [element];
         if (element.length == 0) {
            console.error("Not found element property data for song property '" + songprop + "'[" + i + "]");
            continue;
         }
         var curObject = document.getElementById(element[0]);
         if (!curObject) {
            console.error("Not found element by id '" + element[0] + "'");
            continue;
         }
         if (element.length == 1) {
            if (songprop == "attrcolor") {
               curObject.style.color = value;
            } else {
               curObject.value = value;
            }
         } else {
            curObject[element[1]] = value;
         }
      }
   }
};

// utils
LLSong.prototype.initAttrSelectColor = function (sel) {
   if (sel === undefined) throw "Not specified select";
   if (typeof(sel) == "string") sel = this.getElementOrThrow(sel);
   var len = sel.options.length;
   for (var i = 0; i < len; i++) {
      var opt = sel.options[i];
      opt.style.color = this.attcolor[opt.value];
   }
   sel.style.color = this.attcolor[sel.value];
};

